# PRD — Thư viện Đồi Mơ (Release 1.0 · Tài liệu v1.3 — Đã phê duyệt)

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Tên thư viện** | **Thư viện Đồi Mơ** |
| **Định danh** | **Sách đọc và nghe trước giờ ngủ** |
| **Bản quyền** | **Copyright © Nancy & Liti** |
| **Phiên bản** | Sản phẩm Release 1.0 · Tài liệu v1.3 (Đồng bộ Hiến pháp [GEMINI.md](./GEMINI.md)) |
| **Vai trò biên soạn** | Principal Product Manager · UX Architect · Technical Product Lead |
| **Phạm vi tài liệu** | Cấp độ sản phẩm (cơ sở chuẩn cho Kiến trúc Kỹ thuật & Thiết kế UX/UI) |
| **Phong cách mỹ thuật** | Minimalist Watercolor Storybook (tinh thần màu nước của *Miền Dâu Dại*) |
| **Trạng thái** | **Đã phê duyệt chính thức (Ràng buộc bất biến với [GEMINI.md](./GEMINI.md))** |

---

## 1. Tầm nhìn, Mục tiêu & Phạm vi sản phẩm

### 1.1. Tầm nhìn sản phẩm
**Litibook** là một thư viện sách nói gia đình thiết kế theo tư duy **mobile-first**, dành cho trẻ em và được chia sẻ riêng tư trong vòng tròn người thân, bạn bè thân thiết. Litibook mang đến trải nghiệm nghe – đọc ấm áp, chậm rãi và an toàn như lật giở một cuốn sách tranh màu nước trước giờ đi ngủ, đồng thời trao cho chủ thư viện khả năng tự xuất bản và quản lý nhiều bộ sách độc lập mà không cần đụng đến mã nguồn.

### 1.2. Mục tiêu sản phẩm Release 1.0
1. **Đa bộ sách, tự chủ xuất bản:** Chủ thư viện tự tạo bộ sách mới, phân chia phần/tập, tải lên audio, ảnh bìa, tranh minh họa, bản chữ và xuất bản trực tiếp qua giao diện quản trị.
2. **Trải nghiệm nghe ru ngủ trọn vẹn trên di động:** Trình phát audio ổn định khi khóa màn hình, nhớ vị trí nghe, có hẹn giờ tắt an toàn và giao diện ban đêm ấm áp.
3. **Chia sẻ đơn giản, không rào cản:** Người thân mở đường dẫn là vào thẳng thư viện nghe/đọc ngay lập tức (không cổng mã mời, không bắt đăng nhập); chỉ chặn lập chỉ mục công cụ tìm kiếm (`noindex`) và khóa xác thực tại khu vực Quản trị `/admin`.
4. **Dữ liệu thuộc về chủ thư viện:** Toàn bộ cấu trúc nội dung, siêu dữ liệu, bản chữ và bảng kê đường dẫn tải tệp đa phương tiện có thể xuất ra định dạng chuẩn bất kỳ lúc nào; tệp gốc được tổ chức rõ ràng để chủ thư viện lưu bản sao tại máy cá nhân hoặc di chuyển nền tảng về sau.

### 1.3. Ngoài phạm vi (Out of Scope — Release 1.0)
- **Không kiêm công cụ sáng tác / sinh nội dung AI:** Litibook chỉ tập trung làm nền tảng thư viện giới thiệu, lưu trữ, phát audio và hiển thị các bộ sách hoàn chỉnh được đưa lên qua CMS; việc viết truyện hay thiết kế/vẽ tranh minh họa thuộc các dự án tạo sách độc lập bên ngoài.
- **Không thương mại hóa:** Không thanh toán, gói cước, giỏ hàng, mã giảm giá, quảng cáo hay liên kết tiếp thị.
- **Không tính năng mạng xã hội:** Không bình luận công khai, thả tim, bảng xếp hạng, theo dõi người dùng hay chia sẻ công khai lên mạng xã hội.
- **Không cơ chế gây nghiện cho trẻ:** Không thông báo đẩy thúc ép (streak, thông báo nhắc quay lại), không tự động gợi ý video/nội dung ngoài thư viện.

---

## 2. Chân dung người dùng & Tình huống sử dụng thực tế

### 2.1. Chân dung người dùng (Personas)

| Vai trò | Mô tả | Nhu cầu cốt lõi |
| :--- | :--- | :--- |
| **Chủ thư viện (Admin)** | Cha/mẹ hoặc người sáng tạo nội dung gia đình (không chuyên lập trình). | Thêm/sửa bộ sách, tải audio & ảnh bìa, nhập bản chữ, xem trước và xuất bản nhanh trên máy tính hoặc điện thoại mà không cần sửa code. |
| **Người nghe đồng hành (Phụ huynh / Người thân)** | Cha mẹ, ông bà, bạn bè thân thiết được chia sẻ quyền truy cập. | Mở nhanh đúng tập đang nghe dở hoặc tập kế tiếp, đặt hẹn giờ ngủ, đổi giọng đọc (nếu có), đọc bản chữ kèm tranh cùng trẻ. |
| **Người nghe nhỏ tuổi (Trẻ em 3–10 tuổi)** | Con cái trong gia đình hoặc con của người thân. | Nhận diện bộ sách và tập qua tranh minh họa trực quan, thao tác đơn giản, không có nút bấm gây lạc ra ngoài ứng dụng. |

### 2.2. Tình huống sử dụng thực tế (Real-world Scenarios)
1. **Giờ đi ngủ buổi tối (Bedtime):** Phụ huynh mở Litibook trên điện thoại trong phòng tối, bật chế độ ánh sáng đêm ấm, chạm mở tập đang nghe dở (hoặc tập kế tiếp được gợi ý sẵn), đặt hẹn giờ tắt 15 phút (hoặc "Hết tập này"), rồi khóa màn hình đặt điện thoại lên tủ đầu giường.
2. **Đọc cùng con (Co-reading):** Phụ huynh và trẻ cùng ngồi xem tranh minh họa màu nước, nghe giọng đọc (hoặc đọc tập *"Chỉ đọc chữ"*) và lướt theo bản chữ với cỡ chữ dễ đọc.
3. **Nghe trên xe / di chuyển:** Thao tác một tay ở vùng ngón cái để phát/tạm dừng hoặc tua lùi 15 giây; khi mạng 4G chập chờn ở đoạn hầm/đường xa, trình phát tự đệm lại êm ái thay vì văng lỗi khó hiểu.
4. **Chia sẻ nhanh cho ông bà / bạn thân:** Chủ thư viện gửi đường dẫn Litibook qua tin nhắn; người thân bấm vào mở thẳng Trang chủ Thư viện để nghe và đọc ngay mà không cần nhập mã mời hay tạo tài khoản.
5. **Xuất bản tập mới cuối tuần:** Chủ thư viện đăng nhập khu vực quản trị, tạo Tập mới trong một bộ sách có sẵn, chọn Hồ sơ Giọng đọc và tải 1–2 file audio, dán bản thảo văn bản, thêm 3–4 tranh minh họa, bấm "Xem trước" kiểm tra giao diện di động rồi bấm "Xuất bản".

