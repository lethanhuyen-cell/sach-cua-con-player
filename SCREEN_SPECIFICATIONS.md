# SCREEN SPECIFICATIONS & WIREFRAMES — Litibook (Phase 2)

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Tham chiếu** | [PRD.md](./PRD.md) v1.2 · [UX_FLOWS.md](./UX_FLOWS.md) · [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| **Khung chuẩn thiết kế** | Mobile `390 × 844px` (`padding` ngang `20px`, vùng nội dung `350px`) |
| **Quy chuẩn biểu tượng** | 100% SVG nét mảnh `1.25px` đơn sắc (không dùng emoji hệ điều hành) |
| **Mô hình truy cập** | Mở thẳng Thư viện cho người nghe (không cổng mã mời, không bắt đăng nhập); chỉ khóa đăng nhập riêng tại `/admin` cho Chủ thư viện |

---

## Màn hình 1: Trang chủ Thư viện (`/`)
- **Mục đích:** Đón người nghe bằng không gian giấy kem điềm đạm; 1 chạm để phát tiếp tập đang nghe dở hoặc chuyển sang bộ sách yêu thích.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│ Litibook              (Đêm)  (Tìm)   │ 54px (Line icons 44×44)
├──────────────────────────────────────┤
│ BUỔI TỐI AN LÀNH                     │ 10px uppercase tracked
│ Thư viện Gia đình                    │ 24px Serif Display
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ [54×72] ĐANG NGHE · 05:30        │ │
│ │  Bìa    Bác chó Barley và con... │ │ NowReadingCard
│ │         ───────────────          │ │ (Thanh tiến độ 2px)
│ │                          (Phát)  │ │ 44×44px tròn mảnh
│ └──────────────────────────────────┘ │
│                                      │
│ TỦ SÁCH                 Xem tất cả → │
│ ┌──────────────┐   ┌──────────────┐  │
│ │              │   │              │  │ 165×220 (3:4)
│ │  Tranh bìa   │   │  Tranh bìa   │  │ Sạch hoàn toàn,
│ │  sạch 3:4    │   │  sạch 3:4    │  │ không tem/badge đè
│ │              │   │              │  │
│ └──────────────┘   └──────────────┘  │
│ Lim và Mẹ Vacci    Mùa Thu Hạt Dẻ    │ 14px Serif Bold
│ 4 / 10 tập         0 / 6 tập         │ 11px tabular-nums
│                                      │
│ BẢN THU ĐÃ LƯU              Mở mục → │
│ ┌──────────────────────────────────┐ │
│ │ [44×44] Chiếc bánh hương thảo... │ │
│ │         Mùa Thu Hạt Dẻ · 11 phút │ │ (Icon Bookmark)
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ [40×52] Bác chó Barley... (Dừng) │ │ Mini-player 62px
│ └──────────────────────────────────┘ │
│ [ Thư viện ]  [ Tủ sách ]  [ Lưu trữ ]│ Bottom Tab 58px
└──────────────────────────────────────┘
```
- **Khác biệt Phương án A vs B:**
  - *Phương án A (Ấn Bản Giấy Cotton):* Thẻ phẳng viền mảnh `1px`, bìa sách góc bo `6px` sạch nét, phân tách khối bằng đường kẻ chỉ tinh tế.
  - *Phương án B (Tủ Sách Bìa Vải):* Bìa sách có nếp gáy vải bên trái + khung giấy lót `4px` và bóng giấy nhẹ; đầu mục dùng đường viền kép cổ điển.
- **Liên kết PRD:** `LIS-001`, `LIS-002`, `LIS-006`, `NFR-001`, `NFR-002`, `AC-01`.

---

## Màn hình 2: Tủ sách với Nhiều Bộ sách (`/books`)
- **Mục đích:** Trưng bày các bộ sách độc lập của gia đình như một giá sách nghệ thuật; lọc nhẹ theo tên sách, tên tập hoặc chủ đề.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│ Tủ sách                        (Đêm) │ 54px
│ ┌──────────────────────────────────┐ │
│ │ [Tìm] Tìm tên sách hoặc tập...   │ │ 46px
│ └──────────────────────────────────┘ │
│ [Tất cả] [Thiên nhiên] [Ẩm thực] [Thơ]│ Bộ lọc nhẹ viền mảnh
│                                      │
│ ┌──────────────┐   ┌──────────────┐  │
│ │  Tranh bìa   │   │  Tranh bìa   │  │ 165×220 (3:4)
│ │  Bộ 1 (Rêu)  │   │  Bộ 2 (Thổ)  │  │ Không nhãn dán đè
│ └──────────────┘   └──────────────┘  │
│ Lim và Mẹ Vacci    Mùa Thu Hạt Dẻ    │
│ Lê Thanh Uyên      Mẹ Cốm            │
│ 11 tập · 4 đã nghe 6 tập · Chưa nghe │
│                                      │
│ ┌──────────────┐                     │
│ │  Tranh bìa   │                     │
│ │  Bộ 3 (Tím)  │                     │
│ └──────────────┘                     │
│ Khúc Ru Thung Lũng                   │
│ 8 tập · 2 đã nghe                    │
│                                      │
│ [Mini-player 62px nếu đang phát]     │
│ [ Thư viện ]  [ Tủ sách ]  [ Lưu trữ ]│
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `LIS-001`, `LIS-007`, `NFR-004`, `AC-01`.

---

## Màn hình 3: Trang Chi tiết một Bộ sách (`/books/[slug]`)
- **Mục đích:** Thể hiện bản sắc riêng của từng Bộ sách bằng Preset màu nước ở phần đầu trang, hiển thị thông tin tác giả/họa sĩ và dẫn thẳng xuống Danh sách Tập.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│ ← Tủ sách                      (Đêm) │ Nền wash Preset 10%
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░ ┌──────────┐  BỘ SÁCH · 4–9 TUỔI░░ │
│ ░░ │ Bìa 3:4  │  Lim và Mẹ Vacci   ░░ │ 108×144px
│ ░░ │ 108×144  │  Chữ: Lê Thanh Uyên░░ │
│ ░░ └──────────┘  Tranh: Gốc Sồi    ░░ │
│ ░░ 365 đêm khám phá thiên nhiên    ░░ │ Mô tả tối đa 3 dòng
│ ░░ ┌────────────────────────────┐  ░░ │
│ ░░ │  Phát tiếp · Tập 01        │  ░░ │ 46px Primary Preset
│ ░░ └────────────────────────────┘  ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├──────────────────────────────────────┤
│ [Tất cả] [Phần 1: Vườn Sồi] [Phần 2] │ PartFilterPills (ẩn nếu 0 Phần)
│ ── Màn hình 4A: Danh sách tập ────── │
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `LIS-003`, `ADM-003`, `ADM-004`, `AC-01`, `AC-10`.

---

## Màn hình 4: Danh sách các Tập truyện & Trang Đọc Tập
### 4A. Danh sách các Tập (Mục lục sách in dưới đầu trang Bộ sách)
```text
┌──────────────────────────────────────┐
│ 00  Chương mở đầu: Chiếc túi rỗng [☆]│
│     32 phút · 2 giọng · Đã nghe xong │ (Touch row >= 68px)
├──────────────────────────────────────┤ (Đường kẻ chỉ 1px)
│ 01  Bác chó Barley và con đường... [★]│
│     16 phút · 2 giọng · Đang nghe 35%│ (Thanh tiến độ mảnh)
├──────────────────────────────────────┤
│ 02  Lá thư đêm của Đốm Đốm       [☆] │
│     Chỉ đọc chữ · ~6 phút đọc        │ (OPD-03: không audio)
└──────────────────────────────────────┘
```

### 4B. Trang Chi tiết Tập — Bản chữ & Tranh minh họa (`/episodes/[id]`)
```text
┌──────────────────────────────────────┐
│ ← Lim và Mẹ Vacci    [A-][A+]  (Đêm) │ 52px (Line icons)
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │       Tranh minh họa 4:3         │ │ Chạm phóng to Lightbox
│ │       (Sạch khung, vuốt ngang)   │ │
│ └──────────────────────────────────┘ │
│ Tranh 1 / 4 — Thung lũng rừng phong  │ Caption 12px italic
│                                      │
│ TẬP 01                               │
│ Bác chó Barley và con đường vô hình  │ 22px Serif Display
│ [Giọng Nữ · Mỹ Duyên*] [Giọng Nam]   │ (Ẩn cụm này nếu Chỉ đọc chữ)
│ ┌──────────────────────────────────┐ │
│ │       Phát tập này · 16 phút     │ │ 46px Primary Accent
│ └──────────────────────────────────┘ │
│                                      │
│ Thân bài văn học (18px, line 1.78)   │
│ Dòng chữ thoáng, lề rộng dễ đọc...   │
│                                      │
│ ┌──────────────────────────────────┐ │ EndNoteBox (chỉ hiện khi
│ │ KỶ VẬT TRONG TÚI DA              │ │ Bộ sách cấu hình nhãn)
│ │ Mẩu gỗ thông thơm của bác Barley │ │
│ └──────────────────────────────────┘ │
│       [Khoảng đệm đáy 140px]         │ Tránh Mini-player che chữ
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `LIS-003`–`LIS-005`, `PLY-005`, `OPD-03`, `DEC-08`, `AC-04`, `AC-10`.

---

## Màn hình 5: Trình phát Audio Toàn màn hình (`Full-screen Player`)
- **Mục đích:** Màn hình điều khiển ru ngủ tĩnh lặng, toàn bộ thao tác nằm trong tầm ngón cái (`thumb-zone`), có `Khóa chạm` chống trẻ bấm nhầm.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│  (Thu gọn)    [Khóa chạm]   (Bản chữ)│ 48px (Line icons >= 44×44)
│                                      │
│       ┌──────────────────────┐       │
│       │                      │       │
│       │   Bìa sách / Tập     │       │ 232 × 310px (3:4)
│       │   Màu nước tĩnh dịu  │       │
│       └──────────────────────┘       │
│                                      │
│   Bác chó Barley và con đường vô hình│ 19px Serif (max 2 dòng)
│   Lim và Mẹ Vacci · Tập 01           │ 12px secondary
│                                      │
│      [ Giọng Nữ · Mỹ Duyên  ▾ ]      │ Voice Switcher Pill
│                                      │
│   05:30 ────────●──────────── 16:00  │ Thanh tua 2px (touch 44px)
│                                      │
│    (Trước)  (↺15s)  (▶/⏸)  (15s↻) (Sau)│
│     44px     48px   60px    48px  44px
│                                      │
│   [Hẹn giờ: 15p]   [1.0x]   [Tự tiếp]│ Hàng tiện ích 44px
│  (Khi Khóa chạm: "Giữ 2 giây để mở") │
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `PLY-001`–`PLY-010`, `AC-02`, `AC-03`, `AC-09`.

---

## Màn hình 6: Khu vực Nghe tiếp và Yêu thích (`/saved`)
- **Mục đích:** Tổng hợp các tập đang nghe dở, gợi ý tập kế tiếp khi tập trước đã nghe xong 100%, danh sách bản thu đã đánh dấu yêu thích và hướng dẫn giữ lịch sử trên iPhone.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│ Lưu trữ                        (Đêm) │ 54px
│ ┌────────────────┬─────────────────┐ │
│ │  Đang nghe (2) │  Đã lưu (3)     │ │ Segmented control 44px
│ └────────────────┴─────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │[48×64] ĐANG NGHE DỞ · 05:30      │ │
│ │        Tập 01: Bác chó Barley [▶]│ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │[48×64] GỢI Ý KẾ TIẾP (Tập 01 xong)│ │ DEC-04
│ │        Tập 02: Hũ mật ong...  [▶]│ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ LƯU Ý TRÌNH DUYỆT IPHONE         │ │ Chỉ hiện trên iOS Safari
│ │ Chọn Chia sẻ → Thêm vào Màn hình │ │ khi chưa cài Home Screen
│ │ chính để giữ lịch sử nghe lâu dài│ │
│ └──────────────────────────────────┘ │
│ [Mini-player 62px]                   │
│ [ Thư viện ]  [ Tủ sách ]  [ Lưu trữ ]│
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `LIS-002`, `LIS-008`, `LIS-009`, `DEC-03`, `DEC-04`.

---

## Màn hình 7 (Quản trị): Danh sách Dự án sách (`/admin`)
- **Mục đích:** Không gian quản trị gọn ấm như "Xưởng sách gia đình" (nền giấy kem, không dashboard công nghệ) để quản lý đa bộ sách, hồ sơ giọng đọc, thùng rác và sao lưu JSON.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│ Xưởng Sách Gia Đình     [Trang nghe] │ 54px
│ [Giọng đọc]  [Thùng rác]  [Sao lưu]  │ Thanh công cụ 44px
│                                      │
│ ┌──────────────────────────────────┐ │
│ │       + Tạo Bộ Sách Mới          │ │ 48px Primary Accent
│ └──────────────────────────────────┘ │
│                                      │
│ DỰ ÁN SÁCH TRONG THƯ VIỆN (3)        │ 10px uppercase tracked
│ ┌──────────────────────────────────┐ │
│ │[48×64] Lim và Mẹ Vacci           │ │
│ │        Đã xuất bản · 11 tập      │ │
│ │        [Quản lý tập]  [Cấu hình] │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │[48×64] Mùa Thu Hạt Dẻ            │ │
│ │        Nháp / Đang ẩn · 2 tập    │ │
│ │        [Quản lý tập]  [Cấu hình] │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `ADM-001`–`ADM-003`, `ADM-006`, `ADM-010`, `BKP-001`.

---

## Màn hình 8 (Quản trị): Thêm và Chỉnh sửa Bộ sách (`/admin/books/[id]`)
- **Mục đích:** Thiết lập bản sắc riêng cho Bộ sách (bìa `3:4`, điểm căn, Preset màu nước, nhãn ghi chú cuối tập, cấu hình Phần) và xác nhận quyền sử dụng hợp lệ.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│ ← Dự án sách               [Lưu lại] │ 52px
│ ┌──────────┐ Tải ảnh bìa 3:4 (≤ 5MB) │
│ │ Khung    │ Điểm căn ảnh bìa:       │
│ │  3 : 4   │ [Trên] [Giữa*] [Dưới]   │
│ └──────────┘                         │
│ Tên bộ sách *  [____________________]│
│ Tác giả chữ    [____________________]│
│ Họa sĩ         [____________________]│
│ Sắc thái màu nước (WCAG AA):         │
│ [Rêu Sồi*] [Hoàng Thổ] [Gỗ Hồng] [Tím]
│ Nhãn ghi chú cuối tập (trống = ẩn):  │
│ [ Kỷ vật trong túi da______________ ]│ (DEC-08)
│ [x] Mặc định tự chuyển tập tiếp theo │
│ Phần / Mùa (tùy chọn):               │
│   Phần 1: Thung Lũng Phong     [Sửa] │
│   [+ Thêm Phần mới]                  │
│ [x] Xác nhận quyền sở hữu/lưu hành   │ (DEC-02)
│ Trạng thái: [Nháp/Ẩn] <-> [Xuất bản] │ [Đưa vào Thùng rác]
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `ADM-003`, `ADM-004`, `ADM-007`, `PUB-001`, `DEC-02`, `DEC-05`, `DEC-08`.

---

## Màn hình 9 (Quản trị): Thêm Tập, Upload Bìa & Audio, Xuất bản (`/admin/episodes/[id]`)
- **Mục đích:** Trình biên tập tập gọn theo 4 Tab trên di động, tự động lưu nháp bản chữ mỗi 3 giây và hiển thị Checklist trước khi xuất bản.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│ ← Lim và Mẹ Vacci     Đã lưu nháp    │ Thanh dính 48px
│ [Xem trước 390px]     [Xuất bản]     │ 44px touch targets
├──────────────────────────────────────┤
│ [1.Thông tin] [2.Audio] [3.Tranh] [4.Chữ]
│                                      │
│ (Ví dụ Tab 2: AUDIO)                 │
│ [ ] Bật chế độ Tập Chỉ đọc chữ       │
│ ┌──────────────────────────────────┐ │
│ │ Hồ sơ: Giọng Nữ · Mỹ Duyên       │ │ Chọn từ Voice Profile
│ │ Tap_01_My_Duyen_48kHz.mp3 · 14.2MB│ │
│ │ ────────────────────── 100%      │ │
│ │ [Nghe thử 16:00]     [Mặc định]  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Hồ sơ: Giọng Nam · Thiền Tâm Đức │ │
│ │ Lỗi mạng tại 62% — Bản chữ đã giữ│ │
│ │ [Thử tải lại]        [Gỡ bản thu]│ │ (AC-06)
│ └──────────────────────────────────┘ │
│ [+ Thêm bản thu giọng đọc (≤ 5)]     │
│                                      │
│ KIỂM TRA TRƯỚC XUẤT BẢN              │
│   [x] Tiêu đề tập hợp lệ             │
│   [x] Bộ sách đã xác nhận bản quyền  │
│   [x] Có ít nhất 1 audio / Chỉ đọc   │
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `ADM-005`–`ADM-010`, `PUB-001`–`PUB-003`, `NFR-011`, `AC-05`, `AC-06`.
