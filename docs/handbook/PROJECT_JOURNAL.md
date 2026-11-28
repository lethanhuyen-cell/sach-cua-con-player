# NHẬT KÝ & SỔ TAY BÀN GIAO DỰ ÁN THƯ VIỆN ĐỒI MƠ (`PROJECT_JOURNAL.md`)

**Cập nhật lần cuối:** `2026-11-28 09:35 (GMT+7)`  
**Định danh chính thức:** **Thư viện Đồi Mơ** (*Sách đọc và nghe trước giờ ngủ · Copyright © Nancy & Liti*)  
**Ranh giới dự án:** Thư viện chỉ đảm nhận lưu trữ, phân loại, trình bày sách đọc/sách nói gia đình và quản trị xuất bản qua `/admin` — **tách biệt hoàn toàn** với khâu sáng tác nội dung gốc hay vẽ tranh minh họa bên ngoài.

---

## 1. Tóm tắt Kiến trúc & Các Quyết định Cốt lõi Đã Khóa Cứng

### A. Hành trình Không gian 6 Lớp, Định vị 5 Nấc & Truy cập Tự nhiên
1. **Truy cập mở không rào cản đăng nhập:** Người thân bấm link là vào thẳng Thư viện; không mã mời, không tài khoản người nghe; gắn `noindex, nofollow, noarchive`; chỉ khóa đăng nhập riêng tại `/admin`.
2. **Hành trình Không gian 6 Lớp cho bạn đọc nhỏ tuổi:**
   - *Lớp 1 — Cổng Đồi Mơ (`/`, tự chào đón mỗi phiên mới hoặc sau 45 phút nghỉ):* Vòm tranh Ngày/Đêm + đom đóm/đèn lồng nhẹ + nút `Bước vào →`.
   - *Lớp 2 — Sảnh sách (`/` sau khi vào cổng):* Khối `Đang đọc / Đang nghe`, kệ `Mới lên kệ`, nút `[Ra cổng]`, `[Tìm]`, `[Đã lưu]` (mở `SearchAndSavedSheet`), `[Sáng/Đêm]`.
   - *Lớp 3 — Các kệ sách:* 6 Kệ phân loại tự nhiên (`Khoa học & Tự nhiên`, `Ẩm thực & Nếp nhà`, `Văn học`, `Lịch sử & Văn hóa`, `Nghệ thuật`, `Kỹ năng sống`).
   - *Lớp 4 — Không gian Kệ gỗ sồi (`/halls/[slug]`):* Khung tranh Hero Stage 2/3 + Wash màu nước Preset + gờ kệ gỗ sồi nâng đỡ bìa `3:4` sạch.
   - *Lớp 5 — Bàn mở sách & Mục lục (`/books/[slug]`):* Thanh định vị `Wayfinder`, `CHUNK_SIZE = 25`, hai vùng chạm Đọc chữ / Nghe audio.
   - *Lớp 6 — Trang đọc văn học & Trình phát ru ngủ (`/episodes/[id]` & `Sleep Player`):* Tuân thủ tuyệt đối Điều 1 `GEMINI.md`, vi điều khiển `[⏸]` `0px` trên thanh `Sticky 42px`, tự lưu vị trí cuộn đọc chữ, hẹn giờ ru ngủ 1 chạm (`Hết tập dừng êm` giảm âm lượng `8s` qua Web Audio `GainNode`).
3. **Hệ thống Định vị Không gian 5 Nấc (`LibraryWayfinder`):**
   - 5 nấc liên tục: `Cổng Đồi Mơ` ➔ `Sảnh sách` ➔ `Kệ sách` ➔ `Bộ sách` ➔ `Tập truyện`.
   - Tích hợp đồng bộ ở thanh dính 42px và bên trong Trình phát ru ngủ toàn màn hình (`FullScreenPlayerDrawer`), hỗ trợ khay chuyển đổi không gian thông minh (`Wayfinder Tray`).
4. **Kỷ luật Ngôn ngữ Không Khẩu Hiệu:** Chuẩn hóa thuật ngữ "Kệ sách", mộc mạc, tự nhiên, không đóng kịch hay hô khẩu hiệu.