---

## 3. Cấu trúc nội dung & Mô hình thông tin

Litibook tổ chức nội dung theo cấu trúc phân cấp linh hoạt, hỗ trợ đồng thời bộ sách ngắn (chỉ có danh sách tập) và bộ sách dài nhiều mùa/chủ đề (có phân Phần), cùng Danh mục Hồ sơ Giọng đọc dùng chung toàn thư viện.

```text
Thư viện (Library) [kèm Danh mục Hồ sơ Giọng đọc (Voice Profile) dùng chung]
 └── Bộ sách (Book / Series) [1..N]
      ├── Phần / Mùa (Part / Section) [0..N — tùy chọn] ──> Tập (Episode) [1..N]
      └── Tập trực tiếp (khi Bộ sách không chia Phần) [1..N]
           ├── Bản thu âm / Giọng đọc (Audio Track) [0..N — bằng 0 khi "Chỉ đọc chữ"]
           ├── Bản chữ (Transcript / Text Content) [0..1]
           └── Bộ tranh minh họa (Illustration) [0..N]
```

### 3.1. Thực thể & Thuộc tính chính

| Thực thể | Thuộc tính bắt buộc | Thuộc tính tùy chọn / Mở rộng |
| :--- | :--- | :--- |
| **Bộ sách (Book)** | Mã định danh, Tên bộ sách, Trạng thái (`Nháp/Đang ẩn` · `Đã xuất bản`) + cờ `Thùng rác`, Thứ tự hiển thị, Cờ xác nhận quyền sử dụng hợp lệ | Mô tả ngắn, Tác giả chữ, Họa sĩ minh họa, Độ tuổi gợi ý, Ảnh bìa (`3:4`), Nhãn chủ đề, Sắc thái màu nước định sẵn (3–4 preset chuẩn WCAG AA), Mặc định `Auto-next`, Kiểu đánh số tập |
| **Phần (Part)** | Mã định danh, Tên phần, Thứ tự trong bộ sách | Mô tả ngắn, Ảnh bìa phần |
| **Tập (Episode)** | Mã định danh, Tiêu đề tập, Thứ tự hiển thị, Trạng thái (`Nháp/Đang ẩn` · `Đã xuất bản`) + cờ `Thùng rác`, Cờ `Chỉ đọc chữ` | Mã/Số tập hiển thị (VD: `Tập 01`), Tóm tắt ngắn (chỉ dùng ở danh sách quản trị/mô tả ngắn nếu cần, không tách hộp vụn trên trang đọc), Thẻ/nhãn, Ảnh bìa riêng (kế thừa Phần/Bộ sách nếu trống), Thời lượng hiển thị (từ audio mặc định hoặc ước tính phút đọc nếu `Chỉ đọc chữ`) |
| **Hồ sơ Giọng đọc (Voice Profile)** | Mã giọng cố định (`voice_key`), Tên hiển thị chuẩn (VD: *Giọng Nữ · Mỹ Duyên*) | Tên người đọc, Ghi chú nguồn thu âm |
| **Bản thu âm (Audio Track)** | Tệp audio, Tham chiếu `Voice Profile`, Cờ giọng mặc định, Mã phiên bản/thời điểm cập nhật | Thời lượng chính xác (giây), Dung lượng tệp, Ghi chú bản thu |
| **Bản chữ (Text)** | Nội dung văn bản có cấu trúc cơ bản (tiêu đề nhỏ, đoạn văn, trích dẫn, dấu ngắt cảnh) | Số từ (tự tính, tối đa `30.000` từ/tập) |
| **Tranh minh họa (Illustration)** | Tệp hình ảnh, Thứ tự hiển thị | Mô tả thay thế ẩn cho trình đọc màn hình (`alt text` — **không có chú thích `caption` hiển thị trên giao diện đọc**) |

---

## 4. Định hướng Mỹ thuật & Trải nghiệm Mobile-first

### 4.1. Ngôn ngữ mỹ thuật: Minimalist Watercolor Storybook
- **Tinh thần chủ đạo:** Lấy cảm hứng từ tinh thần màu nước của *Miền Dâu Dại* — ấm áp, tinh tế, dịu mắt, mang cảm giác thủ công và gần gũi với thiên nhiên.
- **Không gian & Bố cục:** Tối giản chi tiết thừa, khoảng trắng thoáng, các thẻ nội dung bo tròn mềm mại, đường viền mỏng nhẹ thay vì đổ bóng nặng nề. Tranh bìa và minh họa là điểm sáng thị giác; giao diện đóng vai trò khung giấy dịu nhẹ.
- **Bảng màu & Chế độ hiển thị:**
  - *Chế độ Ban ngày (Warm Paper):* Nền giấy kem ấm, chữ nâu than/xanh rêu đậm dễ đọc, sắc nhấn tự nhiên từ bộ preset định sẵn (xanh lá rêu, mật ong, dâu chín dịu) đảm bảo chuẩn tương phản.
  - *Chế độ Ban đêm (Warm Night):* Nền tối ấm dịu mắt (tránh đen gắt và ánh sáng xanh gắt) phục vụ nghe truyện trước khi ngủ.
- **Kiểu chữ (Typography):** Tiêu đề mềm mại có nét sách truyện; phần bản chữ thân bài thoáng, khoảng cách dòng rộng để phụ huynh đọc trong ánh sáng yếu không mỏi mắt.

### 4.2. Quy chuẩn Mobile-first UX & Giao diện Đọc Nhiều Chữ (Bất khả xâm phạm)
- **NFR-001 (Ưu tiên màn hình dọc):** Toàn bộ luồng người nghe được thiết kế chuẩn cho màn hình `360px–430px` trước, sau đó mở rộng hài hòa cho máy tính bảng và màn hình lớn.
- **NFR-001B (Quy chuẩn Giao diện Đọc cho mọi bộ sách hiện tại & tương lai):**
  1. **Cấm chi tiết phụ gây loãng mạch đọc:** Tuyệt đối bỏ chi tiết *"Kỷ vật trong túi da"*, *"Ghi chú cuối tập"* hoặc bất kỳ hộp thông tin phụ nào trên giao diện đọc của mọi bộ sách.
  2. **Tối ưu cho màn hình nhiều chữ, không để không gian vụn:** Trên mỗi lần cuộn màn hình dọc phải ưu tiên diện tích liền mạch cho thân bài chữ; không tách nhiều thẻ viền rời rạc, không chèn banner thừa hay khoảng trống vụn.
  3. **Thu gọn chọn giọng đọc:** Cụm nút Phát và chọn Giọng đọc trên trang đọc phải gom gọn vào **1 thanh ngang mảnh duy nhất (`≤ 40px`)** với bộ chọn giọng thu gọn; ẩn hoàn toàn nếu tập ở chế độ *"Chỉ đọc chữ"*.
  4. **Tranh minh họa gọn trong mạch cuộn dọc & Không chú thích (`0 caption`):** Khi tập truyện tải lên có chèn tranh minh họa xen giữa các đoạn Markdown (hoặc đính kèm qua CMS, tối đa `20 tranh/tập`), mỗi ảnh tự giới hạn chiều cao gọn trong màn hình dọc di động mà không bị cắt xén, cuộn hết tranh nối tiếp ngay sang chữ và **tuyệt đối không sinh hộp chú thích (`caption`)**. Nếu tập có nhiều tranh (`≥ 2`), hỗ trợ chuyển gọn `[Đọc truyện | Xem tranh]` (hoặc chạm xem toàn màn hình) trong khi vẫn nghe Audio.
  5. **Điều hướng thoát đọc cố định (`Sticky Exit Bar`):** Giao diện đọc luôn giữ cố định thanh điều hướng mảnh ở đầu màn hình có nút **về Thư mục mẹ (trang Bộ sách / Mục lục tập)** và nút **về Trang chủ** để người đọc dừng và thoát thuận tiện ở mọi vị trí cuộn.
