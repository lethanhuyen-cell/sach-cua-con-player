# DESIGN SYSTEM — Litibook (Phase 2: Editorial Watercolor Storybook)

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Tham chiếu sản phẩm** | [GEMINI.md](../../GEMINI.md) · [PRD.md](./PRD.md) (Release 1.0 · v1.3) · [UX_FLOWS.md](./UX_FLOWS.md) |
| **Cảm hứng mỹ thuật** | Minimalist Watercolor Storybook — tinh thần màu nước của *Miền Dâu Dại*, thanh nhã, ấm áp, chín chắn như ấn bản sách nghệ thuật |
| **Phạm vi tái sử dụng** | Dùng chung cho toàn bộ các dự án sách trong thư viện trên khung mobile-first `390px` |
| **Phương án đã phê duyệt** | **Phương án A — *Ấn Bản Giấy Cotton* (*Botanical Paper Edition*)** |

---

## 1. Nguyên tắc Mỹ thuật Cốt lõi (*Editorial Dignity*)

1. **Giấy cotton làm nền, tranh màu nước làm linh hồn:** Nền giao diện mang sắc độ giấy in sách tự nhiên (`#F8F5EE` / `#F5EFE4`), tránh nền trắng kỹ thuật số chói gắt `#FFFFFF`.
2. **Thẩm mỹ sách in chín chắn, tuyệt đối không trẻ con hóa giao diện:**
   - **Không sử dụng emoji hệ điều hành** trong toàn bộ giao diện (thay bằng bộ **SVG Line Icons đơn sắc nét mảnh `1.25px–1.5px`**).
   - **Không dùng font tròn hoạt hình hay ngôn ngữ nựng trẻ**; dùng văn phong biên tập sách điềm đạm, tôn trọng cả người lớn lẫn trẻ em.
   - **Không dán nhãn, tem màu hay badge đè lên mặt tranh bìa `3:4`**; giữ nguyên vẹn vẻ đẹp của bức tranh màu nước.
3. **Quy tắc "3 Không" (Anti-Patterns):**
   - **Không Dashboard công nghệ:** Không sidebar tối, không biểu đồ KPI, không sắc tím Indigo/xanh Neon.
   - **Không Ứng dụng học tập (EdTech):** Không điểm thưởng, huy hiệu thi đua, thanh streak.
   - **Không Cửa hàng thương mại:** Không nhãn giá, giỏ hàng, nút mua ngay hay banner khuyến mãi.
4. **Đa dự án sách, một khung nền thống nhất:** Mỗi bộ sách giữ bản sắc riêng qua **tranh bìa nguyên bản `3:4`** và **1 trong 4 Preset màu nước trầm nhã** ở phần đầu trang Bộ sách.
5. **Quy chuẩn Giao diện Đọc Nhiều Chữ (Bất biến cho mọi bộ sách):**
   - **Tuyệt đối không có** chi tiết *"Kỷ vật trong túi da"*, *"Ghi chú cuối tập"* hay bất kỳ hộp phụ nào trên giao diện đọc.
   - **Không tạo không gian vụn** trên mỗi lần cuộn dọc: gom nút Phát và chọn Giọng đọc vào **1 thanh ngang mảnh duy nhất (`≤ 40px`)** (ẩn hoàn toàn nếu tập *"Chỉ đọc chữ"*).
   - **Tranh minh họa gọn trong mạch cuộn dọc & Không chú thích:** Khi tập truyện tải lên có chèn ảnh xen giữa các đoạn Markdown, mỗi bức tranh tự giới hạn chiều cao gọn trong khung màn hình dọc di động mà không cắt mất chi tiết tranh, cuộn hết tranh nối tiếp ngay sang chữ và **0 hộp chú thích `caption`** (chạm vào tranh mở xem toàn màn hình; nếu tập đính kèm nhiều tranh `≥ 2` thì hỗ trợ chuyển gọn sang chế độ xem bộ tranh kèm nghe Audio).
   - **Lối thoát luôn sẵn sàng (`Sticky Exit Bar`):** Thanh đỉnh `42px` cố định (`sticky`) luôn có nút về **Thư mục mẹ (`← Bộ sách`)** và nút về **Trang chủ** để người đọc dừng và thoát bất kỳ lúc nào.

---

## 2. Hai Phương án Art Direction Chín chắn để Lựa chọn

Cả hai phương án đều kế thừa trọn vẹn phong cách minh họa màu nước nét mực mảnh trên giấy kem đã duyệt, đạt chuẩn tương phản tối thiểu **WCAG 2.1 AA (≥ 4.5:1)** và hỗ trợ 2 chế độ **Giấy kem ban ngày** & **Đêm ấm ru ngủ**.

