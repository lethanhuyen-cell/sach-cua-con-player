# PRD — Litibook (Phiên bản 1.0)

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Tên sản phẩm** | Litibook — Thư viện Sách nói Gia đình |
| **Phiên bản tài liệu** | v1.0 (Bản thảo trình duyệt) |
| **Vai trò biên soạn** | Principal Product Manager · UX Architect · Technical Product Lead |
| **Phạm vi tài liệu** | Cấp độ sản phẩm (chưa chốt công nghệ, framework hoặc nhà cung cấp hạ tầng) |
| **Phong cách mỹ thuật** | Minimalist Watercolor Storybook (tinh thần màu nước *Miền Dâu Dại*) |
| **Trạng thái** | Chờ phê duyệt trước khi thiết kế kỹ thuật & phát triển |

---

## 1. Tầm nhìn, Mục tiêu & Phạm vi sản phẩm

### 1.1. Tầm nhìn sản phẩm
**Litibook** là một thư viện sách nói gia đình thiết kế theo tư duy **mobile-first**, dành cho trẻ em và được chia sẻ riêng tư trong vòng tròn người thân, bạn bè. Litibook mang đến trải nghiệm nghe – đọc ấm áp, chậm rãi và an toàn như lật giở một cuốn sách tranh màu nước trước giờ đi ngủ, đồng thời trao cho chủ thư viện khả năng tự xuất bản và quản lý nhiều bộ sách độc lập mà không cần đụng đến mã nguồn.

### 1.2. Mục tiêu phiên bản 1.0
1. **Đa bộ sách, tự chủ xuất bản:** Chủ thư viện tự tạo bộ sách mới, phân chia phần/tập, tải lên audio, ảnh bìa, tranh minh họa, bản chữ và xuất bản trực tiếp qua giao diện quản trị.
2. **Trải nghiệm nghe ru ngủ trọn vẹn trên di động:** Trình phát audio ổn định khi khóa màn hình, nhớ vị trí nghe, có hẹn giờ tắt dịu nhẹ và giao diện ban đêm ấm áp.
3. **Riêng tư mặc định:** Nội dung chỉ dành cho gia đình và những người được mời; không bị lập chỉ mục công khai bởi công cụ tìm kiếm.
4. **Dữ liệu thuộc về chủ thư viện:** Toàn bộ nội dung và tệp đa phương tiện có thể sao lưu và xuất ra định dạng chuẩn, không phụ thuộc vào nền tảng cụ thể.

### 1.3. Ngoài phạm vi (Out of Scope — v1.0)
- **Không thương mại hóa:** Không thanh toán, gói cước, giỏ hàng, mã giảm giá, quảng cáo hay liên kết tiếp thị.
- **Không tính năng mạng xã hội:** Không bình luận công khai, thả tim, bảng xếp hạng, theo dõi người dùng hay chia sẻ công khai lên mạng xã hội.
- **Không cơ chế gây nghiện cho trẻ:** Không thông báo đẩy thúc ép (streak, thông báo nhắc quay lại), không tự động gợi ý video/nội dung ngoài thư viện.

---

## 2. Chân dung người dùng & Tình huống sử dụng thực tế

### 2.1. Chân dung người dùng (Personas)

| Vai trò | Mô tả | Nhu cầu cốt lõi |
| :--- | :--- | :--- |
| **Chủ thư viện (Admin)** | Cha/mẹ hoặc người sáng tạo nội dung gia đình (không chuyên lập trình). | Thêm/sửa bộ sách, tải audio & ảnh bìa, nhập bản chữ, xem trước và xuất bản nhanh trên máy tính hoặc điện thoại mà không cần sửa code. |
| **Người nghe đồng hành (Phụ huynh / Người thân)** | Cha mẹ, ông bà, bạn bè thân thiết được chia sẻ quyền truy cập. | Mở nhanh đúng tập đang nghe dở, đặt hẹn giờ ngủ, đổi giọng đọc (nếu có), đọc bản chữ kèm tranh cùng trẻ. |
| **Người nghe nhỏ tuổi (Trẻ em 3–10 tuổi)** | Con cái trong gia đình hoặc con của người thân. | Nhận diện bộ sách và tập qua tranh minh họa trực quan, thao tác đơn giản, không có nút bấm gây lạc ra ngoài ứng dụng. |

### 2.2. Tình huống sử dụng thực tế (Real-world Scenarios)
1. **Giờ đi ngủ buổi tối (Bedtime):** Phụ huynh mở Litibook trên điện thoại trong phòng tối, bật chế độ ánh sáng đêm ấm, chọn tiếp tập đang nghe, đặt hẹn giờ tắt 15 phút (hoặc "Hết tập này"), rồi khóa màn hình đặt điện thoại lên tủ đầu giường.
2. **Đọc cùng con (Co-reading):** Phụ huynh và trẻ cùng ngồi xem tranh minh họa màu nước, nghe giọng đọc và lướt theo bản chữ với cỡ chữ dễ đọc.
3. **Nghe trên xe / di chuyển:** Thao tác một tay ở vùng ngón cái để phát/tạm dừng hoặc tua lùi 15 giây; khi mạng 4G chập chờn ở đoạn hầm/đường xa, trình phát tự đệm lại êm ái thay vì văng lỗi khó hiểu.
4. **Chia sẻ cho ông bà / bạn thân:** Chủ thư viện gửi đường dẫn kèm mã truy cập riêng tư để người thân mở nghe ngay trên trình duyệt điện thoại mà không cần quy trình đăng ký phức tạp.
5. **Xuất bản tập mới cuối tuần:** Chủ thư viện đăng nhập khu vực quản trị, tạo Tập mới trong một bộ sách có sẵn, tải 1–2 file audio (ví dụ giọng nữ và giọng nam), dán bản thảo văn bản, thêm 3–4 tranh minh họa, bấm "Xem trước" kiểm tra giao diện di động rồi bấm "Xuất bản".

