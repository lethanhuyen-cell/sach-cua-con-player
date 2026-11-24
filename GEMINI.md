# HIẾN PHÁP DỰ ÁN THƯ VIỆN ĐỒI MƠ (`GEMINI.md`)

Tài liệu này là **Hiến pháp bất khả xâm phạm** áp dụng cho toàn bộ quá trình thiết kế sản phẩm, UX/UI, kiến trúc dữ liệu, CMS và lập trình của **Thư viện Đồi Mơ** (*Định danh: Sách đọc và nghe trước giờ ngủ · Copyright © Nancy & Liti*).

> **Ranh giới Phạm vi Dự án (Tuyệt đối tuân thủ):**
> **Thư viện Đồi Mơ** tại thư mục này là **Nền tảng Thư viện giới thiệu, lưu trữ và trình diễn sách nói / sách đọc** dành cho gia đình (quản lý nhiều bộ sách độc lập được đưa lên qua CMS). Dự án Thư viện **tách biệt hoàn toàn với khâu sáng tác** — tuyệt đối **không** kiêm nhiệm việc viết truyện, biên tập nội dung gốc hay tự động sinh/vẽ tranh minh họa (các công việc đó thuộc về những dự án tạo sách độc lập bên ngoài).

---

## Điều 1. Quy chuẩn Giao diện Đọc (*Long-form Story Reader* — Tuyệt đối tuân thủ)

1. **Cấm tuyệt đối chi tiết "Kỷ vật trong túi da" và mọi hộp phụ cuối tập trên giao diện đọc:**
   - Không hiển thị *"Kỷ vật trong túi da"*, *"Ghi chú cuối tập"*, `EndNoteBox`, thẻ tóm tắt bài học hay bất kỳ hộp thông tin phụ nào trên giao diện đọc của **mọi bộ sách hiện tại và tương lai** (đồng thời loại bỏ trường cấu hình này khỏi CMS).
2. **Ưu tiên tối đa cho màn hình nhiều chữ (*Text-First Continuity*):**
   - Giao diện đọc là trang sách văn học liền mạch dành cho văn bản dài.
   - Trên mỗi lần cuộn màn hình dọc, **tuyệt đối không để nhiều không gian vụn** (không chèn nhiều thẻ/khung viền rời rạc, không tạo khoảng trống thừa, không đặt banner thông báo cồng kềnh).
3. **Thu gọn tối đa cụm chọn Giọng đọc & Phát âm thanh:**
   - Trên trang đọc chữ, nút Phát và bộ chọn Giọng đọc phải gom gọn trên **duy nhất 1 thanh ngang mảnh (`≤ 38–40px`)** với menu/nút chọn giọng thu gọn (`▾`), không dàn trải danh sách các nút giọng đọc thành nhiều hàng.
   - Với tập *"Chỉ đọc chữ"*, ẩn hoàn toàn thanh điều khiển âm thanh để nhường trọn không gian cho văn bản (không chèn hộp thông báo chiếm chỗ).
4. **Quy tắc Hiển thị Tranh Minh họa Gọn Trong Mạch Đọc & Không Chú Thích:**
   - Khi một tập truyện được đưa lên thư viện có tranh minh họa chèn xen giữa các đoạn Markdown (hoặc đính kèm qua CMS), tranh đi theo mạch nội dung từ trên xuống, **tự động giới hạn chiều cao gọn trong khung màn hình di động (`max-height` hợp lý, không cắt xén mất chi tiết tranh)** và **tuyệt đối không sinh hộp chú thích (`caption`)**: cuộn hết tranh nối tiếp ngay sang chữ.
   - Khi tập truyện có bộ nhiều tranh minh họa (`≥ 2` tranh), hỗ trợ nút chuyển gọn `[Đọc truyện | Xem tranh]` (hoặc chạm phóng to toàn màn hình) để người nghe có thể xem trọn vẹn tranh minh họa của tập trong khi vẫn nghe Audio.
