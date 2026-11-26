# CẨM NANG THIẾT KẾ & VẬN HÀNH — THƯ VIỆN ĐỒI MƠ

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Định danh** | **Thư viện Đồi Mơ** — *Sách đọc và nghe trước giờ ngủ · Copyright © Nancy & Liti* |
| **Hệ mỹ thuật** | **Phương án A — Ấn Bản Giấy Cotton (*Botanical Paper Edition*)** |
| **Tài liệu liên quan** | [GEMINI.md](./GEMINI.md) · [QUY_TRINH_THU_VIEN_DOI_MO.md](./QUY_TRINH_THU_VIEN_DOI_MO.md) · [PROJECT_JOURNAL.md](./PROJECT_JOURNAL.md) |

---

## CHƯƠNG 1. HỆ THẨM MỸ & HIẾN PHÁP THỊ GIÁC

### 1.1. Bảng màu Chính thức (*Ấn Bản Giấy Cotton — WCAG 2.1 AA*)

Giao diện tự động chuyển sang chế độ **Đêm ấm ru ngủ** trong khung giờ **`19:30 – 05:30`** theo đồng hồ thiết bị người dùng (và trở về **Giấy cotton ban ngày** từ `05:30 – 19:30`); người đọc luôn có thể bấm icon Mặt trăng / Mặt trời để đổi thủ công theo khung Sáng/Đêm hiện tại.

| Token CSS (`globals.css`) | Ban ngày (`05:30–19:30`) | Đêm ấm (`19:30–05:30`) | Vai trò sử dụng |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#F8F5EE` | `#111613` | Nền giấy cotton / Rừng đêm thẳm |
| `--bg-surface` | `#F1ECE1` | `#19201C` | Nền phụ, ô nút icon, ô thẻ chưa có sách |
| `--bg-elevated` | `#FDFBF6` | `#212A24` | Thẻ Đang đọc/nghe, danh sách mục lục, `Mini-player`, `Bottom Sheet` |
| `--border-hairline` | `#DED7C8` (`1px`) | `#2D3831` (`1px`) | Đường kẻ chỉ phân tách mảnh |
| `--text-primary` | `#222923` *(13.8:1)* | `#EFE9DC` *(13.9:1)* | Tiêu đề & văn bản truyện chữ Serif |
| `--text-secondary` | `#666D63` *(5.1:1)* | `#9EA69A` *(5.8:1)* | Phụ đề, tác giả, thời lượng |
| `--accent-primary` | `#354F3E` *(Rêu Rừng Trầm)* | `#89A892` | Nút hành động chính (`Bước vào`, `Nghe tiếp`, `Đọc tiếp`) |
| `--accent-warm` | `#9E7B43` *(Đồng Cổ)* | `#D4AC6E` | Thanh tiến độ `2px`, hẹn giờ ru ngủ, chấm đèn gian sách |
| `--accent-berry` | `#9A5144` *(Đất Đỏ Trầm)* | `#CE7E6F` | Đánh dấu yêu thích (`Bookmark`), cảnh báo nhẹ |

### 1.2. Hệ màu Wash của 4 Preset Sách & Kệ Gỗ Sồi

- **4 Preset màu nước ([presets.ts](./src/lib/presets.ts)):** `Moss` (`#EAEFE8` / `#17211B`), `Ochre` (`#F4ECDD` / `#241E15`), `Rosewood` (`#F2E7E3` / `#261A18`), `Lavender` (`#ECEAF1` / `#1E1D27`). Chỉ dùng nhuộm nhẹ phần đầu Gian sách hoặc phần đầu Bộ sách, không dán badge màu đè lên tranh.
- **Kệ Gỗ Sồi (`HallShelfClient.tsx`):** Thanh gờ kệ gỗ sồi cao `10px` bo `4px`, chuyển sắc nhẹ ban ngày (`#E2D2BA → #CBB594`, viền `#B79F7D`) và ban đêm (`#3A2F24 → #261E16`, viền `#4E3E30`).

### 1.3. Chuẩn Typography Tiếng Việt (`134/134` ký tự)

- **Văn bản & Tiêu đề truyện:** `"Lora", Georgia, "Times New Roman", serif` (nhúng qua `next/font/google` với `subsets: ['vietnamese', 'latin']`, thân bài `18px`, `line-height: 1.82`; tiêu đề `line-height: 1.48`).
- **Điều khiển & Chỉ số:** `"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif` (luôn bật `tabular-nums` cho đồng hồ và số tập).
- **Chống cắt dấu chồng:** Mọi lớp `.truncate`, `.line-clamp-*` giữ `padding-top: 1px; padding-bottom: 2px; line-height: 1.48` để không bao giờ xén dấu chữ Việt (`Ấ, Ề, Ổ, Ứ, ệ, ộ, ợ`).
- **Cấm tuyệt đối:** `Iowan Old Style`, `Charter`, `Athelas`, `Hoefler Text`, `Palatino` (thiếu 24 ký tự nguyên âm có móc `ơ, ư`).