---

## 3. Cấu trúc nội dung & Mô hình thông tin

Litibook tổ chức nội dung theo cấu trúc phân cấp linh hoạt, hỗ trợ đồng thời bộ sách ngắn (chỉ có danh sách tập) và bộ sách dài nhiều mùa/chủ đề (có phân Phần).

```text
Thư viện (Library)
 └── Bộ sách (Book / Series) [1..N]
      ├── Phần / Mùa (Part / Section) [0..N — tùy chọn]
      │    └── Tập (Episode) [1..N]
      └── Tập trực tiếp (khi Bộ sách không chia Phần)
           ├── Bản thu âm / Giọng đọc (Audio Track) [1..N]
           ├── Bản chữ (Transcript / Text Content) [0..1]
           └── Bộ tranh minh họa (Illustration) [0..N]
```

### 3.1. Thực thể & Thuộc tính chính

| Thực thể | Thuộc tính bắt buộc | Thuộc tính tùy chọn / Mở rộng |
| :--- | :--- | :--- |
| **Bộ sách (Book)** | Mã định danh, Tên bộ sách, Trạng thái (`Draft` / `Published` / `Archived`), Thứ tự hiển thị | Mô tả ngắn, Tác giả, Độ tuổi gợi ý, Ảnh bìa chính, Nhãn chủ đề, Tông màu nhấn (phù hợp bảng màu chung), Quyền hiển thị (mặc định theo thư viện hoặc riêng tư theo bộ) |
| **Phần (Part)** | Mã định danh, Tên phần, Thứ tự trong bộ sách | Mô tả ngắn, Ảnh bìa phần |
| **Tập (Episode)** | Mã định danh, Tiêu đề tập, Thứ tự hiển thị, Trạng thái (`Draft` / `Published` / `Hidden` / `Archived`) | Số tập hiển thị (VD: `Tập 01`), Tóm tắt ngắn, Thẻ/nhãn (VD: *Thú kỳ diệu*), Điểm nhấn/Kỷ vật tập, Ảnh bìa riêng (nếu trống sẽ kế thừa bìa Phần hoặc Bộ sách), Thời lượng hiển thị (tự đọc từ audio mặc định) |
| **Bản thu âm (Audio Track)** | Tệp audio, Tên hiển thị giọng đọc (VD: *Giọng Mẹ*, *Giọng Nữ*, *Giọng Nam*), Cờ giọng mặc định | Thời lượng chính xác (giây), Tên người đọc, Ghi chú bản thu |
| **Bản chữ (Text)** | Nội dung văn bản có cấu trúc cơ bản (tiêu đề nhỏ, đoạn văn, trích dẫn, dấu ngắt cảnh) | Số từ (tự tính) |
| **Tranh minh họa (Illustration)** | Tệp hình ảnh, Thứ tự hiển thị | Chú thích ảnh (caption), Mô tả thay thế (alt text) |

---

## 4. Định hướng Mỹ thuật & Trải nghiệm Mobile-first

### 4.1. Ngôn ngữ mỹ thuật: Minimalist Watercolor Storybook
- **Tinh thần chủ đạo:** Lấy cảm hứng từ tranh màu nước *Miền Dâu Dại* — ấm áp, tinh tế, dịu mắt, mang cảm giác thủ công và gần gũi với thiên nhiên.
- **Không gian & Bố cục:** Tối giản chi tiết thừa, khoảng trắng thoáng, các thẻ nội dung bo tròn mềm mại, đường viền mỏng nhẹ thay vì đổ bóng nặng nề. Tranh bìa và minh họa là điểm sáng thị giác; giao diện đóng vai trò khung giấy dịu nhẹ.
- **Bảng màu & Chế độ hiển thị:**
  - *Chế độ Ban ngày (Warm Paper):* Nền giấy kem ấm, chữ nâu than/xanh rêu đậm dễ đọc, sắc nhấn tự nhiên (xanh lá rêu, mật ong, dâu chín dịu).
  - *Chế độ Ban đêm (Warm Night):* Nền tối ấm dịu mắt (tránh đen gắt và ánh sáng xanh gắt) phục vụ nghe truyện trước khi ngủ.
- **Kiểu chữ (Typography):** Tiêu đề mềm mại có nét sách truyện; phần bản chữ thân bài thoáng, khoảng cách dòng rộng để phụ huynh đọc trong ánh sáng yếu không mỏi mắt.