5. **Luôn có lối thoát nhanh về Thư mục mẹ & Trang chủ (`Sticky Exit Navigation`):**
   - Thanh điều hướng mảnh ở đỉnh Giao diện Đọc (`~42px`) phải luôn cố định (`sticky`) khi cuộn bài dài, hiển thị rõ nút **về Thư mục mẹ / Mục lục Bộ sách (`← Tên bộ sách`)** và nút **về Trang chủ (`Trang chủ`)** để người đọc có thể dừng đọc và thoát ra bất cứ lúc nào chỉ với 1 chạm.

---

## Điều 2. Mô hình Truy cập Đơn giản

1. **Mở thẳng Thư viện cho người nghe:** Người thân bấm vào đường dẫn là vào thẳng **Trang chủ Thư viện (`/`)** — không màn hình cổng riêng tư (`/gate`), không mã mời gia đình, không bắt người nghe tạo tài khoản hay đăng nhập.
2. **Tách biệt quyền Quản trị:** Chỉ khu vực quản trị `/admin` yêu cầu xác thực của Chủ thư viện để thêm, chỉnh sửa, xóa và xuất bản sách. Các trang dùng thẻ `noindex, nofollow, noarchive` để tránh lập chỉ mục công khai không cần thiết.

---

## Điều 3. Thẩm mỹ Sách Nghệ thuật & Chuẩn Tiếng Việt

1. **Tinh thần mỹ thuật (Đã chốt Phương án A — *Ấn Bản Giấy Cotton / Botanical Paper Edition*):**
   - *Minimalist Watercolor Storybook* lấy cảm hứng từ tinh thần màu nước của *Miền Dâu Dại* — ấm áp, tinh tế, điềm đạm như ấn bản sách in; không sao chép trực tiếp tranh tham chiếu.
   - **Hệ màu chính thức (Phương án A):** Ban ngày giấy cotton `#F8F5EE` (bề mặt `#F1ECE1`, thẻ nổi `#FDFBF6`, kẻ chỉ `1px #DED7C8`, chữ `#222923`, nhấn Rêu Rừng Trầm `#354F3E` & Đồng Cổ `#9E7B43`); Ban đêm `#111613` (bề mặt `#19201C`, kẻ chỉ `#2D3831`, chữ `#EFE9DC`, nhấn `#89A892` & `#D4AC6E`). Khung bìa `3:4` phẳng tối giản bo nhẹ `6px–8px`, viền mảnh `1px`, mục lục tập căn cột thẳng hàng.
2. **Không trẻ con hóa giao diện & 3 Không:**
   - **0 emoji hệ điều hành** trên toàn bộ giao diện (chỉ dùng SVG Line Icons đơn sắc nét mảnh `1.25px–1.5px`).
   - Không dán nhãn/badge/sticker đè lên mặt tranh bìa `3:4`.
   - Không thiết kế kiểu dashboard công nghệ, ứng dụng học tập tính điểm hay cửa hàng thương mại.
3. **Bảo toàn hiển thị Tiếng Việt 100% (`134/134` ký tự dấu):**
   - Chỉ sử dụng webfont có subset `vietnamese` đầy đủ (`Lora`, `Playfair Display`, `Be Vietnam Pro`) và chuỗi phông hệ thống dự phòng đủ 134/134 ký tự tiếng Việt (`Georgia`, `"Times New Roman"`, `-apple-system`, `"Helvetica Neue"`).
   - **Cấm dùng** các phông thiếu nguyên âm móc tiếng Việt (`ơ`, `ư`) như `Iowan Old Style`, `Charter`, `Athelas`, `Hoefler Text`, `Palatino`.
   - Tiêu đề tiếng Việt giữ `line-height ≥ 1.45` và dòng cắt `ellipsis` có đệm dọc `1–2px` để không bao giờ mất dấu chồng (`Ấ, Ề, Ổ, Ứ, ệ, ộ, ợ`).