- **NFR-002 (Vùng chạm & Thao tác một tay):** Mọi nút tương tác chính có kích thước vùng chạm tối thiểu `44×44px`; các nút điều khiển cốt lõi của trình phát (Phát/Tạm dừng, Tua ±15s, Hẹn giờ) nằm trong vùng thuận tiện cho ngón cái.
- **NFR-003 (An toàn cho trẻ):** Không có liên kết điều hướng ra trang web bên ngoài trong khu vực người nghe; khu vực Quản trị không hiển thị lộ liễu để trẻ không bấm nhầm.

---

## 5. Yêu cầu Chức năng chi tiết

Quy ước mức độ ưu tiên:
- **Must Have (P0):** Bắt buộc có ở Release 1.0 để sản phẩm vận hành trọn vẹn.
- **Should Have (P1):** Rất nên có ở Release 1.0 hoặc ngay đợt hoàn thiện kế tiếp để nâng cao trải nghiệm.
- **Future (P2):** Định hướng mở rộng sau khi Release 1.0 ổn định.

### 5.1. Giao diện Người nghe (Listener Experience)

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| `LIS-001` | Kệ sách trang chủ & Khu vực "Mới lên kệ" | Hiển thị mục **"Mới lên kệ"** gọn ở đầu trang chủ với các tập vừa xuất bản gần nhất chưa mở, cùng danh sách **Bộ sách** bìa `3:4` sạch sẽ (bên dưới tên bộ sách có dòng báo màu Đồng Cổ `Có tập mới · Tập XX` khi có tập mới, tuyệt đối không dán nhãn đè lên mặt tranh). Dấu hiệu `"Mới"` tự động tắt trên thiết bị ngay khi bạn đọc đã mở đọc hoặc nghe tập đó. | **Must Have** |
| `LIS-002` | Khu vực "Nghe tiếp" | Hiển thị ngay đầu trang chủ tập đang nghe dở gần nhất (< 95%) với 1 chạm để phát tiếp; nếu tập gần nhất đã hoàn thành và còn tập có audio kế tiếp trong bộ sách thì tự động gợi ý *"Tập kế tiếp"*. Tự động ẩn nếu tập bị chủ thư viện chuyển về Nháp hoặc Thùng rác. | **Must Have** |
| `LIS-003` | Trang chi tiết Bộ sách & Mục lục quy mô 100–365 tập | Đầu trang thu gọn (bìa, nút Tiếp tục nghe, chọn Giọng kể, mô tả gập gọn); hỗ trợ 2 kiểu mục lục cấu hình theo từng Bộ sách: **(1) Tuyển tập chủ đề trượt ngang + tự chia chặng 20 tập** và **(2) Xếp tuần tự chia chặng 20 tập (`01–20`, `21–40`...)** kèm ô tìm nhanh số/tên tập. Mỗi tập hiển thị trên **1 hàng mảnh tối giản** (`Số tập` + `Ảnh 38×50px` + `Tên tập` + `"16 phút"` + nút tròn `▶` — hiển thị 6–7 tập/màn hình, chạm tên là Đọc, chạm `▶` là Nghe). | **Must Have** |
| `LIS-004` | Giao diện đọc Tập liền mạch | Thanh đỉnh cố định (`sticky`) có nút về **Thư mục mẹ (Bộ sách)** và **Trang chủ**; thanh điều khiển gọn tích hợp nút Phát + chọn Giọng đọc thu gọn; văn bản cuộn dọc liền mạch xen kẽ tranh minh họa của tập (mỗi ảnh tự giới hạn chiều cao gọn trong màn hình, **không hộp chú thích `caption`**, tuyệt đối không có *"Kỷ vật trong túi da"* hay hộp cuối tập). | **Must Have** |
| `LIS-005` | Tùy chỉnh cỡ chữ & Xem tranh phóng to | Cho phép chỉnh cỡ chữ Nhỏ/Vừa/Lớn trên trang đọc; chạm vào tranh minh họa bất kỳ để xem rõ toàn màn hình (và hỗ trợ chuyển chế độ xem bộ tranh nếu tập có nhiều tranh đính kèm) mà không ngắt Audio đang phát. | **Must Have** |
| `LIS-006` | Chuyển đổi chế độ Sáng / Đêm ấm | Cho phép chuyển nhanh giữa chế độ *Giấy ấm ban ngày* và *Đêm ấm ru ngủ*; ghi nhớ lựa chọn trên thiết bị. | **Must Have** |
| `LIS-007` | Tìm kiếm & Lọc tập | Tìm nhanh theo tên bộ sách, tên tập hoặc lọc theo Phần/thẻ chủ đề trong thư viện; hiển thị trạng thái rỗng rõ ràng khi không tìm thấy kết quả. | **Should Have** |
| `LIS-008` | Danh sách Yêu thích / Đánh dấu | Cho phép phụ huynh hoặc trẻ đánh dấu các tập yêu thích để mở lại nhanh vào buổi tối. | **Should Have** |
| `LIS-009` | Cài đặt như ứng dụng (Add to Home Screen) | Hỗ trợ mở toàn màn hình từ màn hình chính điện thoại với biểu tượng và tên Litibook; hiển thị lời nhắc nhẹ nhàng trên iOS Safari khuyến khích thêm vào Màn hình chính để giữ lịch sử nghe lâu dài. | **Should Have** |
| `LIS-010` | Nghe ngoại tuyến (Offline Download) | Cho phép tải trước một số tập về thiết bị để nghe khi đi máy bay hoặc nơi không có sóng. | **Future** |
| `LIS-011` | Hồ sơ nhiều bé trong gia đình | Tách riêng lịch sử nghe và danh sách yêu thích nếu gia đình có nhiều trẻ ở độ tuổi khác nhau. | **Future** |