### 1.4. Quy tắc "5 Tuyệt Đối Không"

1. **0 emoji hệ điều hành** — toàn bộ dùng SVG nét mảnh `1.4px` đơn sắc trong [Icons.tsx](./src/components/Icons.tsx).
2. **0 tem, nhãn, nút phát hay chữ đè lên mặt tranh bìa `3:4`**.
3. **0 chi tiết *"Kỷ vật trong túi da"*, *"Ghi chú cuối tập"*, `EndNoteBox` hay thẻ bài học cuối bài đọc**.
4. **0 hộp chú thích (`caption`) dưới tranh minh họa** trong bài đọc (cuộn hết tranh nối tiếp thẳng sang văn bản).
5. **0 thanh Bottom Tab Bar, Floating Action Button (`+`), màu tím Indigo/Neon hay giao diện Dashboard / EdTech tính điểm**.

---

## CHƯƠNG 2. CẨM NANG NGÔN NGỮ TỰ NHIÊN ("KHÔNG KHẨU HIỆU")

Bạn đọc thiếu nhi và thiếu niên cảm nhận thế giới sách qua hình ảnh, không gian tĩnh lặng và mạch truyện — không qua khẩu hiệu hay lời mời gọi đóng kịch. Mọi câu chữ trên giao diện phải tuân theo chuẩn mộc mạc, chân phương:

| Vị trí giao diện | Chuẩn Tự Nhiên (Đang áp dụng) | Dạng Khẩu Hiệu / Gượng Ép (Tránh dùng) |
| :--- | :--- | :--- |
| **Màn hình Cổng** | Tên: `Thư viện Đồi Mơ`<br/>Phụ đề: `Sách đọc và nghe trước giờ ngủ`<br/>Nút: `Bước vào →` | Gắn nhãn `"ĐÊM ĐÈN LỒNG · GIỜ ĐỌC TRƯỚC KHI NGỦ"` hay viết `"Ánh đèn lồng đã thắp, mời bạn nhỏ đẩy nhẹ cửa gỗ..."` |
| **Header Sảnh** | `Thư viện Đồi Mơ` / `Sảnh sách` | `"Chào buổi tối ở Sảnh Đồi Mơ"` / `"Đèn sảnh đã thắp ấm áp"` |
| **Khối Tiếp tục** | `Đang đọc` · `Đang nghe` · `Tập tiếp theo` | `"Bàn sách đang kẹp dở đêm qua"` |
| **Sơ đồ 6 Gian** | `Các gian sách` · tên ngắn từng Gian (`Văn học`, `Nghệ thuật`, `Kỹ năng sống`...) · `Sắp có sách` | Đánh số `GIAN I..VI`, viết câu chỉ dẫn `"Chạm vào vòm cửa để bước vào..."` |
| **Bên trong Gian** | `← Sảnh sách` · mô tả cụ thể (`"Cây cỏ, muông thú, bầu trời và thế giới tự nhiên."`) | Đóng ngoặc kép đề từ sáo rỗng (`"nuôi dưỡng tâm hồn"`, `"vững vàng lớn khôn"`) |
| **Trên Kệ Gỗ** | Để khoảng trống tự nhiên khi hàng kệ chỉ có 1 cuốn sách; gian trống chỉ ghi `Chưa có sách trên kệ này.` | Vẽ khung nét đứt `"Sách tiếp theo đang được sắp lên kệ..."` hoặc gắn chữ `"Rút sách mở mục lục →"` |

---

## CHƯƠNG 3. QUY HOẠCH 6 GIAN SÁCH & TIÊU CHUẨN MEDIA

### 3.1. Bảng Tra cứu 6 Gian Sách ([halls.ts](./src/lib/halls.ts))

| `slug` (URL `/halls/[slug]`) | Tên đầy đủ trong Gian | Tên ngắn ở Sảnh & Breadcrumb | Preset màu | Nội dung phù hợp |
| :--- | :--- | :--- | :--- | :--- |
| `khoa-hoc-tu-nhien` | Gian Khoa học & Tự nhiên | Khoa học & Tự nhiên | `moss` | Tự nhiên, sinh học, muông thú, thiên văn, khoa học (*Lim và Mẹ Vacci*) |
| `am-thuc-nep-nha` | Gian Ẩm thực & Nếp nhà | Ẩm thực & Nếp nhà | `ochre` | Căn bếp, món ngon, nông trang, đời sống gia đình (*Tiểu Hạt Dẻ Thích Ăn Vụng*) |
| `van-hoc-dong-thoai` | Gian Văn học | Văn học | `rosewood` | Đồng thoại, truyện ngắn, ngụ ngôn, tiểu thuyết thiếu nhi |
| `lich-su-van-hoa` | Gian Lịch sử & Văn hóa | Lịch sử & Văn hóa | `ochre` | Lịch sử, danh nhân, phong tục, vùng đất và văn hóa |
| `nghe-thuat-tho-nhac` | Gian Nghệ thuật | Nghệ thuật | `lavender` | Hội họa, âm nhạc, thơ ca và các khúc hát ru |
| `ky-nang-lon-khon` | Gian Kỹ năng sống | Kỹ năng sống | `moss` | Cảm xúc, thói quen tốt, tự lập, giao tiếp và ứng xử |

