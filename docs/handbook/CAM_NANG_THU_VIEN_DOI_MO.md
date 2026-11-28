# CẨM NANG THIẾT KẾ & VẬN HÀNH CHUẨN CUỐI — THƯ VIỆN ĐỒI MƠ

| Thuộc tính | Thông tin định chuẩn |
| :--- | :--- |
| **Định danh chính thức** | **Thư viện Đồi Mơ** — *Sách đọc và nghe trước giờ ngủ · Copyright © Nancy & Liti* |
| **Hệ mỹ thuật cốt lõi** | **Phương án A — Ấn Bản Giấy Cotton (*Botanical Paper Edition*)** |
| **Hệ thống điều hướng** | **Định vị Không gian 5 Nấc (*5-Step Spatial Wayfinder*)** |
| **Tài liệu nền tảng** | [GEMINI.md](../../GEMINI.md) (Hiến pháp) · [QUY_TRINH_THU_VIEN_DOI_MO.md](./QUY_TRINH_THU_VIEN_DOI_MO.md) · [PROJECT_JOURNAL.md](./PROJECT_JOURNAL.md) |

---

## CHƯƠNG 1. HỆ THẨM MỸ, BẢNG MÀU & HIẾN PHÁP THỊ GIÁC

### 1.1. Bảng màu Chính thức (*Ấn Bản Giấy Cotton — Đạt chuẩn WCAG 2.1 AA*)

Giao diện tự động kích hoạt chế độ **Đêm ấm ru ngủ** trong khung giờ **`19:30 – 05:30`** theo đồng hồ sinh học thiết bị người dùng (và trở về **Giấy cotton ban ngày** từ `05:30 – 19:30`); người đọc luôn có thể chạm biểu tượng Mặt trăng / Mặt trời trên thanh điều hướng để chuyển đổi thủ công. Lựa chọn này được lưu vào bộ nhớ cục bộ theo từng khung giờ (`litibook_theme_window_v3`).

| Token CSS (`globals.css`) | Ban ngày (`05:30–19:30`) | Đêm ấm (`19:30–05:30`) | Tỷ lệ tương phản | Vai trò sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#F8F5EE` | `#111613` | Nền gốc | Nền giấy cotton mộc / Rừng đêm thẳm tĩnh lặng |
| `--bg-surface` | `#F1ECE1` | `#19201C` | Lớp phụ | Nền ô tìm kiếm, viền nút icon, ô kệ chưa có sách |
| `--bg-elevated` | `#FDFBF6` | `#212A24` | Nổi nhẹ | Thẻ Đang đọc/nghe, danh sách mục lục, `Mini-player`, Khay Wayfinder, Bottom Sheet |
| `--border-hairline` | `#DED7C8` (`1px`) | `#2D3831` (`1px`) | Tinh tế | Đường kẻ chỉ phân tách thanh mảnh, viền khung tranh 3:4 |
| `--text-primary` | `#222923` | `#EFE9DC` | > 13.8:1 | Tiêu đề và văn bản truyện chữ Serif đọc đêm |
| `--text-secondary` | `#666D63` | `#9EA69A` | > 5.1:1 | Phụ đề, tên tác giả, nhãn thời lượng, số tập |
| `--accent-primary` | `#354F3E` *(Rêu Rừng)* | `#89A892` | Nhấn chính | Nút hành động chính (`Bước vào`, `Nghe tiếp`, `Đọc tiếp`, nấc hiện hành) |
| `--accent-warm` | `#9E7B43` *(Đồng Cổ)* | `#D4AC6E` | Điểm xuyết | Thanh tiến độ `2px`, hẹn giờ ru ngủ, chấm đèn kệ sách sáng đèn |
| `--accent-berry` | `#9A5144` *(Đất Đỏ)* | `#CE7E6F` | Cảm xúc | Đánh dấu yêu thích (`Bookmark`), cảnh báo nhẹ nhàng |

### 1.2. Hệ màu Nhuộm Màu Nước (Wash Presets) & Kệ Gỗ Sồi