### 5.2. Trình phát Audio (Audio Player)

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| `PLY-001` | Trình phát thu gọn & toàn màn hình | Mini-player nổi cố định ở đáy màn hình khi người dùng duyệt bộ sách/tập khác; chạm để mở rộng thành Full-screen Player có tranh bìa và thanh tiến độ. | **Must Have** |
| `PLY-002` | Điều khiển phát cốt lõi | Phát/Tạm dừng, tua lùi 15 giây, tua tới 15 giây, kéo thanh thời gian (scrubbing) kèm hiển thị thời gian hiện tại / tổng thời lượng. | **Must Have** |
| `PLY-003` | Phát nền & Điều khiển màn hình khóa | Tiếp tục phát liên tục khi khóa màn hình hoặc chuyển ứng dụng; hiển thị tiêu đề tập, tên bộ sách, ảnh bìa và nút Phát/Dừng/Tua trên màn hình khóa thiết bị. | **Must Have** |
| `PLY-004` | Ghi nhớ vị trí nghe (Resume) | Tự động lưu vị trí phát định kỳ trên thiết bị và khi tạm dừng/thoát; khi mở lại tập đang dở (< 95%) thì lùi nhẹ 2–3 giây để bắt nhịp. Đánh dấu *"Đã nghe xong"* khi còn dưới 15 giây cuối hoặc đạt ≥ 95%; khi bấm Phát lại tập đã xong sẽ tự động phát từ `00:00`. | **Must Have** |
| `PLY-005` | Chuyển đổi giọng đọc trong tập | Khi tập có từ 2 bản thu trở lên, cho phép chọn giọng đọc ngay trên trình phát; ánh xạ vị trí theo công thức tỷ lệ tuyến tính duy nhất và ghi nhớ giọng ưu tiên theo `voice_key` chuẩn của Hồ sơ Giọng đọc cho các tập sau. | **Must Have** |
| `PLY-006` | Hẹn giờ tắt ru ngủ (Sleep Timer) | Hỗ trợ các mốc: 10 phút, 15 phút, 30 phút, 45 phút và *"Hết tập này"*; hiển thị đếm ngược. Trên nền tảng hỗ trợ điều chỉnh âm lượng phần mềm (Android/Desktop), giảm dần âm lượng trong `8 ± 2 giây` cuối trước khi chuyển sang `Paused`; trên iOS Safari khóa màn hình, dừng chính xác tại mốc hẹn giờ (`±2 giây`) và lưu nguyên vị trí. | **Must Have** |
| `PLY-007` | Chuyển tập trước / tập tiếp theo | Nút chuyển nhanh tập kế tiếp/trước đó xuyên suốt qua ranh giới các Phần trong cùng Bộ sách; tự động bỏ qua tập *"Chỉ đọc chữ"* trong chuỗi phát liên tục; trạng thái bật/tắt `Auto-next` mặc định lấy theo cấu hình Bộ sách. | **Must Have** |
| `PLY-008` | Điều chỉnh tốc độ phát | Cho phép chọn tốc độ đọc (`0.85x`, `1.0x`, `1.15x`, `1.25x`) phù hợp thói quen nghe của trẻ. | **Should Have** |
| `PLY-009` | Âm thanh nền ru ngủ nhẹ (Ambient) | Tùy chọn trộn thêm tiếng mưa nhẹ/gió rừng ở mức âm lượng rất nhỏ phía sau giọng đọc. | **Future** |
| `PLY-010` | Khóa màn hình trẻ em (Kid Lock) | Cho phép khóa tạm các nút điều khiển và thanh tua trên Full-screen Player để trẻ không chạm nhầm khi xem tranh; mở khóa bằng thao tác chạm giữ `2 giây`. | **Should Have** |

### 5.3. Giao diện Quản trị (Admin CMS)

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| `ADM-001` | Đăng nhập quản trị tách biệt | Khu vực quản trị có đường dẫn riêng và yêu cầu xác thực riêng của chủ thư viện; khóa tạm 15 phút sau 5 lần nhập sai liên tiếp; hỗ trợ đặt lại mật khẩu qua email và nút *"Đăng xuất tất cả thiết bị quản trị"*. | **Must Have** |
| `ADM-002` | Bảng điều khiển thư viện | Hiển thị tổng quan các bộ sách, số tập đã xuất bản/nháp và lối tắt tạo nhanh bộ sách hoặc tập mới. | **Must Have** |
| `ADM-003` | Quản lý Bộ sách (CRUD) | Tạo mới, chỉnh sửa thông tin (bao gồm Tác giả chữ, Họa sĩ, sắc thái màu nước định sẵn, mặc định `Auto-next`), hộp xác nhận quyền sở hữu/lưu hành nội bộ hợp lệ, sắp xếp thứ tự hiển thị và chặn xuất bản Bộ sách rỗng chưa có tập `Đã xuất bản` nào. | **Must Have** |
| `ADM-004` | Quản lý Phần trong Bộ sách | Tạo, đổi tên, sắp xếp thứ tự Phần và gán Tập vào Phần (cho phép Bộ sách không cần tạo Phần nếu không có nhu cầu); không làm mất dữ liệu khi thêm/bỏ Phần. | **Must Have** |
| `ADM-005` | Quản lý Tập (CRUD) | Tạo, chỉnh sửa siêu dữ liệu tập, bật/tắt cờ `Chỉ đọc chữ`, sắp xếp thứ tự tập (kéo-thả hoặc nhập số thứ tự), nhân bản cấu trúc tập nếu cần. | **Must Have** |
| `ADM-006` | Quản lý Hồ sơ Giọng đọc & Audio đa giọng | Quản lý danh mục **Hồ sơ Giọng đọc (`Voice Profiles`)** dùng chung toàn thư viện; tải một hoặc nhiều tệp audio cho mỗi tập (≤ 5 giọng/tập, ≤ 60MB/tệp), gắn vào Voice Profile, chọn giọng mặc định, nghe thử tại chỗ, thay thế hoặc xóa bản thu (tự thu dọn tệp cũ sau 24–48 giờ). | **Must Have** |
| `ADM-007` | Tải lên Ảnh bìa & Tranh minh họa xen kẽ | Tải ảnh bìa Bộ sách/Tập (`3:4`, có chọn điểm căn `Trên / Giữa / Dưới`) và tranh minh họa đính kèm cho tập (`≤ 20` tranh/tập, `≤ 5MB`/tệp); hỗ trợ chèn ảnh xen giữa các đoạn Markdown liên quan (hiển thị gọn không sinh hộp chú thích, chỉ lưu `alt text` ẩn cho trợ năng) và tự thu dọn tệp cũ khi xóa. | **Must Have** |
| `ADM-008` | Trình soạn thảo Bản chữ | Nhập hoặc dán văn bản (hỗ trợ định dạng cơ bản: tiêu đề, đoạn văn, in nghiêng/đậm, ngắt cảnh), tự đếm số từ (tối đa `30.000` từ/tập) và tự động lưu nháp cục bộ tránh mất nội dung khi tải lại trang. | **Must Have** |
| `ADM-009` | Xem trước trước khi xuất bản | Cho phép chủ thư viện mở bản xem trước giao diện tập đúng như người nghe sẽ thấy trên màn hình di động (`390px`) ngay trong phiên đăng nhập quản trị. | **Must Have** |
| `ADM-010` | Thùng rác & Khôi phục / Xóa vĩnh viễn | Thùng rác thống nhất cho Bộ sách và Tập: chuyển vào thùng rác giúp ẩn ngay khỏi người nghe mà không mất dữ liệu; cho phép khôi phục hoặc xóa vĩnh viễn kèm giải phóng tệp lưu trữ liên quan. | **Must Have** |
| `ADM-011` | Tải lên hàng loạt / Nhập nhiều tập | Hỗ trợ tải nhiều tệp audio hoặc nhập dữ liệu nhiều tập cùng lúc để tiết kiệm thời gian khi khởi tạo bộ sách lớn. | **Future** |
| `ADM-012` | Phân quyền đồng quản trị | Cho phép mời thêm thành viên gia đình (ví dụ vợ/chồng) cùng biên tập nội dung. | **Future** |