### Phương án A — "Ấn Bản Giấy Cotton" (*Botanical Paper Edition*)
> **Tâm trạng:** Tinh giản, thoáng tĩnh như tạp chí sách nghệ thuật (*Kinfolk / Apple Books*). Điểm nhấn nằm ở tỷ lệ khoảng thở rộng, đường kẻ chỉ `1px` sắc ấm và chữ Serif biên tập thanh thoát.

| Nhóm Token | Giấy kem ban ngày (*Cotton Paper*) | Đêm ấm ru ngủ (*Deep Moss Night*) | Vai trò sử dụng |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#F8F5EE` | `#111613` | Nền giấy toàn màn hình |
| `bg-surface` | `#F1ECE1` | `#19201C` | Bề mặt thẻ nghe tiếp, danh sách mục lục, ô nhập |
| `bg-elevated` | `#FDFBF6` | `#212A24` | Mini-player, Bottom Sheet, thẻ nổi |
| `border-hairline` | `#DED7C8` (`1px`) | `#2D3831` (`1px`) | Đường kẻ chỉ phân tách mục lục sách |
| `text-primary` | `#222923` *(13.8:1)* | `#EFE9DC` *(13.9:1)* | Tiêu đề Serif, thân bài truyện |
| `text-secondary` | `#666D63` *(5.1:1)* | `#9EA69A` *(5.8:1)* | Nhãn in hoa giãn chữ, thời lượng, tác giả |
| `accent-primary` | `#354F3E` *(Rêu Rừng Trầm)* | `#89A892` | Nút Phát chính, tab đang chọn |
| `accent-warm` | `#9E7B43` *(Đồng Cổ)* | `#D4AC6E` | Thanh tiến độ `2px`, Sleep Timer |
| `accent-berry` | `#9A5144` *(Đất Đỏ Trầm)* | `#CE7E6F` | Đánh dấu yêu thích, cảnh báo nhẹ |

- **Typography:**
  - *Tiêu đề & Thân bài truyện:* **`Lora` / `Playfair Display`** (Serif nét thanh, thân bài `18px`, `line-height: 1.78`).
  - *Nhãn phụ & Chỉ số:* **`Be Vietnam Pro`**; nhãn phân mục dùng in hoa nhỏ (`10px–11px`, `letter-spacing: 0.14em`).
- **Hình khối & Bìa sách:** Bìa sách `3:4` góc bo tinh tế (`6px–8px`) đặt phẳng trên nền giấy kèm viền mảnh `1px`, không đổ bóng nặng; danh sách tập trình bày kiểu **Mục lục sách in** (`00`, `01`, `02` căn cột thẳng hàng).

---

### Phương án B — "Tủ Sách Bìa Vải" (*Clothbound Salon Edition*)
> **Tâm trạng:** Trầm ấm, cổ điển, giàu chiều sâu như tủ sách bìa vải gia truyền buổi tối bên ánh đèn vàng ấm — kết hợp tinh tế với bảng màu Đêm Rừng Phong sâu lắng.

| Nhóm Token | Giấy ngà ấm (*Ivory Linen*) | Đêm đèn lồng (*Woodland Lantern*) | Vai trò sử dụng |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#F5EFE4` | `#0E1714` | Nền giấy ngà / Đêm rừng phong |
| `bg-surface` | `#ECE3D3` | `#16231E` | Bề mặt thẻ sách, danh sách tập |
| `bg-elevated` | `#FBF8F1` | `#1E2E27` | Mini-player, ngăn kéo điều khiển |
| `border-hairline` | `#D9CEBA` (`1px`) | `#2A3D34` (`1px`) | Viền khung giấy đôi & đường phân tách |
| `text-primary` | `#241D17` *(14.2:1)* | `#F6F1E7` *(15.1:1)* | Chữ chính sắc mực nâu / trắng ngà |
| `text-secondary` | `#6B5F54` *(5.3:1)* | `#9FB0A6` *(6.4:1)* | Chữ phụ, thời lượng, tác giả |
| `accent-primary` | `#243E32` *(Xanh Bách Xù)* | `#D6A14E` *(Vàng Đèn Lồng)* | Nút Phát chính, điểm nhấn chủ đạo |
| `accent-secondary` | `#9B5B42` *(Gỗ Quế Trầm)* | `#C87D55` | Điểm nhấn phụ, biểu tượng đánh dấu |
| `accent-warm` | `#B07D38` *(Mật Ong Cổ)* | `#EAB354` | Thanh tiến độ & bộ đếm giờ ngủ |