- **4 Preset màu nước ([presets.ts](../../src/lib/presets.ts)):**
  - `Moss`: Ban ngày `#EAEFE8`, Ban đêm `#17211B` (Dành cho Kệ Khoa học & Tự nhiên, Kỹ năng sống).
  - `Ochre`: Ban ngày `#F4ECDD`, Ban đêm `#241E15` (Dành cho Kệ Ẩm thực & Nếp nhà, Lịch sử & Văn hóa).
  - `Rosewood`: Ban ngày `#F2E7E3`, Ban đêm `#261A18` (Dành cho Kệ Văn học & Đồng thoại).
  - `Lavender`: Ban ngày `#ECEAF1`, Ban đêm `#1E1D27` (Dành cho Kệ Nghệ thuật & Thơ nhạc).
  - *Nguyên tắc:* Chỉ dùng nhuộm nhẹ nền phía trên kệ hoặc đầu trang bộ sách, tuyệt đối không dùng làm tem/badge đè lên mặt bìa.
- **Kệ Gỗ Sồi Nâng Đỡ Bìa Sách (`HallShelfClient.tsx`):**
  - Thanh gờ gỗ sồi cao `10px` bo nhẹ `4px`, chuyển sắc tinh tế: Ban ngày (`#E2D2BA → #CBB594`, gờ viền `#B79F7D`), Ban đêm (`#3A2F24 → #261E16`, gờ viền `#4E3E30`). Bìa sách `3:4` đứng phẳng trên gờ, không đổ bóng giả tạo.

### 1.3. Khung Tranh 2/3 Màn Hình Đầu Tiên (`StorybookHeroStage`)

- **Bố cục sân khấu tranh:** Chiếm khoảng `~60% – 66%` chiều cao màn hình đầu tiên (`max-h-[58vh]`), giữ trọn vẹn tỷ lệ dọc `3:4` phẳng sạch, bo góc mềm `14px`, viền chỉ mảnh `1px`.
- **Phần 1/3 còn lại bên dưới:** Dành cho tiêu đề bộ sách/kệ sách, các nút tương tác chính (`Đọc truyện`, `Nghe audio`) và hé lộ một phần mạch cuộn bên dưới để mời gọi lướt tiếp tự nhiên.
- **Tương tác Lightbox:** Chạm trực tiếp vào tranh mở ngay chế độ xem toàn màn hình (kèm nút thu nhỏ hoặc vuốt đóng), phục vụ trọn vẹn việc thưởng thức tranh mỹ thuật vẽ tay.

### 1.4. Chuẩn Typography Tiếng Việt Tuyệt Đối (`134/134` Ký Tự)

- **Văn bản bài đọc & Tiêu đề:** Sử dụng font `"Lora", Georgia, "Times New Roman", serif` (tích hợp qua `next/font/google` với `subsets: ['vietnamese', 'latin']`). Thân bài đọc cài đặt `18px`, khoảng cách dòng `line-height: 1.82`; tiêu đề giữ `line-height: 1.48`.
- **Thanh điều khiển, Nút bấm & Nhãn số:** Sử dụng `"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif` (bật thuộc tính `tabular-nums` cho đồng hồ và số thứ tự tập).
- **Phòng chống cắt dấu chồng:** Toàn bộ các thẻ tiêu đề và lớp cắt dòng (`.truncate`, `.line-clamp-*`) bắt buộc có đệm dọc an toàn `padding-top: 1px; padding-bottom: 2px; line-height: 1.48` để không bao giờ bị xén các dấu mũ chồng tiếng Việt (`Ấ, Ề, Ổ, Ứ, ệ, ộ, ợ`).
- **Danh sách cấm tuyệt đối:** Cấm dùng các phông thiếu 24 ký tự nguyên âm có móc tiếng Việt (`ơ, ư`) như `Iowan Old Style`, `Charter`, `Athelas`, `Hoefler Text`, `Palatino`.

### 1.5. Bộ Kỷ Luật "5 Tuyệt Đối Không"

1. **0 emoji hệ điều hành** trên toàn bộ các trang (thay thế 100% bằng hệ thống SVG nét mảnh `1.4px` đơn sắc trong [Icons.tsx](../../src/components/ui/Icons.tsx)).
2. **0 tem, nhãn, nút phát đè lên mặt tranh bìa `3:4`**.
3. **0 chi tiết *"Kỷ vật trong túi da"*, *"Ghi chú cuối tập"*, `EndNoteBox` hay thẻ đúc kết bài học cuối trang đọc**.
4. **0 hộp chú thích (`caption`) dưới tranh minh họa** trong bài đọc (cuộn hết tranh là nối tiếp ngay sang chữ, tạo cảm giác lật giở trang sách in).
5. **0 thanh Bottom Tab Bar, Floating Action Button (`+`), màu tím Indigo/Neon hay các thành phần Dashboard / Gamification tính điểm**.

---

