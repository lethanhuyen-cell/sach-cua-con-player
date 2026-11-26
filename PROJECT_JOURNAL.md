# NHẬT KÝ & SỔ TAY BÀN GIAO DỰ ÁN THƯ VIỆN ĐỒI MƠ (`PROJECT_JOURNAL.md`)

**Cập nhật lần cuối:** `2026-11-26 15:02 (GMT+7)`  
**Định danh chính thức:** **Thư viện Đồi Mơ** (*Sách đọc và nghe trước giờ ngủ · Copyright © Nancy & Liti*)  
**Ranh giới dự án:** Thư viện chỉ đảm nhận lưu trữ, phân loại, trình bày sách đọc/sách nói gia đình và quản trị xuất bản qua `/admin` — **tách biệt hoàn toàn** với khâu sáng tác nội dung gốc hay vẽ tranh minh họa.

---

## 1. Tóm tắt Kiến trúc & Các Quyết định Cốt lõi Đã Khóa Cứng

### A. Hành trình Không gian 6 Lớp & Truy cập Tự nhiên
1. **Truy cập mở không rào cản đăng nhập:** Người thân bấm link là vào thẳng Thư viện; không mã mời, không tài khoản người nghe; gắn `noindex, nofollow, noarchive`; chỉ khóa đăng nhập riêng tại `/admin`.
2. **Hành trình Không gian 6 Lớp cho bạn đọc nhỏ tuổi:**
   - *Lớp 1 — Cổng Đồi Mơ (`/`, tự chào đón mỗi phiên mới hoặc sau 45 phút nghỉ):* Vòm tranh Ngày/Đêm + đom đóm/đèn lồng nhẹ + nút `Bước vào →`.
   - *Lớp 2 — Sảnh sách (`/` sau khi vào cổng):* Khối `Đang đọc / Đang nghe`, kệ `Mới lên kệ`, nút `[Ra cổng]`, `[Tìm]`, `[Đã lưu]` (mở `SearchAndSavedSheet`), `[Sáng/Đêm]`.
   - *Lớp 3 — Các gian sách:* 6 Gian phân loại tự nhiên (`Khoa học & Tự nhiên`, `Ẩm thực & Nếp nhà`, `Văn học`, `Lịch sử & Văn hóa`, `Nghệ thuật`, `Kỹ năng sống`).
   - *Lớp 4 — Gian đọc & Kệ gỗ sồi (`/halls/[slug]`):* Wash màu nước Preset + kệ gỗ sồi nâng đỡ bìa `3:4` sạch.
   - *Lớp 5 — Bàn mở sách & Mục lục (`/books/[slug]`):* Thanh định vị `← Sảnh sách › Tên gian`, `CHUNK_SIZE = 25`, hai vùng chạm Đọc / Nghe.
   - *Lớp 6 — Trang đọc văn học & Trình phát ru ngủ (`/episodes/[id]` & `Sleep Player`):* Tuân thủ tuyệt đối Điều 1 `GEMINI.md`, vi điều khiển `[⏸]` `0px` trên thanh `Sticky 42px`, tự lưu vị trí cuộn đọc chữ, hẹn giờ ru ngủ 1 chạm (`Hết tập dừng êm` giảm âm lượng `8s`).
3. **Kỷ luật Ngôn ngữ Không Khẩu Hiệu:** Toàn bộ câu chữ hiển thị giữ ở mức tối giản, tự nhiên, không đóng kịch hay hô khẩu hiệu.

### B. Thẩm mỹ *Ấn Bản Giấy Cotton* & Công thái học Đêm
- Hệ màu Phương án A: Ngày `#F8F5EE` (chữ `#222923`, nhấn `#354F3E` & `#9E7B43`), Đêm `#111613` (chữ `#EFE9DC`, nhấn `#89A892` & `#D4AC6E`) — tự động kích hoạt chế độ Đêm trong khung **`19:30 – 05:30`**.
- `0` emoji hệ điều hành, `0` tem đè bìa `3:4`, `0` *"Kỷ vật trong túi da"*, `0` caption dưới tranh, `0` Bottom Tab Bar.
- Tiếng Việt `134/134` ký tự qua `Lora` + `Be Vietnam Pro` (`vietnamese` subset); cấm tuyệt đối `Iowan Old Style`, `Charter`, `Athelas`, `Hoefler Text`, `Palatino`.

---

## 2. Nhật ký Tiến hóa Dự án (*Project Changelog*)