### 5.4. Quy trình Xuất bản, Quyền riêng tư & Sao lưu

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| `PUB-001` | Quản lý vòng đời trạng thái xuất bản | Vòng đời 2 trạng thái rõ ràng (`Nháp/Đang ẩn` ↔ `Đã xuất bản`) kết hợp cùng `Thùng rác` áp dụng đồng nhất cho cả cấp Bộ sách và cấp Tập. | **Must Have** |
| `PUB-002` | Kiểm tra hợp lệ trước xuất bản | Tự động kiểm tra điều kiện tối thiểu trước khi chuyển sang `Đã xuất bản` (Tiêu đề không rỗng + Bộ sách hợp lệ đã xác nhận quyền sử dụng + ≥ 1 audio hợp lệ hoặc bật cờ `Chỉ đọc chữ`) và báo rõ trường còn thiếu. | **Must Have** |
| `PUB-003` | Cập nhật không gián đoạn | Khi sửa bản chữ, ảnh hoặc thay audio của tập đã xuất bản, đường dẫn tập giữ nguyên; nếu bản thu mới thay thế có thời lượng nhỏ hơn mốc `resume` cũ hoặc lệch > 10% thì tự đặt lại về `00:00` an toàn; giao diện người nghe làm mới danh mục khi quay lại tiền cảnh. | **Must Have** |
| `PRV-001` | Truy cập trực tiếp & Chặn lập chỉ mục | Người nghe mở đường dẫn là vào thẳng Trang chủ Thư viện (không cổng mã mời, không bắt đăng nhập); toàn bộ trang gắn `noindex, nofollow, noarchive` để tránh lập chỉ mục công khai trên máy tìm kiếm; chỉ khóa xác thực tại `/admin` cho Chủ thư viện. | **Must Have** |
| `BKP-001` | Xuất dữ liệu cấu trúc (Metadata Export) | Chủ thư viện tải về tệp JSON chuẩn chứa toàn bộ cấu trúc bộ sách, phần, tập, bản chữ và bảng kê URL tải lại các tệp đa phương tiện gốc chỉ với 1 thao tác. | **Must Have** |
| `BKP-002` | Sao lưu tự động tầng cơ sở dữ liệu | Cơ sở dữ liệu có cơ chế sao lưu tự động định kỳ phục vụ phục hồi sự cố hạ tầng (không xây giao diện ghi đè toàn bộ thư viện trên Web Admin Release 1.0). | **Should Have** |

---

## 6. Hành vi & Trạng thái của các Chức năng cốt lõi

### 6.1. Máy trạng thái & Hành vi Trình phát Audio

```text
[Idle] ──(Chọn tập / Bấm Phát)──> [Loading / Buffering]
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼ (Sẵn sàng)                             ▼ (Lỗi mạng / Tệp hỏng)
               [Playing] <────(Phát / Tạm dừng)────> [Paused]     [Error]
                    │                                              │
         ┌──────────┴──────────┐                         (Thử lại)─┘
         ▼ (Hết thời lượng)    ▼ (Hết Sleep Timer)
      [Ended]              [Paused + Dừng an toàn]
```

**Quy tắc hành vi bắt buộc:**
1. **Gián đoạn hệ thống:** Khi có cuộc gọi đến, thiết bị ngắt tai nghe hoặc ứng dụng khác chiếm quyền âm thanh, trình phát tự chuyển sang `Paused` và lưu ngay vị trí hiện tại.
2. **Đệm mạng (Buffering):** Nếu mất mạng giữa chừng, giữ nguyên vị trí hiện tại, hiển thị trạng thái nhẹ nhàng (*"Đang chờ kết nối..."*), và tự phát tiếp hoặc cho phép bấm thử lại khi có mạng mà không đặt lại về `00:00`.
3. **Phát tiếp & Phát lại (`Resume`):**
   - Nếu tập ở trạng thái đang dở (< 95%): phát tiếp từ vị trí đã lưu lùi lại `2–3 giây`.
   - Nếu tập đã đánh dấu *"Đã nghe xong"* (≥ 95%): lần bấm Phát kế tiếp bắt đầu lại từ `00:00`.
4. **Chuyển giọng đọc giữa chừng (`PLY-005`):**
   - Áp dụng thống nhất một công thức tỷ lệ tuyến tính: `vị_trí_mới = clamp((vị_trí_cũ / thời_lượng_cũ) × thời_lượng_mới, 0, thời_lượng_mới)` và giữ nguyên trạng thái đang phát hoặc tạm dừng.
5. **Hẹn giờ tắt (`Sleep Timer`):**
   - Trên Android/Desktop (nền tảng cho phép điều chỉnh `volume` bằng phần mềm): giảm âm lượng tuyến tính về 0 trong `8 ± 2 giây` cuối trước khi `Paused`, rồi khôi phục âm lượng nội bộ cho lần phát sau.
   - Trên iOS Safari (nền tảng khóa điều chỉnh âm lượng nền): dừng phát đúng mốc hẹn giờ (`±2 giây`) và lưu nguyên vị trí mà không gây lỗi phát nền.
   - Khi chọn *"Hết tập này"*, hệ thống tạm vô hiệu hóa `Auto-next` cho tập hiện tại để dừng hẳn khi tập kết thúc.
6. **Thao tác kéo thanh thời gian (Scrubbing):** Hiển thị thời gian xem trước theo ngón tay trong lúc kéo và chỉ phát lại từ vị trí mới sau khi thả tay.

### 6.2. Quy trình & Trạng thái Xuất bản Nội dung

```text
[Nháp / Đang ẩn] <──(Xuất bản / Chuyển về ẩn)──> [Đã xuất bản]
        │                                               │
        └──────────────(Đưa vào Thùng rác)──────────────┘
                                │
                                ▼
                           [Thùng rác] ──(Khôi phục)──> [Nháp / Đang ẩn]
                                │
                        (Xóa vĩnh viễn) ──> [Giải phóng dữ liệu & tệp]
```