- Khi chỉnh sửa bộ sách trong `/admin/books/[id]`, Chủ thư viện chọn 1 trong 6 **Gian sách** chính, có thể chọn thêm 1 **Gian giao thoa** (ví dụ *Khoa học & Tự nhiên + Văn học* cho sách đồng thoại khoa học) và (tùy chọn) điền nhánh phụ; hàm `formatAdminHallGenre` lưu chuẩn vào trường `genreTag` sẵn có của cả Supabase lẫn `data/library_db.json`.
- Tại **Sảnh sách (`/`)**, khu vực *Đang đọc / Đang nghe* hiển thị gọn tối đa `2` bộ sách đang mở dở gần nhất (hỗ trợ gia đình nhiều bé hoặc đọc song song 2 cuốn), và các gian chưa có sách tạm khóa nhấn tới khi có ít nhất `1` bộ sách xuất bản.

### 3.2. Tiêu chuẩn Ảnh & Âm thanh

- **Ảnh Cổng & OpenGraph:**
  - Ban ngày: `public/images/home/doi-mo-day.jpg`
  - Ban đêm: `public/images/home/doi-mo-night.jpg`
  - Ảnh chia sẻ link (OG): `public/images/doi-mo-cover.jpg`
- **Bìa Bộ sách & Tập:** Tỷ lệ dọc `3:4`, dung lượng `≤ 5MB` (`JPEG / PNG / WebP`), thiết lập điểm căn `top / center / bottom` trong `/admin` để không cắt mất mặt nhân vật.
- **Tranh trong bài đọc:** Chèn bằng cú pháp Markdown `![alt](url)`, hiển thị `max-height: 72vh`, `object-contain`, chạm phóng to toàn màn hình qua Lightbox; nếu tập có `≥ 2` tranh tự hiện nút chuyển `[Đọc truyện | Xem tranh]`.
- **Tệp Âm thanh:** Định dạng MP3/M4A (`48kHz`), `≤ 60MB`/bản thu; khi lưu trữ trên Cloudflare R2 cần hỗ trợ `HTTP 206 Range Requests` để tua mượt trên iOS Safari.

---

## CHƯƠNG 4. SỔ TAY VẬN HÀNH KỸ THUẬT & KHẮC PHỤC SỰ CỐ

### 4.1. Bộ khóa Lưu trữ Cục bộ trên Trình duyệt Người đọc

| Khóa lưu trữ | Storage | Vai trò |
| :--- | :--- | :--- |
| `litibook_gate_session_v1` | `sessionStorage` | Ghi nhớ phiên đã bước qua Cổng Đồi Mơ; tự đặt lại về Cổng khi mở tab/phiên mới hoặc sau `45 phút` tạm nghỉ. |
| `litibook_theme_window_v3` | `localStorage` | Ghi nhớ lựa chọn Sáng/Đêm thủ công trong đúng khung giờ sinh học hiện tại (`19:30–05:30` hay ban ngày). |
| `litibook_progress_v1` | `localStorage` | Tiến độ giây nghe Audio theo từng tập & từng `trackUpdatedAt`. |
| `litibook_reading_progress_v1` | `localStorage` | Tiến độ `%` cuộn trang đọc chữ (tự đánh dấu hoàn thành khi cuộn `≥ 92%`). |
| `litibook_favorites_v1` | `localStorage` | Danh sách ID các tập đã đánh dấu Bookmark. |
| `litibook_preferred_voice_v1` | `localStorage` | Giọng đọc ưu tiên (`voiceKey`, mặc định `female_my_duyen`). |
| `litibook_opened_episodes_v1` | `localStorage` | Danh sách tập đã mở để tự động xóa nhãn `Mới`. |
| `litibook_reader_fontsize_v1` | `localStorage` | Cỡ chữ đọc (`16px–22px`, mặc định `18px`). |

### 4.2. Các Lệnh & Tình huống Thường gặp

- **Kiểm tra kiểu dữ liệu & Build Production:**
  ```bash
  npm run typecheck && npm run build
  ```
- **Giữ lịch sử nghe lâu dài trên iPhone / iPad:** Trên iOS Safari trình duyệt thường, dữ liệu `localStorage` có thể bị dọn sau 7 ngày không truy cập; hướng dẫn người thân chọn *Chia sẻ → Thêm vào Màn hình chính* (đã có ghi chú nhẹ ở đáy tab *Đã lưu*).
- **Chuyển đổi Local JSON ↔ Supabase + Cloudflare R2:** Hệ thống tự động đọc `data/library_db.json` khi chưa cấu hình `NEXT_PUBLIC_SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`; khi có đủ biến môi trường trên Vercel, mọi thao tác đọc/ghi của `/admin` và người nghe tự chuyển sang PostgreSQL Supabase & R2.