### 4.2. Quy chuẩn Mobile-first UX
- **NFR-001 (Ưu tiên màn hình dọc):** Toàn bộ luồng người nghe được thiết kế chuẩn cho màn hình 360px–430px trước, sau đó mở rộng hài hòa cho máy tính bảng và màn hình lớn.
- **NFR-002 (Vùng chạm & Thao tác một tay):** Mọi nút tương tác chính có kích thước vùng chạm tối thiểu `44×44px`; các nút điều khiển cốt lõi của trình phát (Phát/Tạm dừng, Tua ±15s, Hẹn giờ) nằm trong vùng thuận tiện cho ngón cái.
- **NFR-003 (An toàn cho trẻ):** Không có liên kết điều hướng ra trang web bên ngoài trong khu vực người nghe; khu vực Quản trị không hiển thị lộ liễu để trẻ không bấm nhầm.

---

## 5. Yêu cầu Chức năng chi tiết

Quy ước mức độ ưu tiên:
- **Must Have (P0):** Bắt buộc có ở phiên bản 1.0 để sản phẩm vận hành trọn vẹn.
- **Should Have (P1):** Rất nên có ở v1.0 hoặc ngay đợt hoàn thiện kế tiếp để nâng cao trải nghiệm.
- **Future (P2):** Định hướng mở rộng sau khi v1.0 ổn định.

### 5.1. Giao diện Người nghe (Listener Experience)

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| `LIS-001` | Kệ sách trang chủ | Hiển thị danh sách các **Bộ sách** đã xuất bản dưới dạng thẻ bìa trực quan (ảnh bìa, tên bộ sách, số tập hiện có, tiến độ nghe tổng quát). | **Must Have** |
| `LIS-002` | Khu vực "Nghe tiếp" | Hiển thị ngay đầu trang chủ tập đang nghe dở gần nhất với 1 chạm để phát tiếp tại đúng giây đã dừng. | **Must Have** |
| `LIS-003` | Trang chi tiết Bộ sách | Hiển thị bìa, mô tả, tác giả, danh sách Phần (nếu bộ sách có chia Phần) và danh sách Tập theo đúng thứ tự; đánh dấu rõ tập chưa nghe, đang nghe dở và đã nghe xong. | **Must Have** |
| `LIS-004` | Trang chi tiết Tập | Hiển thị tiêu đề, tóm tắt, ảnh bìa/bộ tranh minh họa có chú thích, nút phát chính, chọn giọng đọc (nếu có nhiều bản thu) và bản chữ đầy đủ để đọc kèm. | **Must Have** |
| `LIS-005` | Trình đọc bản chữ & xem tranh | Cho phép đọc bản chữ rõ ràng, điều chỉnh cỡ chữ (Nhỏ / Vừa / Lớn), lướt xem bộ tranh minh họa theo thứ tự và phóng to tranh toàn màn hình. | **Must Have** |
| `LIS-006` | Chuyển đổi chế độ Sáng / Đêm ấm | Cho phép chuyển nhanh giữa chế độ *Giấy ấm ban ngày* và *Đêm ấm ru ngủ*; ghi nhớ lựa chọn trên thiết bị. | **Must Have** |
| `LIS-007` | Tìm kiếm & Lọc tập | Tìm nhanh theo tên bộ sách, tên tập hoặc lọc theo Phần/thẻ chủ đề trong thư viện. | **Should Have** |
| `LIS-008` | Danh sách Yêu thích / Đánh dấu | Cho phép phụ huynh hoặc trẻ đánh dấu các tập yêu thích để mở lại nhanh vào buổi tối. | **Should Have** |
| `LIS-009` | Cài đặt như ứng dụng (Add to Home Screen) | Hỗ trợ mở toàn màn hình từ màn hình chính điện thoại với biểu tượng và tên Litibook. | **Should Have** |
| `LIS-010` | Nghe ngoại tuyến (Offline Download) | Cho phép tải trước một số tập về thiết bị để nghe khi đi máy bay hoặc nơi không có sóng. | **Future** |
| `LIS-011` | Hồ sơ nhiều bé trong gia đình | Tách riêng lịch sử nghe và danh sách yêu thích nếu gia đình có nhiều trẻ ở độ tuổi khác nhau. | **Future** |

