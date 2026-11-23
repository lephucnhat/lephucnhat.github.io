/* CheckCCRQT v0.4.0+ — Audit-Grade EUDR/VNTLAS Citations, Seasonal Sensor Profiles & Local AI Knowledge Engine */
(function (global) {
  "use strict";

  const CITATIONS_V04 = [
    {
      id: 1,
      category: "science",
      categoryLabel: "Khoa học & Viễn thám",
      title: "1. Bản đồ nền chuẩn EUDR (10 m) & EC JRC TMF",
      html: "Bourgoin, C., et al. (2024), <em>EC JRC Global Forest Cover 2020 (GFC2020)</em> độ phân giải 10 m làm bản đồ nền tham chiếu mốc 31/12/2020; kết hợp chuỗi biến động rừng ẩm nhiệt đới Vancutsem et al. (2021), <em>Science Advances</em>, 7(10), eabe1603 (phiên bản mở rộng <code class=\"mono\">v1_2025</code>) và chuẩn phân loại <em>FAO FRA 2020</em> (Working Paper 188).",
      copyText: "Bourgoin, C., et al. (2024). EC JRC Global Forest Cover 2020 (GFC2020, 10 m). Vancutsem, C., et al. (2021). Long-term monitoring of forest cover changes in the humid tropics. Science Advances, 7(10), eabe1603 (v1_2025). FAO FRA 2020 (Working Paper 188)."
    },
    {
      id: 2,
      category: "science",
      categoryLabel: "Khoa học & Viễn thám",
      title: "2. Viễn thám Quang học Sentinel-2 & Lọc mây Đa lớp",
      html: "Sản phẩm phản xạ bề mặt ESA Copernicus Sentinel-2A/2B/2C L2A (10–20 m, Drusch et al., 2012), truy xuất qua đặc tả STAC API v1.0 và Cloud-Optimized GeoTIFF (COG) bằng GDAL <code class=\"mono\">/vsicurl/</code>. Nâng cấp lớp lọc mây từ SCL lên <em>Cloud Score+</em> (Pasquarella et al., 2023) / <em>Fmask</em> để triệt tiêu mây ti mỏng vùng nhiệt đới.",
      copyText: "Drusch, M., et al. (2012). Sentinel-2: ESA's Optical High-Resolution Mission for GMES Operational Services. Remote Sensing of Environment, 120, 25–36. Pasquarella, V. J., et al. (2023). Comprehensive quality assessment of optical satellite imagery using weakly supervised video learning (Cloud Score+). STAC API v1.0 & COG."
    },
    {
      id: 3,
      category: "science",
      categoryLabel: "Khoa học & Viễn thám",
      title: "3. Kiểm định Biến động & Đánh giá Độ chính xác",
      html: "Áp dụng quy trình chuẩn ước lượng diện tích và kiểm định sai số biến động lớp phủ của Olofsson et al. (2014), <em>Remote Sensing of Environment</em>, 148, 42–57; tính toán chỉ số thực vật NBR/NDVI và đối chứng độc lập với bản đồ mất rừng toàn cầu Hansen et al. (2013), <em>Science</em>, 342(6160).",
      copyText: "Olofsson, P., et al. (2014). Good practices for estimating area and assessing accuracy of land change. Remote Sensing of Environment, 148, 42–57. Hansen, M. C., et al. (2013). High-Resolution Global Maps of 21st-Century Forest Cover Change. Science, 342(6160), 850–853."
    },
    {
      id: 4,
      category: "science",
      categoryLabel: "Khoa học & Viễn thám",
      title: "4. Radar Xuyên mây Sentinel-1 SAR (Lõi v0.4.0)",
      html: "Dữ liệu Radar khẩu độ tổng hợp ESA Sentinel-1 C-band phân cực kép VV/VH (Torres et al., 2012) đã qua <strong>hiệu chỉnh địa hình bức xạ (RTC)</strong> nhằm khử nhiễu sườn dốc đồi núi. Ứng dụng phương pháp cảnh báo RADD (Reiche et al., 2021) và chỉ số thực vật Radar tổng hợp <code class=\"mono\">RVI = 4·VH / (VV + VH)</code>.",
      copyText: "Torres, R., et al. (2012). GMES Sentinel-1 mission. Remote Sensing of Environment, 120, 9–24. Reiche, J., et al. (2021). Forest disturbance alerts for the Congo Basin using Sentinel-1 (RADD). Environmental Research Letters, 16(2), 024005."
    },
    {
      id: 5,
      category: "legal",
      categoryLabel: "Pháp lý & Chuẩn dữ liệu",
      title: "5. Quy định Chống phá rừng Châu Âu (EUDR)",
      html: "Regulation (EU) 2023/1115 của Nghị viện và Hội đồng Châu Âu: mốc pháp lý 31/12/2020; Điều 2(4) định nghĩa rừng chuẩn FAO (diện tích <strong>&gt; 0,5 ha</strong>, độ tàn che <strong>&gt; 10%</strong>, chiều cao cây trưởng thành <strong>&gt; 5 m</strong>, không phải đất nông nghiệp/đô thị); Điều 9 quy định định vị địa lý phân ngưỡng <strong>4 ha</strong> kèm <em>EC Guidance Document</em>.",
      copyText: "Regulation (EU) 2023/1115 of the European Parliament and of the Council of 31 May 2023 (EUDR): Cutoff 31/12/2020; Art. 2(4) FAO forest definition (>0.5 ha, >10% canopy, >5 m height); Art. 9 geolocation threshold (4 ha) & EC Guidance Document."
    },
    {
      id: 6,
      category: "legal",
      categoryLabel: "Pháp lý & Chuẩn dữ liệu",
      title: "6. Pháp lý Lâm nghiệp & Gỗ hợp pháp Việt Nam (VNTLAS)",
      html: "Luật Lâm nghiệp số 16/2017/QH14; Nghị định 102/2020/NĐ-CP &amp; Nghị định 120/2024/NĐ-CP về Hệ thống bảo đảm gỗ hợp pháp Việt Nam (VNTLAS); Thông tư 33/2018/TT-BNNPTNT &amp; Thông tư 16/2023/TT-BNNPTNT về theo dõi diễn biến rừng (FRMS); Thông tư 26/2022/TT-BNNPTNT &amp; Quyết định 406/QĐ-CCKL ngày 08/7/2025.",
      copyText: "Luật Lâm nghiệp số 16/2017/QH14; NĐ 102/2020/NĐ-CP & NĐ 120/2024/NĐ-CP (VNTLAS); TT 33/2018/TT-BNNPTNT & TT 16/2023/TT-BNNPTNT (FRMS); TT 26/2022/TT-BNNPTNT; QĐ 406/QĐ-CCKL ngày 08/7/2025."
    },
    {
      id: 7,
      category: "legal",
      categoryLabel: "Pháp lý & Chuẩn dữ liệu",
      title: "7. Hệ quy chiếu Quốc gia VN-2000 & WGS-84",
      html: "Quyết định 83/2000/QĐ-TTg, Thông tư 973/2001/TT-TCĐC và Quyết định 05/2007/QĐ-BTNMT quy định bộ 7 tham số Helmert chuyển đổi chính xác giữa hệ tọa độ quốc gia VN-2000 múi chiếu 3° (kinh tuyến trục tỉnh Quảng Trị) và hệ tọa độ toàn cầu WGS-84 (EPSG:4326).",
      copyText: "Quyết định 83/2000/QĐ-TTg; Thông tư 973/2001/TT-TCĐC; Quyết định 05/2007/QĐ-BTNMT về hệ quy chiếu quốc gia VN-2000 (7 tham số Helmert chuyển đổi WGS-84 EPSG:4326)."
    },
    {
      id: 8,
      category: "legal",
      categoryLabel: "Pháp lý & Chuẩn dữ liệu",
      title: "8. Chuẩn Dữ liệu Mở GeoPackage & GeoJSON",
      html: "Chuẩn ISO 19100 series / OGC 12-128r18 (GeoPackage) thay thế Shapefile cũ cho lưu trữ nội bộ (không giới hạn 2 GB, giữ nguyên trường tiếng Việt có dấu). Tự động xuất chuẩn <strong>IETF RFC 7946 (GeoJSON)</strong> làm tròn 6 chữ số thập phân để nộp cổng thông tin EU TRACES NT.",
      copyText: "ISO 19100 series / OGC 12-128r18 (GeoPackage Encoding Standard); IETF RFC 7946 (The GeoJSON Format, EPSG:4326, 6-decimal precision for EU TRACES NT)."
    }
  ];

  const SEASON_PROFILES = {
    dry: {
      id: "dry",
      badge: "MÙA KHÔ QUẢNG TRỊ (THÁNG 2 – THÁNG 8)",
      sensor: "Sentinel-2A / 2B / 2C L2A (Quang học 10–20 m)",
      cloudFilter: "Cloud Score+ (Pasquarella et al., 2023) / Fmask",
      indexUsed: "NDVI & NBR chuỗi 10 ngày (dekad) + xác nhận cửa sổ K=2",
      cloudCover: "12% – 25% (Thông thoáng)",
      penetration: "Quang học độ phân giải cao 10 m, sắc nét ranh giới lô keo lai",
      statusColor: "#2EE59D",
      summary: "Hệ thống ưu tiên ảnh quang học đa phổ Sentinel-2A/2B/2C L2A làm chuẩn chính, kết hợp Cloud Score+ lọc mây ti mỏng để bóc tách chính xác diễn biến tán rừng trồng và rừng tự nhiên."
    },
    rainy: {
      id: "rainy",
      badge: "MÙA MƯA BÃO QUẢNG TRỊ (THÁNG 9 – THÁNG 1)",
      sensor: "Sentinel-1 SAR C-band VV/VH (Hiệu chỉnh địa hình bức xạ RTC)",
      cloudFilter: "Sóng Radar băng tần C (5,405 GHz) — Xuyên mây & mưa 100%",
      indexUsed: "RVI = (4 · σ⁰_VH) / (σ⁰_VV + σ⁰_VH) + thuật toán cảnh báo RADD",
      cloudCover: "80% – 98% (Mây dày đặc — Quang học bị mù)",
      penetration: "Xuyên mây 24/7, khử nhiễu sườn dốc đồi núi miền Trung nhờ RTC",
      statusColor: "#38BDF8",
      summary: "Khi độ che phủ mây vượt ngưỡng mùa mưa bão miền Trung, hệ thống tự động chuyển mạch sang Sentinel-1 SAR RTC để duy trì giám sát sinh khối liên tục 12/12 tháng, xóa hoàn toàn điểm mù thời tiết."
    }
  };

  const QUICK_QUESTIONS = [
    { label: "Lô keo lai 5,2 ha ở Cam Lộ nộp tọa độ kiểu gì?", q: "Lô keo lai 5,2 ha ở Cam Lộ cần nộp tọa độ kiểu gì?" },
    { label: "Mùa mưa tháng 10 Quảng Trị giám sát thế nào?", q: "Mùa mưa tháng 10 ở Quảng Trị hệ thống theo dõi rừng bằng cách nào?" },
    { label: "Chuyển tọa độ VN-2000 sang WGS-84?", q: "Cách chuyển tọa độ VN-2000 sang WGS-84 chuẩn 7 tham số Helmert?" },
    { label: "Phân tích lô đang chọn trên bản đồ", q: "Phân tích chi tiết lô rừng tôi đang chọn trên bản đồ" },
    { label: "Phân tách FRMS Đỏ / Vàng / Xanh", q: "Phân tách FRMS giữa Cảnh báo Đỏ (rừng tự nhiên) và Ghi nhận Vàng (keo lai VNTLAS) thế nào?" },
    { label: "Điều 2(4) EUDR & 08 nguồn chuẩn", q: "Tóm tắt Điều 2(4) EUDR (>0,5 ha) và 08 nguồn trích dẫn chuẩn kiểm toán v0.4.0" }
  ];

  function answerLocalQuestion(question, selectedLot) {
    const q = String(question || "").toLowerCase();

    if (q.includes("5,2 ha") || q.includes("5.2 ha") || (q.includes("cam lộ") && q.includes("kiểu gì"))) {
      return (
        "ĐỐI VỚI LÔ KEO LAI 5,2 HA TẠI CAM LỘ (ĐIỀU 9 EUDR):\n" +
        "1. Nghĩa vụ hình học: Vì diện tích 5,2 ha > 4,0 ha, theo Điều 9 Quy định (EU) 2023/1115, BẮT BUỘC phải nộp ĐA GIÁC KHÉP KÍN (Polygon/MultiPolygon) — không được rút gọn thành 1 điểm tọa độ.\n" +
        "2. Chuẩn tệp nộp EU TRACES NT: Định dạng GeoJSON (IETF RFC 7946), hệ quy chiếu WGS-84 (EPSG:4326), tọa độ làm tròn tối thiểu 6 chữ số thập phân (~11 cm), vòng ngoài ngược chiều kim đồng hồ (CCW), không tự cắt.\n" +
        "3. Hồ sơ hợp pháp VNTLAS: Rừng trồng Keo lai trên đất quy hoạch lâm nghiệp được phân loại 🟡 Ghi nhận Vàng (Hợp pháp VNTLAS) hoặc 🟢 Đạt chuẩn Xanh nếu không xâm lấn rừng tự nhiên sau 31/12/2020."
      );
    }

    if (q.includes("đang chọn") || q.includes("lô này") || q.includes("phân tích lô")) {
      if (!selectedLot) {
        return "Vui lòng bấm vào một lô rừng trên bản đồ hoặc bảng kết quả để hệ thống phân tích chi tiết trắc địa, FRMS và nghĩa vụ EUDR.";
      }
      const ruleText = selectedLot.area_ha > 4.0
        ? "Lô > 4,0 ha: BẮT BUỘC xuất Polygon khép kín chuẩn IETF RFC 7946."
        : "Lô ≤ 4,0 ha: Có thể nộp 1 tọa độ điểm đại diện (Point) hoặc đa giác đầy đủ.";
      const alertText = selectedLot.frms_alert === "DEFORESTATION_ALERT"
        ? "🔴 CẢNH BÁO ĐỎ (DEFORESTATION_ALERT): Suy giảm sinh khối trên Rừng tự nhiên sau 31/12/2020 — cần kiểm tra thực địa ngay."
        : (selectedLot.frms_alert === "LEGAL_PLANTATION_CYCLE"
            ? "🟡 GHI NHẬN VÀNG (LEGAL_PLANTATION_CYCLE): Khai thác/trồng lại theo chu kỳ trên Rừng trồng Keo lai — hợp pháp VNTLAS."
            : "🟢 ĐẠT CHUẨN XANH (COMPLIANT_STABLE): Tán rừng ổn định, đủ điều kiện xuất GeoJSON nộp TRACES NT.");
      return (
        `PHÂN TÍCH LÔ ${selectedLot.id_lo} (${selectedLot.chu_ho}):\n` +
        `• Diện tích: ${selectedLot.area_ha.toFixed(4)} ha | Chu vi: ${selectedLot.perim_m} m\n` +
        `• Loại rừng FRMS: ${selectedLot.loai_rung}\n` +
        `• Tâm WGS-84: ${selectedLot.lat.toFixed(6)}, ${selectedLot.lon.toFixed(6)}\n` +
        `• Phân tách FRMS v0.4.0: ${alertText}\n` +
        `• Nghĩa vụ Điều 9 EUDR: ${ruleText}\n` +
        `• Kiểm tra hình học RFC 7946: ${selectedLot.issues.length ? selectedLot.issues.join(", ") : "Đạt chuẩn (Sạch lỗi)"}.`
      );
    }

    if (q.includes("mùa mưa") || q.includes("tháng 10") || q.includes("radar") || q.includes("sentinel-1") || q.includes("sar") || q.includes("rvi") || q.includes("rtc")) {
      return (
        "CƠ CHẾ GIÁM SÁT MÙA MƯA BÃO QUẢNG TRỊ (THÁNG 9 – THÁNG 1):\n" +
        "• Khi mây che phủ dày đặc làm ảnh quang học Sentinel-2 bị mù, Kiến trúc v0.4.0 tự động chuyển mạch sang Radar xuyên mây ESA Sentinel-1 SAR C-band phân cực kép (VV/VH).\n" +
        "• Dữ liệu đã qua Hiệu chỉnh địa hình bức xạ (RTC) giúp khử nhiễu sườn dốc đồi núi miền Trung (Torres et al., 2012; RADD — Reiche et al., 2021).\n" +
        "• Tính chỉ số thực vật Radar tổng hợp (đổi dB sang tuyến tính σ⁰ = 10^(dB/10) trước khi tính): RVI = (4 · σ⁰_VH) / (σ⁰_VV + σ⁰_VH).\n" +
        "• Bạn có thể bấm thanh gạt Mùa Khô / Mùa Mưa Bão ở Phân khu Kiến trúc v0.4.0 để mô phỏng trực quan."
      );
    }

    if (q.includes("vn-2000") || q.includes("vn2000") || q.includes("helmert") || q.includes("chuyển tọa độ")) {
      return (
        "CHUYỂN ĐỔI TỌA ĐỘ VN-2000 ↔ WGS-84 CHUẨN 7 THAM SỐ HELMERT:\n" +
        "• Căn cứ pháp lý: QĐ 83/2000/QĐ-TTg, TT 973/2001/TT-TCĐC, QĐ 05/2007/QĐ-BTNMT.\n" +
        "• Kinh tuyến trục tỉnh Quảng Trị (múi 3°, k=0,9999, x_0=500.000 m): Quảng Trị Mới 106°00' | Quảng Trị Cũ 106°15' | Quảng Bình Cũ 106°00'.\n" +
        "• Bộ 7 tham số Helmert (+towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278) loại bỏ hoàn toàn sai số dịch chuyển 105–200 m.\n" +
        "• Nhập ngay tọa độ tại Bộ Chuyển đổi Tọa độ Sống ở phía dưới bản đồ để tính tức thì và bay tới vị trí."
      );
    }

    if (q.includes("frms") || q.includes("phân tách") || q.includes("vntlas") || q.includes("keo") || q.includes("rừng tự nhiên") || q.includes("cảnh báo đỏ")) {
      return (
        "BỘ PHÂN TÁCH TRẠNG THÁI RỪNG FRMS CROSS-CHECK (TT 33/2018 & TT 16/2023):\n" +
        "Hệ thống chồng lớp biến động vệ tinh lên cơ sở dữ liệu FRMS (tách bạch hoàn toàn TT 33/2018 & TT 16/2023 về diễn biến rừng khỏi TT 25/2022 về trồng rừng thay thế) kết hợp khung VNTLAS (Luật 16/2017/QH14, NĐ 102/2020 & NĐ 120/2024):\n" +
        "• 🔴 Cảnh báo Đỏ (DEFORESTATION_ALERT): Suy giảm sinh khối trên Rừng tự nhiên sau 31/12/2020 → Rủi ro vi phạm EUDR.\n" +
        "• 🟡 Ghi nhận Vàng (LEGAL_PLANTATION_CYCLE): Khai thác và trồng lại theo chu kỳ trên Rừng trồng (Keo lai) → Hợp pháp VNTLAS, không phải phá rừng EUDR.\n" +
        "• 🟢 Đạt chuẩn Xanh (COMPLIANT_STABLE): Độ che phủ ổn định, đầy đủ tọa độ RFC 7946 và hồ sơ hợp pháp."
      );
    }

    if (q.includes("08 nguồn") || q.includes("8 nguồn") || q.includes("điều 2") || q.includes("0,5 ha") || q.includes("eudr") || q.includes("4 ha")) {
      return (
        "CHUẨN KIỂM TOÁN EUDR (EU 2023/1115) & 08 NGUỒN KHOA HỌC – PHÁP LÝ:\n" +
        "• Điều 2(4) EUDR (Định nghĩa rừng FAO): diện tích > 0,5 ha, độ tàn che > 10%, chiều cao cây trưởng thành > 5 m (không phải đất nông nghiệp/đô thị).\n" +
        "• Điều 9 EUDR: Lô ≤ 4 ha (1 điểm đại diện hoặc đa giác), Lô > 4 ha (bắt buộc đa giác khép kín); tệp nộp EU TRACES NT chuẩn IETF RFC 7946 (EPSG:4326, 6 số lẻ).\n" +
        "• 08 Nguồn chuẩn: (1) Bourgoin et al. 2024 GFC2020 10 m + Vancutsem et al. 2021 JRC TMF + FAO FRA 2020; (2) Sentinel-2 L2A + Cloud Score+ (Pasquarella et al. 2023); (3) Olofsson et al. 2014 + Hansen et al. 2013; (4) Sentinel-1 SAR RTC (Torres 2012) + RADD (Reiche 2021) + RVI; (5) Regulation EU 2023/1115; (6) Luật 16/2017, NĐ 102/2020 & 120/2024, TT 33/2018 & 16/2023, TT 26/2022, QĐ 406/QĐ-CCKL; (7) VN-2000 7 tham số Helmert; (8) ISO 19100 series / OGC 12-128r18 & IETF RFC 7946."
      );
    }

    return (
      "Trợ lý AI EUDR v0.4.0 (Local Knowledge Engine — Chạy tức thì 0 giây không cần API Key).\n" +
      "Bạn có thể bấm các nút câu hỏi gợi ý bên trên hoặc hỏi về: nghĩa vụ Điều 9 (4 ha), Điều 2(4) (>0,5 ha), chuyển mạch Radar Sentinel-1 RTC/RVI mùa mưa bão Quảng Trị, phân tách FRMS Đỏ/Vàng/Xanh, chuyển đổi VN-2000 7 tham số Helmert, hoặc phân tích trực tiếp lô rừng đang chọn."
    );
  }

  global.CheckCCRQTKnowledge = {
    CITATIONS_V04,
    SEASON_PROFILES,
    QUICK_QUESTIONS,
    answerLocalQuestion
  };
})(window);