### B. Thẩm mỹ *Ấn Bản Giấy Cotton* & Công thái học Đêm
- Hệ màu Phương án A: Ngày `#F8F5EE` (chữ `#222923`, nhấn `#354F3E` & `#9E7B43`), Đêm `#111613` (chữ `#EFE9DC`, nhấn `#89A892` & `#D4AC6E`) — tự động kích hoạt chế độ Đêm trong khung **`19:30 – 05:30`**.
- `0` emoji hệ điều hành, `0` tem đè bìa `3:4`, `0` *"Kỷ vật trong túi da"*, `0` caption dưới tranh, `0` Bottom Tab Bar.
- Tiếng Việt `134/134` ký tự qua `Lora` + `Be Vietnam Pro` (`vietnamese` subset); cấm tuyệt đối `Iowan Old Style`, `Charter`, `Athelas`, `Hoefler Text`, `Palatino`.

---

## 2. Nhật ký Tiến hóa Dự án (*Project Changelog*)

| Mốc thời gian | Chặng phát triển | Những thay đổi quan trọng đã hoàn thành |
| :--- | :--- | :--- |
| **24/11/2026** | **Chặng 1: Nền móng & Hiến pháp** | Thiết lập [GEMINI.md](../../GEMINI.md), chốt Phương án A *Ấn Bản Giấy Cotton*, khởi tạo Next.js App Router + Dual-Engine DB (`data/library_db.json` + Supabase/Cloudflare R2) và khu vực quản trị Xưởng sách `/admin`. |
| **25/11/2026** | **Chặng 2: Lên kệ 2 Bộ sách Đầu tiên** | Đưa lên kho xuất bản 2 bộ sách: *Lim và Mẹ Vacci* (`11` tập có 3 giọng đọc & tranh minh họa) và *Tiểu Hạt Dẻ Thích Ăn Vụng* (`21` tập đọc chữ), hoàn thiện bộ bìa màu nước `3:4` sạch. |
| **25/11 – Sáng 26/11** | **Chặng 3: Tối ưu Công thái học Phòng ngủ (Gói A & B)** | Rà soát UX qua `/grill-me`: gỡ bỏ thanh 3 tab đáy lặp nội dung, gom Tìm kiếm & Đã lưu thành `SearchAndSavedSheet`, bổ sung đồng bộ tiến độ cuộn đọc cho sách chữ (`litibook_reading_progress_v1`), tự bật Đêm ấm `19:30–05:30`, gắn nút dừng `[⏸]` `0px` khi cuộn sâu trang đọc, nâng cấp thanh Hẹn giờ 1 chạm *Hết tập dừng êm* (`fade-out 8s`), sinh bộ mockup Stitch Project `10062734016695037708`. |
| **Trưa 26/11/2026** | **Chặng 4: Kiến trúc Không gian 6 Lớp & Ngôn ngữ Tự nhiên** | Tái cấu trúc trải nghiệm dành cho bạn đọc nhỏ tuổi theo trình tự *Cổng Đồi Mơ → Sảnh sách → 6 Gian sách → Kệ gỗ sồi → Bàn mở sách → Trang đọc*; tích hợp bộ chọn 6 Gian vào `/admin/books/[id]`; sinh bộ mockup Stitch Project `12208283992779232055`; tinh lọc toàn bộ văn bản sang ngôn ngữ mộc mạc không khẩu hiệu; đóng gói trọn bộ Quy trình – Cẩm nang – Nhật ký. |
| **Chiều 26/11/2026** | **Chặng 5: Hoàn thiện Mobile-First Cổng Đồi Mơ, Đồng nhất Tranh & PWA Xuất bản Vercel** | Đồng nhất 100% khung cảnh **Thư viện Cây Sồi trên Đỉnh Đồi Mơ** xuyên suốt Ngày – Đêm (`896x1200`) – OpenGraph `16:9` (`1280x714`) – Icon vuông `public/icons/` (`512`, `192`, `180`, `32`): vòm sồi đại thụ liền mạch sum suê, vầng trăng ngoài tán lá ở góc trời trên trái, cột biển gỗ **`Thư viện Đồi Mơ`** chuẩn dấu kèm đèn lồng nhỏ, mẹ con nhà cáo ngủ bên sách mở, sóc ôm hạt dẻ, đôi chim nhỏ & giỏ sách mây bên thềm. Tối ưu giao diện điện thoại `100dvh` (`viewportFit: 'cover'`, `safe-area-inset-bottom`), khung tranh `3:4` bo góc `18px` hiển thị trọn vẹn không cắt góc trời + nút Sáng/Đêm nổi gọn góc trên phải, hoàn thiện `manifest.ts` + `appleWebApp` iOS Standalone và đẩy lên Vercel. |
| **Chiều 26/11/2026** | **Giai đoạn 6: Rà soát & Vá 9 Điểm Mù Thực Tế** | Sửa lỗi React Rules of Hooks tại `page.tsx`; thống nhất suy luận tập đọc chữ `isEpisodeReadingOnly` / `getEpisodeDurationLabel`; gỡ bẫy văng Cổng khi mở deep-link và ẩn `Mini-player` ở Cổng; hỗ trợ tối đa `2` bộ đang đọc/nghe dở trên Sảnh; khóa nhấn vào gian chưa có sách; hỗ trợ **Gian giao thoa (`+`)** để *Lim và Mẹ Vacci* + *Tiểu Hạt Dẻ* đồng thời sáng đèn **Gian Văn học** (`3/6` gian); bổ sung Web Audio `GainNode` giảm âm `8s` cho iOS Safari; đồng bộ mốc Đêm `19:30–05:30` & `<meta name="theme-color">` động; hoàn tất kiểm chứng `npm run typecheck && npm run build`. |
| **Chiều muộn 26/11/2026** | **Chặng 7: Khung Tranh 2/3 Màn Hình Đầu Tiên (`StorybookHeroStage`) & Bộ 14 Tranh Nội Thất Đồi Mơ** | Chốt qua `/grill-me` và triển khai `StorybookHeroStage` (`~2/3` chiều cao màn hình đầu tiên, giữ nguyên tỷ lệ `3:4` sạch 100% không đè chữ, chạm mở Lightbox toàn màn hình, `1/3` dưới hiện tiêu đề + nút chính + hé lộ mạch cuộn) trên toàn bộ Sảnh sách, 6 Gian sách, Tủ sách, Trang Bộ sách và các Tập truyện có tranh riêng; sáng tạo đồng bộ bộ `14` tranh màu nước bút sắt Ngày/Đêm cho Sảnh sách (`foyer-day/night.jpg`) và 6 Gian sách (`public/images/halls/*-day/night.jpg`) có các bạn thú rừng sinh hoạt yên bình. |
| **Tối 26/11/2026** | **Chặng 8: Đồng bộ Bản văn Mới & 7 Track Audio 48kHz Chặng 1 Tiểu Hạt Dẻ** | Cập nhật bản văn đã biên tập khử lỗi AI và gắn đủ `7` file MP3 `48kHz` giọng `Nam · Thiền Tâm Đức` (`01..07_THD_001..007_Thien_Tam_Duc_48kHz.mp3`, tổng `1h 24m 05s`) cho `ep-thd-01` → `ep-thd-07` trong `data/library_db.json`, dọn bỏ 2 file thu nháp cũ lệch bản văn và đẩy lên GitHub/Vercel (`commit 312e642`). |
| **Tối 26/11/2026** | **Chặng 9: Đồng bộ Trọn Bộ Bìa & 72 Tranh Minh Họa Dọc `3:4` *Miền Dâu Dại* (`v3.0`) Cho *Lim và Vacci*** | Cập nhật bìa đại diện bộ sách `lim-vacci-cover.jpg` (nhà hốc sồi ấm cúng `v3.0`), toàn bộ `11` bìa tập (`00`–`10`) và **`72` tranh minh họa cuộn dọc `3:4`** (`scene_01..08.jpg`, điểm nhìn nhân vật `30–50 cm` đan nét bút sắt màu nước không ám vàng, bỏ giỏ mây & bỏ đom đóm) neo chuẩn theo đoạn văn vào `data/library_db.json` (tự động mở khóa chế độ `[Đọc truyện | Xem tranh]` & Lightbox cho cả 10 tập `01`–`10`, bảo toàn nguyên vẹn 21 tập *Tiểu Hạt Dẻ* và 29 bản thu 48kHz). |
| **Đêm 26/11/2026** | **Chặng 10: Hoàn thiện Định vị 5 Nấc (`LibraryWayfinder`), Chuẩn hóa Kệ Sách & Đóng Gói Bộ Quy Trình Chuẩn Cuối** | Phát triển và tích hợp toàn diện thành phần `LibraryWayfinder` 5 nấc (`Cổng` ➔ `Sảnh` ➔ `Kệ` ➔ `Bộ` ➔ `Tập`) kèm khay chuyển đổi không gian thông minh trên toàn bộ các trang và bên trong Trình phát ru ngủ; chuẩn hóa thống nhất thuật ngữ "Kệ sách" (`Kệ Khoa học & Tự nhiên`, `Kệ Ẩm thực & Nếp nhà`, v.v.); cập nhật hàm điều hướng mượt mà `navigateToGate` / `navigateToFoyer` không gián đoạn âm thanh; lưu trữ và đóng gói toàn diện Cẩm nang & Quy trình vận hành chuẩn cuối. |
| **Tối 27/11/2026** | **Chặng 11: Chuẩn hóa 5 Kệ Sách Mới, Kiến trúc Tri thức v2.0 (11–15 tuổi) & Metadata Liên ngành** | Tinh gọn hệ thống Kệ giao diện thành `5` Kệ chủ đạo kèm `10` tranh Ngày/Đêm đồng bộ (`Thiên nhiên kỳ thú`, `Chuyện xưa và thế giới`, `Thế giới hôm nay`, `Lớn lên mỗi ngày`, `Vườn trí tuệ`); ban hành [KIEN_TRUC_TRI_THUC_DOI_MO.md](./KIEN_TRUC_TRI_THUC_DOI_MO.md) (`6` Trụ cột, `18` Dòng sách + `V.3` dự phòng Toán học, Danh mục ưu tiên Lớp 6); nâng cấp `data/library_db.json` lên `schemaVersion: "2.0"`, gắn nhãn tri thức liên ngành & mạch kết nối (`curiosityTrails`) cho `2` bộ / `32` tập (chuyển *Tiểu Hạt Dẻ* sang `7–13 tuổi`), bổ sung bộ lọc độ tuổi, tìm kiếm khái niệm xuyên ngành và trình gắn nhãn CMS v2.0. |
| **Đêm 27/11/2026** | **Chặng 12: Mở rộng Lưới 6 Kệ Cân đối & Kệ Gợi ý Tự thích ứng *"Có thể bạn sẽ thích"*** | Chốt qua `/grill-me` và thiết kế thử nghiệm Stitch MCP (Project `3092093985773902605`): nâng mục *"Các kệ sách"* từ `5` lên `6` kệ (`2×3` Mobile, `3×2` Tablet/Desktop) bằng cách giữ nguyên `5` kệ chủ đề (`THEMATIC_HALLS`) và bổ sung kệ tuyển chọn **`Có thể bạn sẽ thích`** (`CURATED_HALL`, dùng cặp tranh Ngày/Đêm `van-hoc-dong-thoai-day/night.jpg` và sắc nhấn Đồng Cổ); xây dựng động cơ chấm điểm Hybrid (`src/lib/recommendations.ts`) kết hợp hành vi đọc/nghe trên thiết bị với đề cử từ Admin; nâng cấp `/halls/co-the-ban-se-thich` dạng 2 tầng (*Bộ sách gợi ý trên kệ gỗ sồi* + *Tập truyện gợi ý tiếp nối* 1 chạm); bổ sung Tab 4 **`Kệ gợi ý`** tại `/admin` (`src/app/api/admin/recommendations/route.ts`) và đồng bộ `data/library_db.json` (`2` bộ, `33` tập). |
| **Sáng 28/11/2026** | **Chặng 13: Chuẩn hoá Cấu trúc Thư mục Dự án** | Tạo [README.md](../../README.md) làm bản đồ gốc; gom tài liệu và mockup vào `docs/` (`handbook/`, `specs/`, `mockups/`); gom dữ liệu nguồn vào `data/seeds/`; chuẩn hoá `public/audio/lim-va-me-vacci/` và `public/images/episodes/lim-va-me-vacci/` theo `[slug]` đồng nhất với `tieu-hat-de` kèm `rewrites()` tương thích ngược trong `next.config.mjs`; phân nhóm `src/components/` thành 4 miền (`admin/`, `layout/`, `library/`, `ui/`); xoá các bản sao media trùng lặp (~310 MB) và đưa ảnh tham chiếu nháp, ảnh kệ v1, bản sao lưu tĩnh cũ vào `_archive/` (gitignored). |