### 5.2. Trình phát Audio (Audio Player)

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| `PLY-001` | Trình phát thu gọn & toàn màn hình | Mini-player nổi cố định ở đáy màn hình khi người dùng duyệt bộ sách/tập khác; chạm để mở rộng thành Full-screen Player có tranh bìa và thanh tiến độ. | **Must Have** |
| `PLY-002` | Điều khiển phát cốt lõi | Phát/Tạm dừng, tua lùi 15 giây, tua tới 15 giây, kéo thanh thời gian (scrubbing) kèm hiển thị thời gian hiện tại / tổng thời lượng. | **Must Have** |
| `PLY-003` | Phát nền & Điều khiển màn hình khóa | Tiếp tục phát liên tục khi khóa màn hình hoặc chuyển ứng dụng; hiển thị tiêu đề tập, tên bộ sách, ảnh bìa và nút Phát/Dừng/Tua trên màn hình khóa thiết bị. | **Must Have** |
| `PLY-004` | Ghi nhớ vị trí nghe (Resume) | Tự động lưu vị trí phát định kỳ và khi tạm dừng/thoát; khi mở lại tập đó sẽ phát tiếp đúng vị trí (hoặc lùi lại 2–3 giây để người nghe bắt nhịp). Đánh dấu "Đã nghe xong" khi còn dưới 15 giây cuối hoặc đạt ≥ 95% thời lượng. | **Must Have** |
| `PLY-005` | Chuyển đổi giọng đọc trong tập | Khi tập có từ 2 bản thu trở lên, cho phép chọn giọng đọc ngay trên trình phát; ghi nhớ giọng ưu tiên của người nghe cho các tập sau nếu có giọng tương ứng. | **Must Have** |
| `PLY-006` | Hẹn giờ tắt ru ngủ (Sleep Timer) | Hỗ trợ các mốc: 10 phút, 15 phút, 30 phút, 45 phút và "Hết tập này"; hiển thị thời gian đếm ngược; giảm dần âm lượng êm ái trong 5–10 giây cuối trước khi dừng. | **Must Have** |
| `PLY-007` | Chuyển tập trước / tập tiếp theo | Nút chuyển nhanh tập kế tiếp/trước đó trong cùng bộ sách và tùy chọn bật/tắt tự động phát tập tiếp theo (Auto-next). | **Must Have** |
| `PLY-008` | Điều chỉnh tốc độ phát | Cho phép chọn tốc độ đọc (`0.85x`, `1.0x`, `1.15x`, `1.25x`) phù hợp thói quen nghe của trẻ. | **Should Have** |
| `PLY-009` | Âm thanh nền ru ngủ nhẹ (Ambient) | Tùy chọn trộn thêm tiếng mưa nhẹ/gió rừng ở mức âm lượng rất nhỏ phía sau giọng đọc. | **Future** |

### 5.3. Giao diện Quản trị (Admin CMS)

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| `ADM-001` | Đăng nhập quản trị tách biệt | Khu vực quản trị có đường dẫn riêng và yêu cầu xác thực riêng của chủ thư viện; tách biệt hoàn toàn với luồng người nghe. | **Must Have** |
| `ADM-002` | Bảng điều khiển thư viện | Hiển thị tổng quan các bộ sách, số tập đã xuất bản/nháp và lối tắt tạo nhanh bộ sách hoặc tập mới. | **Must Have** |
| `ADM-003` | Quản lý Bộ sách (CRUD) | Tạo mới, chỉnh sửa thông tin, tải/thay ảnh bìa, sắp xếp thứ tự hiển thị và lưu trữ/xóa mềm Bộ sách. | **Must Have** |
| `ADM-004` | Quản lý Phần trong Bộ sách | Tạo, đổi tên, sắp xếp thứ tự Phần và gán Tập vào Phần (cho phép Bộ sách không cần tạo Phần nếu không có nhu cầu). | **Must Have** |
| `ADM-005` | Quản lý Tập (CRUD) | Tạo, chỉnh sửa siêu dữ liệu tập, sắp xếp thứ tự tập (kéo-thả hoặc nhập số thứ tự), nhân bản cấu trúc tập nếu cần. | **Must Have** |
| `ADM-006` | Tải lên & Quản lý Audio đa giọng | Tải một hoặc nhiều tệp audio cho mỗi tập, đặt tên nhãn giọng đọc, chọn giọng mặc định, nghe thử ngay trong trang quản trị, thay thế hoặc xóa bản thu. | **Must Have** |
| `ADM-007` | Tải lên Ảnh bìa & Tranh minh họa | Tải ảnh bìa bộ sách/tập và nhiều tranh minh họa cho tập; hỗ trợ sắp xếp thứ tự tranh, nhập chú thích, xem ảnh thu nhỏ và xóa ảnh. | **Must Have** |
| `ADM-008` | Trình soạn thảo Bản chữ | Nhập hoặc dán văn bản (hỗ trợ định dạng cơ bản: tiêu đề, đoạn văn, in nghiêng/đậm, ngắt cảnh), tự đếm số từ và lưu nháp an toàn tránh mất nội dung khi tải lại trang. | **Must Have** |
| `ADM-009` | Xem trước trước khi xuất bản | Cho phép chủ thư viện mở bản xem trước giao diện tập đúng như người nghe sẽ thấy trên màn hình di động trước khi xuất bản chính thức. | **Must Have** |
| `ADM-010` | Thùng rác / Khôi phục xóa nhầm | Khi xóa tập hoặc bộ sách, chuyển vào trạng thái lưu trữ tạm (soft delete) cho phép khôi phục trước khi xóa vĩnh viễn. | **Should Have** |
| `ADM-011` | Tải lên hàng loạt / Nhập nhiều tập | Hỗ trợ tải nhiều tệp audio hoặc nhập dữ liệu nhiều tập cùng lúc để tiết kiệm thời gian khi khởi tạo bộ sách lớn. | **Future** |
| `ADM-012` | Phân quyền đồng quản trị | Cho phép mời thêm thành viên gia đình (ví dụ vợ/chồng) cùng biên tập nội dung. | **Future** |