**Quy tắc vận hành:**
1. **Điều kiện tối thiểu để xuất bản Tập (`Nháp/Đang ẩn` → `Đã xuất bản`):**
   - Có **Tiêu đề tập** không rỗng.
   - Thuộc một **Bộ sách** hợp lệ.
   - Có **ít nhất 1 tệp audio hợp lệ** đã tải lên hoàn tất (hoặc bật cờ chủ đích *"Chỉ đọc chữ"*).
   - Nếu chưa có ảnh bìa riêng, tự động kế thừa ảnh bìa của Phần hoặc Bộ sách (không chặn xuất bản).
2. **Điều kiện hiển thị với Người nghe:**
   - Một Tập chỉ hiển thị cho Người nghe khi **cả Bộ sách chứa nó và chính Tập đó** đều ở trạng thái `Đã xuất bản` và không nằm trong `Thùng rác`.
   - Khi chuyển Bộ sách về `Nháp/Đang ẩn`, toàn bộ tập bên trong tự động ẩn khỏi giao diện Người nghe nhưng giữ nguyên trạng thái riêng của từng tập. Không cho phép xuất bản Bộ sách rỗng chưa có tập `Đã xuất bản` nào.
3. **Trạng thái tải tệp (Upload Resilience):**
   - Hiển thị tiến trình phần trăm rõ ràng (`Đang tải` → `Đang kiểm tra` → `Sẵn sàng`).
   - Nếu tải tệp thất bại do rớt mạng hoặc sai định dạng, báo lỗi cụ thể và nút **"Thử lại"** mà **không làm mất dữ liệu chữ/biểu mẫu** đang nhập.
4. **Cảnh báo rời trang:** Khi có thay đổi chưa lưu trong biểu mẫu soạn thảo mà bấm rời trang, hệ thống hỏi xác nhận trước khi thoát.

---

## 7. Yêu cầu Phi chức năng (Non-Functional Requirements)

**Điều kiện kiểm thử chuẩn cho các chỉ số hiệu năng:** Mạng mô phỏng `Regular 4G (9 Mbps download / 1.5 Mbps upload / độ trễ RTT 150ms)`, quy mô thư viện thử nghiệm `5 bộ sách / 100 tập`, tệp audio mẫu `MP3 128kbps dài 20 phút`.

| Nhóm | Mã | Yêu cầu cụ thể |
| :--- | :--- | :--- |
| **Hiệu năng** | `NFR-004` | Danh sách Bộ sách và danh sách Tập tải xong và tương tác được trong `≤ 2,5 giây` trong điều kiện kiểm thử chuẩn. |
| **Hiệu năng** | `NFR-005` | Tệp audio hỗ trợ truyền phát từng phần (HTTP Range Requests / seekable) để bắt đầu phát trong `≤ 2 giây` sau khi bấm Phát mà không cần tải toàn bộ tệp (kể cả tệp 20–40 phút). |
| **Hiệu năng** | `NFR-006` | Ảnh bìa và tranh minh họa được tự động tối ưu kích thước hiển thị cho di động và tải lười (lazy-load) khi cuộn trang. |
| **Quyền riêng tư** | `NFR-007` | Toàn bộ trang người nghe và quản trị gắn `robots.txt` + HTTP header/meta `noindex, nofollow, noarchive`; không dùng cookie quảng cáo hay công cụ theo dõi bên thứ ba; trang chưa xác thực không lộ meta sách nội bộ. |
| **Quyền riêng tư** | `NFR-008` | Không thu thập thông tin định danh cá nhân của trẻ em (tên thật, ngày sinh, ảnh cá nhân, vị trí địa lý). |
| **Khả năng truy cập** | `NFR-009` | Độ tương phản màu chữ/nền đạt tối thiểu chuẩn WCAG 2.1 mức AA ở cả chế độ Ban ngày và Ban đêm ấm (áp dụng cho cả 3–4 preset sắc thái Bộ sách). |
| **Khả năng truy cập** | `NFR-010` | Tất cả nút điều khiển trình phát đều có nhãn mô tả dễ hiểu (screen-reader friendly) và tranh minh họa hỗ trợ văn bản thay thế (alt text). |
| **Độ tin cậy** | `NFR-011` | Hỗ trợ audio `MP3, M4A/AAC` (tối đa `60MB`/tệp, `≤ 5` giọng/tập), hình ảnh `JPG, PNG, WebP` (tối đa `5MB`/tệp, `≤ 20` tranh/tập) và bản chữ `≤ 30.000` từ/tập; từ chối sớm tệp sai định dạng hoặc vượt trần dung lượng với thông báo tiếng Việt rõ ràng. |
| **Sao lưu** | `NFR-012` | Chủ thư viện có thể xuất toàn bộ cấu trúc nội dung, bản chữ và danh sách đường dẫn tải tệp gốc bất kỳ lúc nào; tệp trên kho lưu trữ tổ chức gọn theo `Bộ sách / Tập` để dễ di chuyển nền tảng. |

---

## 8. Tiêu chí Nghiệm thu có thể kiểm thử (Acceptance Criteria)

### AC-01: Khám phá đa bộ sách & Tiếp tục nghe (`LIS-001`, `LIS-002`, `LIS-003`)
- **Given** thư viện có 2 bộ sách đã xuất bản (Bộ A có 2 Phần, Bộ B không chia Phần) và 1 bộ sách ở trạng thái `Nháp/Đang ẩn`.
- **When** người nghe mở trang chủ trên điện thoại.
- **Then** chỉ thấy Bộ A và Bộ B (kèm tiến độ dạng số tập đã nghe, VD `1/5 tập`); mở Bộ A thấy đúng cấu trúc Phần → Tập, mở Bộ B thấy thẳng danh sách Tập.
- **And** nếu trước đó người nghe đã dừng Tập 1 (15 phút) tại `05:30`, thẻ *"Nghe tiếp"* chạm 1 lần phát tiếp từ `05:27–05:30`; nếu Tập 1 đã ở trạng thái *"Đã nghe xong"*, thẻ *"Nghe tiếp"* gợi ý Tập 2 và bấm Phát lại Tập 1 sẽ bắt đầu từ `00:00`.

### AC-02: Trình phát Audio, Màn hình khóa & Hẹn giờ tắt (`PLY-001` – `PLY-006`)
- **Given** người nghe đang phát một tập dài 15 phút có 2 giọng đọc.
- **When** thu gọn trình phát và chuyển sang xem bộ sách khác → âm thanh không ngắt và Mini-player luôn hiện ở đáy màn hình.
- **When** khóa màn hình điện thoại → âm thanh tiếp tục phát, màn hình khóa hiển thị đúng tên tập, bìa và nút Phát/Tạm dừng hoạt động.
- **When** đặt hẹn giờ tắt 10 phút và đến cuối phút thứ 10:
  - Trên Android/Desktop: âm lượng giảm dần từ `100% -> 0%` trong `8 ± 2 giây` cuối rồi chuyển sang `Paused`.
  - Trên iOS Safari khóa màn hình: dừng phát đúng mốc hẹn giờ (`±2 giây`), lưu nguyên vị trí và không tự chuyển sang tập sau.

