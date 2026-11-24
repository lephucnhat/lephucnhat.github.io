# BÁO CÁO NGHIÊN CỨU 3 NGUỒN & PHÂN TÍCH KIẾN TRÚC (GIAI ĐOẠN 1)
**Dự án:** Cổng Thông tin Điện tử Trường Mầm non Lê Thế Hiếu — Xã Cam Lộ, Tỉnh Quảng Trị  
**Năm học:** 2026 – 2027  
**Kiến trúc:** Zero-Build Vanilla HTML5 + Modern CSS3 Design Tokens + Modular ES6 JS + Static JSON CMS

---

## 1. KHẢO SÁT NGUỒN 1: HIỆN TRẠNG & LỖI THỰC TẾ TRÊN `mnlethehieu.quangtri.edu.vn`

Qua quá trình truy cập trực tiếp và quét mã nguồn DOM của trang chủ cùng các trang con (`/gioi-thieu`, `/cho-cha-me`, `/chuong-trinh/van-ban-truong`, `/chuong-trinh/van-ban-so`, `/lien-he/...`), hệ thống ghi nhận dữ liệu gốc và **14 lỗi kỹ thuật / nội dung thực tế** cần xử lý triệt để:

### A. Dữ liệu thật đã trích xuất thành công
- **Lịch sử & Dấu mốc năm học 2026–2027:** Trường Mầm non Lê Thế Hiếu được thành lập trên cơ sở hợp nhất **Trường Mầm non Bình Minh** và **Trường Mầm non Hoa Mai** theo Quyết định của UBND xã Cam Lộ từ năm học 2026–2027, mang thông điệp *"Ươm mầm xanh trên quê hương vùng Cùa lịch sử"*.
- **Địa danh hành chính mới (sau 01/07/2025):** Trụ sở chính đặt tại **Thôn Cam Chính, xã Cam Lộ, tỉnh Quảng Trị** (không còn cấp huyện Cam Lộ).
- **Hệ thống điểm trường thực tế:** Trường chính Cam Chính, Điểm Phân hiệu, Điểm trường Cam Sơn, Điểm trường Cam Lộc (kèm cấu trúc mở sẵn sàng bổ sung điểm trường trong `data/site-config.json`).
- **Cơ cấu tổ chức:** Đảng bộ (Chi bộ Trường Chính, Chi bộ Phân hiệu), Ban Giám hiệu, Chi đoàn, 4 Tổ chuyên môn theo độ tuổi (Nhà trẻ 24–36 tháng, Mẫu giáo 3–4 tuổi, Mẫu giáo 4–5 tuổi, Mẫu giáo 5–6 tuổi), Tổ Nuôi dưỡng, Tổ Văn phòng.
- **Tin tức & Hoạt động thực tế (Năm học 2026–2027):**
  1. *Tọa đàm kỷ niệm 44 năm Ngày Nhà giáo Việt Nam (20/11/1982 – 20/11/2026)* — mùa tri ân đầu tiên sau hợp nhất hai trường Bình Minh và Hoa Mai.
  2. *Sinh hoạt Câu lạc bộ "Nuôi con khỏe" (11/11/2026)* — phối hợp dinh dưỡng, theo dõi biểu đồ tăng trưởng đợt cân đo tháng 9/2026.
  3. *Sinh hoạt chuyên đề "Bí mật của nụ cười chắc khỏe" (22/10/2026)* — phối hợp cùng các bác sĩ Trạm Y tế xã Cam Lộ chăm sóc răng miệng cho trẻ.
  4. *Sôi nổi các hoạt động chào mừng Ngày Phụ nữ Việt Nam 20/10 (20/10/2026)* — chạy bộ vì cộng đồng UpRace và giao lưu bóng chuyền 3 đội.
  5. *Tổ chức "Bữa ăn gia đình" cho trẻ khối Mẫu giáo 5–6 tuổi (15/10/2026)* tại Trường Chính và Điểm Phân hiệu.
  6. *Chi đoàn tổ chức chương trình "Bé vui Tết Trung thu" (25/09/2026)* tại Điểm trường Cam Sơn, Phân hiệu và Trường Chính.
  7. *Họp phụ huynh đầu năm học & Hội nghị Ban đại diện cha mẹ trẻ năm học 2026–2027 (20/09/2026)*.