### 5.4. Quy trình Xuất bản, Quyền riêng tư & Sao lưu

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| `PUB-001` | Quản lý vòng đời trạng thái xuất bản | Hỗ trợ chuyển đổi trạng thái rõ ràng (`Nháp` → `Đã xuất bản` ↔ `Tạm ẩn` → `Lưu trữ`) ở cả cấp Bộ sách và cấp Tập. | **Must Have** |
| `PUB-002` | Kiểm tra hợp lệ trước xuất bản | Tự động kiểm tra điều kiện tối thiểu trước khi cho phép chuyển sang `Đã xuất bản` và báo rõ trường còn thiếu. | **Must Have** |
| `PUB-003` | Cập nhật không gián đoạn | Khi sửa bản chữ, ảnh minh họa hoặc thay file audio của tập đã xuất bản, đường dẫn tập giữ nguyên và không làm hỏng trải nghiệm người nghe đang mở thư viện. | **Must Have** |
| `PRV-001` | Chế độ thư viện riêng tư mặc định | Chặn lập chỉ mục từ công cụ tìm kiếm; yêu cầu thông tin truy cập riêng tư (mã mời hoặc mật khẩu gia đình) mới vào được thư viện. | **Must Have** |
| `PRV-002` | Quản lý truy cập chia sẻ | Chủ thư viện có thể xem, thay đổi mã truy cập hoặc thu hồi liên kết chia sẻ cũ ngay trong trang quản trị khi cần. | **Must Have** |
| `PRV-003` | Bảo vệ liên kết tệp đa phương tiện | Tệp audio và hình ảnh không bị lộ công khai dễ đoán cho người ngoài chưa có quyền truy cập thư viện. | **Should Have** |
| `BKP-001` | Xuất dữ liệu cấu trúc (Metadata Export) | Chủ thư viện có thể tải về toàn bộ siêu dữ liệu thư viện (bộ sách, phần, tập, bản chữ, danh sách đường dẫn tệp) dưới định dạng mở chuẩn (như JSON/Markdown) chỉ với 1 thao tác. | **Must Have** |
| `BKP-002` | Khôi phục & Sao lưu định kỳ | Hệ thống có cơ chế sao lưu định kỳ dữ liệu cấu trúc và hỗ trợ khôi phục khi xảy ra sự cố thao tác. | **Should Have** |

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
      [Ended]              [Paused + Fade-out]
```

**Quy tắc hành vi bắt buộc:**
1. **Gián đoạn hệ thống:** Khi có cuộc gọi đến, thiết bị ngắt tai nghe hoặc ứng dụng khác chiếm quyền âm thanh, trình phát tự chuyển sang `Paused` và lưu ngay vị trí hiện tại.
2. **Đệm mạng (Buffering):** Nếu mất mạng giữa chừng, giữ nguyên vị trí hiện tại, hiển thị trạng thái nhẹ nhàng (*"Đang chờ kết nối..."*), và tự phát tiếp hoặc cho phép bấm thử lại khi có mạng mà không đặt lại về `00:00`.
3. **Chuyển giọng đọc giữa chừng:**
   - Khi người nghe đổi từ Giọng A sang Giọng B trong lúc đang phát, trình phát giữ nguyên trạng thái đang phát/tạm dừng và ánh xạ vị trí theo tỷ lệ phần trăm thời lượng (hoặc giữ nguyên giây nếu thời lượng hai bản thu chênh lệch < 5%).
   - Nếu vị trí vượt quá tổng thời lượng bản thu mới, đưa về an toàn ở đầu đoạn cuối hoặc `00:00` kèm thông báo nhỏ.
4. **Hẹn giờ tắt (Sleep Timer):**
   - Trong 5–10 giây cuối cùng của bộ đếm, âm lượng giảm tuyến tính về 0 trước khi chuyển sang `Paused`, tránh tiếng cắt đột ngột làm trẻ giật mình.
   - Sau khi dừng do hết giờ, mức âm lượng nội bộ được khôi phục về bình thường cho lần bấm Phát tiếp theo.
   - Nếu chọn chế độ *"Hết tập này"*, hệ thống tạm thời vô hiệu hóa Auto-next để dừng hẳn khi tập kết thúc.
5. **Thao tác kéo thanh thời gian (Scrubbing):** Khi người dùng đang giữ và kéo thanh tiến độ, hiển thị thời gian xem trước theo ngón tay và chỉ phát lại từ vị trí mới sau khi thả tay.

### 6.2. Quy trình & Trạng thái Xuất bản Nội dung

```text
[Draft (Nháp)] ──(Đạt điều kiện hợp lệ)──> [Published (Đã xuất bản)]
      ▲                                          │          ▲
      │                                     (Tạm ẩn)   (Xuất bản lại)
      │                                          ▼          │
      └────────────────────────────────── [Hidden (Tạm ẩn)]
                                                 │
                                             (Lưu trữ)
                                                 ▼
                                         [Archived (Lưu trữ)]