## CHƯƠNG 2. HỆ THỐNG ĐỊNH VỊ KHÔNG GIAN 5 NẤC (`LIBRARY WAYFINDER`)

Để bạn đọc nhỏ tuổi và cha mẹ không bao giờ bị lạc khi đi sâu vào các lớp không gian của thư viện, hệ thống tích hợp thanh định vị không gian 5 nấc chuẩn mực:

```
[Cổng Đồi Mơ] ➔ [Sảnh sách] ➔ [Kệ sách / Tủ sách] ➔ [Bộ sách] ➔ [Tập truyện]
```

### 2.1. Cấu trúc và Vị trí Hiện diện

- **Thanh đỉnh dính cố định (`Sticky 42px`):** Luôn nổi ở đầu trang khi cuộn bài dài ở màn hình đọc tập (`/episodes/[id]`), trang bộ sách (`/books/[slug]`), trang kệ sách (`/halls/[slug]`), trang tủ sách (`/books`), trang đã lưu (`/saved`) và sảnh chính (`/`).
- **Tích hợp bên trong Trình phát Ru ngủ (`AppShell.tsx`):** Khi kéo mở trình phát toàn màn hình (`FullScreenPlayerDrawer`), Wayfinder hiển thị gọn gàng ngay dưới thanh đóng kéo, cho phép người nghe vừa nghe audio vừa chuyển nhanh về Kệ, Bộ sách hoặc Sảnh mà không cần đóng trình phát (tự động khóa khi bật chế độ *Khóa trẻ em*).
- **Nấc hiện hành & Lối thoát 1 chạm:**
  - Nấc đang đứng hiển thị màu rêu trầm `--accent-primary`, chữ đậm `font-semibold`.
  - Các nấc trước đó đóng vai trò đường dẫn lùi cấp nhanh (`← Kệ`, `← Bộ sách`).
  - Nút mũi tên mở khay (`ChevronDownIcon`) cho phép mở khay chuyển đổi không gian thông minh.

### 2.2. Khay Chuyển Đổi Không Gian Thông Minh (`Wayfinder Tray`)

Khi chạm vào biểu tượng chuyển nấc hoặc tên nấc, khay thả nổi mềm mại xuất hiện:
1. **Chuyển nhanh giữa 6 Kệ sách:** Hiển thị danh sách 6 Kệ sách kèm chấm đèn ấm (kệ đã có sách thắp đèn sáng, kệ chưa có sách hiển thị mộc mạc).
2. **Chuyển nhanh giữa các Tập trong Bộ:** Liệt kê danh sách tập, đánh dấu rõ tập đang đọc/nghe dở và tập hiện tại.
3. **Các lối rẽ tiện ích:** Nút mở nhanh *Tủ sách đầy đủ*, *Tập đã lưu* hoặc *Quay ra Cổng Đồi Mơ*.
4. **Cơ chế đóng tự động an toàn:** Tự động khép lại khi bấm phím `Esc`, khi chuyển trang (URL thay đổi), hoặc khi chạm ra vùng ngoài khay.

---

## CHƯƠNG 3. CẨM NANG NGÔN NGỮ TỰ NHIÊN ("KHÔNG KHẨU HIỆU")

Bạn đọc thiếu nhi và gia đình tìm đến thư viện để đón nhận sự bình yên trước giờ ngủ. Mọi thông điệp và câu chữ phải mộc mạc, tĩnh tại, chuẩn tiếng Việt và triệt tiêu mọi biểu hiện văn mẫu, kịch hóa:

| Vị trí giao diện | Chuẩn Ngôn Ngữ Tự Nhiên (Đang áp dụng) | Dạng Khẩu Hiệu / Kịch Hóa (Cấm dùng) |
| :--- | :--- | :--- |
| **Màn hình Cổng** | Tên: `Thư viện Đồi Mơ`<br/>Phụ đề: `Sách đọc và nghe trước giờ ngủ`<br/>Nút: `Bước vào →` | `"ĐÊM ĐÈN LỒNG · GIỜ ĐỌC TRƯỚC KHI NGỦ"`<br/>`"Ánh đèn lồng đã thắp, mời bạn nhỏ đẩy nhẹ cánh cửa gỗ..."` |
| **Header Sảnh** | `Thư viện Đồi Mơ` / `Sảnh sách` | `"Chào buổi tối ấm áp tại Thư viện Đồi Mơ"` |
| **Khối Đang mở** | `Đang đọc` · `Đang nghe` · `Tập tiếp theo` | `"Bàn sách đang kẹp dở đêm qua"` / `"Hành trình kỳ thú của bé"` |
| **Phân loại Kệ** | Dùng từ `Kệ` (`Kệ Khoa học & Tự nhiên`, `Kệ Văn học`...) | Đánh số La Mã `GIAN I..VI`, gắn khẩu hiệu `"Nơi ươm mầm tri thức tương lai"` |
| **Mô tả Kệ** | Tả cảnh thực (`"Cây cỏ, muông thú, bầu trời và thế giới tự nhiên."`) | Thuyết giáo đạo đức (`"Giúp các con rèn luyện nhân cách và nuôi dưỡng tâm hồn cao đẹp"`) |
| **Hàng Kệ Trống** | Để khoảng trống tự nhiên, chỉ ghi: `Chưa có sách trên kệ này.` | Vẽ viền nét đứt `"Sách tiếp theo đang được sắp lên kệ..."` hoặc `"Rút sách mở mục lục →"` |
| **Hẹn giờ Audio** | `Hết tập dừng êm` · `15 phút` · `30 phút` · `Liên tiếp` | `"Chế độ ru bé ngủ ngon không giật mình"` |

---

## CHƯƠNG 4. BẢNG QUY HOẠCH 6 KỆ SÁCH & TIÊU CHUẨN MEDIA CHUẨN HÓA

### 4.1. Bảng Tra Cứu 6 Kệ Sách ([halls.ts](../../src/lib/halls.ts))

| `slug` (URL `/halls/[slug]`) | Tên đầy đủ trên Kệ | Tên ngắn tại Wayfinder & Sảnh | Preset màu | Trọng tâm nội dung phù hợp |
| :--- | :--- | :--- | :--- | :--- |
| `khoa-hoc-tu-nhien` | Kệ Khoa học & Tự nhiên | Khoa học & Tự nhiên | `moss` | Thế giới động thực vật, sinh học, thiên văn, vật lý tự nhiên (*Lim và Mẹ Vacci*) |
| `am-thuc-nep-nha` | Kệ Ẩm thực & Nếp nhà | Ẩm thực & Nếp nhà | `ochre` | Góc bếp, phong vị món ngon, nếp sống gia đình, nông trang (*Tiểu Hạt Dẻ Thích Ăn Vụng*) |
| `van-hoc-dong-thoai` | Kệ Văn học | Văn học | `rosewood` | Truyện đồng thoại, truyện ngắn cổ tích, ngụ ngôn, tiểu thuyết thiếu nhi |
| `lich-su-van-hoa` | Kệ Lịch sử & Văn hóa | Lịch sử & Văn hóa | `ochre` | Tích xưa danh nhân, cội nguồn văn hóa, địa lý vùng miền |
| `nghe-thuat-tho-nhac` | Kệ Nghệ thuật | Nghệ thuật | `lavender` | Hội họa màu nước, khúc ru ngủ, thơ ca và cảm thụ âm nhạc |
| `ky-nang-lon-khon` | Kệ Kỹ năng sống | Kỹ năng sống | `moss` | Nuôi dưỡng cảm xúc, tính tự lập, quan sát thiên nhiên và sẻ chia |

> **Cơ chế Kệ Giao Thoa (`+`):** Khi một cuốn sách mang tính chất liên ngành (như *Lim và Mẹ Vacci* vừa là Khoa học vừa là Văn học thiếu nhi), trường `genreTag` hỗ trợ cú pháp `Khoa học & Tự nhiên + Văn học`. Cả hai Kệ tương ứng trên thư viện đều sẽ sáng đèn và đưa sách lên kệ một cách chính xác.

### 4.2. Tiêu Chuẩn Kỹ Thuật Media

- **Tranh Bìa Bộ Sách & Bìa Tập:**
  - Tỷ lệ: Chuẩn khổ dọc **`3:4`** (Khuyến nghị `896 x 1195 px` hoặc `900 x 1200 px`).
  - Định dạng & Dung lượng: `JPEG / WebP / PNG`, dung lượng `≤ 2MB`/ảnh (tối đa `≤ 5MB`).
  - Mỹ thuật: Bìa phẳng sạch, không viền khung nhân tạo, không gắn tem mác hay chữ đè lên góc.
  - Điểm căn (`focalPoint`): Thiết lập `top / center / bottom` trong `/admin` để ảnh tự căn chỉnh chuẩn xác trên mọi kích thước màn hình.