### AC-03: Đổi giọng đọc giữ nhịp nghe (`PLY-005`)
- **Given** người nghe đang nghe Giọng Nữ dài `10 phút (600s)` tại mốc `04:00 (240s — 40%)`, và tập này có bản thu Giọng Nam dài `12 phút 30 giây (750s)`.
- **When** người nghe chuyển sang Giọng Nam ngay trên trình phát.
- **Then** trình phát tải bản thu Giọng Nam và tiếp tục phát từ mốc `05:00 ± 3 giây (300s ± 3s)`, đồng thời ghi nhớ lựa chọn giọng này cho tập kế tiếp nếu cùng `voice_key`.

### AC-04: Giao diện đọc nhiều chữ liền mạch & Tranh gọn không chú thích (`LIS-004`, `LIS-005`, `LIS-006`, `NFR-001B`)
- **Given** một tập có bản chữ `3.000` từ, `2` giọng đọc và tranh minh họa chèn xen giữa các đoạn Markdown.
- **When** người nghe mở trang đọc tập trên màn hình `360px–390px` và cuộn dọc bài đọc.
- **Then** chữ cuộn dọc liền mạch ưu tiên diện tích văn bản, nút Phát và chọn Giọng đọc gom gọn trên 1 thanh ngang mảnh, mỗi tranh minh họa tự giới hạn chiều cao gọn trong màn hình (**0 hộp chú thích `caption`**, **0 hộp *"Kỷ vật trong túi da"***), và thanh đỉnh cố định (`sticky`) luôn giữ nút về **Bộ sách (Thư mục mẹ)** và **Trang chủ**.

### AC-05: Tự xuất bản tập mới không cần sửa code (`ADM-003` – `ADM-010`, `PUB-001`, `PUB-002`)
- **Given** chủ thư viện đã đăng nhập khu vực quản trị.
- **When** chủ thư viện tạo Tập mới, nhập tiêu đề, dán bản chữ, chọn Hồ sơ Giọng đọc, tải 1 file audio MP3 (`≤ 60MB`) và 2 ảnh minh họa (`≤ 5MB`), sau đó bấm **"Xem trước"**.
- **Then** giao diện xem trước (`390px`) hiển thị đầy đủ audio, tranh và chữ đúng như màn hình người nghe, trong khi người nghe bên ngoài vẫn chưa thấy tập này.
- **When** chủ thư viện bấm **"Xuất bản"**.
- **Then** ngay sau khi thao tác Xuất bản trả về thành công (`≤ 2 giây`), khi Người nghe mở hoặc tải lại trang Bộ sách thì Tập mới xuất hiện đúng thứ tự và phát được audio ngay.
- **When** chủ thư viện thử bấm Xuất bản một tập chưa có tiêu đề hoặc chưa có audio (và chưa bật cờ *"Chỉ đọc chữ"*), hoặc Bộ sách chưa xác nhận quyền sử dụng / chưa có tập xuất bản nào.
- **Then** hệ thống chặn xuất bản và chỉ rõ chính xác mục còn thiếu.

### AC-06: Xử lý lỗi tải tệp & Giới hạn tệp an toàn (`ADM-006`, `ADM-007`, `NFR-011`)
- **Given** chủ thư viện đã nhập xong tiêu đề và `1.500` từ bản chữ trong biểu mẫu tạo tập.
- **When** chủ thư viện chọn tệp sai định dạng, vượt ngưỡng (`> 60MB` audio hoặc `> 5MB` ảnh), hoặc bị mất mạng giữa chừng khi đang tải.
- **Then** hệ thống báo lỗi tiếng Việt rõ ràng tại ô tải tệp, cho phép chọn lại hoặc **"Thử lại"** mà toàn bộ tiêu đề và `1.500` từ bản chữ vẫn được giữ nguyên (kể cả khi tải lại trang nhờ lưu nháp cục bộ).

### AC-07: Truy cập trực tiếp cho người nghe & Khóa quản trị (`/admin`) (`PRV-001`, `ADM-001`)
- **Given** người thân bấm mở đường dẫn thư viện Litibook trên điện thoại.
- **Then** vào thẳng Trang chủ Thư viện mà không bị chặn bởi cổng mã mời hay màn hình đăng nhập; trong khi truy cập `/admin` chưa xác thực bị chặn hoàn toàn và khóa tạm 15 phút sau 5 lần nhập sai mật khẩu quản trị.

### AC-08: Xuất bản sao lưu dữ liệu (`BKP-001`)
- **Given** thư viện có ít nhất 1 bộ sách gồm nhiều tập có bản chữ và siêu dữ liệu.
- **When** chủ thư viện bấm **"Xuất dữ liệu thư viện"** trong trang quản trị.
- **Then** trình duyệt tải về tệp JSON chuẩn chứa đầy đủ cấu trúc bộ sách, phần, tập, bản chữ, hồ sơ giọng đọc và bảng kê URL tải tệp đa phương tiện gốc.

### AC-09: Xung đột Auto-next vs Sleep Timer & Kid Lock (`PLY-007`, `PLY-010`)
- **Given** người nghe đang bật đồng thời `Auto-next` và Sleep Timer *"Hết tập này"*.
- **When** tập hiện tại kết thúc → trình phát dừng hẳn, không tự phát sang tập kế tiếp.
- **Given** người nghe bật `Kid Lock` trên Full-screen Player.
- **When** chạm nhanh vào thanh tua hoặc nút chuyển tập → trình phát không phản hồi cho tới khi chạm giữ nút mở khóa đủ `2 giây`.

### AC-10: Quản lý Phần linh hoạt & Tập Chỉ đọc chữ (`ADM-004`, `LIS-003`, `LIS-004`, `PLY-007`)
- **Given** Bộ sách đang có 3 tập chưa phân Phần.
- **When** Admin tạo Phần 1 và gán cả 3 tập vào Phần 1 → không tập nào bị mất dữ liệu hay thay đổi trạng thái xuất bản.
- **Given** Admin xuất bản Tập X ở chế độ *"Chỉ đọc chữ"* (`0` audio).
- **When** Người nghe mở Tập X → giao diện hiển thị bản chữ/tranh và thời gian đọc ước tính mà không hiện lỗi thiếu audio; chuỗi phát liên tục `Auto-next` tự động bỏ qua Tập X để phát tiếp tập có audio kế sau.

### AC-11: Cập nhật tập đang xuất bản không lỗi vị trí nghe (`PUB-003`)
- **Given** máy người nghe đang lưu mốc `18:00` trên Tập A (bản cũ dài 20 phút).
- **When** Admin thay audio mới cho Tập A chỉ dài 12 phút.
- **Then** khi người nghe mở lại Tập A, trình phát không bị kẹt/lỗi tràn thời gian mà tự đặt lại về `00:00` an toàn.

### AC-12: Quy chuẩn chạm di động & Chặn công cụ tìm kiếm (`NFR-002`, `NFR-007`)
- **Given** kiểm tra giao diện Người nghe trên viewport `360×800`.
- **When** đo toàn bộ nút điều khiển cốt lõi và kiểm tra phản hồi HTTP của các trang thư viện & quản trị.
- **Then** 100% nút chính có vùng chạm `≥ 44×44px`, không tràn ngang, và các route trả về chỉ thị chặn lập chỉ mục (`noindex, nofollow, noarchive`).