- **Typography:**
  - *Tiêu đề sách & Tập:* **`Playfair Display` / `Lora`** sắc nét cổ điển.
  - *UI & Thân bài đọc:* **`Lora`** cho bản chữ truyện (`18px`, `line-height: 1.78`) và **`Be Vietnam Pro`** cho điều khiển (`tabular-nums`).
- **Hình khối & Bìa sách:** Bìa sách `3:4` có **nếp gáy vải mảnh bên trái** (*clothbound spine crease*) và **khung giấy lót `4px`** (*inset mat border*) cùng bóng sách rất nhẹ (`0 8px 20px rgba(30,22,14,0.10)`), mang lại cảm giác cầm một cuốn sách đóng bìa cứng thực thụ.

---

### Bảng So sánh Trực diện Hai Phương án

| Tiêu chí | Phương án A — *Ấn Bản Giấy Cotton* | Phương án B — *Tủ Sách Bìa Vải* |
| :--- | :--- | :--- |
| **Cảm giác tổng thể** | Tĩnh lặng, sáng thoáng, tối giản kiểu tạp chí sách | Cổ điển, ấm sâu, giàu chất thư viện gia truyền |
| **Hình thức bìa sách** | Khung giấy phẳng tối giản, viền mảnh `1px`, bo góc nhẹ `6–8px` | Khung bìa sách có nếp gáy vải + viền lót `4px` |
| **Chế độ Đêm ru ngủ** | Rêu tối nhẹ nhàng (`#111613`), tương phản dịu vừa | Rừng đêm sâu lắng (`#0E1714`) kết hợp ánh vàng đèn lồng (`#D6A14E`) |
| **Mật độ thị giác** | Khoảng thở lớn, rất nhẹ mắt trên màn hình `390px` | Có chiều sâu vật lý rõ nét hơn giữa bìa sách và nền |

---

## 3. Hệ thống Bản sắc Đa Dự án Sách (4 Preset Trầm Nhã)

| Tên Preset | Gợi ý dòng sách | Wash Header Ngày | Điểm nhấn Ngày | Điểm nhấn Đêm |
| :--- | :--- | :--- | :--- | :--- |
| **`Moss` (Rêu Sồi)** | Thiên nhiên, rừng cây (*Lim & Mẹ Vacci*) | `#EAEFE8` | `#354F3E` | `#89A892` |
| **`Ochre` (Hoàng Thổ Ấm)** | Nông trang, đời sống (*Mùa Thu Hạt Dẻ*) | `#F4ECDD` | `#966D34` | `#D6A14E` |
| **`Rosewood` (Gỗ Hồng)** | Truyện cổ tích, hồi ức gia đình | `#F2E7E3` | `#914D41` | `#CE7E6F` |
| **`Lavender` (Hoa Chuông Tím)** | Thơ, khúc hát ru đêm (*Khúc Ru Thung Lũng*) | `#ECEAF1` | `#585270` | `#A69EC2` |

**Quy tắc áp dụng Preset:** Chỉ nhuộm nhẹ vùng đầu trang Bộ sách (`8–10%` độ đậm) và màu chữ nhấn phụ tinh gọn. **Tuyệt đối không** dán badge màu đè lên bìa sách hay chèn hộp màu vụn vào trang đọc.

---

## 4. Hệ lưới, Khoảng cách & Quy chuẩn Mobile-first `390px`