---

## 3. Bản đồ Chỉ mục Tài liệu & Tài sản Dự án

### Tài liệu Cốt lõi (Đọc theo thứ tự ưu tiên)
1. [GEMINI.md](../../GEMINI.md) — **Hiến pháp bất khả xâm phạm** (Điều 1–3).
2. [KIEN_TRUC_TRI_THUC_DOI_MO.md](./KIEN_TRUC_TRI_THUC_DOI_MO.md) — **Kiến trúc Tri thức v2.0 & Danh mục Xuất bản Khai phóng (11–15 tuổi, trọng tâm Lớp 6)**.
3. [QUY_TRINH_THU_VIEN_DOI_MO.md](./QUY_TRINH_THU_VIEN_DOI_MO.md) — **Bộ Quy trình Vận hành Chuẩn cuối** (4 quy trình cốt lõi).
4. [CAM_NANG_THU_VIEN_DOI_MO.md](./CAM_NANG_THU_VIEN_DOI_MO.md) — **Cẩm nang Thiết kế & Vận hành Chuẩn cuối**.
5. [PROJECT_JOURNAL.md](./PROJECT_JOURNAL.md) — **Nhật ký & Sổ tay Bàn giao Toàn diện**.
6. [OPTIMAL_UX_DESIGN_BRIEF.md](../specs/OPTIMAL_UX_DESIGN_BRIEF.md) — **Hồ sơ Đặc tả Trải nghiệm & Thiết kế Không gian 6 Lớp**.

