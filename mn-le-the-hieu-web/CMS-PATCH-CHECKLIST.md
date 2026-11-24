# CẨM NANG VÁ LỖI NHANH 15 PHÚT TRÊN CỔNG CMS HIỆN HÀNH (`mnlethehieu.quangtri.edu.vn`)

Tài liệu này dành riêng cho Quản trị viên CNTT của **Trường Mầm non Lê Thế Hiếu (xã Cam Lộ, tỉnh Quảng Trị)** để khắc phục ngay các lỗi hiển thị đang tồn tại trên hệ thống CMS của Sở GD&ĐT trong vòng 15 phút:

---

## 1. Xóa thông tin giả & Điền thông tin chuẩn ở Chân trang (Footer) — *2 phút*
- **Hiện trạng lỗi:** Trong `#module5` ở chân trang đang hiển thị `Hiệu trưởng: ` (bỏ trống) và `Điện thoại: 0900000000` (số giả).
- **Cách sửa trong CMS:**
  1. Đăng nhập trang quản trị CMS → Chuyển sang chế độ **Thiết kế giao diện / Cấu hình Module Footer (`#module5`)**.
  2. Điền đầy đủ họ tên Hiệu trưởng chính thức năm học 2026–2027.
  3. Thay số `0900000000` bằng số điện thoại văn phòng chính thức của nhà trường và bổ sung Email công vụ (`@quangtri.edu.vn`).
  4. Giữ nguyên địa chỉ hành chính chuẩn sau 01/07/2025: **Thôn Cam Chính, xã Cam Lộ, tỉnh Quảng Trị** (tuyệt đối không ghi huyện Cam Lộ).

---

## 2. Sửa 4 lỗi chính tả trong Cây Danh mục Menu & Tài nguyên — *3 phút*
Vào mục **Quản trị Danh mục (Category Manager)** và sửa tên hiển thị của các mục sau:
1. `Cẩm năng chăm sóc, nuôi dưỡng trẻ` ➔ Sửa thành: **Cẩm nang chăm sóc, nuôi dưỡng trẻ**
2. `Vioclip` ➔ Sửa thành: **Video clip**
3. `Cơ cấu tổ chức _ nhân sự nhà trường` ➔ Sửa thành: **Cơ cấu tổ chức – Nhân sự nhà trường** (bỏ dấu gạch dưới `_`)
4. Bài giảng `PP LQ CHŨ CÁI: O,Ô,Ơ - LỚP MG 5-6 TUỔI CAM SƠN` ➔ Sửa thành: **Phương pháp làm quen chữ cái: O, Ô, Ơ – Lớp MG 5–6 tuổi Cam Sơn**

---

## 3. Khắc phục lỗi rò rỉ thẻ HTML vỡ `<a href="/cho-cha-me"...` và chữ `true` — *4 phút*
- **Nguyên nhân:** Module danh sách tin tức trang chủ đang lấy tiêu đề chuyên mục có chứa thẻ HTML `<a href="/cho-cha-me" title="TIN TỨC HOẠT ĐỘNG">` nhúng thẳng vào thuộc tính `alt=""` của ảnh đại diện, đồng thời cấu hình hiển thị trường Boolean trả về chữ `true` dưới phần tóm tắt (`brief-news`).
- **Cách sửa:**
  1. Mở **Cấu hình Module Tin tức trang chủ (`#frameBoundB5b6030888b08c0`)**.
  2. Tắt tùy chọn hiển thị trường phụ (extra boolean field) dưới phần tóm tắt bài viết để mất chữ `true`.
  3. Trong bài viết *"Ứng dụng AI trong hoạt động khám phá khoa học: Chú voi ngộ nghĩnh"*, sửa ô **Tóm tắt (Brief)** từ tên file thô `HDKPKH_CHU_VOI_NGO_NGHINH__1__0cd9f.pptx` thành câu mô tả tiếng Việt chuẩn mực.

---

## 4. Gỡ bỏ các Module bị nhân đôi và Văn bản lạc cấp học — *4 phút*
1. **Gỡ bỏ Module lặp trên cột trái và trang chủ:**
   - Xóa bớt 1 widget **Danh mục Giới thiệu** bị kéo thả lặp 2 lần ở cột trái.
   - Xóa bớt các widget Tin tức trùng lặp làm bài *Tọa đàm 20/11/2026* xuất hiện 4–5 lần trên cùng trang chủ.
2. **Ẩn hoặc gỡ các văn bản lạc cấp THCS:**
   - Vào chuyên mục **Văn bản từ Sở GD&ĐT**, ẩn 4 quyết định chỉnh sửa bằng tốt nghiệp Trung học cơ sở (`QĐ 566/QĐ-SGDĐT`, `QĐ 383/QĐ-SGDĐT`, `QĐ 394/QĐ-SGDĐT`, `QĐ 395/QĐ-SGDĐT`) để cổng thông tin của trường chỉ hiển thị văn bản Nhà trường, UBND xã Cam Lộ và cấp học Mầm non.

---

## 5. Xóa bộ đếm truy cập lỗi cú pháp `Hôm nay : ">2.664` — *2 phút*
- Tắt hoặc thay thế widget **Thống kê truy cập** cũ ở cột trái đang bị lỗi đóng thẻ HTML (`">2.664`) và hiển thị `Lượt truy cập hiện tại: 1` không phản ánh đúng thực tế.