- **Grid `390px`:** Lề hai bên `20px` (vùng nội dung `350px`), lưới tủ sách 2 cột (`165px × 220px` tỷ lệ `3:4`, khe giữa `20px`).
- **Nhịp khoảng cách (8pt Rhythm):** `4 · 8 · 12 · 16 · 20 · 24 · 32 · 48px`.
- **Safe Area & Thanh cố định:** Đỉnh `44px`, đáy `34px`; `MiniPlayerBar` cao `62px`; `BottomNavBar` 3 tab cao `58px`; khoảng đệm cuối trang đọc chữ `140px`.
- **Vùng chạm tối thiểu:** `44×44px` cho mọi nút tương tác; **`60×60px`** cho nút Phát/Tạm dừng chính trên Full-screen Player.
- **Bộ Icon chuẩn:** Toàn bộ dùng **SVG nét mảnh `1.25px–1.5px` đầu tròn (`stroke-linecap="round"`)**, màu kế thừa theo token văn bản (`currentColor`). Tuyệt đối không dùng emoji.
- **Quy chuẩn Hiển thị Tiếng Việt (*Vietnamese Typography Guardrails*):**
  1. **Tải đúng subset `vietnamese`:** Khi nhúng `Lora`, `Playfair Display` và `Be Vietnam Pro` ở Phase 3, bắt buộc khai báo `subsets: ['vietnamese', 'latin']` (`font-display: swap`) và chuẩn hóa chuỗi văn bản ở dạng Unicode dựng sẵn **NFC**.
  2. **Cấm phông dự phòng thiếu dấu móc (`ơ`, `ư`):** Tuyệt đối **không** đưa `Iowan Old Style`, `Charter`, `Athelas`, `Hoefler Text` hoặc `Palatino` vào chuỗi `font-family` dự phòng vì các phông hệ thống này trên macOS/iOS thiếu 24 ký tự nguyên âm có móc (`Ơ/ơ, Ư/ư` và các thanh điệu đi kèm), gây hiện tượng nhảy phông chữ giữa chừng trong cùng một từ.
  3. **Chuỗi Fallback chuẩn đủ 134/134 ký tự tiếng Việt:**
     - *Serif biên tập:* `"Lora", Georgia, "Times New Roman", serif`
     - *Sans-serif giao diện:* `"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`
  4. **Chống cắt dấu chồng (`Ấ, Ề, Ổ, Ứ, ệ, ộ, ợ`):** Tiêu đề tiếng Việt bắt buộc đặt `line-height ≥ 1.45`; các dòng dùng `text-overflow: ellipsis` phải có đệm dọc `padding-block: 1px–2px` và `line-height ≥ 1.5`; nhãn in hoa (`uppercase`) không giãn chữ quá `0.06em–0.08em` để giữ liền mạch âm tiết tiếng Việt.

---

## 5. Thư viện Thành phần Tái sử dụng (Component Library)

| Component | Mô tả chuẩn Editorial |
| :--- | :--- |
| **`BookCoverFrame`** | Khung `3:4` hiển thị nguyên bản tranh bìa (không badge đè góc); A dùng khung phẳng `1px`, B dùng hiệu ứng rãnh gáy vải + viền lót `4px`. Tên sách, tác giả và tiến độ số tập (`4 / 10 tập`) đặt thanh lịch bên dưới ảnh bìa. |
| **`NowReadingCard`** | Thẻ ngang đầu trang chủ: ảnh thu nhỏ `54×72px`, nhãn in hoa nhỏ (`ĐANG NGHE · 05:30` hoặc `GỢI Ý TẬP KẾ`), tên tập Serif, thanh tiến độ `2px` và nút Phát tròn mảnh `44×44px`. |
| **`EditorialEpisodeRow`** | Hàng mục lục đánh số thẳng cột (`00`, `01`, `02`), tên tập Serif, thời lượng & số giọng bằng `tabular-nums`, trạng thái văn bản tinh gọn (*Đã nghe* · *Đang nghe 35%* · *Chỉ đọc chữ*) và icon `Bookmark` nét mảnh `44×44px`. |
| **`MiniPlayerBar`** | Thanh nổi mảnh gọn trên đáy màn hình, viền chỉ `1px`, thanh tiến độ `2px` chạy sát mép trên, chạm để mở toàn màn hình. |
| **`FullScreenPlayerDrawer`** | Thanh đỉnh gồm icon `Thu gọn`, nút `Khóa chạm` (biểu tượng ổ khóa nét mảnh), nút `Bản chữ`; trung tâm là tranh bìa lớn `232×310px`; cụm điều khiển `Lùi 15s · Phát/Dừng (60px) · Tới 15s`; hàng đáy `Giọng đọc · Hẹn giờ · Tốc độ · Tự tiếp`. |
| **`StoryReaderView`** | Thanh đỉnh cố định (`sticky`, `42px`) có `← Bộ sách` + `Trang chủ` + `A-/A+` + `Đêm`; thanh mảnh `36px` gom `[Phát]` + `[Giọng đọc ▾]`; văn bản cuộn dọc liền mạch xen kẽ tranh minh họa của tập (giới hạn chiều cao gọn trong màn hình, chạm phóng to toàn màn hình, **0 hộp chú thích**, **0 hộp cuối tập**; nếu tập có `≥ 2` tranh đính kèm thì hiển thị thêm nút chuyển xem bộ tranh). |
| **`AdminBookbinderyKit`** | Khu vực `/admin` dùng chung hệ giấy kem & đường kẻ mảnh: `VoiceProfileList`, `CoverFocalPreview3x4` (`Trên/Giữa/Dưới`), `AudioUploadCard`, `PrePublishChecklist`, `MobilePreview390Modal`. |
