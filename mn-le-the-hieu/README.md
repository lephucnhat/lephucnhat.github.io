# CỔNG THÔNG TIN ĐIỆN TỬ TRƯỜNG MẦM NON LÊ THẾ HIẾU
**Địa chỉ:** Thôn Cam Chính, xã Cam Lộ, tỉnh Quảng Trị (Định danh hành chính mới sau 01/07/2025)  
**Năm học:** 2026 – 2027 (Hợp nhất từ Trường Mầm non Bình Minh và Trường Mầm non Hoa Mai)  
**Kiến trúc:** Zero-Build Vanilla HTML5 + Modern CSS3 Design Tokens + Modular ES6 JS + Static JSON CMS

---

## 1. HƯỚNG DẪN GIÁO VIÊN CẬP NHẬT NỘI DUNG KHÔNG CẦN BIẾT CODE (`data/*.json`)

Toàn bộ dữ liệu trên trang web được tách bạch hoàn toàn trong thư mục `data/`. Giáo viên phụ trách CNTT hoặc Tổ Nuôi dưỡng chỉ cần mở các file dưới đây bằng Notepad / VS Code hoặc sửa trực tiếp trên giao diện web GitHub:

1. **Cập nhật Họ tên Hiệu trưởng, Số điện thoại, Email & Điểm trường (`data/site-config.json`):**
   - Tìm các dòng chữ giữ chỗ:
     - `"principal": "[HỌ TÊN HIỆU TRƯỞNG]"`
     - `"phone": "[SỐ ĐIỆN THOẠI NHÀ TRƯỜNG]"`
     - `"email": "[EMAIL NHÀ TRƯỜNG]"`
     - `"localPhone": "[SỐ ĐƯỜNG DÂY NÓNG XÃ CAM LỘ]"`
   - Thay thế bằng thông tin chính thức của trường. Ngay sau khi điền số điện thoại thật, nút **📥 Lưu danh bạ (.vcf)** sẽ tự động nạp số điện thoại của trường vào file danh bạ cho phụ huynh.

2. **Cập nhật Thực đơn bán trú & Kế hoạch tuần (`data/menu.json`):**
   - Mở `data/menu.json`, chỉnh sửa món ăn của các ngày từ `thu-2` đến `thu-6` (`morning` - bữa phụ sáng, `lunch` - bữa chính trưa, `afternoon` - bữa phụ chiều) và lịch hoạt động sáng/chiều.
   - Xóa hoặc đổi dòng `"notice": "[DỮ LIỆU MẪU MINH HỌA – CẬP NHẬT TRONG data/menu.json]"` thành tuần lễ thực tế (ví dụ: `"Thực đơn Tuần 12 (Từ 23/11 đến 27/11/2026)"`).

3. **Đăng Tin tức mới (`data/news.json`):**
   - Thêm một khối bài viết mới vào đầu mảng JSON. Đặt `"featured": true` cho bài viết muốn làm Tin tiêu điểm lớn bên trái.

4. **Thêm Giáo án, Bài giảng PowerPoint, Video clip (`data/resources.json`):**
   - Thêm học liệu mới với đúng `ageGroup` (`Nhà trẻ 24–36 tháng`, `MG 3–4 tuổi`, `MG 4–5 tuổi`, `MG 5–6 tuổi`, `Chung`) và `type` (`Giáo án – STEM`, `PowerPoint`, `Trò chơi`, `Video clip`, `Cẩm nang`).

5. **Cập nhật Văn bản & Ba Công khai (`data/documents.json`):**
   - Chỉ thêm văn bản thuộc `Công khai 2026–2027`, `Văn bản Nhà trường`, `Văn bản Xã Cam Lộ`, hoặc `Văn bản Sở & Bộ (Cấp Mầm non)`.

---

## 2. HƯỚNG DẪN THAY ẢNH THẬT CỦA NHÀ TRƯỜNG (`assets/images/`)

Hiện tại thư mục `assets/images/` đang sử dụng bộ đồ họa Vector SVG sắc nét, nhẹ và chuẩn tỷ lệ. Khi có ảnh chụp thực tế của trường, giáo viên chỉ cần chép ảnh vào `assets/images/` theo kích thước khuyến nghị:
- **Logo trường (`assets/images/logo.svg`):** Kích thước vuông `240×240px` (SVG hoặc PNG nền trong suốt).
- **Ảnh lớn đầu trang Hero (`assets/images/hero-illustration.svg`):** Tỷ lệ `16:10`, kích thước `1280×800px` (JPG hoặc WebP, dung lượng `< 250KB`).
- **Ảnh bài viết Tin tức & Thư viện (`news-*.svg`, `gallery-*.svg`):** Tỷ lệ `16:10`, kích thước `800×500px` (JPG hoặc WebP, dung lượng `< 180KB`).

---

## 3. KẾT NỐI FORM GÓP Ý PHỤ HUYNH VỚI GOOGLE FORMS / FORMSPREE (TÙY CHỌN)

Mặc định, Form góp ý hoạt động ở chế độ tĩnh an toàn (kiểm tra dữ liệu tiếng Việt, hỗ trợ sao chép nội dung chuẩn để dán gửi Zalo nhóm lớp/trường hoặc mở ứng dụng Email). Nếu nhà trường muốn lưu tự động vào bảng tính:
- **Cách 1 (Formspree miễn phí):** Tạo form tại `https://formspree.io`, lấy mã endpoint `https://formspree.io/f/xxxxxxx` và gắn vào thuộc tính `action` của thẻ `<form id="parent-feedback-form">`.
- **Cách 2 (Google Forms):** Tạo biểu mẫu Google Forms của trường và gắn đường dẫn vào nút gửi để đồng bộ thẳng về Google Sheets của Ban Giám hiệu.

---

## 4. LỆNH CHẠY KIỂM TRA CỤC BỘ & 5 BƯỚC ĐĂNG LÊN GITHUB PAGES

### Chạy kiểm tra ngay trên máy tính:
```bash
cd mn-le-the-hieu-web
python -m http.server 8000
```
Sau đó mở trình duyệt truy cập: `http://localhost:8000`

### 5 Bước xuất bản lên GitHub Pages trong 1 phút:
1. Tạo một Repository mới trên GitHub (ví dụ: `mn-le-the-hieu-web`).
2. Đẩy toàn bộ mã nguồn trong thư mục `mn-le-the-hieu-web/` lên nhánh `main`:
   ```bash
   git init
   git add .
   git commit -m "Deploy Cong thong tin Truong Mam non Le The Hieu 2026-2027"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan>/mn-le-the-hieu-web.git
   git push -u origin main
   ```
3. Mở Repository trên GitHub ➔ Vào tab **Settings** ➔ Chọn mục **Pages** ở cột bên trái.
4. Tại mục **Build and deployment** ➔ Chọn **Deploy from a branch** ➔ Nhánh `main` / thư mục `/ (root)` ➔ Bấm **Save**.
5. Đợi 30–60 giây, trang web sẽ chính thức hoạt động tại `https://<tai-khoan>.github.io/mn-le-the-hieu-web/`.
