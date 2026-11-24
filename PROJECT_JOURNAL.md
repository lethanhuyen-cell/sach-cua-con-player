# NHẬT KÝ & SỔ TAY BÀN GIAO DỰ ÁN LITIBOOK (`PROJECT_JOURNAL.md`)

**Cập nhật lần cuối:** `2026-11-24 23:42 (GMT+7)`
**Phạm vi dự án (Đã đính chính & khóa cứng):** **Litibook** tại thư mục này chỉ tập trung làm **Nền tảng Thư viện giới thiệu, lưu trữ, phát audio đa giọng đọc và hiển thị sách** cho gia đình — tách biệt hoàn toàn, **không liên quan đến khâu sáng tác nội dung hay tự động thiết kế tranh minh họa** (phần sáng tác thuộc các dự án tạo sách độc lập).

---

## 1. Tóm tắt Toàn bộ Quyết định Đã Chốt Cứng

### A. Mô hình Sản phẩm, Phạm vi & Hạ tầng
1. **Ranh giới dự án rõ ràng:** Thư viện chỉ nhận và trình bày hoàn chỉnh các bộ sách/tập truyện sẵn có hoặc được Chủ thư viện tải lên qua `/admin` (không kiêm quy trình viết truyện hay sinh ảnh minh họa).
2. **Truy cập mở thẳng, đơn giản tuyệt đối:**
   - Người thân mở đường dẫn Litibook là vào thẳng **Trang chủ Thư viện (`/`)** — **không** cổng mã mời (`/gate`), **không** bắt đăng nhập/tạo tài khoản người nghe.
   - Gắn `noindex, nofollow, noarchive` để tránh lập chỉ mục công khai; chỉ khóa xác thực riêng tại `/admin` cho Chủ thư viện (`5` lần nhập sai khóa tạm `15` phút).
3. **Hạ tầng kỹ thuật:**
   - **Web & API:** Next.js 14 (App Router + TypeScript + Tailwind CSS) triển khai trên Vercel (`thuviencualiti`).
   - **Database & Admin Auth:** Dual-engine — hoạt động tức thì với kho JSON cục bộ (`data/library_db.json` + `public/uploads/`) trên máy cá nhân và sẵn sàng kết nối **Supabase (`6` bảng)** + **Cloudflare R2 (`10 GB` miễn phí, `0đ` băng thông)** khi điền biến môi trường.

### B. Thẩm mỹ & Phông chữ (**Phương án A — Ấn Bản Giấy Cotton**)
1. **Phong cách chủ đạo:** *Minimalist Watercolor Storybook* lấy cảm hứng từ tinh thần màu nước của *Miền Dâu Dại*.
2. **Bảng màu Phương án A (*Botanical Paper Edition*):**
   - *Ban ngày:* Nền giấy cotton `#F8F5EE` · Bề mặt `#F1ECE1` · Thẻ nổi `#FDFBF6` · Kẻ chỉ `1px #DED7C8` · Chữ `#222923` · Nhấn **Rêu Rừng Trầm `#354F3E`** & **Đồng Cổ `#9E7B43`**.
   - *Ban đêm ru ngủ:* Nền `#111613` · Bề mặt `#19201C` · Kẻ chỉ `#2D3831` · Chữ `#EFE9DC` · Nhấn `#89A892` & `#D4AC6E`.
3. **Kỷ luật thị giác & Tiếng Việt 134/134 ký tự:**
   - **0 emoji hệ điều hành** (100% dùng SVG Line Icons đơn sắc `1.4px`); **0 badge/nhãn đè mặt bìa `3:4`**.
   - Webfont chính thức: `Lora` (Serif) + `Be Vietnam Pro` (Sans) subset `vietnamese`; cấm các phông dự phòng thiếu nguyên âm móc (`ơ`, `ư`) như `Iowan Old Style`, `Charter`, `Athelas`, `Hoefler Text`, `Palatino`.

### C. Quy chuẩn Giao diện Đọc Nhiều Chữ (Áp dụng mọi bộ sách đưa lên Thư viện)
1. **Xóa bỏ 100% chi tiết phụ:** Tuyệt đối không có *"Kỷ vật trong túi da"*, *"Ghi chú cuối tập"* hay bất kỳ hộp phụ nào trên giao diện đọc và biểu mẫu CMS.
2. **Tối ưu nhiều chữ, không không gian vụn:** Gom nút Phát và chọn Giọng đọc vào **1 thanh ngang mảnh `38px`** (ẩn hẳn nếu tập *Chỉ đọc chữ*); ẩn `Mini-player` đáy màn hình nếu đang đọc chính tập đang phát.
3. **Thanh thoát cố định (`Sticky 42px`):** Luôn cố định ở đỉnh khi cuộn bài dài, hiển thị rõ cả nút **về Thư mục mẹ (`← Tên bộ sách`)** và nút **về `Trang chủ`**.
4. **Tranh minh họa gọn trong mạch đọc & Không chú thích:** Tranh chèn xen giữa các đoạn Markdown tự động giới hạn chiều cao gọn trong màn hình dọc di động mà không cắt xén chi tiết tranh, cuộn hết tranh nối tiếp ngay sang chữ và **0 hộp chú thích `caption`**.

---

## 2. Danh mục Hồ sơ Tài liệu Hiện có trong Dự án

- [GEMINI.md](./GEMINI.md) — **Hiến pháp bất khả xâm phạm** của Thư viện Litibook.
- [PRD.md](./PRD.md) (v1.3) — Đặc tả sản phẩm chi tiết & tiêu chí nghiệm thu `AC-01..12`.
- [ARCHITECTURE.md](./ARCHITECTURE.md) (v1.2) — Kiến trúc kỹ thuật Next.js + Supabase + Cloudflare R2.
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — Hệ thống thiết kế **Phương án A (Ấn Bản Giấy Cotton)** & quy tắc chữ tiếng Việt.
- [UX_FLOWS.md](./UX_FLOWS.md) — Kiến trúc thông tin & 6 luồng tương tác.
- [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md) — Đặc tả 9 màn hình `390px` (1–6 Người nghe · 7–9 Quản trị).