- **Kho Tài nguyên & Học liệu số thực tế:**
  - Ứng dụng AI trong hoạt động khám phá khoa học: *"Chú voi ngộ nghĩnh"* (Khối 4–5 tuổi), *"Chuyện quả trứng"* (Nhà trẻ 24–36 tháng), Làm quen chữ cái `u, ư` (Khối 5–6 tuổi).
  - Bài giảng PowerPoint & Chuyên đề: Làm quen chữ cái `a, ă, â` (MG 5–6 tuổi B Cam Chính & A Phân hiệu), `e, ê` (Khối MG 5–6 tuổi), `o, ô, ơ` (MG 5–6 tuổi Cam Sơn); Tìm hiểu các giác quan.
  - Truyện kể & Trò chơi: Câu chuyện *"Gấu con bị sâu răng"* (Lớp 4–5 tuổi A Cam Chính), *"Chuyện Gà trống và Vịt bầu"*; Trò chơi *"Đoán tên nhạc cụ"*, *"Giác quan kỳ diệu"*, *"Tìm đúng đôi dép"* (MG 3–4 tuổi Cam Sơn), *"Chuyền vòng qua chân"* (4–5 tuổi A Phân hiệu).
  - Tài liệu bồi dưỡng: *Ứng dụng giáo dục STEAM trong thực hiện chương trình GDMN*, *Bồi dưỡng năng lực giáo dục cảm xúc xã hội (SEL) cho trẻ*, *Xây dựng lớp học hạnh phúc*.
- **Hệ thống Văn bản & Công khai 2026–2027:**
  - Văn bản nhà trường: Quyết định số 25, 26, 27, 28 ngày 08/09/2026 (Quy chế dân chủ, Quy chế làm việc, Quy chế văn hóa công sở, Quy chế phối hợp các tổ chức).
  - Văn bản UBND xã Cam Lộ: Quyết định hợp nhất trường MN Bình Minh và MN Hoa Mai thành trường MN Lê Thế Hiếu; Quyết định tiếp nhận & bố trí viên chức; Quyết định xếp hạng đơn vị trường học thuộc UBND xã Cam Lộ; Thông báo công khai đường dây nóng bảo vệ trẻ em xã Cam Lộ; Kế hoạch phát triển GD&ĐT xã Cam Lộ giai đoạn 2026–2030.
  - Văn bản Sở GD&ĐT & Bộ GD&ĐT (Cấp Mầm non): Chương trình 4425/CTr-SGDĐT về công tác trọng tâm năm học 2026–2027; Công văn triển khai phổ cập GDMN trẻ 3–5 tuổi; Công văn hướng dẫn quản lý đồ dùng – đồ chơi – học liệu GDMN; Thông tư 03/2026/TT-BGDĐT quy tắc ứng xử nhà giáo.

