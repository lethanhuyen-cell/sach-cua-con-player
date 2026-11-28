# SCREEN SPECIFICATIONS & WIREFRAMES — Litibook (Phase 2)

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Tham chiếu** | [GEMINI.md](../../GEMINI.md) · [PRD.md](./PRD.md) v1.3 · [UX_FLOWS.md](./UX_FLOWS.md) · [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| **Khung chuẩn thiết kế** | Mobile `390 × 844px` (`padding` ngang `20px`, vùng nội dung `350px`) |
| **Quy chuẩn biểu tượng** | 100% SVG nét mảnh `1.25px` đơn sắc (không dùng emoji hệ điều hành) |
| **Mô hình truy cập** | Mở thẳng Thư viện cho người nghe (không cổng mã mời, không bắt đăng nhập); chỉ khóa đăng nhập riêng tại `/admin` cho Chủ thư viện |

---

## Màn hình 1: Trang chủ Thư viện (`/`)
- **Mục đích:** Giao diện trang chủ sạch, tĩnh tại: định danh rõ **Thư viện Đồi Mơ — Sách đọc và nghe trước giờ ngủ**, vào thẳng Tủ sách (chỉ hiện thẻ *Đang nghe dở* khi người nghe đã bắt đầu nghe) và chân trang **Copyright © Nancy & Liti**.
- **Wireframe `390px`:**
```text
┌──────────────────────────────────────┐
│ Thư viện Đồi Mơ       (Tìm)  (Đêm)   │ 22px Serif Display
│ Sách đọc và nghe trước giờ ngủ       │ 12px secondary
├──────────────────────────────────────┤
│ (Chỉ hiện khi đang có tập nghe dở:)  │
│ ┌──────────────────────────────────┐ │
│ │ [76×102] Tập 01: Bác chó Barley  │ │
│ │          ────────────── 05:30    │ │
│ │          [ ▶ Nghe tiếp ]         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ MỚI LÊN KỆ          3 tập mới chưa mở│ (Tự ẩn từng tập khi đã đọc/nghe)
│ ┌──────────────────────────────────┐ │
│ │ [54×72] MỚI · HÔM QUA            │ │
│ │         Tập 10: Chú chuột... (▶) │ │
│ └──────────────────────────────────┘ │
│                                      │
│ TỦ SÁCH                              │
│ ┌──────────────┐   ┌──────────────┐  │
│ │  Tranh bìa   │   │  Tranh bìa   │  │ 165×220 (3:4)
│ │  sạch 3:4    │   │  sạch 3:4    │  │ Sạch hoàn toàn,
│ └──────────────┘   └──────────────┘  │ không tem/badge đè
│ Lim và Mẹ Vacci    ...               │
│ 3 tập mới · Tập 10                   │ Dòng chữ nhỏ màu Đồng Cổ dưới bìa
│                                      │
│      Copyright © Nancy & Liti        │ 11px secondary
├──────────────────────────────────────┤
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

## Màn hình 4: Mục lục Tập truyện Mật độ cao (100–365+ tập) & Trang Đọc Tập
### 4A. Mục lục Tập truyện Phương án 1: Tab Tuyển tập + Chặng 20 tập + Hàng mảnh
```text
┌──────────────────────────────────────┐
│ ← Tủ sách          Trang chủ   (Đêm) │ Đầu trang thu gọn để hiện nhiều tập
│ [62×82] Lim và Mẹ Vacci              │
│         365 Đêm · 128 tập            │
│         [▶ Tiếp Tập 04] [Mỹ Duyên ▾] │
├──────────────────────────────────────┤
│ [Tìm số tập hoặc tên tập...] [Mới(3)]│ Tìm nhanh & Lọc tập mới
│ [Tất cả] [Cội nguồn] [Thú kỳ diệu]   │ Tab Tuyển tập trượt ngang (ẩn nếu tuần tự)
│ [01–20*] [21–40] [41–60] [61–80]...  │ Tự chia chặng 20 tập nhẹ mượt
│ ┌──────────────────────────────────┐ │
│ │ 01 [38×50] Bác chó Barley...  (▶)│ │ Hàng mảnh ~56px (6–7 tập/màn hình)
│ │            16 phút · Đã nghe     │ │ Chạm tên: Đọc · Chạm ▶: Nghe ngay
│ ├──────────────────────────────────┤ │
│ │ 02 [38×50] Cô mèo Amber và... (▶)│ │ Chỉ ghi "15 phút" tối giản
│ │            15 phút               │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### 4B. Giao diện Đọc Tập (`/episodes/[id]`)
- **Quy tắc bất biến (áp dụng mọi bộ sách):**
  1. **Thanh đỉnh cố định (`Sticky 42px`):** Luôn hiển thị ở mọi vị trí cuộn với nút **về Thư mục mẹ (`← Bộ sách`)** và nút **về Trang chủ (`Trang chủ`)** để người đọc thoát ra bất cứ lúc nào.
  2. **Không không gian vụn & không hộp cuối tập:** Bỏ tuyệt đối *"Kỷ vật trong túi da"* / *"Ghi chú cuối tập"*; gom nút Phát & chọn Giọng đọc vào duy nhất 1 thanh mảnh `36px` (ẩn hoàn toàn nếu tập *Chỉ đọc chữ*).
  3. **Tranh minh họa gọn trong mạch đọc & Không chú thích:** Tranh chèn trong Markdown hiển thị theo dòng cuộn từ trên xuống, tự giới hạn chiều cao gọn trong màn hình di động (không cắt xén hình, cuộn hết tranh đến chữ, **0 hộp chú thích `caption`**; chạm mở xem toàn màn hình, và nếu tập có `≥ 2` tranh thì có nút xem bộ tranh).
```text
┌──────────────────────────────────────┐
│ ← Bộ sách   [Trang chủ] [A-][A+](Đêm)│ Sticky 42px (luôn cố định)
├──────────────────────────────────────┤
│ TẬP 01                               │
│ Bác chó Barley và con đường vô hình  │ 20px Serif
│ [▶ 05:30 / 16:00] [Nữ · Mỹ Duyên ▾]  │ 1 thanh mảnh 36px (ẩn nếu Chỉ đọc chữ)
│                                      │
│ Bác chó Barley đang đánh hơi chiếc   │ (Vào thẳng nội dung chữ liền
│ cổng gỗ thì Lim và mẹ Vacci tới nông │ mạch; tranh chèn trong bài tự
│ trang. Chiếc mũi đen ươn ướt của bác │ giới hạn chiều cao gọn trong
│ liên tục phập phồng giữa bụi cỏ thu. │ màn hình dọc, không chú thích)
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │       Tranh minh họa truyện      │ │ Giới hạn chiều cao gọn,
│ │    (Không cắt hình · 0 caption)  │ │ cuộn hết tranh đến chữ
│ │                                  │ │
│ └──────────────────────────────────┘ │
│ — Mỗi sinh vật đi qua đều để lại một │
│ sợi mùi hương riêng — bác Barley đáp │
│ chậm rãi giữa làn gió sớm...         │
│ ──────────────────────────────────── │
│ ← Mục lục sách · Trang chủ · Tập tiếp → │
└──────────────────────────────────────┘
```
- **Liên kết PRD:** `NFR-001B`, `LIS-003`–`LIS-005`, `PLY-005`, `OPD-03`, `DEC-01`, `AC-04`, `AC-10`.

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
- **Mục đích:** Thiết lập bản sắc riêng cho Bộ sách (bìa `3:4`, điểm căn, Preset màu nước, cấu hình Phần) và xác nhận quyền sử dụng hợp lệ.
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
