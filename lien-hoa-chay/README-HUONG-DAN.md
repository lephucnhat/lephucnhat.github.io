# Hướng Dẫn Quản Trị Website Nhà Hàng Chay Liên Hoa

Bộ mã nguồn được thiết kế theo chuẩn **Static Web thuần (HTML5 + CSS3 + Vanilla JS)**, chạy trực tiếp bằng cách mở file `index.html` hoặc triển khai miễn phí trên **GitHub Pages**.

---

## 1. Cấu Trúc Thư Mục
```text
website_lienhoa_new/
├── index.html             # Trang chủ hoàn chỉnh
├── css/style.css          # Giao diện Zen Culinary & Responsive
├── js/
│   ├── site-data.js       # Toàn bộ dữ liệu món ăn, mâm cỗ, liên hệ (dùng trực tiếp)
│   └── main.js            # Logic tìm kiếm, lọc món, khay đặt bàn Zalo, Lightbox
├── data/site-data.json    # Bản JSON chuẩn đồng bộ với site-data.js
├── assets/images/         # Hình ảnh thực tế đã tối ưu dung lượng từ D:\Lienhoa
└── README-HUONG-DAN.md    # Tài liệu này
```

---

## 2. Cách Cập Nhật Thông Tin Liên Hệ & Thực Đơn
Mở file `js/site-data.js` (bằng Notepad, VS Code hoặc trình soạn thảo bất kỳ):
1. **Đổi Hotline / Zalo / Địa chỉ / Fanpage:** Tìm mục `brand.contact` ở đầu file.
   - Nếu quán có thêm link Fanpage Facebook, điền vào `fanpageUrl: "https://facebook.com/..."`, nút Fanpage sẽ tự động hiện trên web.
2. **Thêm hoặc sửa món ăn:** Tìm mảng `menu`, sao chép một khối món ăn có sẵn, đổi `id`, `name`, `price`, `desc` và đường dẫn `image`.
3. **Thay ảnh món ăn / không gian:** Chép ảnh mới (nên nén dưới 300KB, chuẩn `.jpg` hoặc `.webp`) vào `assets/images/food/` hoặc `assets/images/space/`, sau đó trỏ đúng tên file trong `js/site-data.js`.

---

## 3. Cách Đưa Website Lên GitHub Pages
1. Đăng nhập GitHub và tạo hoặc mở repository (ví dụ `lienhoachay`).
2. Tải toàn bộ các file và thư mục bên trong `website_lienhoa_new/` lên nhánh `main` của repository (đảm bảo `index.html` nằm ở thư mục gốc của repo).
3. Vào **Settings → Pages → Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main` / `/ (root)` → bấm **Save**.
4. Sau 1–2 phút, website sẽ hoạt động tại địa chỉ `https://<tên-tài-khoản>.github.io/<tên-repo>/`.