- **Tranh Minh Họa Trong Mạch Đọc:**
  - Tỷ lệ: Khổ dọc `3:4` theo phong cách *Miền Dâu Dại* (Brambly Hedge), điểm nhìn nhân vật `30–50 cm`, đan nét bút sắt, màu nước thực vật không ám vàng.
  - Vị trí: Chèn xen kẽ giữa các đoạn văn Markdown qua cú pháp `![Mô tả ngắn](url)`.
  - Hiển thị: Chiều cao tối đa `max-h-[72vh]`, `object-contain`, tự động loại bỏ caption, có nút chuyển chế độ `[Đọc truyện | Xem tranh]` khi tập có `≥ 2` tranh minh họa.
- **Tệp Âm Thanh Chuẩn Studio:**
  - Định dạng: `MP3` hoặc `M4A` chuẩn âm thanh sạch `48kHz`, tốc độ bit `128kbps – 192kbps`.
  - Dung lượng: `≤ 60MB`/bản thu.
  - Máy chủ lưu trữ: Hỗ trợ `HTTP 206 Partial Content` (Range Requests) để đảm bảo tính năng tua nhanh/lùi và tiếp tục nghe mượt mà trên iOS Safari.

---

## CHƯƠNG 5. SỔ TAY VẬN HÀNH KỸ THUẬT & KHẮC PHỤC SỰ CỐ

### 5.1. Danh Mục Khóa Lưu Trữ Cục Bộ (Client Storage Keys)

| Tên khóa | Phạm vi lưu | Mục đích sử dụng |
| :--- | :--- | :--- |
| `litibook_gate_session_v1` | `sessionStorage` | Ghi nhận phiên đã bước qua Cổng; tự động đưa về Cổng sau `45 phút` không hoạt động. |
| `litibook_theme_window_v3` | `localStorage` | Lưu trữ trạng thái Sáng/Đêm thủ công tương ứng với từng khung giờ sinh học. |
| `litibook_progress_v1` | `localStorage` | Lưu trữ tiến độ nghe (số giây) theo từng tập và phiên bản tệp âm thanh (`trackUpdatedAt`). |
| `litibook_reading_progress_v1` | `localStorage` | Lưu trữ tiến độ cuộn trang đọc chữ (tự động đánh dấu hoàn thành khi cuộn đạt `≥ 92%`). |
| `litibook_favorites_v1` | `localStorage` | Mảng chứa danh sách ID các tập truyện được đánh dấu yêu thích (Bookmark). |
| `litibook_preferred_voice_v1` | `localStorage` | Giọng đọc ưa thích được lựa chọn gần nhất (ví dụ `female_my_duyen`, `male_thien_tam_duc`). |
| `litibook_opened_episodes_v1` | `localStorage` | Danh sách các tập đã được mở nhằm tự động gỡ bỏ nhãn `Mới` trên kệ. |
| `litibook_reader_fontsize_v1` | `localStorage` | Cỡ chữ đọc được tùy chỉnh (`16px – 22px`, mặc định chuẩn là `18px`). |

### 5.2. Các Kỹ Thuật Đặc Thù Đã Khóa Chuẩn

- **Khử Hiện Tượng Giật Tiếng Trên iOS Safari (`GainNode` Web Audio):**
  - Trình duyệt iOS Safari thường gây giật âm thanh hoặc không hỗ trợ chỉnh thuộc tính `audio.volume` trực tiếp. Hệ thống vận hành cầu nối `AudioContext` + `GainNode` để thực hiện quá trình hạ dần âm lượng (Fade-out) trong `8 giây` cuối một cách êm ái trước khi dừng hẳn.
- **Hỗ trợ Deep-Link Không Bị Văng Cổng:**
  - Khi người dùng bấm vào đường dẫn chia sẻ trực tiếp (ví dụ `/books/lim-va-me-vacci` hoặc `/episodes/ep-01`), hệ thống tự động xác lập `hasPassedGate = true` để đưa bạn đọc vào thẳng nội dung, không bắt quay lại màn hình Cổng.
- **Kiểm tra và Xuất Bản Hệ Thống:**
  - Kiểm tra tính toàn vẹn kiểu dữ liệu và đóng gói sản phẩm:
    ```bash
    npm run typecheck && npm run build
    ```
  - Khi triển khai trên Vercel hoặc Cloudflare, hệ thống hoạt động ở chế độ Dual-Engine: ưu tiên đọc PostgreSQL Supabase & R2 khi có biến môi trường; tự động dự phòng đọc `data/library_db.json` mượt mà khi chạy offline cục bộ.