### B. Danh sách lỗi thực tế đã phát hiện trên cổng cũ (Đã xử lý 100% ở bản mới)
1. **Rò rỉ mã HTML vỡ trong thuộc tính `alt` ảnh:** Thẻ `<img alt="<a href=&quot;/cho-cha-me&quot; title=&quot;TIN TỨC HOẠT ĐỘNG&quot;...>` làm lộ chuỗi HTML thô ra giao diện khi ảnh lỗi.
2. **Rò rỉ giá trị Boolean `true`:** Dưới phần tóm tắt bài viết (`<div class="brief-news">...</div> true`) in thừa chữ `true` do lỗi template CMS.
3. **Rò rỉ ký tự lạ trong bộ đếm:** Phần thống kê truy cập bị lỗi cú pháp HTML `Hôm nay : ">2.664` và dấu `×` lạc lõng.
4. **Lỗi chính tả & tên chuyên mục thiếu chuẩn mực:**
   - `Cẩm năng chăm sóc, nuôi dưỡng trẻ` (sai chính tả → sửa thành **Cẩm nang chăm sóc, nuôi dưỡng trẻ**).
   - `Vioclip` (viết dính sai chuẩn → sửa thành **Video clip**).
   - `PP LQ CHŨ CÁI: O,Ô,Ơ` (sai dấu ngã → sửa thành **Phương pháp làm quen chữ cái: O, Ô, Ơ**).
   - `Cơ cấu tổ chức _ nhân sự nhà trường` (dùng dấu gạch dưới thô → sửa thành **Cơ cấu tổ chức – Nhân sự nhà trường**).
   - Tiêu đề tài nguyên dùng tên file thô `HDKPKH_CHU_VOI_NGO_NGHINH__1__0cd9f.pptx` làm tóm tắt bài viết và viết IN HOA toàn bộ kèm dấu `_`.
5. **Lặp cấu trúc & Nhân bản dữ liệu nghiêm trọng:**
   - Cây danh mục **Giới thiệu** và nhãn **Liên kết website** bị render lặp 2 lần liên tiếp ở cột trái.
   - Bài viết *Tọa đàm kỷ niệm 44 năm Ngày Nhà giáo Việt Nam 20/11/2026* và bài *Chú voi ngộ nghĩnh* bị lặp 3–5 lần trên cùng trang chủ.
   - Danh sách 24 văn bản và lịch làm việc BGH bị nhân đôi ở 2 widget liền kề.
6. **Văn bản lạc cấp học & Lỗi định dạng văn bản:**
   - Hiển thị cả các Quyết định chỉnh sửa bằng tốt nghiệp THCS (QĐ 566, 383, 394, 395) không thuộc cấp Mầm non.
   - Tên văn bản bị bọc trong dấu ngoặc đơn thừa `(...)` hoặc cắt cụt tiêu đề giữa chừng (`...ve-cong-tac-bao-dam-trat-tu-an-toan-giao-t.html`).
7. **Thông tin liên hệ giả / bỏ trống:**
   - Chân trang ghi `Hiệu trưởng: ` (bỏ trống) và `Điện thoại: 0900000000` (số giả). Bản mới tuyệt đối không dùng số giả `0900000000`, thay bằng biến cấu hình minh bạch `[HỌ TÊN HIỆU TRƯỞNG]`, `[SỐ ĐIỆN THOẠI NHÀ TRƯỜNG]`, `[EMAIL NHÀ TRƯỜNG]` trong `data/site-config.json`.

---

## 2. TINH TÚY UX & TƯƠNG TÁC CHỌN LỌC TỪ `lephucnhat.vn`

Qua khảo sát mã nguồn `https://lephucnhat.vn/`, chúng tôi chắt lọc **5 giải pháp kỹ thuật UX thực chiến** phù hợp hoàn hảo với phụ huynh, ông bà và giáo viên mầm non, đồng thời tuân thủ nghiêm ngặt **Ranh giới đỏ**:

1. **Bộ điều khiển Trợ năng Cỡ chữ (`A- / A+ / A++`) qua biến CSS `--font-scale`:**
   - Cho phép tăng/giảm tỷ lệ chữ toàn trang mượt mà (`1.0` → `1.12` → `1.22`), lưu trạng thái vào `localStorage` để ông bà và phụ huynh đọc thông báo, thực đơn rõ ràng trên màn hình điện thoại nhỏ.
2. **Giọng đọc Tiếng Việt Tự nhiên (Web Speech API — `window.speechSynthesis`):**
   - Tắt mặc định, chỉ kích hoạt khi người dùng chủ động bấm nút **🔊 Nghe đọc bài** hoặc **🔊 Nghe cô kể chuyện**, hỗ trợ chọn tốc độ đọc (`0.85x` chậm rãi cho bé, `1.0x` chuẩn, `1.15x` nhanh) và tự dừng khi đóng Modal.