---

## 9. Rủi ro, Giả định & Các Quyết định Sản phẩm Đã phê duyệt

### 9.1. Rủi ro chính & Hướng giảm thiểu (ở cấp sản phẩm)
1. **Rủi ro phát nền & khóa điều khiển âm lượng trên iOS Safari:** iOS không cho web thay đổi `audio.volume` bằng phần mềm khi phát nền khóa màn hình và có thể ngắt phát nếu thiếu Media Session hợp lệ.
   - *Giảm thiểu:* Kiểm thử thực tế trên iOS Safari & Android Chrome ngay từ nguyên mẫu trình phát; tách tiêu chí nghiệm thu thực tế tại `AC-02`.
2. **Rủi ro Safari iOS xóa dữ liệu cục bộ sau 7 ngày (`localStorage`):** Nếu người thân nghe qua trình duyệt iOS mà không vào lại trong 7 ngày, lịch sử nghe và yêu thích lưu trên máy có thể bị trình duyệt dọn sạch.
   - *Giảm thiểu:* Giữ ưu tiên không bắt người thân tạo tài khoản ở Release 1.0 (`OPD-02`), kèm lời nhắc nhẹ *"Thêm vào Màn hình chính"* (`LIS-009`) để lưu dữ liệu bền vững dạng PWA.
3. **Rủi ro giao diện đọc bị chia vụn trên màn hình di động:** Nhiều hộp phụ, nút chọn giọng dàn trải hoặc tranh kèm chú thích dài làm đứt mạch đọc với các tập nhiều chữ.
   - *Giảm thiểu:* Luật hóa trong `GEMINI.md` & `NFR-001B`: bỏ triệt để *"Kỷ vật trong túi da"* / hộp cuối tập, bỏ chú thích ảnh, thu gọn thanh chọn giọng đọc còn 1 dòng mảnh và dành tối đa mặt trang cho văn bản liền mạch.
4. **Rủi ro dung lượng tệp audio lớn (48kHz ~10–20MB/tập):** Gây chậm khi tải lên từ di động hoặc tốn băng thông 4G của người thân.
   - *Giảm thiểu:* Giới hạn trần `≤ 60MB`/tệp (`NFR-011`) và truyền phát từng phần (`NFR-005`).
5. **Rủi ro nhập liệu dài trên điện thoại:** Dán bản chữ dài và tải nhiều tệp trên màn hình nhỏ dễ mất nháp nếu rớt mạng.
   - *Giảm thiểu:* Tự động lưu nháp cục bộ khi soạn thảo (`ADM-008`) và giữ nguyên form khi lỗi upload (`AC-06`).

### 9.2. Giả định (Assumptions)
- Quy mô người dùng ở Release 1.0 là nhóm gia đình và bạn bè thân thiết được chia sẻ đường dẫn trực tiếp (ước tính dưới 100 người nghe đồng thời).
- Chủ thư viện sở hữu hợp pháp hoặc có quyền lưu hành đối với toàn bộ bản chữ, giọng đọc và tranh minh họa tải lên (được xác nhận tường minh trên CMS khi xuất bản Bộ sách).
- Người nghe chủ yếu sử dụng điện thoại thông minh hiện đại (iOS / Android) có kết nối Wi-Fi hoặc 4G.

### 9.3. Tổng hợp các Quyết định Sản phẩm Đã phê duyệt (`OPD-01`..`06` & `DEC-01`..`08`)

| Mã | Quyết định sản phẩm | Phương án đã chốt cho Release 1.0 |
| :--- | :--- | :--- |
| `OPD-01` | **Cơ chế truy cập thư viện** | Mở thẳng qua đường dẫn chia sẻ (không cổng mã mời, không bắt đăng nhập người nghe; gắn `noindex`). |
| `OPD-02` | **Lưu tiến độ nghe (Resume)** | Lưu cục bộ trên thiết bị (không yêu cầu tài khoản người nghe). |
| `OPD-03` | **Tập chỉ có bản chữ** | Cho phép xuất bản tập không có audio với cờ *"Chỉ đọc chữ"* và nhãn phân biệt. |
| `OPD-04` | **Bảo vệ quyền chỉnh sửa** | Tách biệt hoàn toàn: chỉ khu vực `/admin` yêu cầu đăng nhập Chủ thư viện. |
| `OPD-05` | **Dữ liệu bộ sách hiện có** | Nhập trọn vẹn 11 tập *Lim & Mẹ Vacci* sẵn có vào thư viện (làm sạch Markdown, chuẩn hóa tiêu đề, bỏ trường `relic`, `icon` emoji và `caption`). |
| `OPD-06` | **Chuẩn chất lượng audio** | Phát trực tiếp tệp MP3/M4A chuẩn chủ thư viện tải lên (trần `≤ 60MB`/tệp). |
| `DEC-01` | **Quy chuẩn Giao diện Đọc tinh gọn** | **Bất biến:** Bỏ hoàn toàn *"Kỷ vật trong túi da"* / hộp cuối tập; 1 thanh chọn giọng mảnh; tranh minh họa tải lên hiển thị gọn trong mạch cuộn dọc (**0 chú thích**); thanh `Sticky` cố định luôn có nút về Bộ sách & Trang chủ. |
| `DEC-02` | **Phạm vi bản quyền nội dung** | Chỉ nội dung thuộc sở hữu gia đình / có phép hợp lệ, có xác nhận & ghi nguồn trên CMS. |
| `DEC-03` | **Chống mất dữ liệu 7 ngày iOS** | Lưu cục bộ kèm lời nhắc nhẹ *"Thêm vào Màn hình chính"* (`LIS-009`). |
| `DEC-04` | **Hành vi "Nghe tiếp" & Phát lại** | Tập gần nhất đã xong tự gợi ý tập kế tiếp; bấm phát lại tập đã xong chạy từ `00:00`. |
| `DEC-05` | **Vòng đời trạng thái xuất bản** | Rút gọn còn **2 trạng thái (`Nháp/Đang ẩn` ↔ `Đã xuất bản`) + 1 `Thùng rác` (`Must Have`)**. |
| `DEC-06` | **Định mức giới hạn tệp tải lên** | Audio `≤ 60MB` (`≤ 5` giọng/tập), Ảnh dọc `3:4` `≤ 5MB` (`≤ 20` tranh/tập), Bản chữ `≤ 30.000` từ/tập. |
| `DEC-07` | **Phạm vi sao lưu dữ liệu** | Web xuất JSON cấu trúc + bản chữ + bảng kê URL tệp gốc; lưu trữ file gốc ở máy chủ thư viện. |
| `DEC-08` | **Tùy biến CMS đa bộ sách** | Cấu hình Preset sắc thái màu nước chuẩn WCAG AA và mặc định `Auto-next` theo từng Bộ sách (áp dụng chung chuẩn Giao diện Đọc tinh gọn nhiều chữ cho mọi bộ sách). |
