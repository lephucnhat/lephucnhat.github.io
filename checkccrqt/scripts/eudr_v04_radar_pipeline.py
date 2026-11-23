# -*- coding: utf-8 -*-
"""CheckCCRQT v0.4.0 — Sentinel-1 SAR RTC (RVI) & FRMS Cross-Check EUDR Pipeline.

Luồng xử lý chuẩn kiểm toán EUDR (Regulation (EU) 2023/1115) & VNTLAS:
  1. Kết nối STAC API v1.0 (Microsoft Planetary Computer / Copernicus Data Space)
     truy vấn bộ sưu tập ``sentinel-1-rtc`` (dữ liệu Radar C-band VV/VH đã hiệu
     chỉnh địa hình bức xạ RTC — Torres et al., 2012; RADD — Reiche et al., 2021).
  2. Đọc trực tiếp cửa sổ COG theo đa giác lô rừng qua GDAL ``/vsicurl/`` và
     ``rasterio.mask`` (không tải toàn cảnh lớn về ổ cứng).
  3. Chuyển đổi giá trị tán xạ ngược từ dB sang thang tuyến tính
     ``sigma0 = 10 ** (dB / 10)`` trước khi tính chỉ số thực vật Radar tổng hợp:
         RVI = (4 * sigma0_VH) / (sigma0_VV + sigma0_VH)
  4. Chồng lớp với thuộc tính ``loai_rung`` từ cơ sở dữ liệu GeoPackage FRMS
     (TT 33/2018 & TT 16/2023/TT-BNNPTNT, QĐ 406/QĐ-CCKL) để phân loại:
       - ``DEFORESTATION_ALERT`` (Cảnh báo Đỏ — Vi phạm EUDR trên Rừng tự nhiên)
       - ``LEGAL_PLANTATION_CYCLE`` (Ghi nhận Vàng — Hợp pháp VNTLAS trên Rừng trồng)
       - ``COMPLIANT_STABLE`` (Ổn định — Không suy giảm sinh khối)
  5. Xuất hồ sơ GeoJSON chuẩn IETF RFC 7946 (EPSG:4326, tọa độ 2D làm tròn đúng
     6 chữ số thập phân, vòng ngoài CCW / vòng lỗ CW) sẵn sàng nộp EU TRACES NT.

Author: Phòng Sử dụng và Phát triển rừng — Chi cục Kiểm lâm tỉnh Quảng Trị
License: GPL-3.0
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import date, datetime
from typing import Any

import numpy as np
from shapely.geometry import MultiPolygon, Polygon, mapping, shape
from shapely.geometry.polygon import orient as _orient_polygon

DEFAULT_STAC_API = "https://planetarycomputer.microsoft.com/api/stac/v1"
DEFAULT_COLLECTION = "sentinel-1-rtc"
NATURAL_FOREST_KEYWORDS = (
    "tu nhien",
    "tự nhiên",
    "rừng tự nhiên",
    "rung tu nhien",
    "natural",
    "primary",
    "rtx",
    "rtg",
    "rtb",
    "rtn",
    "rtd",
)
PLANTATION_KEYWORDS = (
    "rung trong",
    "rừng trồng",
    "keo",
    "acacia",
    "plantation",
    "rt",
)


def select_sensor_by_month(month: int) -> str:
    """Chuyển mạch cảm biến tự động theo mùa tại tỉnh Quảng Trị (v0.4.0).

    - Tháng 2 – Tháng 8 (mùa ít mây): ưu tiên quang học Sentinel-2 L2A.
    - Tháng 9 – Tháng 1 (mùa mưa bão): kích hoạt Radar xuyên mây Sentinel-1 SAR RTC.
    """
    if 2 <= int(month) <= 8:
        return "SENTINEL-2_L2A"
    return "SENTINEL-1_SAR_RTC"


def db_to_linear(arr_db: np.ndarray) -> np.ndarray:
    """Chuyển đổi tán xạ ngược từ decibel (dB) sang thang công suất tuyến tính σ⁰."""
    arr = np.asarray(arr_db, dtype="float64")
    return np.power(10.0, arr / 10.0)


def compute_rvi(vv: np.ndarray, vh: np.ndarray, input_in_db: bool = True) -> np.ndarray:
    """Tính chỉ số thực vật Radar tổng hợp RVI = (4 * σ⁰_VH) / (σ⁰_VV + σ⁰_VH).

    Bắt buộc chuyển đổi dB → thang tuyến tính trước khi tính RVI nếu ``input_in_db=True``.
    Mọi pixel chia cho 0 hoặc không hợp lệ trả về NaN.
    """
    vv_lin = db_to_linear(vv) if input_in_db else np.asarray(vv, dtype="float64")
    vh_lin = db_to_linear(vh) if input_in_db else np.asarray(vh, dtype="float64")

    # Loại bỏ giá trị vật lý bất hợp lệ (<= 0 trên thang tuyến tính)
    valid = np.isfinite(vv_lin) & np.isfinite(vh_lin) & (vv_lin > 0.0) & (vh_lin >= 0.0)
    denom = vv_lin + vh_lin
    with np.errstate(divide="ignore", invalid="ignore"):
        rvi = (4.0 * vh_lin) / denom
    rvi = np.where(valid & (denom > 0.0), rvi, np.nan)
    return np.clip(rvi, 0.0, 2.0)


def classify_forest_change(
    loai_rung: str,
    rvi_baseline: float,
    rvi_current: float,
    rvi_drop_threshold: float = -0.15,
) -> tuple[str, str]:
    """Chồng lớp biến động RVI với thuộc tính loại rừng FRMS để gắn nhãn EUDR/VNTLAS.

    Returns ``(alert_code, alert_description_vi)``.
    """
    if not (np.isfinite(rvi_baseline) and np.isfinite(rvi_current)):
        return "NO_DATA", "Thiếu dữ liệu Radar hợp lệ"

    delta_rvi = float(rvi_current - rvi_baseline)
    if delta_rvi > rvi_drop_threshold:
        return "COMPLIANT_STABLE", "Tán rừng ổn định — Không phát hiện suy giảm sinh khối"

    norm = str(loai_rung or "").strip().lower()
    is_natural = any(kw in norm for kw in NATURAL_FOREST_KEYWORDS)
    if is_natural:
        return (
            "DEFORESTATION_ALERT",
            "Cảnh báo Đỏ (Vi phạm EUDR): Suy giảm sinh khối trên Rừng tự nhiên sau mốc 31/12/2020",
        )
    return (
        "LEGAL_PLANTATION_CYCLE",
        "Ghi nhận Vàng (Hợp pháp VNTLAS): Khai thác/trồng lại theo chu kỳ trên Rừng trồng (Keo lai)",
    )


def _strip_zm_and_round(coords: Any) -> Any:
    if not coords:
        return coords
    if isinstance(coords[0], (int, float)):
        return [round(float(coords[0]), 6), round(float(coords[1]), 6)]
    return [_strip_zm_and_round(c) for c in coords]


def normalize_rfc7946_geometry(geom_obj: Any) -> dict:
    """Chuẩn hóa hình học sang GeoJSON RFC 7946 (2D, 6 chữ số thập phân, ngoại vi CCW)."""
    g = shape(geom_obj) if isinstance(geom_obj, dict) else geom_obj
    if not g.is_valid:
        g = g.buffer(0)
    if isinstance(g, Polygon):
        g = _orient_polygon(g, sign=1.0)
    elif isinstance(g, MultiPolygon):
        parts = [_orient_polygon(p, sign=1.0) for p in g.geoms if not p.is_empty]
        g = parts[0] if len(parts) == 1 else MultiPolygon(parts)
    geo = mapping(g)
    return {
        "type": geo["type"],
        "coordinates": _strip_zm_and_round(geo["coordinates"]),
    }


def query_s1_rtc_stac(
    bbox_wgs84: tuple[float, float, float, float],
    date_from: str,
    date_to: str,
    stac_api_url: str = DEFAULT_STAC_API,
    collection: str = DEFAULT_COLLECTION,
    max_items: int = 20,
) -> list:
    """Truy vấn STAC API v1.0 lấy danh sách cảnh Sentinel-1 RTC theo bbox & thời gian."""
    from pystac_client import Client

    modifier = None
    if "planetarycomputer.microsoft.com" in stac_api_url:
        try:
            import planetary_computer
            modifier = planetary_computer.sign_inplace
        except ImportError:
            modifier = None

    catalog = Client.open(stac_api_url, modifier=modifier)
    search = catalog.search(
        collections=[collection],
        bbox=list(bbox_wgs84),
        datetime=f"{date_from}/{date_to}",
        max_items=max_items,
    )
    items = list(search.items())
    items.sort(key=lambda it: it.datetime or datetime.min)
    return items


def read_clipped_rvi_mean(item: Any, geom_wgs84: Any, input_in_db: bool = False) -> float:
    """Cắt trực tiếp cửa sổ COG VV/VH từ STAC Item qua /vsicurl/ và tính trung bình RVI."""
    import rasterio
    from rasterio.mask import mask as rio_mask
    from rasterio.warp import transform_geom

    vv_asset = item.assets.get("vv") or item.assets.get("VV")
    vh_asset = item.assets.get("vh") or item.assets.get("VH")
    if vv_asset is None or vh_asset is None:
        return float("nan")

    env_opts = {
        "GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
        "GDAL_HTTP_MULTIRANGE": "YES",
        "GDAL_HTTP_MERGE_CONSECUTIVE_RANGES": "YES",
        "VSI_CACHE": "TRUE",
    }

    with rasterio.Env(**env_opts):
        with rasterio.open(vv_asset.href) as src_vv, rasterio.open(vh_asset.href) as src_vh:
            geom_proj = transform_geom("EPSG:4326", src_vv.crs, mapping(geom_wgs84))
            vv_arr, _ = rio_mask(src_vv, [geom_proj], crop=True, filled=True, nodata=np.nan)
            vh_arr, _ = rio_mask(src_vh, [geom_proj], crop=True, filled=True, nodata=np.nan)

    vv_2d = vv_arr[0].astype("float64")
    vh_2d = vh_arr[0].astype("float64")
    # Tự động phát hiện nếu dữ liệu đầu vào là dB (giá trị âm)
    auto_db = input_in_db or bool(np.nanmedian(vv_2d) < 0.0)
    rvi_2d = compute_rvi(vv_2d, vh_2d, input_in_db=auto_db)
    valid = rvi_2d[np.isfinite(rvi_2d)]
    return float(np.mean(valid)) if valid.size > 0 else float("nan")


def load_frms_forest_type_map(frms_gpkg: str | None) -> tuple[Any, str | None]:
    """Nạp lớp GeoPackage FRMS (chứa cột ``loai_rung``) bằng geopandas nếu được cung cấp."""
    if not frms_gpkg or not os.path.isfile(frms_gpkg):
        return None, None
    import geopandas as gpd

    gdf = gpd.read_file(frms_gpkg)
    if gdf.crs is not None and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)

    loai_col = None
    for c in gdf.columns:
        low = c.lower()
        if low in ("loai_rung", "loairung", "ldlr", "maldlr", "forest_type"):
            loai_col = c
            break
    return gdf, loai_col


def resolve_loai_rung(parcel_props: dict, parcel_geom: Any, frms_gdf: Any, loai_col: str | None) -> str:
    """Xác định loại rừng từ thuộc tính lô hoặc chồng lớp không gian với GeoPackage FRMS."""
    if frms_gdf is not None and loai_col is not None:
        hits = frms_gdf[frms_gdf.intersects(parcel_geom)]
        if len(hits) > 0:
            vals = [str(v) for v in hits[loai_col].dropna().tolist()]
            # Ưu tiên cảnh báo nếu có bất kỳ phần nào chồng lên Rừng tự nhiên
            for v in vals:
                if any(kw in v.lower() for kw in NATURAL_FOREST_KEYWORDS):
                    return v
            if vals:
                return vals[0]
    return str(
        parcel_props.get("loai_rung")
        or parcel_props.get("LDLR")
        or parcel_props.get("Species")
        or "Rừng trồng (Keo lai)"
    )


def run_pipeline(
    parcels_geojson: str,
    output_geojson: str,
    date_from: str,
    date_to: str,
    frms_gpkg: str | None = None,
    stac_api_url: str = DEFAULT_STAC_API,
    rvi_drop_threshold: float = -0.15,
) -> str:
    """Chạy toàn bộ luồng Sentinel-1 RTC + RVI + FRMS Cross-Check và xuất RFC 7946 GeoJSON."""
    with open(parcels_geojson, encoding="utf-8") as fh:
        fc = json.load(fh)

    frms_gdf, loai_col = load_frms_forest_type_map(frms_gpkg)
    out_features = []

    for idx, feat in enumerate(fc.get("features", []), start=1):
        props = dict(feat.get("properties") or {})
        geom = shape(feat["geometry"])
        if not geom.is_valid:
            geom = geom.buffer(0)

        items = query_s1_rtc_stac(geom.bounds, date_from, date_to, stac_api_url=stac_api_url)
        rvi_vals = []
        for it in items:
            val = read_clipped_rvi_mean(it, geom)
            if np.isfinite(val):
                rvi_vals.append(val)

        rvi_base = float(np.max(rvi_vals[: max(1, len(rvi_vals) // 2)])) if rvi_vals else float("nan")
        rvi_curr = float(rvi_vals[-1]) if rvi_vals else float("nan")

        loai_rung = resolve_loai_rung(props, geom, frms_gdf, loai_col)
        alert_code, alert_desc = classify_forest_change(
            loai_rung, rvi_base, rvi_curr, rvi_drop_threshold=rvi_drop_threshold
        )

        out_props = {
            **props,
            "FRMS_LoaiRung": loai_rung,
            "SAR_Sensor": "Sentinel-1 C-band RTC (VV/VH)",
            "RVI_Baseline": round(rvi_base, 4) if np.isfinite(rvi_base) else None,
            "RVI_Current": round(rvi_curr, 4) if np.isfinite(rvi_curr) else None,
            "RVI_Delta": round(rvi_curr - rvi_base, 4)
            if (np.isfinite(rvi_base) and np.isfinite(rvi_curr))
            else None,
            "EUDR_v04_Alert": alert_code,
            "EUDR_v04_Note": alert_desc,
            "CheckDate": date.today().isoformat(),
        }

        out_features.append(
            {
                "type": "Feature",
                "id": str(feat.get("id") or props.get("id_lo") or idx),
                "geometry": normalize_rfc7946_geometry(geom),
                "properties": out_props,
            }
        )

    out_fc = {
        "type": "FeatureCollection",
        "name": "CheckCCRQT_v040_SAR_RTC_EUDR",
        "features": out_features,
    }
    os.makedirs(os.path.dirname(os.path.abspath(output_geojson)), exist_ok=True)
    with open(output_geojson, "w", encoding="utf-8") as fh:
        json.dump(out_fc, fh, ensure_ascii=False, indent=2)
    return output_geojson


def _run_self_test() -> int:
    """Tự kiểm thử nội bộ (không cần Internet): dB→Linear→RVI, FRMS Đỏ/Vàng, RFC 7946."""
    # 1. Kiểm tra chuyển đổi dB -> tuyến tính và công thức RVI
    vv_db = np.array([[-8.0, -8.0]])
    vh_db = np.array([[-14.0, -19.0]])
    rvi = compute_rvi(vv_db, vh_db, input_in_db=True)
    expected_0 = (4.0 * (10 ** (-14.0 / 10.0))) / ((10 ** (-8.0 / 10.0)) + (10 ** (-14.0 / 10.0)))
    assert abs(rvi[0, 0] - expected_0) < 1e-6, f"RVI mismatch: {rvi[0, 0]} vs {expected_0}"
    assert rvi[0, 0] > rvi[0, 1], "RVI phải giảm khi VH giảm mạnh (mất tán rừng)"

    # 2. Kiểm tra phân tách FRMS Đỏ / Vàng
    code_nat, _ = classify_forest_change("Rừng tự nhiên lá rộng thường xanh", 0.72, 0.38)
    code_plt, _ = classify_forest_change("Rừng trồng Keo lai", 0.72, 0.38)
    code_ok, _ = classify_forest_change("Rừng tự nhiên", 0.72, 0.70)
    assert code_nat == "DEFORESTATION_ALERT"
    assert code_plt == "LEGAL_PLANTATION_CYCLE"
    assert code_ok == "COMPLIANT_STABLE"

    # 3. Kiểm tra chuyển mạch cảm biến theo mùa Quảng Trị
    assert select_sensor_by_month(5) == "SENTINEL-2_L2A"
    assert select_sensor_by_month(11) == "SENTINEL-1_SAR_RTC"
    assert select_sensor_by_month(1) == "SENTINEL-1_SAR_RTC"

    # 4. Kiểm tra chuẩn hóa RFC 7946 (CCW + 6 số lẻ + bỏ Z)
    cw_poly_3d = Polygon([
        (106.942012345, 16.818012345, 45.0),
        (106.942012345, 16.819012345, 45.0),
        (106.943012345, 16.819012345, 45.0),
        (106.943012345, 16.818012345, 45.0),
        (106.942012345, 16.818012345, 45.0),
    ])
    norm_geo = normalize_rfc7946_geometry(cw_poly_3d)
    ring = norm_geo["coordinates"][0]
    assert all(len(pt) == 2 and round(pt[0], 6) == pt[0] and round(pt[1], 6) == pt[1] for pt in ring)
    signed_area = sum(
        ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
        for i in range(len(ring) - 1)
    ) / 2.0
    assert signed_area > 0, "Vòng ngoài phải ngược chiều kim đồng hồ (CCW)"

    print("[PASS] eudr_v04_radar_pipeline.py self-test OK (RVI, FRMS Red/Yellow, Seasonal Switch, RFC 7946).")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="CheckCCRQT v0.4.0 — Sentinel-1 SAR RTC (RVI) & FRMS Cross-Check Pipeline"
    )
    parser.add_argument("--parcels", help="Đường dẫn tệp GeoJSON danh sách lô rừng đầu vào")
    parser.add_argument("--output", default="eudr_v04_sar_result.geojson", help="Tệp GeoJSON RFC 7946 đầu ra")
    parser.add_argument("--date-from", default="2025-09-01", help="Ngày bắt đầu (YYYY-MM-DD)")
    parser.add_argument("--date-to", default="2026-01-31", help="Ngày kết thúc (YYYY-MM-DD)")
    parser.add_argument("--frms-gpkg", default=None, help="Tệp GeoPackage FRMS chứa cột loai_rung")
    parser.add_argument("--stac-url", default=DEFAULT_STAC_API, help="STAC API v1.0 endpoint")
    parser.add_argument("--rvi-drop", type=float, default=-0.15, help="Ngưỡng sụt giảm RVI cảnh báo")
    parser.add_argument("--self-test", action="store_true", help="Chạy kiểm thử nội bộ không cần mạng")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(_run_self_test())

    if not args.parcels:
        parser.error("Cần truyền --parcels <file.geojson> hoặc dùng --self-test.")

    out_path = run_pipeline(
        parcels_geojson=args.parcels,
        output_geojson=args.output,
        date_from=args.date_from,
        date_to=args.date_to,
        frms_gpkg=args.frms_gpkg,
        stac_api_url=args.stac_url,
        rvi_drop_threshold=args.rvi_drop,
    )
    print(f"[OK] Đã xuất kết quả Radar SAR RTC v0.4.0 chuẩn RFC 7946: {out_path}")


if __name__ == "__main__":
    main()