```

**Quy tắc vận hành:**
1. **Điều kiện tối thiểu để xuất bản Tập (`Draft` → `Published`):**
   - Có **Tiêu đề tập** không rỗng.
   - Thuộc một **Bộ sách** hợp lệ.
   - Có **ít nhất 1 tệp audio hợp lệ** đã tải lên hoàn tất (trừ trường hợp tập được đánh dấu chủ đích là *"Chỉ đọc chữ"* — xem Mục 9).
   - Nếu chưa có ảnh bìa riêng, hệ thống tự động kế thừa ảnh bìa của Phần hoặc Bộ sách (không chặn xuất bản).
2. **Điều kiện hiển thị với Người nghe:**
   - Một Tập chỉ hiển thị cho Người nghe khi **cả Bộ sách chứa nó và chính Tập đó** đều ở trạng thái `Published`.
   - Nếu Bộ sách bị chuyển sang `Hidden` hoặc `Draft`, toàn bộ tập bên trong tự động ẩn khỏi giao diện Người nghe nhưng giữ nguyên trạng thái riêng của từng tập để không phải bật lại thủ công.
3. **Trạng thái tải tệp (Upload Resilience):**
   - Luồng tải tệp hiển thị thanh tiến trình phần trăm rõ ràng (`Đang tải` → `Đang kiểm tra` → `Sẵn sàng`).
   - Nếu tải tệp thất bại do rớt mạng hoặc sai định dạng, hiển thị lý do cụ thể và nút **"Thử lại"** mà **không làm mất dữ liệu chữ/biểu mẫu** chủ thư viện đã nhập.
4. **Cảnh báo rời trang:** Khi chủ thư viện có thay đổi chưa lưu trong biểu mẫu soạn thảo mà bấm rời trang, hệ thống hỏi xác nhận trước khi thoát.

---

## 7. Yêu cầu Phi chức năng (Non-Functional Requirements)

| Nhóm | Mã | Yêu cầu cụ thể |
| :--- | :--- | :--- |
| **Hiệu năng** | `NFR-004` | Danh sách Bộ sách và danh sách Tập tải xong và tương tác được trong ≤ 2,5 giây trên kết nối di động 4G tiêu chuẩn. |
| **Hiệu năng** | `NFR-005` | Tệp audio hỗ trợ truyền phát từng phần (streaming / seekable) để bắt đầu phát trong ≤ 2 giây sau khi bấm Phát mà không cần tải toàn bộ tệp (kể cả tệp dài 20–40 phút). |
| **Hiệu năng** | `NFR-006` | Ảnh bìa và tranh minh họa được tự động tối ưu kích thước hiển thị cho di động và tải lười (lazy-load) khi cuộn trang. |
| **Quyền riêng tư** | `NFR-007` | Toàn bộ trang người nghe và quản trị gắn chỉ thị chặn lập chỉ mục tìm kiếm; không sử dụng cookie quảng cáo hoặc công cụ theo dõi hành vi bên thứ ba. |
| **Quyền riêng tư** | `NFR-008` | Không thu thập thông tin định danh cá nhân của trẻ em (tên thật, ngày sinh, ảnh cá nhân, vị trí địa lý). |
| **Khả năng truy cập** | `NFR-009` | Độ tương phản màu chữ/nền đạt tối thiểu chuẩn WCAG 2.1 mức AA ở cả chế độ Ban ngày và Ban đêm ấm. |
| **Khả năng truy cập** | `NFR-010` | Tất cả nút điều khiển trình phát đều có nhãn mô tả dễ hiểu (screen-reader friendly) và tranh minh họa hỗ trợ văn bản thay thế (alt text). |
| **Độ tin cậy** | `NFR-011` | Hỗ trợ các định dạng audio phổ biến trên di động (tối thiểu MP3, M4A/AAC) và hình ảnh (JPG, PNG, WebP); từ chối sớm tệp sai định dạng hoặc vượt giới hạn dung lượng với thông báo dễ hiểu. |
| **Sao lưu** | `NFR-012` | Chủ thư viện có thể xuất toàn bộ cấu trúc nội dung & bản chữ bất kỳ lúc nào; tệp gốc (audio, ảnh) được lưu giữ có tổ chức rõ ràng theo Bộ sách/Tập để dễ dàng di chuyển nền tảng về sau. |

---

## 8. Tiêu chí Nghiệm thu có thể kiểm thử (Acceptance Criteria)

### AC-01: Khám phá đa bộ sách & Tiếp tục nghe (`LIS-001`, `LIS-002`, `LIS-003`)
- **Given** thư viện có 2 bộ sách đã xuất bản (Bộ A có 2 Phần, Bộ B không chia Phần) và 1 bộ sách đang ở trạng thái Nháp.
- **When** người nghe mở trang chủ trên điện thoại.
- **Then** chỉ thấy Bộ A và Bộ B; không thấy bộ sách Nháp; mở Bộ A thấy đúng cấu trúc Phần → Tập, mở Bộ B thấy thẳng danh sách Tập.
- **And** nếu trước đó người nghe đã nghe Tập 1 đến phút `05:30`, khu vực *"Nghe tiếp"* hiển thị Tập 1 và chạm 1 lần sẽ phát tiếp từ khoảng `05:27–05:30`.

### AC-02: Trình phát Audio, Màn hình khóa & Hẹn giờ tắt (`PLY-001` – `PLY-006`)
- **Given** người nghe đang phát một tập dài 15 phút có 2 giọng đọc (Giọng Nữ, Giọng Nam).
- **When** người nghe thu gọn trình phát và chuyển sang xem bộ sách khác.
- **Then** âm thanh không bị ngắt và Mini-player luôn hiển thị ở đáy màn hình.
- **When** người nghe khóa màn hình điện thoại.
- **Then** âm thanh tiếp tục phát, màn hình khóa hiển thị đúng tên tập, bìa và nút Tạm dừng/Phát hoạt động.
- **When** người nghe đặt hẹn giờ tắt 10 phút và đến cuối phút thứ 10.
- **Then** âm lượng giảm dần êm ái trong 5–10 giây cuối rồi tự chuyển sang `Paused`, không phát tiếp tập sau.

### AC-03: Đổi giọng đọc giữ nhịp nghe (`PLY-005`)
- **Given** người nghe đang nghe Giọng Nữ tại mốc `04:00` của tập dài 10 phút.
- **When** người nghe chuyển sang Giọng Nam ngay trên trình phát.
- **Then** trình phát tải bản thu Giọng Nam và tiếp tục phát từ vị trí tương ứng (~40% thời lượng), không tự nhảy về `00:00`.

### AC-04: Đọc bản chữ & Xem tranh minh họa (`LIS-004`, `LIS-005`, `LIS-006`)
- **Given** một tập có bản chữ 2.000 từ và 4 tranh minh họa.
- **When** người nghe mở tập, đổi cỡ chữ sang Lớn và bật chế độ Đêm ấm.
- **Then** toàn bộ chữ rõ ràng không tràn ngang màn hình 360px, độ tương phản đạt chuẩn, và có thể bấm phóng to từng tranh minh họa cùng chú thích.

### AC-05: Tự xuất bản tập mới không cần sửa code (`ADM-003` – `ADM-009`, `PUB-001`, `PUB-002`)
- **Given** chủ thư viện đã đăng nhập khu vực quản trị.
- **When** chủ thư viện tạo Tập mới, nhập tiêu đề, dán bản chữ, tải 1 file audio MP3 và 2 ảnh minh họa, sau đó bấm **"Xem trước"**.
- **Then** giao diện xem trước hiển thị đầy đủ audio, tranh và chữ đúng như màn hình người nghe, trong khi người nghe bên ngoài vẫn chưa thấy tập này.
- **When** chủ thư viện bấm **"Xuất bản"**.
- **Then** trong vòng ≤ 5 giây (sau khi làm mới), tập mới xuất hiện ở đúng thứ tự trong Bộ sách tương ứng bên giao diện Người nghe và phát được audio ngay.
- **When** chủ thư viện thử bấm Xuất bản một tập chưa có tiêu đề hoặc chưa có audio (và không bật chế độ chỉ đọc chữ).
- **Then** hệ thống chặn xuất bản và chỉ rõ chính xác mục còn thiếu.

### AC-06: Xử lý lỗi tải tệp an toàn (`ADM-006`, `ADM-007`)
- **Given** chủ thư viện đã nhập xong tiêu đề và 1.500 từ bản chữ trong biểu mẫu tạo tập.
- **When** chủ thư viện tải lên một tệp sai định dạng hoặc bị mất mạng giữa chừng khi đang tải audio.
- **Then** hệ thống báo lỗi rõ ràng tại ô tải audio, cho phép chọn lại hoặc thử lại mà toàn bộ tiêu đề và bản chữ đã nhập vẫn được giữ nguyên.

### AC-07: Quyền riêng tư & Thu hồi quyền truy cập (`PRV-001`, `PRV-002`)
- **Given** thư viện đang bật chế độ riêng tư với Mã truy cập X.
- **When** người chưa nhập mã mở đường dẫn thư viện.
- **Then** không thể xem danh sách sách hay phát audio cho tới khi nhập đúng Mã truy cập X.
- **When** chủ thư viện đổi sang Mã truy cập Y (hoặc thu hồi liên kết cũ).
- **Then** người mới dùng Mã X không thể truy cập được nữa.

### AC-08: Xuất bản sao lưu dữ liệu (`BKP-001`)
- **Given** thư viện có ít nhất 1 bộ sách gồm nhiều tập có bản chữ và siêu dữ liệu.
- **When** chủ thư viện bấm **"Xuất dữ liệu thư viện"** trong trang quản trị.
- **Then** trình duyệt tải về tệp sao lưu định dạng mở chứa đầy đủ cấu trúc bộ sách, phần, tập, bản chữ và tham chiếu tới các tệp đa phương tiện.

---

## 9. Rủi ro, Giả định & Quyết định sản phẩm còn mở

### 9.1. Rủi ro chính & Hướng giảm thiểu (ở cấp sản phẩm)
1. **Rủi ro phát nền trên iOS / trình duyệt di động:** Trình duyệt di động có thể tạm dừng audio hoặc hạn chế điều khiển màn hình khóa nếu không tuân thủ chuẩn media session của thiết bị.
   - *Giảm thiểu:* Bắt buộc kiểm thử thực tế trên cả iOS (Safari) và Android (Chrome) ngay từ giai đoạn nguyên mẫu trình phát.
2. **Rủi ro dung lượng tệp audio lớn (ví dụ bản thu 48kHz ~10–20MB/tập):** Gây chậm khi tải lên từ di động hoặc tốn băng thông 4G của người thân.
   - *Giảm thiểu:* Quy định rõ giới hạn dung lượng/định dạng khuyến nghị khi tải lên và yêu cầu cơ chế truyền phát từng phần (streaming); cân nhắc chuẩn hóa bitrate phù hợp cho phát di động mà vẫn giữ độ ấm của giọng đọc.
3. **Rủi ro lộ mã truy cập khi chia sẻ cho nhiều người thân:** Một mã dùng chung có thể bị chuyển tiếp ngoài dự kiến.
   - *Giảm thiểu:* Cho phép chủ thư viện đổi mã truy cập nhanh chỉ bằng 1 thao tác; cân nhắc cơ chế nhiều mã mời riêng ở giai đoạn sau.
4. **Rủi ro chủ thư viện nhập liệu dài trên điện thoại:** Thao tác tải nhiều tệp và dán bản chữ dài trên màn hình nhỏ dễ gây mệt mỏi hoặc mất nháp.
   - *Giảm thiểu:* Tự động lưu nháp cục bộ trong lúc nhập, tối ưu giao diện quản trị dùng mượt trên cả máy tính (ưu tiên soạn thảo) lẫn điện thoại (duyệt nhanh, sửa nhỏ, xuất bản).

### 9.2. Giả định (Assumptions)
- Quy mô người dùng ở v1.0 là nhóm nhỏ gia đình và bạn bè thân thiết (ước tính dưới 100 người nghe đồng thời), không cần bài toán phân tải quy mô đại chúng ở giai đoạn đầu.
- Chủ thư viện sở hữu hợp pháp hoặc có quyền sử dụng riêng tư đối với toàn bộ bản chữ, giọng đọc và tranh minh họa tải lên.
- Người nghe chủ yếu sử dụng điện thoại thông minh hiện đại (iOS / Android) có kết nối Wi-Fi hoặc 4G.

### 9.3. Quyết định sản phẩm còn mở (Open Product Decisions)
Cần chủ dự án chốt 6 điểm sau trước khi chuyển sang giai đoạn Thiết kế chi tiết & Kiến trúc:

| Mã | Câu hỏi sản phẩm | Các phương án lựa chọn | Đề xuất mặc định |
| :--- | :--- | :--- | :--- |
| `OPD-01` | **Cơ chế chia sẻ riêng tư v1.0:** Dùng 1 mã truy cập chung cho cả gia đình, hay tạo từng liên kết/mã riêng cho từng nhóm (ông bà, bạn bè), hay tài khoản cá nhân? | (A) 1 mã chung đổi được · (B) Nhiều mã mời có thể thu hồi lẻ · (C) Tài khoản email/mật khẩu | **(B) Nhiều mã mời có thể thu hồi lẻ** (nhẹ như A, an toàn hơn khi cần thu hồi). |
| `OPD-02` | **Lưu tiến độ nghe (Resume):** Lưu cục bộ theo từng thiết bị hay đồng bộ giữa nhiều thiết bị của cùng một người nghe? | (A) Lưu trên thiết bị (không cần tạo tài khoản người nghe) · (B) Đồng bộ đa thiết bị (cần đăng nhập cá nhân) | **(A) Lưu trên thiết bị** ở v1.0 để người thân/ông bà mở là nghe ngay. |
| `OPD-03` | **Tập chỉ có bản chữ (chưa có audio):** Có cho phép xuất bản tập khi chưa có file audio không? | (A) Bắt buộc có ít nhất 1 file audio · (B) Cho phép xuất bản dạng *"Chỉ đọc chữ"* kèm nhãn phân biệt | **(B) Cho phép có nhãn phân biệt** để linh hoạt khi bản thảo xong trước bản thu âm. |
| `OPD-04` | **Quyền riêng tư theo từng Bộ sách:** Mọi người có mã thư viện đều thấy tất cả Bộ sách đã xuất bản, hay cần giới hạn một số Bộ sách chỉ cho nhóm người thân cụ thể? | (A) Toàn bộ thư viện dùng chung 1 quyền · (B) Phân quyền theo từng Bộ sách | **(A) Dùng chung 1 quyền ở v1.0** để đơn giản hóa quản trị; mở rộng (B) khi có nhu cầu thực tế. |
| `OPD-05` | **Chuyển đổi dữ liệu hiện có:** Có cần nhập tự động dữ liệu bộ sách *Lim & Mẹ Vacci* hiện đang lưu trong kho dự án vào Litibook v1.0 không? | (A) Có, nhập trọn vẹn làm bộ sách mẫu đầu tiên · (B) Tạo lại thủ công qua Admin | **(A) Nhập trọn vẹn** để kiểm chứng thực tế cấu trúc đa giọng và tranh minh họa. |
| `OPD-06` | **Chuẩn chất lượng audio khi xuất bản:** Giữ nguyên bản tệp gốc 48kHz chủ thư viện tải lên hay tự động tạo thêm bản nén tối ưu cho mạng di động? | (A) Phát đúng tệp chủ thư viện tải lên (kèm khuyến nghị định dạng) · (B) Tự động tối ưu hóa khi tải lên | **(A) ở v1.0** nếu chủ thư viện đã xuất MP3 chuẩn; đánh giá **(B)** ở giai đoạn thiết kế kỹ thuật. |