### Tài liệu Kiến trúc & Mockup Tham chiếu
- [ARCHITECTURE.md](../specs/ARCHITECTURE.md) — Kiến trúc hệ thống Next.js + Supabase + Cloudflare R2.
- [DESIGN_SYSTEM.md](../specs/DESIGN_SYSTEM.md) — Bảng token chi tiết *Ấn Bản Giấy Cotton*.
- [PRD.md](../specs/PRD.md) · [UX_FLOWS.md](../specs/UX_FLOWS.md) · [SCREEN_SPECIFICATIONS.md](../specs/SCREEN_SPECIFICATIONS.md) — Hồ sơ đặc tả Phase 1–2 gốc.
- [docs/mockups/spatial-v2/README.md](../mockups/spatial-v2/README.md) — Bộ 4 màn hình Stitch `390px` mô hình Không gian 6 Lớp (Project `12208283992779232055`).
- [docs/mockups/package-a/README.md](../mockups/package-a/README.md) — Bộ 5 màn hình Stitch `390px` công thái học đọc/nghe ban đầu (Project `10062734016695037708`).

---

## 4. Trạng thái Dự án Hiện tại & Bàn giao Đóng máy (Handover Status)

- **Trạng thái Git:** Sạch 100% (`working tree clean`). Toàn bộ mã nguồn, cấu phần Wayfinder, dữ liệu JSON và tài liệu quy trình đã được cập nhật, đồng bộ và ghi nhận đầy đủ.
- **Trạng thái Triển khai (Deploy):** Hoạt động ổn định trên nền tảng Next.js App Router.
- **Trạng thái Thư viện:**
  - *Bộ 1 — Lim và Mẹ Vacci:* 11 tập đầy đủ chữ, tranh minh họa dọc 3:4 chuẩn phong cách *Miền Dâu Dại* và 3 tùy chọn giọng đọc Studio.
  - *Bộ 2 — Tiểu Hạt Dẻ Thích Ăn Vụng:* 21 tập đọc chữ mượt mà, trong đó 7 tập đầu (`ep-thd-01` → `ep-thd-07`) đã tích hợp audio chuẩn Studio 48kHz giọng `Nam · Thiền Tâm Đức` (tổng thời lượng 1 giờ 24 phút).
  - *Không gian 6 Lớp & 5 Nấc Wayfinder:* Đầy đủ 14 tranh Ngày/Đêm bút sắt màu nước cho Sảnh và 6 Kệ sách, điều hướng mượt mà, không giật trang, không khẩu hiệu.

---

## 5. Chỉ dẫn Khởi động lại khi Làm tiếp (Resume Guide)

Khi tiếp tục dự án, chỉ cần thực hiện:

1. **Kiểm tra trạng thái dự án:**
   ```bash
   cd "/Users/mac/Desktop/THƯ VIỆN DƯOỚI GỐC CÂY SỒI"
   git status
   ```
2. **Khởi chạy Local Dev Server (nếu cần xem trước trên máy):**
   ```bash
   npm run dev
   # Mở trình duyệt tại: http://localhost:3000
   ```
3. **Kế hoạch tiếp theo khi quay lại (Backlog):**
   - **Chặng 2 Tiểu Hạt Dẻ:** Khi có thêm file audio thu âm 48kHz các tập 08 đến 14 (hoặc đến tập 21), copy vào `public/audio/tieu-hat-de/` và cập nhật trường `audioSources` tương ứng trong `data/library_db.json`.
   - **Thẩm định thực tế:** Mở điện thoại kiểm tra PWA trên màn hình thực tế trong phòng ngủ để cảm nhận âm lượng hạ êm và ánh sáng chế độ Đêm.
