/* CheckCCRQT v0.4.0+ — GIS Command Center Main Application Controller */
(function () {
  "use strict";

  const V = window.EudrValidator;
  const KB = window.CheckCCRQTKnowledge;

  function makeRect(lon, lat, dLon, dLat) {
    return [[[lon, lat], [lon + dLon, lat], [lon + dLon, lat + dLat], [lon, lat + dLat], [lon, lat]]];
  }

  // Embedded copy of data/sample-cam-lo.geojson (zero CORS issues on file:// & GitHub Pages)
  const SAMPLE_CAM_LO = {
    type: "FeatureCollection",
    name: "QuangTri_CamLo_KeoLai_EUDR_Sample_v040",
    features: [
      {
        type: "Feature",
        properties: {
          id_lo: "QT-CL-001", chu_ho: "Nguyễn Văn Minh (HTX Cam Nghĩa)", tieu_khu: "751A", khoanh: "2", lo: "14",
          loai_rung: "Rừng trồng (Keo lai)", loai_cay: "Keo lai (Acacia hybrid)", nam_trong: 2021,
          tmf_status: "Tuân thủ", tmf_year: null, tmf_ha: 0,
          tmf_driver: "Rừng trồng ổn định trên đất quy hoạch lâm nghiệp",
          harvest_status: "Chưa khai thác", harvest_date: null,
          scenario: "Đạt chuẩn Xanh — Lô Keo lai Cam Nghĩa ≤ 4 ha ổn định tán",
          ts_ndvi: [0.76, 0.78, 0.81, 0.82, 0.79, 0.77, 0.78, 0.80, 0.83, 0.84, 0.82],
          ts_nbr:  [0.62, 0.65, 0.68, 0.70, 0.66, 0.64, 0.65, 0.67, 0.71, 0.72, 0.69],
          ts_ndmi: [0.44, 0.46, 0.49, 0.50, 0.47, 0.45, 0.46, 0.48, 0.51, 0.52, 0.49]
        },
        geometry: { type: "Polygon", coordinates: makeRect(106.9420, 16.8180, 0.0018, 0.0016) }
      },
      {
        type: "Feature",
        properties: {
          id_lo: "QT-CL-002", chu_ho: "Trần Thị Lan (Nhóm hộ Cam Tuyền)", tieu_khu: "751A", khoanh: "3", lo: "08",
          loai_rung: "Rừng trồng (Keo lai)", loai_cay: "Keo lai (Luân canh trồng lại)", nam_trong: 2020,
          tmf_status: "Tuân thủ", tmf_year: null, tmf_ha: 0,
          tmf_driver: "Khai thác rừng trồng keo luân canh và trồng lại mới hợp pháp VNTLAS",
          harvest_status: "Đã khai thác trắng (Phục hồi tái sinh)", harvest_date: "2025-05-14",
          scenario: "Ghi nhận Vàng VNTLAS — Khai thác luân canh keo & tái sinh",
          ts_ndvi: [0.80, 0.82, 0.21, 0.19, 0.28, 0.42, 0.55, 0.64, 0.70, 0.74, 0.76],
          ts_nbr:  [0.66, 0.69, 0.08, 0.06, 0.16, 0.30, 0.43, 0.51, 0.57, 0.60, 0.62],
          ts_ndmi: [0.48, 0.50, -0.05, -0.08, 0.04, 0.18, 0.29, 0.35, 0.40, 0.43, 0.45]
        },
        geometry: { type: "Polygon", coordinates: makeRect(106.9455, 16.8182, 0.0017, 0.0015) }
      },
      {
        type: "Feature",
        properties: {
          id_lo: "QT-VL-003", chu_ho: "Lê Văn Hùng (HTX Vĩnh Hà)", tieu_khu: "582", khoanh: "4", lo: "21",
          loai_rung: "Rừng trồng (Keo lai)", loai_cay: "Keo lai", nam_trong: 2019,
          tmf_status: "Cảnh báo", tmf_year: null, tmf_ha: 0,
          tmf_driver: "Biến động tán rừng đang diễn ra (JRC TMF Class 50 / RADD)",
          harvest_status: "Khai thác một phần", harvest_date: "2026-03-22",
          scenario: "Cảnh báo biến động lớp 50 — Đối chiếu FRMS",
          ts_ndvi: [0.79, 0.80, 0.81, 0.80, 0.78, 0.79, 0.77, 0.52, 0.49, 0.51, 0.54],
          ts_nbr:  [0.64, 0.65, 0.66, 0.65, 0.63, 0.64, 0.61, 0.34, 0.31, 0.33, 0.37],
          ts_ndmi: [0.46, 0.47, 0.48, 0.47, 0.45, 0.46, 0.43, 0.21, 0.19, 0.20, 0.23]
        },
        geometry: { type: "Polygon", coordinates: makeRect(106.9495, 16.8180, 0.0019, 0.0017) }
      },
      {
        type: "Feature",
        properties: {
          id_lo: "QT-VL-004", chu_ho: "Hồ Văn Dũng (Khu vực giáp ranh Vĩnh Ô)", tieu_khu: "574", khoanh: "1", lo: "05",
          loai_rung: "Rừng tự nhiên suy thoái", loai_cay: "Rừng tự nhiên → Đất trồng mới", nam_trong: 2022,
          tmf_status: "Vi phạm", tmf_year: 2022, tmf_ha: 0.68,
          tmf_driver: "Suy giảm sinh khối trên diện tích Rừng tự nhiên sau mốc 31/12/2020",
          harvest_status: "Đã khai thác trắng", harvest_date: "2025-07-09",
          scenario: "Cảnh báo Đỏ EUDR — Mất rừng tự nhiên sau 31/12/2020",
          ts_ndvi: [0.74, 0.75, 0.73, 0.18, 0.17, 0.20, 0.23, 0.26, 0.28, 0.30, 0.31],
          ts_nbr:  [0.58, 0.59, 0.57, 0.04, 0.03, 0.06, 0.09, 0.12, 0.14, 0.16, 0.17],
          ts_ndmi: [0.40, 0.41, 0.39, -0.10, -0.11, -0.08, -0.05, -0.02, 0.01, 0.03, 0.04]
        },
        geometry: { type: "Polygon", coordinates: makeRect(106.9535, 16.8182, 0.0016, 0.0014) }
      },
      {
        type: "Feature",
        properties: {
          id_lo: "QT-GL-005", chu_ho: "Phạm Văn Tám (Lô dải hẹp khe suối)", tieu_khu: "596", khoanh: "5", lo: "19",
          loai_rung: "Rừng tự nhiên ven suối", loai_cay: "Keo lai xen lấn", nam_trong: 2021,
          tmf_status: "Vi phạm", tmf_year: 2023, tmf_ha: 0.14,
          tmf_driver: "Lô dải hẹp <30m giao cắt pixel mất rừng tự nhiên",
          harvest_status: "Khai thác một phần", harvest_date: "2025-09-18",
          scenario: "Lô dải hẹp <30m — Kiểm tra giao cắt hình học",
          ts_ndvi: [0.77, 0.79, 0.80, 0.78, 0.46, 0.44, 0.48, 0.52, 0.56, 0.59, 0.61],
          ts_nbr:  [0.61, 0.63, 0.64, 0.62, 0.28, 0.26, 0.30, 0.34, 0.38, 0.41, 0.43],
          ts_ndmi: [0.43, 0.45, 0.46, 0.44, 0.15, 0.13, 0.17, 0.21, 0.24, 0.27, 0.29]
        },
        geometry: { type: "Polygon", coordinates: makeRect(106.9420, 16.8152, 0.0036, 0.00018) }
      },
      {
        type: "Feature",
        properties: {
          id_lo: "QT-CL-006", chu_ho: "Công ty TNHH MTV Lâm nghiệp Đường 9", tieu_khu: "752", khoanh: "1", lo: "02",
          loai_rung: "Rừng trồng (Keo lai gỗ lớn FSC)", loai_cay: "Keo lai gỗ lớn (FSC)", nam_trong: 2018,
          tmf_status: "Tuân thủ", tmf_year: null, tmf_ha: 0,
          tmf_driver: "Lô diện tích > 4,0 ha — Bắt buộc đa giác khép kín theo Điều 9 EUDR",
          harvest_status: "Chưa khai thác", harvest_date: null,
          scenario: "Đạt chuẩn Xanh — Lô lớn > 4 ha (bắt buộc Polygon Điều 9)",
          ts_ndvi: [0.83, 0.84, 0.86, 0.87, 0.85, 0.84, 0.84, 0.86, 0.87, 0.88, 0.86],
          ts_nbr:  [0.70, 0.72, 0.74, 0.75, 0.73, 0.71, 0.72, 0.74, 0.75, 0.76, 0.74],
          ts_ndmi: [0.52, 0.54, 0.56, 0.57, 0.55, 0.53, 0.54, 0.56, 0.57, 0.58, 0.56]
        },
        geometry: { type: "Polygon", coordinates: makeRect(106.9468, 16.8134, 0.0028, 0.0020) }
      },
      {
        type: "Feature",
        properties: {
          id_lo: "QT-VL-007", chu_ho: "Võ Văn Sơn (Kê khai trùng mã — Bản ghi 1)", tieu_khu: "583", khoanh: "2", lo: "11",
          loai_rung: "Rừng trồng (Keo lai)", loai_cay: "Keo lai", nam_trong: 2021,
          tmf_status: "Tuân thủ", tmf_year: null, tmf_ha: 0,
          tmf_driver: "Phát hiện trùng mã lô DUPLICATE_ID & chồng lấn ranh giới",
          harvest_status: "Chưa khai thác", harvest_date: null,
          scenario: "Lỗi dữ liệu — Trùng mã lô DUPLICATE_ID (bản ghi 1)",
          ts_ndvi: [0.72, 0.74, 0.75, 0.76, 0.74, 0.73, 0.74, 0.75, 0.76, 0.77, 0.75],
          ts_nbr:  [0.56, 0.58, 0.59, 0.60, 0.58, 0.57, 0.58, 0.59, 0.60, 0.61, 0.59],
          ts_ndmi: [0.39, 0.41, 0.42, 0.43, 0.41, 0.40, 0.41, 0.42, 0.43, 0.44, 0.42]
        },
        geometry: { type: "Polygon", coordinates: makeRect(106.9510, 16.8140, 0.0015, 0.0013) }
      },
      {
        type: "Feature",
        properties: {
          id_lo: "QT-VL-007", chu_ho: "Võ Văn Sơn / HTX B (Trùng mã & Chồng lấn)", tieu_khu: "583", khoanh: "2", lo: "11",
          loai_rung: "Rừng trồng (Keo lai)", loai_cay: "Keo lai", nam_trong: 2021,
          tmf_status: "Cảnh báo", tmf_year: null, tmf_ha: 0,
          tmf_driver: "Trùng mã lô DUPLICATE_ID + Chồng lấn OVERLAP với lô kề",
          harvest_status: "Chưa khai thác", harvest_date: null,
          scenario: "Lỗi dữ liệu — Trùng mã DUPLICATE_ID + Chồng lấn OVERLAP",
          ts_ndvi: [0.71, 0.73, 0.74, 0.75, 0.73, 0.72, 0.73, 0.74, 0.75, 0.76, 0.74],
          ts_nbr:  [0.55, 0.57, 0.58, 0.59, 0.57, 0.56, 0.57, 0.58, 0.59, 0.60, 0.58],
          ts_ndmi: [0.38, 0.40, 0.41, 0.42, 0.40, 0.39, 0.40, 0.41, 0.42, 0.43, 0.41]
        },
        geometry: { type: "Polygon", coordinates: makeRect(106.9520, 16.8144, 0.0014, 0.0012) }
      }
    ]
  };

  let map = null;
  let geoLayer = null;
  let pinMarker = null;
  let gpsCircle = null;
  let analyzedLots = [];
  let selectedIdx = 0;
  let currentIndexKey = "NDVI";
  let currentTableFilter = "all";
  let currentSearchQuery = "";
  let currentCitationFilter = "all";
  let layerOpacity = 0.28;
  let showLotLabels = true;
  let tsChart = null;

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val);
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // 1. Theme & PWA
  function initThemeAndPwa() {
    const saved = localStorage.getItem("checkccrqt_theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const next = (document.documentElement.getAttribute("data-theme") || "dark") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("checkccrqt_theme", next);
        if (analyzedLots.length) renderChart(analyzedLots[selectedIdx]);
      });
    }

    const badge = document.getElementById("sensorStatusBadge");
    function syncNet() {
      if (!badge) return;
      if (navigator.onLine) {
        badge.classList.remove("offline");
        const m = new Date().getMonth() + 1;
        badge.textContent = (m >= 2 && m <= 8) ? "S2 L2A · Trực tuyến" : "S1 SAR RTC · Xuyên mây";
      } else {
        badge.classList.add("offline");
        badge.textContent = "Ngoại tuyến (PWA Ready)";
      }
    }
    window.addEventListener("online", syncNet);
    window.addEventListener("offline", syncNet);
    syncNet();

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  // 2. Leaflet Map
  function initMap() {
    if (typeof L === "undefined") return;
    map = L.map("map", { zoomControl: true }).setView([16.817, 106.948], 15);
    const esriSat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri World Imagery", maxZoom: 19 }
    );
    const openTopo = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenTopoMap", maxZoom: 17 }
    );
    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenStreetMap", maxZoom: 19 }
    );
    esriSat.addTo(map);
    L.control.layers({
      "Vệ tinh (Esri World Imagery)": esriSat,
      "Địa hình (OpenTopoMap)": openTopo,
      "Đường phố (OpenStreetMap)": osm
    }, null, { position: "topright" }).addTo(map);
  }

  function lotColor(item) {
    if (item.frms_alert === "DEFORESTATION_ALERT" || item.issues.includes("DUPLICATE_ID") || item.issues.includes("NON_WGS84")) return "#EF4444";
    if (item.frms_alert === "LEGAL_PLANTATION_CYCLE" || item.issues.includes("OVERLAP")) return "#F59E0B";
    return "#2EE59D";
  }

  function renderWorkbench(fc) {
    analyzedLots = V.analyzeFeatureCollection(fc);
    selectedIdx = 0;

    const total = analyzedLots.length;
    const totalHa = analyzedLots.reduce((s, r) => s + r.area_ha, 0);
    const redAlerts = analyzedLots.filter((r) => r.frms_alert === "DEFORESTATION_ALERT").length;
    const topoIssues = analyzedLots.filter((r) => r.issues.length > 0).length;
    const gt4ha = analyzedLots.filter((r) => r.area_ha > V.EUDR_THRESHOLD_HA).length;

    setText("statTotal", total);
    setText("statArea", totalHa.toFixed(2) + " ha");
    setText("statViol", redAlerts);
    setText("statTopo", topoIssues);
    setText("statLarge", gt4ha);

    if (map && typeof L !== "undefined") {
      if (geoLayer) map.removeLayer(geoLayer);
      const validFeatures = analyzedLots
        .filter((it) => !it.issues.includes("NON_WGS84"))
        .map((it) => ({ ...it.feature, _idx: it.idx }));
      geoLayer = L.geoJSON(
        { type: "FeatureCollection", features: validFeatures },
        {
          style: (f) => {
            const it = analyzedLots[f._idx];
            const c = lotColor(it);
            return { color: c, weight: 2.5, opacity: Math.min(1, layerOpacity + 0.45), fillColor: c, fillOpacity: layerOpacity };
          },
          onEachFeature: (f, layer) => {
            const it = analyzedLots[f._idx];
            const gmaps = `https://www.google.com/maps?q=${it.lat},${it.lon}`;
            layer.bindPopup(
              `<strong>${it.id_lo}</strong> — ${it.chu_ho}<br/>` +
              `DT: <b>${it.area_ha.toFixed(4)} ha</b> | FRMS: <b>${it.loai_rung}</b><br/>` +
              `Điều 9: ${it.eudr_rule}<br/>` +
              `WGS-84: <code>${it.lat.toFixed(6)}, ${it.lon.toFixed(6)}</code> <a href="${gmaps}" target="_blank" rel="noopener">Google Maps</a>`
            );
            if (showLotLabels) {
              layer.bindTooltip(it.id_lo, { permanent: true, direction: "center", className: "lot-label-tooltip" });
            }
            layer.on("click", () => selectLot(it.idx));
          }
        }
      ).addTo(map);
      if (validFeatures.length) {
        try { map.fitBounds(geoLayer.getBounds().pad(0.18)); } catch (e) {}
      }
    }

    renderTable();
    if (analyzedLots.length) selectLot(0);
  }

  function renderTable() {
    const tbody = document.getElementById("lotsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    const q = currentSearchQuery.trim().toLowerCase();
    const filtered = analyzedLots.filter((it) => {
      if (currentTableFilter === "violation" && it.frms_alert !== "DEFORESTATION_ALERT") return false;
      if (currentTableFilter === "issue" && it.issues.length === 0) return false;
      if (currentTableFilter === "large" && it.area_ha <= V.EUDR_THRESHOLD_HA) return false;
      if (q) {
        const hay = `${it.id_lo} ${it.chu_ho} ${it.tieu_khu} ${it.loai_rung} ${it.tmf_status}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:16px;">Không tìm thấy lô rừng khớp bộ lọc hiện tại.</td></tr>`;
      return;
    }

    filtered.forEach((it) => {
      const tr = document.createElement("tr");
      tr.dataset.idx = it.idx;
      if (it.idx === selectedIdx) tr.classList.add("selected-row");

      const frmsPill = it.frms_alert === "DEFORESTATION_ALERT"
        ? `<span class="pill pill-err">Đỏ · Vi phạm EUDR</span>`
        : (it.frms_alert === "LEGAL_PLANTATION_CYCLE"
            ? `<span class="pill pill-warn">Vàng · VNTLAS</span>`
            : `<span class="pill pill-ok">Xanh · Đạt chuẩn</span>`);

      const issueBadges = it.issues.length
        ? it.issues.map((c) => `<span class="pill pill-err">${c}</span>`).join(" ")
        : `<span class="pill pill-ok">RFC 7946 OK</span>`;

      const gmaps = `https://www.google.com/maps?q=${it.lat},${it.lon}`;
      tr.innerHTML = `
        <td class="mono"><strong>${it.id_lo}</strong></td>
        <td>${it.chu_ho}<div style="font-size:0.72rem;color:var(--text-muted);">${it.loai_rung}</div></td>
        <td class="mono">${it.area_ha.toFixed(4)}</td>
        <td class="mono">${it.perim_m}</td>
        <td>${frmsPill}</td>
        <td>${issueBadges}</td>
        <td><span class="pill pill-radar">${it.eudr_rule}</span></td>
        <td class="mono"><a href="${gmaps}" target="_blank" rel="noopener" style="color:var(--emerald)">${it.lat.toFixed(6)}, ${it.lon.toFixed(6)}</a></td>
      `;
      tr.addEventListener("click", () => {
        selectLot(it.idx);
        if (map && !it.issues.includes("NON_WGS84")) map.flyTo([it.lat, it.lon], 17, { duration: 0.45 });
      });
      tbody.appendChild(tr);
    });
  }

  function selectLot(idx) {
    if (!analyzedLots[idx]) return;
    selectedIdx = idx;
    document.querySelectorAll("#lotsTableBody tr").forEach((tr) => {
      tr.classList.toggle("selected-row", Number(tr.dataset.idx) === idx);
    });
    const it = analyzedLots[idx];
    const box = document.getElementById("lotDetailBox");
    if (box) {
      const gmaps = `https://www.google.com/maps?q=${it.lat},${it.lon}`;
      box.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <strong>Lô đang chọn: <span class="mono" style="color:var(--emerald)">${it.id_lo}</span> — ${it.chu_ho}</strong>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button id="btnLotPrintComposer" type="button" class="btn btn-emerald btn-sm" title="In Bản đồ Kỹ thuật Khung đôi A4 cho Lô này kèm bảng tọa độ VN-2000">
              <svg class="svg-ico" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              In Bản đồ A4 Lô này
            </button>
            <a href="${gmaps}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Mở Google Maps</a>
          </div>
        </div>
        <div style="color:var(--text-muted);font-size:0.77rem;margin-top:4px;">${it.scenario}</div>
        <div class="lot-detail-grid">
          <div>Diện tích: <strong class="mono">${it.area_ha.toFixed(4)} ha</strong></div>
          <div>Loại rừng FRMS: <strong>${it.loai_rung}</strong></div>
          <div>Trạng thái S2: <strong>${it.harvest_status}</strong></div>
          <div>Phân loại v0.4: <strong class="mono">${it.frms_alert}</strong></div>
          <div>Điều 9 EUDR: <strong>${it.eudr_rule}</strong></div>
          <div>WGS-84: <strong class="mono">${it.lat.toFixed(6)}, ${it.lon.toFixed(6)}</strong></div>
        </div>
      `;
      box.querySelector("#btnLotPrintComposer")?.addEventListener("click", () => {
        const unit = orgInput ? orgInput.value.trim() : V.DEFAULT_ORG;
        if (global.CheckCCRQTComposer) {
          global.CheckCCRQTComposer.openDoubleLineMapPrint(it, analyzedLots, unit);
        }
      });
    }
    renderChart(it);
  }

  // 3. Chart.js (NDVI / NBR / NDMI / RVI SAR)
  function renderChart(item) {
    const canvas = document.getElementById("tsChart");
    if (!canvas || typeof Chart === "undefined" || !item) return;
    const dataMap = { NDVI: item.ts_ndvi, NBR: item.ts_nbr, NDMI: item.ts_ndmi, RVI: item.ts_rvi };
    const values = dataMap[currentIndexKey] || item.ts_ndvi;
    const peak = Math.max(...values);
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const gridColor = isLight ? "rgba(15,23,42,0.10)" : "rgba(148,163,184,0.16)";
    const textColor = isLight ? "#0F172A" : "#CBD5E1";
    const isRadar = currentIndexKey === "RVI";

    if (tsChart) tsChart.destroy();
    tsChart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: item.ts_dates,
        datasets: [
          {
            label: isRadar ? `RVI Sentinel-1 SAR RTC (${item.id_lo})` : `${currentIndexKey} Sentinel-2 (${item.id_lo})`,
            data: values,
            borderColor: isRadar ? "#38BDF8" : "#2EE59D",
            backgroundColor: isRadar ? "rgba(56,189,248,0.16)" : "rgba(46,229,157,0.15)",
            fill: true,
            tension: 0.3,
            borderWidth: 2.3,
            pointRadius: 3.5,
            pointBackgroundColor: values.map((v, i) => {
              if ((peak - v) / Math.max(peak, 0.01) >= 0.25) return "#EF4444";
              const m = Number((item.ts_dates[i] || "").split("-")[1] || 0);
              return m >= 9 || m === 1 ? "#38BDF8" : "#2EE59D";
            })
          },
          {
            label: `Baseline (${peak.toFixed(2)})`,
            data: values.map(() => Number(peak.toFixed(2))),
            borderColor: "#F59E0B",
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { family: "Be Vietnam Pro", size: 11 } } } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
          y: { min: isRadar ? 0 : -0.2, max: 1, ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } }
        }
      }
    });
  }

  // 4. Seasonal Simulator (Dry T2-T8 vs Rainy T9-T1)
  function initSeasonSimulator() {
    const btnDry = document.getElementById("btnSeasonDry");
    const btnRainy = document.getElementById("btnSeasonRainy");
    const box = document.getElementById("seasonDetail");
    if (!btnDry || !btnRainy || !box) return;

    function renderSeason(key) {
      const p = KB.SEASON_PROFILES[key];
      btnDry.className = "season-btn" + (key === "dry" ? " active-dry" : "");
      btnRainy.className = "season-btn" + (key === "rainy" ? " active-rainy" : "");
      box.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:12px;">
          <strong style="color:${p.statusColor};font-size:0.86rem;">${p.badge}</strong>
          <span class="mono" style="font-size:0.76rem;color:var(--text-muted);">Độ che phủ mây điển hình: ${p.cloudCover}</span>
        </div>
        <p style="margin:6px 0 0;font-size:0.82rem;color:var(--text-muted);">${p.summary}</p>
        <div class="season-metrics">
          <div class="season-metric"><div class="lbl">Cảm biến kích hoạt</div><div class="val">${p.sensor}</div></div>
          <div class="season-metric"><div class="lbl">Xử lý mây / khí quyển</div><div class="val">${p.cloudFilter}</div></div>
          <div class="season-metric"><div class="lbl">Chỉ số &amp; thuật toán</div><div class="val mono">${p.indexUsed}</div></div>
          <div class="season-metric"><div class="lbl">Hiệu năng thực địa</div><div class="val">${p.penetration}</div></div>
        </div>
      `;
    }

    btnDry.addEventListener("click", () => renderSeason("dry"));
    btnRainy.addEventListener("click", () => renderSeason("rainy"));
    const curMonth = new Date().getMonth() + 1;
    renderSeason(curMonth >= 2 && curMonth <= 8 ? "dry" : "rainy");
  }

  // 5. 08 Citations Grid + Filter + Copy Citation
  function initCitations() {
    const grid = document.getElementById("citationsGrid");
    if (!grid) return;

    function renderCitations() {
      const list = KB.CITATIONS_V04.filter((c) => currentCitationFilter === "all" || c.category === currentCitationFilter);
      grid.innerHTML = "";
      list.forEach((c) => {
        const art = document.createElement("article");
        art.className = "sci-card";
        art.innerHTML = `
          <div>
            <h4>${c.title}</h4>
            <p>${c.html}</p>
          </div>
          <div class="sci-card-foot">
            <span class="pill ${c.category === "science" ? "pill-radar" : "pill-ok"}">${c.categoryLabel}</span>
            <button type="button" class="copy-cite-btn" data-id="${c.id}">Sao chép trích dẫn</button>
          </div>
        `;
        art.querySelector(".copy-cite-btn").addEventListener("click", (e) => {
          const btn = e.currentTarget;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(c.copyText).then(() => {
              btn.textContent = "Đã sao chép";
              setTimeout(() => { btn.textContent = "Sao chép trích dẫn"; }, 1800);
            }).catch(() => {});
          }
        });
        grid.appendChild(art);
      });
    }

    document.querySelectorAll(".cite-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentCitationFilter = btn.dataset.cat || "all";
        document.querySelectorAll(".cite-filter-btn").forEach((x) => x.classList.toggle("active", x === btn));
        renderCitations();
      });
    });

    renderCitations();
  }

  // 6. VN-2000 Converter, Field GPS, RVI Lab
  function initGeodeticAndLab() {
    const sel = document.getElementById("convMeridian");
    const inpX = document.getElementById("convVnX"), inpY = document.getElementById("convVnY");
    const inpLat = document.getElementById("convWgsLat"), inpLon = document.getElementById("convWgsLon");
    const out = document.getElementById("convOutput");

    function updateOut(x, y, lon, lat, lon0) {
      if (out) {
        out.innerHTML =
          `<span>VN-2000 (${lon0}°): <strong class="mono">X = ${x.toFixed(2)} m, Y = ${y.toFixed(2)} m</strong></span>` +
          `<span>WGS-84: <strong class="mono">${lat.toFixed(6)}, ${lon.toFixed(6)}</strong></span>`;
      }
    }

    function runVnToWgs() {
      const lon0 = Number(sel.value), x = Number(inpX.value), y = Number(inpY.value);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const [lon, lat] = V.vn2000ToWgs84(x, y, lon0);
      inpLon.value = lon.toFixed(6); inpLat.value = lat.toFixed(6);
      updateOut(x, y, lon, lat, lon0);
    }

    function runWgsToVn() {
      const lon0 = Number(sel.value), lat = Number(inpLat.value), lon = Number(inpLon.value);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      const [x, y] = V.wgs84ToVn2000(lon, lat, lon0);
      inpX.value = x.toFixed(2); inpY.value = y.toFixed(2);
      updateOut(x, y, lon, lat, lon0);
    }

    if (sel && inpX && inpY && inpLat && inpLon) {
      document.getElementById("btnVnToWgs")?.addEventListener("click", runVnToWgs);
      document.getElementById("btnWgsToVn")?.addEventListener("click", runWgsToVn);
      sel.addEventListener("change", runWgsToVn);
      document.getElementById("btnCopyCoord")?.addEventListener("click", (e) => {
        const txt = `VN-2000: X=${inpX.value}, Y=${inpY.value} | WGS-84: ${inpLat.value}, ${inpLon.value}`;
        navigator.clipboard?.writeText(txt).then(() => {
          e.target.textContent = "Đã sao chép";
          setTimeout(() => { e.target.textContent = "Sao chép tọa độ"; }, 1600);
        }).catch(() => {});
      });
      document.getElementById("btnFlyToCoord")?.addEventListener("click", () => {
        const lat = Number(inpLat.value), lon = Number(inpLon.value);
        if (!map || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
        if (pinMarker) map.removeLayer(pinMarker);
        pinMarker = L.circleMarker([lat, lon], { radius: 8, color: "#D4AF37", weight: 2.5, fillColor: "#EF4444", fillOpacity: 0.9 })
          .addTo(map).bindPopup(`<strong>Điểm định vị Helmert</strong><br/>WGS-84: <code>${lat.toFixed(6)}, ${lon.toFixed(6)}</code>`).openPopup();
        map.flyTo([lat, lon], 16, { duration: 0.5 });
      });
      runWgsToVn();
    }

    // Field GPS
    document.getElementById("btnMyGps")?.addEventListener("click", (e) => {
      if (!navigator.geolocation) return alert("Trình duyệt không hỗ trợ định vị GPS.");
      const btn = e.currentTarget;
      btn.textContent = "Đang định vị...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          btn.textContent = "GPS Thực địa";
          const lat = pos.coords.latitude, lon = pos.coords.longitude, acc = Math.round(pos.coords.accuracy || 0);
          if (inpLat) inpLat.value = lat.toFixed(6);
          if (inpLon) inpLon.value = lon.toFixed(6);
          runWgsToVn();
          if (map && typeof L !== "undefined") {
            if (pinMarker) map.removeLayer(pinMarker);
            if (gpsCircle) map.removeLayer(gpsCircle);
            gpsCircle = L.circle([lat, lon], { radius: Math.max(acc, 5), color: "#38BDF8", fillOpacity: 0.14 }).addTo(map);
            pinMarker = L.circleMarker([lat, lon], { radius: 8, color: "#fff", weight: 2, fillColor: "#38BDF8", fillOpacity: 1 })
              .addTo(map).bindPopup(`<strong>Vị trí GPS thực địa</strong><br/><code>${lat.toFixed(6)}, ${lon.toFixed(6)}</code> (±${acc}m)`).openPopup();
            map.flyTo([lat, lon], 16, { duration: 0.5 });
          }
        },
        (err) => { btn.textContent = "GPS Thực địa"; alert("Không lấy được GPS: " + err.message); },
        { enableHighAccuracy: true, timeout: 12000 }
      );
    });

    // RVI Lab
    const vvEl = document.getElementById("labVvDb"), vhEl = document.getElementById("labVhDb");
    const baseEl = document.getElementById("labRviBase"), typeEl = document.getElementById("labLoaiRung");
    const rviOut = document.getElementById("rviLabOutput");
    if (vvEl && vhEl && baseEl && typeEl && rviOut) {
      function calcLab() {
        const { vvLin, vhLin, rvi } = V.computeRviFromDb(vvEl.value, vhEl.value);
        const cls = V.classifyFrmsAlert(typeEl.value, baseEl.value, rvi);
        const delta = rvi - Number(baseEl.value);
        rviOut.innerHTML =
          `<span class="mono">σ⁰_VV = ${vvLin.toFixed(4)} | σ⁰_VH = ${vhLin.toFixed(4)} | <strong>RVI = ${rvi.toFixed(4)}</strong> (ΔRVI = ${delta >= 0 ? "+" : ""}${delta.toFixed(4)})</span>` +
          `<span class="pill pill-${cls.level}">${cls.code} — ${cls.label}</span>`;
      }
      [vvEl, vhEl, baseEl, typeEl].forEach((el) => el.addEventListener("input", calcLab));
      calcLab();
    }
  }

  // 7. AI Copilot Drawer (Local Knowledge Engine + Optional Admin Proxy Endpoint — Zero Hardcoded Secrets)
  function initAiDrawer() {
    const fab = document.getElementById("aiFab");
    const drawer = document.getElementById("aiDrawer");
    const chipsBox = document.getElementById("aiQuickChips");
    const msgBox = document.getElementById("aiMessages");
    const form = document.getElementById("aiForm");
    const input = document.getElementById("aiInput");
    const proxyInput = document.getElementById("aiProxyInput");
    const settingsPanel = document.getElementById("aiSettingsPanel");
    const modeBadge = document.getElementById("aiModeBadge");
    if (!fab || !drawer || !msgBox || !form || !input) return;

    function syncBadge() {
      const proxy = (localStorage.getItem("checkccrqt_ai_proxy") || "").trim();
      if (proxyInput) proxyInput.value = proxy;
      if (modeBadge) {
        modeBadge.textContent = proxy ? "Chế độ: Proxy Quản trị (Fallback Nội bộ)" : "Chế độ: Local Knowledge Engine (0 giây · Offline Ready)";
      }
    }

    function appendMsg(role, text) {
      const d = document.createElement("div");
      d.className = `ai-msg ${role}`;
      d.textContent = text;
      msgBox.appendChild(d);
      msgBox.scrollTop = msgBox.scrollHeight;
      return d;
    }

    async function ask(text) {
      const q = text.trim();
      if (!q) return;
      appendMsg("user", q);
      input.value = "";
      const proxy = (localStorage.getItem("checkccrqt_ai_proxy") || "").trim();
      const selLot = analyzedLots[selectedIdx] || null;
      if (!proxy) {
        appendMsg("bot", KB.answerLocalQuestion(q, selLot));
        return;
      }
      const pending = appendMsg("bot", "Đang truy vấn Endpoint Proxy quản trị...");
      try {
        const res = await window.fetch(proxy, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, selectedLot: selLot })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        pending.textContent = data.answer || data.reply || KB.answerLocalQuestion(q, selLot);
      } catch (err) {
        pending.textContent = `Không kết nối được Proxy (${err.message}). Phản hồi từ Local Knowledge Engine:\n\n` + KB.answerLocalQuestion(q, selLot);
      }
    }

    if (chipsBox) {
      KB.QUICK_QUESTIONS.forEach((item) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ai-chip";
        b.textContent = item.label;
        b.addEventListener("click", () => ask(item.q));
        chipsBox.appendChild(b);
      });
    }

    fab.addEventListener("click", () => drawer.classList.toggle("open"));
    document.getElementById("navAiLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      drawer.classList.add("open");
    });
    document.getElementById("aiCloseBtn")?.addEventListener("click", () => drawer.classList.remove("open"));
    document.getElementById("aiSettingsBtn")?.addEventListener("click", () => settingsPanel?.classList.toggle("open"));
    document.getElementById("aiSaveProxyBtn")?.addEventListener("click", () => {
      localStorage.setItem("checkccrqt_ai_proxy", (proxyInput?.value || "").trim());
      syncBadge();
      settingsPanel?.classList.remove("open");
      appendMsg("bot", "Đã cập nhật cấu hình Proxy cục bộ trên trình duyệt.");
    });
    document.getElementById("aiClearProxyBtn")?.addEventListener("click", () => {
      localStorage.removeItem("checkccrqt_ai_proxy");
      syncBadge();
      appendMsg("bot", "Đã xóa Proxy và quay về Local Knowledge Engine (chạy nội bộ 0 giây).");
    });

    form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
    syncBadge();
    appendMsg("bot", "Xin chào! Tôi là Trợ lý AI EUDR CheckCCRQT v0.4.0.\nBấm một câu hỏi thực chiến bên trên hoặc nhập câu hỏi bất kỳ để nhận giải đáp tức thì không cần API Key.");
  }

  // 8. Bootstrap
  document.addEventListener("DOMContentLoaded", () => {
    initThemeAndPwa();
    initMap();
    initSeasonSimulator();
    initCitations();
    initGeodeticAndLab();
    initAiDrawer();

    // Org Name persistence
    const orgInput = document.getElementById("executingUnitInput");
    if (orgInput) {
      orgInput.value = localStorage.getItem("checkccrqt_org_name") || V.DEFAULT_ORG;
      orgInput.addEventListener("input", () => localStorage.setItem("checkccrqt_org_name", orgInput.value.trim() || V.DEFAULT_ORG));
    }

    renderWorkbench(SAMPLE_CAM_LO);

    // Sample Load & Sample Download
    document.getElementById("btnLoadSample")?.addEventListener("click", () => renderWorkbench(SAMPLE_CAM_LO));
    document.getElementById("btnDownloadSample")?.addEventListener("click", () => {
      downloadFile("sample-cam-lo.geojson", JSON.stringify(SAMPLE_CAM_LO, null, 2), "application/geo+json;charset=utf-8");
    });

    // Paste Coordinates Panel
    const pastePanel = document.getElementById("pastePanel");
    document.getElementById("btnTogglePaste")?.addEventListener("click", () => pastePanel?.classList.toggle("open"));
    document.getElementById("btnRunPaste")?.addEventListener("click", () => {
      try {
        const fc = V.parsePastedInput(document.getElementById("pasteTextarea")?.value || "");
        renderWorkbench(fc);
        pastePanel?.classList.remove("open");
      } catch (err) {
        alert(err.message);
      }
    });

    // Export GeoJSON RFC 7946, Multi-Sheet Excel, Word, Technical Map, CSV, Print PDF
    document.getElementById("btnExportEudrGeoJson")?.addEventListener("click", () => {
      if (!analyzedLots.length) return alert("Vui lòng nạp hoặc phân tích lô rừng trước khi xuất GeoJSON!");
      const ptUnder4 = Boolean(document.getElementById("chkPointUnder4Ha")?.checked);
      const unit = orgInput ? orgInput.value.trim() : V.DEFAULT_ORG;
      const fc = V.buildRfc7946Export(analyzedLots, ptUnder4, unit);
      downloadFile("Ho_So_EUDR_TRACES_RFC7946.geojson", JSON.stringify(fc, null, 2), "application/geo+json;charset=utf-8");
    });

    document.getElementById("btnExportMultiSheetExcel")?.addEventListener("click", () => {
      if (!analyzedLots.length) return alert("Vui lòng nạp hoặc phân tích lô rừng trước khi xuất Excel 3-Sheet!");
      const unit = orgInput ? orgInput.value.trim() : V.DEFAULT_ORG;
      if (global.CheckCCRQTComposer) {
        global.CheckCCRQTComposer.exportFormulaExcel(analyzedLots, unit);
      }
    });

    document.getElementById("btnExportWordDoc")?.addEventListener("click", () => {
      if (!analyzedLots.length) return alert("Vui lòng nạp hoặc phân tích lô rừng trước khi xuất Báo cáo Word!");
      const unit = orgInput ? orgInput.value.trim() : V.DEFAULT_ORG;
      if (global.CheckCCRQTComposer) {
        global.CheckCCRQTComposer.exportForestryWord(analyzedLots, unit);
      }
    });

    document.getElementById("btnExportMapComposer")?.addEventListener("click", () => {
      if (!analyzedLots.length) return alert("Vui lòng nạp hoặc phân tích lô rừng trước khi xuất Bản đồ Kỹ thuật!");
      const unit = orgInput ? orgInput.value.trim() : V.DEFAULT_ORG;
      const currentLot = analyzedLots[selectedIdx] || analyzedLots[0];
      if (global.CheckCCRQTComposer) {
        global.CheckCCRQTComposer.openDoubleLineMapPrint(currentLot, analyzedLots, unit);
      }
    });

    document.getElementById("btnExportCsv")?.addEventListener("click", () => {
      if (!analyzedLots.length) return alert("Vui lòng nạp hoặc phân tích lô rừng trước khi xuất CSV!");
      const headers = ["Ma_Lo", "Chu_Ho", "Loai_Rung_FRMS", "Dien_Tich_Ha", "Chu_Vi_m", "Phan_Loai_v04", "Loi_RFC7946", "Nghia_Vu_Dieu_9", "Vi_Do_WGS84", "Kinh_Do_WGS84"];
      const rows = analyzedLots.map((it) => [
        it.id_lo, it.chu_ho, it.loai_rung, it.area_ha, it.perim_m, it.frms_alert,
        it.issues.join("; "), it.eudr_rule, it.lat.toFixed(6), it.lon.toFixed(6)
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
      downloadFile("Bao_Cao_EUDR_CheckCCRQT_v040.csv", "\uFEFF" + headers.join(",") + "\n" + rows.join("\n"), "text/csv;charset=utf-8;");
    });

    document.getElementById("btnPrintPdf")?.addEventListener("click", () => window.print());

    // Map Controls
    document.getElementById("opacityRange")?.addEventListener("input", (e) => {
      layerOpacity = Number(e.target.value) / 100.0;
      setText("opacityVal", `${e.target.value}%`);
      if (geoLayer) {
        geoLayer.setStyle((f) => {
          const c = lotColor(analyzedLots[f._idx]);
          return { color: c, weight: 2.5, opacity: Math.min(1, layerOpacity + 0.45), fillColor: c, fillOpacity: layerOpacity };
        });
      }
    });
    document.getElementById("btnZoomExtent")?.addEventListener("click", () => {
      if (map && geoLayer) try { map.fitBounds(geoLayer.getBounds().pad(0.18)); } catch (e) {}
    });
    document.getElementById("chkShowLabels")?.addEventListener("change", (e) => {
      showLotLabels = Boolean(e.target.checked);
      renderWorkbench({ type: "FeatureCollection", features: analyzedLots.map((it) => it.feature) });
    });

    // Index Tabs
    document.querySelectorAll(".index-btn").forEach((b) => {
      b.addEventListener("click", () => {
        currentIndexKey = b.dataset.index;
        document.querySelectorAll(".index-btn").forEach((x) => x.classList.toggle("active", x === b));
        if (analyzedLots[selectedIdx]) renderChart(analyzedLots[selectedIdx]);
      });
    });

    // Table Search & Filter
    document.getElementById("lotSearchInput")?.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value;
      renderTable();
    });
    document.querySelectorAll(".table-filter-pill").forEach((p) => {
      p.addEventListener("click", () => {
        currentTableFilter = p.dataset.filter || "all";
        document.querySelectorAll(".table-filter-pill").forEach((x) => x.classList.toggle("active", x === p));
        renderTable();
      });
    });

    // Drag & Drop File Upload
    const dz = document.getElementById("dropzone"), fi = document.getElementById("fileInput");
    function handleFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const txt = String(reader.result || "");
          const fc = file.name.toLowerCase().endsWith(".kml")
            ? V.parseKmlToGeoJson(txt)
            : V.parsePastedInput(txt);
          if (!fc.features || !fc.features.length) return alert("Không tìm thấy hình học hợp lệ.");
          renderWorkbench(fc);
        } catch (err) {
          alert("Lỗi đọc tệp không gian: " + err.message);
        }
      };
      reader.readAsText(file, "utf-8");
    }
    if (dz && fi) {
      dz.addEventListener("click", () => fi.click());
      fi.addEventListener("change", (e) => handleFile(e.target.files[0]));
      dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("dragover"); });
      dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
      dz.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("dragover"); handleFile(e.dataTransfer.files[0]); });
    }

    // QR Code
    const qrInput = document.getElementById("qrUrlInput");
    const defaultQrUrl = window.location.protocol.startsWith("http")
      ? window.location.href
      : "https://happyrun09.github.io/checkccrqt/";
    if (qrInput) qrInput.value = defaultQrUrl;
    function renderQR(url) {
      const box = document.getElementById("qrcode");
      if (!box || typeof QRCode === "undefined") return;
      box.innerHTML = "";
      new QRCode(box, { text: url, width: 170, height: 170, colorDark: "#0D3B26", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
    }
    renderQR(defaultQrUrl);
    document.getElementById("btnGenQr")?.addEventListener("click", () => renderQR((qrInput?.value || "").trim() || defaultQrUrl));
    document.getElementById("btnDownloadQr")?.addEventListener("click", () => {
      const canvas = document.querySelector("#qrcode canvas");
      const img = document.querySelector("#qrcode img");
      const dataUrl = canvas ? canvas.toDataURL("image/png") : (img ? img.src : null);
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "QR_CheckCCRQT_v0.4.0.png";
      a.click();
    });
  });
})();
