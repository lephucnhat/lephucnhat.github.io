/* CheckCCRQT v0.4.0+ — EUDR RFC 7946 Validator, Geodetic VN-2000 (7-Param Helmert) & RVI Engine */
(function (global) {
  "use strict";

  const EUDR_THRESHOLD_HA = 4.0;
  const SLIVER_HA = 0.01;
  const DEFAULT_ORG = "Phòng Sử dụng và Phát triển rừng — Chi cục Kiểm lâm tỉnh Quảng Trị";

  // =========================================================================
  // 1. PURE-JS 7-PARAMETER HELMERT VN-2000 <-> WGS-84 GEODETIC ENGINE
  // PROJ +towgs84=-191.90441429,-39.30318279,-111.45032835,
  //               -0.00928836,0.01975479,-0.00427372,0.252906278
  // =========================================================================
  const WGS84_A = 6378137.0;
  const WGS84_F = 1.0 / 298.257223563;
  const WGS84_E2 = 2 * WGS84_F - WGS84_F * WGS84_F;
  const WGS84_EP2 = WGS84_E2 / (1.0 - WGS84_E2);
  const SEC_TO_RAD = Math.PI / (180.0 * 3600.0);

  const HELMERT = {
    dx: -191.90441429,
    dy: -39.30318279,
    dz: -111.45032835,
    rx: -0.00928836 * SEC_TO_RAD,
    ry: 0.01975479 * SEC_TO_RAD,
    rz: -0.00427372 * SEC_TO_RAD,
    ds: 0.252906278 * 1e-6
  };

  function geodeticToEcef(lonDeg, latDeg, h = 0.0) {
    const lon = (lonDeg * Math.PI) / 180.0;
    const lat = (latDeg * Math.PI) / 180.0;
    const sLat = Math.sin(lat), cLat = Math.cos(lat);
    const sLon = Math.sin(lon), cLon = Math.cos(lon);
    const N = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * sLat * sLat);
    return [
      (N + h) * cLat * cLon,
      (N + h) * cLat * sLon,
      (N * (1.0 - WGS84_E2) + h) * sLat
    ];
  }

  function ecefToGeodetic(X, Y, Z) {
    const lon = Math.atan2(Y, X);
    const p = Math.hypot(X, Y);
    let lat = Math.atan2(Z, p * (1.0 - WGS84_E2));
    for (let i = 0; i < 8; i++) {
      const sLat = Math.sin(lat);
      const N = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * sLat * sLat);
      lat = Math.atan2(Z + WGS84_E2 * N * sLat, p);
    }
    return [(lon * 180.0) / Math.PI, (lat * 180.0) / Math.PI];
  }

  function helmertVnToWgs(X, Y, Z) {
    const s = 1.0 + HELMERT.ds;
    return [
      HELMERT.dx + s * (X - HELMERT.rz * Y + HELMERT.ry * Z),
      HELMERT.dy + s * (HELMERT.rz * X + Y - HELMERT.rx * Z),
      HELMERT.dz + s * (-HELMERT.ry * X + HELMERT.rx * Y + Z)
    ];
  }

  function helmertWgsToVn(X, Y, Z) {
    const s = 1.0 - HELMERT.ds;
    const x = X - HELMERT.dx;
    const y = Y - HELMERT.dy;
    const z = Z - HELMERT.dz;
    return [
      s * (x + HELMERT.rz * y - HELMERT.ry * z),
      s * (-HELMERT.rz * x + y + HELMERT.rx * z),
      s * (HELMERT.ry * x - HELMERT.rx * y + z)
    ];
  }

  function tmInverse(x, y, lon0Deg, k0 = 0.9999, x0 = 500000.0, y0 = 0.0) {
    const e2 = WGS84_E2, ep2 = WGS84_EP2, a = WGS84_A;
    const xp = (x - x0) / k0;
    const yp = (y - y0) / k0;
    let phi = yp / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256));
    for (let i = 0; i < 6; i++) {
      const M =
        a *
        ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * phi -
          ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * phi) +
          ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * phi) -
          ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * phi));
      const dM = (a * (1 - e2)) / Math.pow(1 - e2 * Math.sin(phi) * Math.sin(phi), 1.5);
      phi += (yp - M) / dM;
    }
    const sPhi = Math.sin(phi), cPhi = Math.cos(phi), tPhi = Math.tan(phi);
    const N = a / Math.sqrt(1 - e2 * sPhi * sPhi);
    const R = (a * (1 - e2)) / Math.pow(1 - e2 * sPhi * sPhi, 1.5);
    const T = tPhi * tPhi;
    const C = ep2 * cPhi * cPhi;
    const D = xp / N;

    const lat =
      phi -
      ((N * tPhi) / R) *
        ((D * D) / 2 -
          ((5 + 3 * T + 10 * C - 4 * C * C - 9 * ep2) * Math.pow(D, 4)) / 24 +
          ((61 + 90 * T + 298 * C + 45 * T * T - 252 * ep2 - 3 * C * C) * Math.pow(D, 6)) / 720);
    const lon =
      (lon0Deg * Math.PI) / 180.0 +
      (D -
        ((1 + 2 * T + C) * Math.pow(D, 3)) / 6 +
        ((5 - 2 * C + 28 * T - 3 * C * C + 8 * ep2 + 24 * T * T) * Math.pow(D, 5)) / 120) /
        cPhi;
    return [(lon * 180.0) / Math.PI, (lat * 180.0) / Math.PI];
  }

  function tmForward(lonDeg, latDeg, lon0Deg, k0 = 0.9999, x0 = 500000.0, y0 = 0.0) {
    const e2 = WGS84_E2, ep2 = WGS84_EP2, a = WGS84_A;
    const phi = (latDeg * Math.PI) / 180.0;
    const lam = (lonDeg * Math.PI) / 180.0;
    const lam0 = (lon0Deg * Math.PI) / 180.0;
    const sPhi = Math.sin(phi), cPhi = Math.cos(phi), tPhi = Math.tan(phi);
    const N = a / Math.sqrt(1 - e2 * sPhi * sPhi);
    const T = tPhi * tPhi;
    const C = ep2 * cPhi * cPhi;
    const A = (lam - lam0) * cPhi;
    const M =
      a *
      ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * phi -
        ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * phi) +
        ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * phi) -
        ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * phi));
    const x =
      x0 +
      k0 *
        N *
        (A +
          ((1 - T + C) * Math.pow(A, 3)) / 6 +
          ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * Math.pow(A, 5)) / 120);
    const y =
      y0 +
      k0 *
        (M +
          N *
            tPhi *
            ((A * A) / 2 +
              ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
              ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * Math.pow(A, 6)) / 720));
    return [x, y];
  }

  function vn2000ToWgs84(x, y, lon0Deg = 106.0) {
    const [lonVn, latVn] = tmInverse(Number(x), Number(y), Number(lon0Deg));
    const [Xv, Yv, Zv] = geodeticToEcef(lonVn, latVn, 0.0);
    const [Xw, Yw, Zw] = helmertVnToWgs(Xv, Yv, Zv);
    return ecefToGeodetic(Xw, Yw, Zw); // [lon, lat]
  }

  function wgs84ToVn2000(lon, lat, lon0Deg = 106.0) {
    const [Xw, Yw, Zw] = geodeticToEcef(Number(lon), Number(lat), 0.0);
    const [Xv, Yv, Zv] = helmertWgsToVn(Xw, Yw, Zw);
    const [lonVn, latVn] = ecefToGeodetic(Xv, Yv, Zv);
    return tmForward(lonVn, latVn, Number(lon0Deg)); // [x, y]
  }

  // =========================================================================
  // 2. RADAR RVI (dB -> LINEAR) & FRMS CROSS-CHECK ENGINE
  // =========================================================================
  function computeRviFromDb(vvDb, vhDb) {
    const vvLin = Math.pow(10.0, Number(vvDb) / 10.0);
    const vhLin = Math.pow(10.0, Number(vhDb) / 10.0);
    const denom = vvLin + vhLin;
    const rvi = denom > 0 ? Math.min(2.0, Math.max(0.0, (4.0 * vhLin) / denom)) : 0.0;
    return { vvLin, vhLin, rvi };
  }

  function classifyFrmsAlert(loaiRung, rviBaseline, rviCurrent, threshold = -0.15) {
    const delta = Number(rviCurrent) - Number(rviBaseline);
    if (delta > threshold) {
      return {
        code: "COMPLIANT_STABLE",
        level: "ok",
        label: "Đạt chuẩn Xanh — Tán rừng ổn định"
      };
    }
    const norm = String(loaiRung || "").toLowerCase();
    const isNatural = norm.includes("tự nhiên") || norm.includes("tu nhien") || norm.includes("natural");
    if (isNatural) {
      return {
        code: "DEFORESTATION_ALERT",
        level: "err",
        label: "Cảnh báo Đỏ (Vi phạm EUDR) — Suy giảm trên Rừng tự nhiên"
      };
    }
    return {
      code: "LEGAL_PLANTATION_CYCLE",
      level: "warn",
      label: "Ghi nhận Vàng (Hợp pháp VNTLAS) — Chu kỳ Rừng trồng Keo lai"
    };
  }

  // =========================================================================
  // 3. RFC 7946 GEOJSON VALIDATOR, COORDINATE TEXT PARSER & KML PARSER
  // =========================================================================
  function ringSignedArea(ring) {
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    }
    return area / 2;
  }

  function roundCoord(c) {
    return [Number(Number(c[0]).toFixed(6)), Number(Number(c[1]).toFixed(6))];
  }

  function orientRing(ring, wantCCW) {
    const cleaned = ring.map(roundCoord);
    const first = cleaned[0];
    const last = cleaned[cleaned.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) cleaned.push([...first]);
    const isCCW = ringSignedArea(cleaned) > 0;
    return isCCW === wantCCW ? cleaned : cleaned.reverse();
  }

  function orientPolygonCoords(rings) {
    return rings.map((r, i) => orientRing(r, i === 0));
  }

  function isWgs84Coord(pt) {
    return (
      Array.isArray(pt) &&
      pt.length >= 2 &&
      Number.isFinite(pt[0]) &&
      Number.isFinite(pt[1]) &&
      pt[0] >= -180 &&
      pt[0] <= 180 &&
      pt[1] >= -90 &&
      pt[1] <= 90
    );
  }

  function parseKmlToGeoJson(xmlText) {
    const dom = new DOMParser().parseFromString(xmlText, "text/xml");
    const placemarks = Array.from(dom.getElementsByTagName("Placemark"));
    const features = [];
    placemarks.forEach((pm, i) => {
      const nameEl = pm.getElementsByTagName("name")[0];
      const name = nameEl ? nameEl.textContent.trim() : `KML-LO-${i + 1}`;
      const coordEl = pm.getElementsByTagName("coordinates")[0];
      if (!coordEl) return;
      const pts = coordEl.textContent
        .trim()
        .split(/\s+/)
        .map((tok) => {
          const parts = tok.split(",").map(Number);
          return [parts[0], parts[1]];
        })
        .filter((c) => Number.isFinite(c[0]) && Number.isFinite(c[1]));
      if (pts.length >= 3) {
        if (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) {
          pts.push([...pts[0]]);
        }
        features.push({
          type: "Feature",
          properties: { id_lo: name, chu_ho: "Dữ liệu KML tải lên", loai_rung: "Rừng trồng (Keo lai)" },
          geometry: { type: "Polygon", coordinates: [pts] }
        });
      }
    });
    return { type: "FeatureCollection", features };
  }

  function parsePastedInput(rawText) {
    const txt = String(rawText || "").trim();
    if (!txt) throw new Error("Vui lòng dán GeoJSON hoặc danh sách tọa độ trước khi kiểm tra.");

    // 1. Try JSON / GeoJSON first
    if (txt.startsWith("{") || txt.startsWith("[")) {
      const parsed = JSON.parse(txt);
      if (parsed.type === "FeatureCollection") return parsed;
      if (parsed.type === "Feature") return { type: "FeatureCollection", features: [parsed] };
      if (parsed.type === "Polygon" || parsed.type === "MultiPolygon" || parsed.type === "Point") {
        return {
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: { id_lo: "PASTE-01", chu_ho: "Dữ liệu dán trực tiếp" }, geometry: parsed }]
        };
      }
    }

    // 2. Parse line-by-line coordinate pairs (auto-detect lat,lon vs lon,lat for Vietnam)
    const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const pts = [];
    for (const line of lines) {
      const nums = line.replace(/[;|\t]+/g, ",").split(/[,\s]+/).map(Number).filter(Number.isFinite);
      if (nums.length >= 2) {
        let a = nums[0], b = nums[1];
        // Vietnam: lon ~ 102..110, lat ~ 8..24
        if (a >= 8 && a <= 25 && b >= 100 && b <= 112) {
          pts.push([b, a]); // swapped lat,lon -> [lon, lat]
        } else {
          pts.push([a, b]);
        }
      }
    }
    if (pts.length === 0) {
      throw new Error("Không nhận diện được tọa độ hợp lệ. Hãy nhập dạng GeoJSON hoặc từng dòng 'Vĩ độ, Kinh độ' (VD: 16.8180, 106.9420).");
    }
    if (pts.length < 3) {
      return {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { id_lo: "POINT-01", chu_ho: "Tọa độ điểm dán trực tiếp", loai_rung: "Rừng trồng (Keo lai)" },
          geometry: { type: "Point", coordinates: pts[0] }
        }]
      };
    }
    if (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) {
      pts.push([...pts[0]]);
    }
    return {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: { id_lo: "PASTE-POLY-01", chu_ho: "Đa giác dán trực tiếp", loai_rung: "Rừng trồng (Keo lai)" },
        geometry: { type: "Polygon", coordinates: [pts] }
      }]
    };
  }

  function resolveProp(props, keys, fallback) {
    for (const k of keys) {
      if (props && props[k] !== undefined && props[k] !== null && String(props[k]).trim() !== "") {
        return props[k];
      }
    }
    return fallback;
  }

  function analyzeFeatureCollection(fc) {
    const rawFeatures = (fc && fc.features ? fc.features : []).filter(
      (f) => f && f.geometry && ["Polygon", "MultiPolygon", "Point"].includes(f.geometry.type)
    );

    const idCounts = {};
    const items = rawFeatures.map((feat, idx) => {
      const p = feat.properties || {};
      const id_lo = String(resolveProp(p, ["id_lo", "Ma_lo", "malo", "FarmID", "ProductionPlace", "id", "name"], `LO-${idx + 1}`)).trim();
      const normId = id_lo.toLowerCase().replace(/\s+/g, " ");
      idCounts[normId] = (idCounts[normId] || 0) + 1;

      const issues = [];
      let areaHa = 0;
      let perimM = 0;
      let centerLon = 106.95, centerLat = 16.82;
      let crsOk = true;

      // Check EPSG:4326 range & closed ring
      if (feat.geometry.type === "Point") {
        if (!isWgs84Coord(feat.geometry.coordinates)) {
          crsOk = false;
          issues.push("NON_WGS84");
        } else {
          centerLon = feat.geometry.coordinates[0];
          centerLat = feat.geometry.coordinates[1];
        }
      } else {
        const firstRing = feat.geometry.type === "Polygon" ? feat.geometry.coordinates[0] : feat.geometry.coordinates[0][0];
        if (firstRing && firstRing.length) {
          if (!isWgs84Coord(firstRing[0])) {
            crsOk = false;
            issues.push("NON_WGS84");
          }
          const f0 = firstRing[0], fn = firstRing[firstRing.length - 1];
          if (f0[0] !== fn[0] || f0[1] !== fn[1]) {
            issues.push("OPEN_RING");
          }
        }
      }

      if (crsOk && typeof turf !== "undefined") {
        try {
          if (feat.geometry.type !== "Point") {
            areaHa = turf.area(feat) / 10000.0;
            const line = turf.polygonToLine(feat);
            perimM = turf.length(line, { units: "kilometers" }) * 1000.0;
            const kinks = turf.kinks(feat);
            if (kinks && kinks.features && kinks.features.length > 0) {
              issues.push("SELF_INTERSECT");
            }
          }
          const pt = turf.pointOnFeature(feat);
          centerLon = pt.geometry.coordinates[0];
          centerLat = pt.geometry.coordinates[1];
        } catch (e) { /* safe fallback */ }
      }

      if (feat.geometry.type !== "Point" && crsOk && areaHa < SLIVER_HA) {
        issues.push("SLIVER");
      }

      const tmfStatus = String(resolveProp(p, ["tmf_status", "EUDR_TMF_Status"], "Tuân thủ"));
      const harvestStatus = String(resolveProp(p, ["harvest_status"], "Chưa khai thác"));
      const loaiRung = String(resolveProp(p, ["loai_rung", "FRMS_LoaiRung"], "Rừng trồng (Keo lai)"));
      const isNatural = loaiRung.toLowerCase().includes("tự nhiên");

      let frmsAlert = "COMPLIANT_STABLE";
      if (tmfStatus === "Vi phạm" || (isNatural && harvestStatus.includes("khai thác"))) {
        frmsAlert = "DEFORESTATION_ALERT";
      } else if (harvestStatus.includes("khai thác") || tmfStatus === "Cảnh báo") {
        frmsAlert = "LEGAL_PLANTATION_CYCLE";
      }

      const tsNdvi = p.ts_ndvi || [0.76, 0.78, 0.80, 0.81, 0.79, 0.77, 0.78, 0.80, 0.82, 0.83, 0.81];
      return {
        idx,
        feature: feat,
        id_lo,
        normId,
        chu_ho: String(resolveProp(p, ["chu_ho", "ProducerName", "Chu_ho", "churung", "owner"], "Chủ rừng (Chưa khai báo)")),
        tieu_khu: String(resolveProp(p, ["tieu_khu", "TK", "compartment"], "")),
        khoanh: String(resolveProp(p, ["khoanh", "subcompartment"], "")),
        lo: String(resolveProp(p, ["lo", "plot"], "")),
        loai_rung: loaiRung,
        loai_cay: String(resolveProp(p, ["loai_cay", "Species", "species"], "Keo lai")),
        nam_trong: resolveProp(p, ["nam_trong", "PlantedYear", "planted"], 2021),
        area_ha: Number(areaHa.toFixed(4)),
        perim_m: Math.round(perimM),
        lon: Number(centerLon.toFixed(6)),
        lat: Number(centerLat.toFixed(6)),
        tmf_status: tmfStatus,
        tmf_year: resolveProp(p, ["tmf_year", "EUDR_DeforestationYear"], null),
        tmf_ha: Number(resolveProp(p, ["tmf_ha", "EUDR_AffectedHa"], 0)) || 0,
        tmf_driver: String(resolveProp(p, ["tmf_driver", "EUDR_Driver"], "")),
        harvest_status: harvestStatus,
        harvest_date: resolveProp(p, ["harvest_date"], null),
        scenario: String(resolveProp(p, ["scenario"], "Hồ sơ lô rừng kiểm tra trực tuyến")),
        eudr_rule: areaHa > EUDR_THRESHOLD_HA ? "Bắt buộc Đa giác (> 4 ha)" : "Điểm hoặc Đa giác (≤ 4 ha)",
        frms_alert: frmsAlert,
        issues,
        ts_dates: p.ts_dates || ["2025-01","2025-03","2025-05","2025-07","2025-09","2025-11","2026-01","2026-03","2026-05","2026-07","2026-09"],
        ts_ndvi: tsNdvi,
        ts_nbr: p.ts_nbr || [0.60, 0.62, 0.65, 0.66, 0.64, 0.62, 0.63, 0.65, 0.67, 0.68, 0.66],
        ts_ndmi: p.ts_ndmi || [0.42, 0.44, 0.46, 0.47, 0.45, 0.43, 0.44, 0.46, 0.48, 0.49, 0.47],
        ts_rvi: p.ts_rvi || tsNdvi.map((v) => Number(Math.max(0.18, Math.min(0.95, v * 0.88 + 0.05)).toFixed(2)))
      };
    });

    items.forEach((it) => {
      if (idCounts[it.normId] > 1) it.issues.push("DUPLICATE_ID");
    });

    if (typeof turf !== "undefined" && items.length <= 250) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].feature.geometry.type === "Point" || items[i].issues.includes("NON_WGS84")) continue;
        for (let j = i + 1; j < items.length; j++) {
          if (items[j].feature.geometry.type === "Point" || items[j].issues.includes("NON_WGS84")) continue;
          try {
            const inter = turf.intersect(items[i].feature, items[j].feature);
            if (inter && turf.area(inter) > 1.0) {
              if (!items[i].issues.includes("OVERLAP")) items[i].issues.push("OVERLAP");
              if (!items[j].issues.includes("OVERLAP")) items[j].issues.push("OVERLAP");
            }
          } catch (e) { /* skip invalid geom pair */ }
        }
      }
    }
    return items;
  }

  function buildRfc7946Export(analyzedLots, pointUnder4Ha, executingUnit) {
    const today = new Date().toISOString().slice(0, 10);
    const unit = (executingUnit || "").trim() || DEFAULT_ORG;
    const features = analyzedLots.map((it) => {
      const mustPolygon = it.area_ha > EUDR_THRESHOLD_HA;
      let geom;
      let rule;
      if (pointUnder4Ha && !mustPolygon) {
        geom = { type: "Point", coordinates: [Number(it.lon.toFixed(6)), Number(it.lat.toFixed(6))] };
        rule = "EUDR Art.9 Point (<= 4.0 ha)";
      } else {
        const g = it.feature.geometry;
        if (g.type === "Polygon") {
          geom = { type: "Polygon", coordinates: orientPolygonCoords(g.coordinates) };
        } else if (g.type === "MultiPolygon") {
          geom = { type: "MultiPolygon", coordinates: g.coordinates.map(orientPolygonCoords) };
        } else {
          geom = { type: "Point", coordinates: [Number(it.lon.toFixed(6)), Number(it.lat.toFixed(6))] };
        }
        rule = mustPolygon ? "EUDR Art.9 Polygon (> 4.0 ha mandatory)" : "EUDR Art.9 Polygon (<= 4.0 ha full boundary)";
      }

      return {
        type: "Feature",
        id: it.id_lo,
        geometry: geom,
        properties: {
          ProducerName: it.chu_ho,
          ProducerCountry: "VN",
          ProductionPlace: `${it.id_lo}${it.tieu_khu ? " (TK " + it.tieu_khu + " - K" + it.khoanh + " - Lô " + it.lo + ")" : ""}`,
          Area: it.area_ha,
          ForestType_FRMS: it.loai_rung,
          Species: it.loai_cay,
          PlantedYear: it.nam_trong,
          EUDR_TMF_Status: it.tmf_status,
          EUDR_v04_Alert: it.frms_alert,
          EUDR_DeforestationYear: it.tmf_year,
          EUDR_AffectedHa: it.tmf_ha,
          EUDR_Driver: it.tmf_driver,
          GeometryRule: rule,
          CheckDate: today,
          ExecutingUnit: unit
        }
      };
    });
    return { type: "FeatureCollection", name: "CheckCCRQT_EUDR_TRACES_NT_RFC7946", features };
  }

  global.EudrValidator = {
    EUDR_THRESHOLD_HA,
    DEFAULT_ORG,
    vn2000ToWgs84,
    wgs84ToVn2000,
    computeRviFromDb,
    classifyFrmsAlert,
    parseKmlToGeoJson,
    parsePastedInput,
    analyzeFeatureCollection,
    buildRfc7946Export
  };
})(window);
