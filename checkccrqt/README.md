# CheckCCRQT — Hệ thống Giám sát Rừng Chứng chỉ & Thẩm định EUDR Quảng Trị (v0.4.0+)

**Đơn vị phát triển:** Phòng Sử dụng và Phát triển rừng — Chi cục Kiểm lâm tỉnh Quảng Trị (Sở Nông nghiệp và Môi trường tỉnh Quảng Trị)  
**Trang web trực tuyến (GitHub Pages):** https://happyrun09.github.io/checkccrqt/  
**Liên hệ kỹ thuật:** `sdptrklqt@gmail.com` · `0905 822 335`

---

## Kiến trúc Mã nguồn Chuẩn hóa

```text
checkccrqt/
├── index.html                        # Executive GIS Command Center (Dark/Light + Mobile-First)
├── css/style.css                     # Design System (#06110C / #1B4332 / #2EE59D + Print A4)
├── js/
│   ├── eudr-validator.js             # Kiểm định IETF RFC 7946, 7 tham số Helmert VN-2000, RVI & FRMS
│   ├── knowledge-base.js             # 08 nguồn khoa học-pháp lý, mô phỏng mùa & Local AI Engine
│   └── app.js                        # Điều phối Leaflet, Chart.js, GPS thực địa, PWA & AI Drawer
├── data/sample-cam-lo.geojson        # Bộ dữ liệu mẫu 08 lô Keo lai Cam Lộ / Vĩnh Linh (RFC 7946)
├── scripts/
│   ├── eudr_v04_radar_pipeline.py    # Luồng STAC Sentinel-1 SAR RTC + RVI + FRMS Cross-Check
│   └── requirements.txt              # Thư viện Python cho lõi Radar v0.4.0
├── downloads/CheckCCRQT_v0.3.1.zip   # Gói cài đặt sạch Plugin QGIS (3.28 LTR -> 3.44+)
├── assets/logo_kiemlam.png           # Nhận diện Kiểm lâm Việt Nam
├── manifest.webmanifest & sw.js      # Hỗ trợ PWA cài đặt Offline trên điện thoại
└── .nojekyll                         # Tối ưu xuất bản tĩnh trên GitHub Pages
```

---

## Tính năng Cốt lõi (v0.4.0+)

1. **Công cụ Kiểm tra & Chuẩn hóa Hồ sơ Lô rừng EUDR (100% Client-Side):**
   - Hỗ trợ kéo thả `.geojson` / `.json` / `.kml`, dán trực tiếp chuỗi tọa độ, hoặc nạp mẫu Keo lai Cam Lộ.
   - Tự động kiểm tra `EPSG:4326`, lỗi tự cắt/hở vòng, `DUPLICATE_ID`, `OVERLAP`, tính diện tích trắc địa (`ha`), phân loại nghĩa vụ **Điều 9 EUDR (`≤ 4 ha` Điểm vs `> 4 ha` Đa giác bắt buộc)** và xuất tệp **GeoJSON đạt chuẩn IETF RFC 7946** (6 chữ số thập phân, CCW) nộp cổng EU TRACES NT.
2. **Kiến trúc Đa cảm biến Xuyên mây 12/12 tháng:**
   - **Mùa Khô (Tháng 2 – Tháng 8):** Quang học Sentinel-2A/2B/2C L2A + lọc mây *Cloud Score+* / *Fmask*.
   - **Mùa Mưa Bão (Tháng 9 – Tháng 1):** Tự động chuyển mạch sang Radar **Sentinel-1 SAR C-band (RTC)** + chỉ số thực vật Radar $RVI = \frac{4 \cdot \sigma^0_{VH}}{\sigma^0_{VV} + \sigma^0_{VH}}$.
   - **FRMS Cross-Check:** Phân tách rõ 🔴 Cảnh báo Đỏ (`DEFORESTATION_ALERT` trên Rừng tự nhiên), 🟡 Ghi nhận Vàng (`LEGAL_PLANTATION_CYCLE` trên Rừng trồng Keo lai hợp pháp VNTLAS) và 🟢 Đạt chuẩn Xanh (`COMPLIANT_STABLE`).
3. **Trợ lý AI EUDR (Local Knowledge Engine — 0 giây, Bảo mật tuyệt đối):**
   - Không nhúng cứng API Key bí mật trên giao diện công khai; hỗ trợ phản hồi tức thì bằng bộ tri thức nội bộ và tùy chọn cấu hình Endpoint Proxy quản trị.

---

## Chạy thử nghiệm Cục bộ & Xuất bản

```bash
# 1. Chạy thử giao diện Web cục bộ
python -m http.server 8000
# Truy cập: http://localhost:8000

# 2. Chạy tự kiểm thử lõi Radar Python v0.4.0
python scripts/eudr_v04_radar_pipeline.py --self-test
```