| Mốc thời gian | Chặng phát triển | Những thay đổi quan trọng đã hoàn thành |
| :--- | :--- | :--- |
| **24/11/2026** | **Chặng 1: Nền móng & Hiến pháp** | Thiết lập [GEMINI.md](./GEMINI.md), chốt Phương án A *Ấn Bản Giấy Cotton*, khởi tạo Next.js App Router + Dual-Engine DB (`data/library_db.json` + Supabase/Cloudflare R2) và khu vực quản trị Xưởng sách `/admin`. |
| **25/11/2026** | **Chặng 2: Lên kệ 2 Bộ sách Đầu tiên** | Đưa lên kho xuất bản 2 bộ sách: *Lim và Mẹ Vacci* (`11` tập có 3 giọng đọc & tranh minh họa) và *Tiểu Hạt Dẻ Thích Ăn Vụng* (`21` tập đọc chữ), hoàn thiện bộ bìa màu nước `3:4` sạch. |
| **25/11 – Sáng 26/11** | **Chặng 3: Tối ưu Công thái học Phòng ngủ (Gói A & B)** | Rà soát UX qua `/grill-me`: gỡ bỏ thanh 3 tab đáy lặp nội dung, gom Tìm kiếm & Đã lưu thành `SearchAndSavedSheet`, bổ sung đồng bộ tiến độ cuộn đọc cho sách chữ (`litibook_reading_progress_v1`), tự bật Đêm ấm `19:30–05:30`, gắn nút dừng `[⏸]` `0px` khi cuộn sâu trang đọc, nâng cấp thanh Hẹn giờ 1 chạm *Hết tập dừng êm* (`fade-out 8s`), sinh bộ mockup Stitch Project `10062734016695037708`. |
| **Trưa 26/11/2026** | **Chặng 4: Kiến trúc Không gian 6 Lớp & Ngôn ngữ Tự nhiên** | Tái cấu trúc trải nghiệm dành cho bạn đọc nhỏ tuổi theo trình tự *Cổng Đồi Mơ → Sảnh sách → 6 Gian sách → Kệ gỗ sồi → Bàn mở sách → Trang đọc*; tích hợp bộ chọn 6 Gian vào `/admin/books/[id]`; sinh bộ mockup Stitch Project `12208283992779232055`; tinh lọc toàn bộ văn bản sang ngôn ngữ mộc mạc không khẩu hiệu; đóng gói trọn bộ Quy trình – Cẩm nang – Nhật ký. |
| **Chiều 26/11/2026** | **Chặng 5: Đồng nhất Thư viện Cây Sồi & Mẹ Con Nhà Cáo trên Đỉnh Đồi Mơ, Chuẩn hóa PWA & Xuất bản Web Vercel** | Giữ nguyên ngôi nhà và cây sồi gốc đặt trên đỉnh **Đồi Mơ** (có lối mòn uốn lượn, dãy đồi mờ sương phía xa và **hai mẹ con nhà cáo cuộn tròn ngủ bên cuốn sách mở** trên gò cỏ cạnh lối mòn) đồng bộ 100% xuyên suốt Tranh Cổng Ngày – Đêm (`896x1200`) – Ảnh OpenGraph `16:9` (`1280x714`) – Bộ icon vuông `public/icons/` (`512`, `192`, `180`, `32`); hoàn thiện `manifest.ts` + cấu hình `appleWebApp` iOS Standalone; chỉnh khung vòm Cổng Đồi Mơ (`336x392`, `object-[50%_62%]`) và ánh sáng đèn lồng ban đêm; đẩy bản phát hành lên Vercel. |
| **Chiều 26/11/2026** | **Giai đoạn 6: Rà soát & Vá 9 Điểm Mù Thực Tế** | Sửa lỗi React Rules of Hooks tại `page.tsx`; thống nhất suy luận tập đọc chữ `isEpisodeReadingOnly` / `getEpisodeDurationLabel`; gỡ bẫy văng Cổng khi mở deep-link và ẩn `Mini-player` ở Cổng; hỗ trợ tối đa `2` bộ đang đọc/nghe dở trên Sảnh; khóa nhấn vào gian chưa có sách; hỗ trợ **Gian giao thoa (`+`)** để *Lim và Mẹ Vacci* + *Tiểu Hạt Dẻ* đồng thời sáng đèn **Gian Văn học** (`3/6` gian); bổ sung Web Audio `GainNode` giảm âm `8s` cho iOS Safari; đồng bộ mốc Đêm `19:30–05:30` & `<meta name="theme-color">` động; hoàn tất kiểm chứng `npm run typecheck && npm run build`. |

---

## 3. Bản đồ Chỉ mục Tài liệu & Tài sản Dự án

### Tài liệu Cốt lõi (Đọc theo thứ tự ưu tiên)
1. [GEMINI.md](./GEMINI.md) — **Hiến pháp bất khả xâm phạm** (Điều 1–3).
2. [QUY_TRINH_THU_VIEN_DOI_MO.md](./QUY_TRINH_THU_VIEN_DOI_MO.md) — **Quy trình chuẩn** (Hành trình 6 lớp bạn đọc, Quy trình đăng sách `/admin`, Quy trình đặt hàng AI).
3. [CAM_NANG_THU_VIEN_DOI_MO.md](./CAM_NANG_THU_VIEN_DOI_MO.md) — **Cẩm nang Thực chiến** (Bảng màu, Typography, Quy tắc Không Khẩu Hiệu, 6 Gian sách, Khóa `localStorage`).
4. [OPTIMAL_UX_DESIGN_BRIEF.md](./OPTIMAL_UX_DESIGN_BRIEF.md) — **Hồ sơ Đặc tả Trải nghiệm & Thiết kế Không gian 6 Lớp**.

### Tài liệu Kiến trúc & Mockup Tham chiếu
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Kiến trúc hệ thống Next.js + Supabase + Cloudflare R2.
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — Bảng token chi tiết *Ấn Bản Giấy Cotton*.
- [PRD.md](./PRD.md) · [UX_FLOWS.md](./UX_FLOWS.md) · [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md) — Hồ sơ đặc tả Phase 1–2 gốc.
- [design_mockups_spatial_v2/README.md](./design_mockups_spatial_v2/README.md) — Bộ 4 màn hình Stitch `390px` mô hình Không gian 6 Lớp (Project `12208283992779232055`).
- [design_mockups_package_a/README.md](./design_mockups_package_a/README.md) — Bộ 5 màn hình Stitch `390px` công thái học đọc/nghe ban đầu (Project `10062734016695037708`).
