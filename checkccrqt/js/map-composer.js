/* CheckCCRQT v0.5.0 — Browser-Native Technical Map Composer (Double-Line Frame A4/A3),
 * Multi-Sheet Formula Excel (.xlsx) Exporter & Forestry Word (.doc) Report Exporter.
 * Replaces desktop-only reporting features so the Web-App works 100% standalone.
 */
(function (global) {
  "use strict";

  const V = global.EudrValidator;

  // =========================================================================
  // 1. TECHNICAL DOUBLE-LINE FRAME MAP COMPOSER (A4 Single Lot / A3 Overview)
  // =========================================================================
  function getRingCoords(geom) {
    if (!geom) return [];
    if (geom.type === "Polygon") return geom.coordinates[0] || [];
    if (geom.type === "MultiPolygon") return (geom.coordinates[0] && geom.coordinates[0][0]) || [];
    if (geom.type === "Point") return [geom.coordinates];
    return [];
  }

  function buildLotSvgMap(lot, widthPx, heightPx) {
    const ring = getRingCoords(lot.feature.geometry);
    if (!ring.length) return `<svg width="${widthPx}" height="${heightPx}"></svg>`;
    const lons = ring.map((c) => c[0]), lats = ring.map((c) => c[1]);
    let minX = Math.min(...lons), maxX = Math.max(...lons);
    let minY = Math.min(...lats), maxY = Math.max(...lats);
    const padX = Math.max((maxX - minX) * 0.25, 0.0003);
    const padY = Math.max((maxY - minY) * 0.25, 0.0003);
    minX -= padX; maxX += padX; minY -= padY; maxY += padY;

    const spanX = maxX - minX, spanY = maxY - minY;
    const scale = Math.min((widthPx - 80) / spanX, (heightPx - 80) / spanY);
    const offX = (widthPx - spanX * scale) / 2;
    const offY = (heightPx - spanY * scale) / 2;

    const toPx = ([lon, lat]) => [
      offX + (lon - minX) * scale,
      heightPx - (offY + (lat - minY) * scale)
    ];

    // Grid lines
    let gridSvg = "";
    for (let i = 1; i <= 4; i++) {
      const gx = (widthPx / 5) * i;
      const gy = (heightPx / 5) * i;
      gridSvg += `<line x1="${gx}" y1="0" x2="${gx}" y2="${heightPx}" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="0.8"/>`;
      gridSvg += `<line x1="0" y1="${gy}" x2="${widthPx}" y2="${gy}" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="0.8"/>`;
    }

    const pts = ring.map(toPx);
    const polyPoints = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const strokeCol = lot.frms_alert === "DEFORESTATION_ALERT" ? "#dc2626" : (lot.frms_alert === "LEGAL_PLANTATION_CYCLE" ? "#d97706" : "#059669");

    // Vertex markers (up to 16 evenly spaced)
    const uniqueVerts = ring.length > 1 ? ring.slice(0, -1) : ring;
    const step = Math.max(1, Math.ceil(uniqueVerts.length / 16));
    let vertsSvg = "";
    uniqueVerts.forEach((c, idx) => {
      if (idx % step !== 0 && idx !== uniqueVerts.length - 1) return;
      const [px, py] = toPx(c);
      vertsSvg += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="#ffffff" stroke="${strokeCol}" stroke-width="2"/>`;
      vertsSvg += `<text x="${(px + 6).toFixed(1)}" y="${(py - 5).toFixed(1)}" font-size="11" font-weight="700" fill="#0f172a">${idx + 1}</text>`;
    });

    // Scale bar estimate
    const metersWidth = spanX * 111320 * Math.cos((lot.lat * Math.PI) / 180);
    const barMeters = Math.max(20, Math.round((metersWidth * 0.22) / 10) * 10);
    const barPx = Math.min(140, Math.max(55, (barMeters / Math.max(metersWidth, 1)) * widthPx));

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${widthPx} ${heightPx}" width="100%" height="100%" style="background:#f8fafc;display:block;">
        ${gridSvg}
        <polygon points="${polyPoints}" fill="${strokeCol}" fill-opacity="0.18" stroke="${strokeCol}" stroke-width="3"/>
        ${vertsSvg}
        <text x="${(widthPx / 2).toFixed(1)}" y="${(heightPx / 2).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="800" fill="#0D3B26">${lot.id_lo}</text>
        <!-- North Arrow -->
        <g transform="translate(${widthPx - 46}, 26)">
          <polygon points="16,0 24,28 16,22 8,28" fill="#0D3B26"/>
          <text x="16" y="42" text-anchor="middle" font-size="12" font-weight="800" fill="#0D3B26">B (N)</text>
        </g>
        <!-- Scale Bar -->
        <g transform="translate(20, ${heightPx - 32})">
          <rect x="0" y="8" width="${barPx.toFixed(0)}" height="6" fill="#0D3B26"/>
          <text x="0" y="5" font-size="10" font-weight="700" fill="#0f172a">0</text>
          <text x="${barPx.toFixed(0)}" y="5" text-anchor="end" font-size="10" font-weight="700" fill="#0f172a">${barMeters} m</text>
        </g>
      </svg>`;
  }

  function openDoubleLineMapPrint(lot, orgName, meridianDeg) {
    if (!lot) return alert("Vui lòng chọn một lô rừng trước khi xuất bản đồ kỹ thuật.");
    const lon0 = Number(meridianDeg) || 106.0;
    const ring = getRingCoords(lot.feature.geometry);
    const verts = ring.length > 1 ? ring.slice(0, -1) : ring;
    const step = Math.max(1, Math.ceil(verts.length / 16));
    let coordRows = "";
    verts.forEach((c, idx) => {
      if (idx % step !== 0 && idx !== verts.length - 1) return;
      const [vx, vy] = V.wgs84ToVn2000(c[0], c[1], lon0);
      coordRows += `<tr><td>${idx + 1}</td><td class="mono">${vx.toFixed(2)}</td><td class="mono">${vy.toFixed(2)}</td><td class="mono">${c[1].toFixed(6)}</td><td class="mono">${c[0].toFixed(6)}</td></tr>`;
    });

    const today = new Date().toLocaleDateString("vi-VN");
    const svgHtml = buildLotSvgMap(lot, 640, 420);
    const win = window.open("", "_blank", "width=920,height=1080");
    if (!win) return alert("Trình duyệt đang chặn cửa sổ bật lên (Pop-up). Hãy cho phép Pop-up để mở Bản đồ in A4.");

    win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Bản đồ Kỹ thuật Khung 02 Dòng Kẻ — ${lot.id_lo}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 14px; color: #0f172a; background: #fff; }
    .outer-frame { border: 3px solid #0D3B26; padding: 4px; }
    .inner-frame { border: 1px solid #0D3B26; padding: 14px; }
    .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0D3B26; padding-bottom: 8px; margin-bottom: 10px; }
    .hdr h1 { margin: 0; font-size: 16px; color: #0D3B26; text-transform: uppercase; }
    .hdr .sub { font-size: 11px; color: #334155; margin-top: 3px; }
    .map-box { border: 1.5px solid #0D3B26; height: 390px; margin-bottom: 10px; overflow: hidden; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 14px; font-size: 11.5px; margin-bottom: 10px; background: #f8fafc; padding: 8px 10px; border: 1px solid #cbd5e1; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 12px; }
    th, td { border: 1px solid #94a3b8; padding: 4px 6px; text-align: center; }
    th { background: #0D3B26; color: #fff; }
    .mono { font-family: 'Consolas', monospace; }
    .sign { display: flex; justify-content: space-between; margin-top: 14px; font-size: 11px; text-align: center; }
    .no-print { text-align: right; margin-bottom: 10px; }
    .no-print button { padding: 8px 16px; background: #0D3B26; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print"><button onclick="window.print()">In / Lưu PDF Bản đồ Khung 02 Dòng Kẻ (A4)</button></div>
  <div class="outer-frame">
    <div class="inner-frame">
      <div class="hdr">
        <div>
          <div style="font-size:11px;font-weight:700;color:#0D3B26;">${(orgName || V.DEFAULT_ORG).toUpperCase()}</div>
          <h1>BẢN ĐỒ TRUY XUẤT NGUỒN GỐC LÔ RỪNG CHỨNG CHỈ &amp; EUDR</h1>
          <div class="sub">Hệ quy chiếu: VN-2000 Múi 3° (Kinh tuyến trục ${lon0}°, 7 tham số Helmert) &amp; WGS-84 (EPSG:4326)</div>
        </div>
        <div style="text-align:right;font-size:11px;">
          <strong>Mã lô: ${lot.id_lo}</strong><br/>Ngày xuất: ${today}<br/>CheckCCRQT v0.5.0
        </div>
      </div>

      <div class="map-box">${svgHtml}</div>

      <div class="meta-grid">
        <div><strong>Chủ hộ / Đơn vị:</strong> ${lot.chu_ho}</div>
        <div><strong>Diện tích / Chu vi:</strong> ${lot.area_ha.toFixed(4)} ha | ${lot.perim_m} m</div>
        <div><strong>Loại rừng FRMS:</strong> ${lot.loai_rung}</div>
        <div><strong>Phân tách FRMS v0.5:</strong> ${lot.frms_alert}</div>
        <div><strong>Nghĩa vụ Điều 9 EUDR:</strong> ${lot.eudr_rule}</div>
        <div><strong>Tâm WGS-84 (6 số lẻ):</strong> <span class="mono">${lot.lat.toFixed(6)}, ${lot.lon.toFixed(6)}</span></div>
      </div>

      <div style="font-size:11.5px;font-weight:700;margin-bottom:4px;color:#0D3B26;">BẢNG TỌA ĐỘ CÁC ĐỈNH RANH GIỚI LÔ RỪNG (VN-2000 &amp; WGS-84)</div>
      <table>
        <thead>
          <tr><th>Đỉnh</th><th>X VN-2000 (m)</th><th>Y VN-2000 (m)</th><th>Vĩ độ WGS-84</th><th>Kinh độ WGS-84</th></tr>
        </thead>
        <tbody>${coordRows}</tbody>
      </table>

      <div class="sign">
        <div style="width:45%;"><strong>CÁN BỘ KIỂM TRA</strong><br/><em>(Ký, ghi rõ họ tên)</em><br/><br/><br/></div>
        <div style="width:45%;"><em>Quảng Trị, ngày ${today}</em><br/><strong>ĐẠI DIỆN ĐƠN VỊ THỰC HIỆN</strong><br/><em>(Ký tên, đóng dấu)</em><br/><br/><br/></div>
      </div>
    </div>
  </div>
</body>
</html>`);
    win.document.close();
  }

  // =========================================================================
  // 2. MULTI-SHEET FORMULA EXCEL (.xlsx) EXPORTER (SheetJS)
  // =========================================================================
  function exportFormulaExcel(analyzedLots, orgName) {
    if (typeof XLSX === "undefined") {
      return alert("Thư viện SheetJS (XLSX) chưa tải xong. Vui lòng dùng nút Xuất CSV hoặc kiểm tra kết nối mạng.");
    }
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "Báo cáo Thẩm định EUDR & Rừng Chứng chỉ CheckCCRQT v0.5.0",
      Author: (orgName || "").trim() || V.DEFAULT_ORG,
      CreatedDate: new Date()
    };

    // Sheet 1: JRC_TMF_ChiTiet
    const headers1 = [
      "Mã lô", "Chủ hộ", "Loại rừng FRMS", "Diện tích (ha)", "Chu vi (m)",
      "Phân tách FRMS v0.5", "Trạng thái JRC TMF", "Năm mất rừng",
      "Lỗi RFC 7946", "Nghĩa vụ Điều 9 EUDR", "Vĩ độ WGS-84", "Kinh độ WGS-84"
    ];
    const data1 = [headers1];
    analyzedLots.forEach((it) => {
      data1.push([
        it.id_lo, it.chu_ho, it.loai_rung, it.area_ha, it.perim_m,
        it.frms_alert, it.tmf_status, it.tmf_year || "",
        it.issues.length ? it.issues.join("; ") : "RFC 7946 OK",
        it.eudr_rule, Number(it.lat.toFixed(6)), Number(it.lon.toFixed(6))
      ]);
    });
    const ws1 = XLSX.utils.aoa_to_sheet(data1);
    XLSX.utils.book_append_sheet(wb, ws1, "JRC_TMF_ChiTiet");

    // Sheet 2: Tong_Hop_EUDR (LIVE EXCEL FORMULAS COUNTIF / SUMIF)
    const lastRow = analyzedLots.length + 1;
    const ws2 = XLSX.utils.aoa_to_sheet([
      ["Phân loại FRMS / EUDR", "Số lượng lô", "Tổng diện tích (ha)"],
      ["DEFORESTATION_ALERT", { f: `COUNTIF(JRC_TMF_ChiTiet!F2:F${lastRow},"DEFORESTATION_ALERT")` }, { f: `SUMIF(JRC_TMF_ChiTiet!F2:F${lastRow},"DEFORESTATION_ALERT",JRC_TMF_ChiTiet!D2:D${lastRow})` }],
      ["LEGAL_PLANTATION_CYCLE", { f: `COUNTIF(JRC_TMF_ChiTiet!F2:F${lastRow},"LEGAL_PLANTATION_CYCLE")` }, { f: `SUMIF(JRC_TMF_ChiTiet!F2:F${lastRow},"LEGAL_PLANTATION_CYCLE",JRC_TMF_ChiTiet!D2:D${lastRow})` }],
      ["COMPLIANT_STABLE", { f: `COUNTIF(JRC_TMF_ChiTiet!F2:F${lastRow},"COMPLIANT_STABLE")` }, { f: `SUMIF(JRC_TMF_ChiTiet!F2:F${lastRow},"COMPLIANT_STABLE",JRC_TMF_ChiTiet!D2:D${lastRow})` }],
      ["TỔNG CỘNG", { f: "SUM(B2:B4)" }, { f: "SUM(C2:C4)" }]
    ]);
    XLSX.utils.book_append_sheet(wb, ws2, "Tong_Hop_EUDR");

    // Sheet 3: Vi_Pham_Canh_Bao
    const flagged = analyzedLots.filter((it) => it.frms_alert !== "COMPLIANT_STABLE" || it.issues.length > 0);
    const data3 = [["Mã lô", "Chủ hộ", "Diện tích (ha)", "Phân loại", "Lỗi RFC 7946", "Ghi chú nghiệp vụ"]];
    flagged.forEach((it) => {
      data3.push([it.id_lo, it.chu_ho, it.area_ha, it.frms_alert, it.issues.join("; "), it.tmf_driver || it.scenario]);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(data3);
    XLSX.utils.book_append_sheet(wb, ws3, "Vi_Pham_Canh_Bao");

    XLSX.writeFile(wb, "Bao_Cao_EUDR_CheckCCRQT_v050.xlsx");
  }

  // =========================================================================
  // 3. FORESTRY WORD (.doc) REPORT EXPORTER (Opens cleanly in Microsoft Word)
  // =========================================================================
  function exportForestryWord(analyzedLots, orgName) {
    const today = new Date().toLocaleDateString("vi-VN");
    const totalHa = analyzedLots.reduce((s, r) => s + r.area_ha, 0);
    const redCnt = analyzedLots.filter((r) => r.frms_alert === "DEFORESTATION_ALERT").length;
    const yellowCnt = analyzedLots.filter((r) => r.frms_alert === "LEGAL_PLANTATION_CYCLE").length;
    const greenCnt = analyzedLots.filter((r) => r.frms_alert === "COMPLIANT_STABLE").length;

    let rows = "";
    analyzedLots.forEach((it, idx) => {
      rows += `<tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td style="text-align:center;"><strong>${it.id_lo}</strong></td>
        <td>${it.chu_ho}</td>
        <td style="text-align:right;">${it.area_ha.toFixed(4)}</td>
        <td>${it.frms_alert}</td>
        <td>${it.eudr_rule}</td>
        <td style="text-align:center;">${it.lat.toFixed(6)}, ${it.lon.toFixed(6)}</td>
      </tr>`;
    });

    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"/><title>Báo cáo Kiểm tra EUDR</title>
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #111; }
  h1 { text-align: center; color: #0D3B26; font-size: 15pt; }
  h2 { color: #0D3B26; font-size: 12pt; margin-top: 14pt; }
  table { width: 100%; border-collapse: collapse; margin-top: 8pt; font-size: 9.5pt; }
  th, td { border: 1px solid #94a3b8; padding: 5px 6px; }
  th { background: #0D3B26; color: #ffffff; }
</style></head>
<body>
  <p style="text-align:center;font-weight:bold;color:#0D3B26;">${(orgName || V.DEFAULT_ORG).toUpperCase()}</p>
  <h1>BÁO CÁO KẾT QUẢ THẨM ĐỊNH RỪNG CHỨNG CHỈ &amp; TUÂN THỦ EUDR (v0.5.0)</h1>
  <p style="text-align:center;"><em>Ngày lập báo cáo: ${today} | Hệ thống CheckCCRQT v0.5.0 All-in-One Web GIS</em></p>

  <h2>1. Tổng hợp kết quả kiểm tra</h2>
  <table>
    <tr><th>Tổng số lô</th><th>Tổng diện tích (ha)</th><th>Cảnh báo Đỏ (EUDR)</th><th>Ghi nhận Vàng (VNTLAS)</th><th>Đạt chuẩn Xanh</th></tr>
    <tr style="text-align:center;font-weight:bold;">
      <td>${analyzedLots.length}</td><td>${totalHa.toFixed(4)}</td><td style="color:#b91c1c;">${redCnt}</td><td style="color:#b45309;">${yellowCnt}</td><td style="color:#047857;">${greenCnt}</td>
    </tr>
  </table>

  <h2>2. Danh sách chi tiết các lô rừng thẩm định</h2>
  <table>
    <thead><tr><th>STT</th><th>Mã lô</th><th>Chủ hộ / Đơn vị</th><th>DT (ha)</th><th>Phân tách FRMS</th><th>Nghĩa vụ Điều 9</th><th>Tâm WGS-84</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <p style="margin-top:16pt;font-size:10pt;"><em>Ghi chú pháp lý: Kiểm định theo Quy định (EU) 2023/1115 (mốc 31/12/2020; Điều 2(4) &gt;0,5 ha, &gt;10% tàn che, &gt;5 m chiều cao; Điều 9 ngưỡng 4 ha), Luật Lâm nghiệp 16/2017/QH14, NĐ 102/2020 &amp; 120/2024 (VNTLAS), TT 33/2018 &amp; TT 16/2023 (FRMS).</em></p>
</body></html>`;

    const blob = new Blob(["\uFEFF" + docHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Bao_Cao_EUDR_CheckCCRQT_v050.doc";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  global.CheckCCRQTComposer = {
    openDoubleLineMapPrint,
    exportFormulaExcel,
    exportForestryWord
  };
})(window);