3. **Tiện ích Kết nối Phụ huynh 1 Chạm (`.vcf` vCard, Copy Link, Mã QR sạch):**
   - Tự động sinh file danh bạ chuẩn `VCARD 3.0` (`.vcf`) và vẽ mã QR trực tiếp bằng Canvas/SVG nội bộ; có cơ chế kiểm tra an toàn: nếu trường đang để giá trị giữ chỗ `[SỐ ĐIỆN THOẠI NHÀ TRƯỜNG]` thì thông báo hướng dẫn cập nhật `data/site-config.json` thay vì lưu số ảo.
4. **Trạm Di chuyển Nhanh (Quick Jump Bar & Command Search `Ctrl+K`):**
   - Thanh lối tắt 1 chạm dưới Hero và ngăn điều hướng nhanh gọn nhẹ giúp phụ huynh mở ngay *Thực đơn tuần*, *Kế hoạch tuần*, *Góc Bé Vui Học*, hoặc *Đường dây nóng bảo vệ trẻ em* trong 1 giây.
5. **Tuân thủ tuyệt đối Ranh giới đỏ:**
   - Không mang bất kỳ yếu tố thương hiệu cá nhân, giao diện tối (`royal-dark`), màu sắc gắt hay thuật ngữ phát triển bản thân từ `lephucnhat.vn` sang. Toàn bộ giao diện Trường Mầm non Lê Thế Hiếu mang sắc xanh mầm non tin cậy (`#1B7350`) và nắng ấm tuổi thơ (`#FFFDF9`, `#F59E0B`), chuẩn mực trường công lập.

---

## 3. HỌC HỎI CHUẨN QUỐC TẾ TỪ MÃ NGUỒN MỞ GITHUB

1. **Kiến trúc Static JSON-driven CMS + Inline Fallback:**
   - Tách toàn bộ cấu hình và nội dung ra `data/site-config.json`, `data/news.json`, `data/resources.json`, `data/documents.json`, `data/menu.json` để giáo viên dễ dàng chỉnh sửa bằng bất kỳ trình soạn thảo văn bản nào.
   - Tích hợp bộ dữ liệu fallback đồng bộ trong `js/app.js` giúp trang vẫn chạy 100% tính năng ngay cả khi mở trực tiếp qua giao thức `file://` hoặc khi mạng chập chờn.
2. **Tìm kiếm Tiếng Việt Không Dấu Tức Thì (Vietnamese Diacritic-Insensitive Search):**
   - Chuẩn hóa chuỗi bằng `String.prototype.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')` kết hợp lọc đa chiều (Khối tuổi + Loại tài nguyên + Từ khóa), giúp phụ huynh gõ `gau con` hoặc `chu cai` lập tức tìm thấy học liệu.
3. **Bảng Thực đơn & Kế hoạch Tuần Tối ưu In Ấn (`@media print` A4):**
   - Thiết kế `css/print.css` chuyên biệt: khi bấm nút **🖨️ In / Lưu PDF chuẩn A4**, tự động ẩn toàn bộ thanh điều hướng, nút bấm, form góp ý và dàn trang bảng Thực đơn + Kế hoạch tuần vừa khít khổ giấy A4 sắc nét kèm quốc hiệu và tiêu đề Trường Mầm non Lê Thế Hiếu.
4. **Chuẩn Tiếp cận WCAG AA & Micro-interactions:**
   - Đảm bảo độ tương phản màu chữ đạt chuẩn WCAG AA, vùng chạm nút bấm `>= 44x44px` trên di động, hỗ trợ đóng Modal/Lightbox bằng phím `ESC`, khóa cuộn nền và tôn trọng `prefers-reduced-motion`.
