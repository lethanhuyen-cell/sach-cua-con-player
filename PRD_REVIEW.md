# BÁO CÁO THẨM ĐỊNH ĐỘC LẬP PRD — LITIBOOK

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Tài liệu được thẩm định** | [PRD.md](./PRD.md) — Phiên bản v1.1 (dòng 1–322) |
| **Vai trò thực hiện** | Hội đồng Thẩm định Sản phẩm Độc lập *(Product Director · Principal UX Researcher · Security & Privacy Lead · QA Architect · Legal/IP Reviewer)* |
| **Ngày thẩm định** | 24/11/2026 |
| **Kết luận thẩm định** | **Đã phê duyệt toàn bộ DEC-01 → DEC-08 (Phương án A) & Đã nghiệm thu cập nhật sang [PRD.md](./PRD.md) v1.2** |

---

## Kết luận Tổng quát của Hội đồng

Dù `PRD.md` v1.1 đã định hình được tinh thần sản phẩm rõ ràng (thư viện sách nói gia đình mobile-first, tách biệt người nghe và quản trị, trải nghiệm ru ngủ dịu nhẹ), Hội đồng đánh giá tài liệu **chưa sẵn sàng để đóng băng phạm vi phát triển**. Nếu triển khai trực tiếp theo bản hiện tại, đội ngũ kỹ thuật sẽ đối mặt với **22 vấn đề cần xử lý**, gồm **6 lỗi mức Critical**, **11 lỗi mức Major** và **5 lỗi mức Minor**:

1. **Mâu thuẫn nội tại chưa được dọn dẹp sau khi cập nhật v1.1:** Cơ chế nhiều mã mời thu hồi lẻ (`OPD-01`) mâu thuẫn với giả định "1 mã dùng chung" ở Mục 9.1.3 và tiêu chí nghiệm thu `AC-07` (vốn bỏ ngỏ các thiết bị đã đăng nhập trước khi mã bị thu hồi); trạng thái Bộ sách không nhất quán giữa Mục 3.1 và `PUB-001`.
2. **Lỗ hổng bảo mật & quyền riêng tư nghiêm trọng:** Việc xếp bảo vệ liên kết tệp đa phương tiện (`PRV-003`) ở mức *Should Have* khiến đường dẫn tệp audio/ảnh có nguy cơ truy cập công khai; thiếu cơ chế chống dò mã truy cập (brute-force) và khôi phục quyền Admin.
3. **Rủi ro pháp lý & bản quyền khi mở rộng CMS đa bộ sách:** Chưa có rào chắn xác nhận quyền sử dụng khi chia sẻ cho bạn bè ngoài hộ gia đình, thiếu trường ghi nhận nguồn gốc bản chữ/tranh/giọng đọc, và cấu trúc tập vẫn mang dấu ấn cứng của một bộ sách duy nhất (*Lim & Mẹ Vacci*).
4. **Tiêu chí nghiệm thu bất khả thi trên iOS & thiếu định lượng:** `AC-02` yêu cầu giảm dần âm lượng (fade-out) khi khóa màn hình — điều bị hệ điều hành iOS khóa cứng ở cấp trình duyệt; nhiều cam kết hiệu năng thiếu môi trường chuẩn và thiếu hẳn AC cho 7 nhóm yêu cầu quan trọng.

---

## Bảng Tổng hợp 22 Phát hiện theo Mức độ Nghiêm trọng

| Mã | Mức độ | Hạng mục | Tham chiếu `PRD.md` | Tóm tắt vấn đề cốt lõi |
| :--- | :--- | :--- | :--- | :--- |
| `CRIT-01` | **Critical** | (1) Mâu thuẫn | `OPD-01` (dòng 317), Mục 9.1.3 (dòng 302–303), `AC-07` (dòng 282–286) | Mâu thuẫn 3 chiều về cơ chế mã mời; thu hồi mã không vô hiệu hóa thiết bị đã đăng nhập trước đó. |
| `CRIT-02` | **Critical** | (1) Mâu thuẫn | Mục 3.1 (dòng 70), `PUB-001` (dòng 155), Mục 6.2.2 (dòng 216) | Bảng thực thể thiếu trạng thái `Hidden` cho Bộ sách trong khi quy trình xuất bản yêu cầu có. |
| `CRIT-03` | **Critical** | (4) Bảo mật | `PRV-001`–`PRV-003` (dòng 158–160) | Hạ `PRV-003` (bảo vệ link audio/ảnh) xuống *Should Have* làm thủng mô hình thư viện riêng tư. |
| `CRIT-04` | **Critical** | (2) Thiếu sót | `ADM-001` (dòng 138), `PRV-001` (dòng 158) | Thiếu chống dò mã (rate-limit/brute-force), độ khó tối thiểu mã mời và luồng khôi phục mật khẩu Admin. |
| `CRIT-05` | **Critical** | (4) Bản quyền | Mục 1.1 (dòng 17), Mục 9.2 (dòng 309) | Rủi ro bản quyền khi chia sẻ ngoài hộ gia đình cho "bạn bè", thiếu xác nhận quyền sử dụng và ghi nguồn tác giả/họa sĩ/giọng đọc. |
| `CRIT-06` | **Critical** | (5) Nghiệm thu | `AC-02` (dòng 254–255), `PLY-006` (dòng 128, 189) | Yêu cầu fade-out âm lượng khi khóa màn hình trái giới hạn iOS Safari và dùng từ *"êm ái"* không đo được. |
| `MAJ-01` | **Major** | (1) Mâu thuẫn | Mục 3 (dòng 61), `LIS-004` (dòng 110), `OPD-03` (dòng 319) | Quan hệ `Audio Track [1..N]` xung đột với tập *"Chỉ đọc chữ"* (`0` audio); thiếu hành vi UI và Auto-next cho tập không có audio. |
| `MAJ-02` | **Major** | (1) Mâu thuẫn | Mục 1.2.4 (dòng 23), `BKP-001` (dòng 161), `AC-08` (dòng 291) | Mục tiêu hứa sao lưu *"tệp đa phương tiện"* nhưng yêu cầu v1.0 chỉ xuất metadata + danh sách đường dẫn. |
| `MAJ-03` | **Major** | (3) Over-eng. | `PUB-001` (dòng 155), Mục 6.2 (dòng 197–206), `ADM-003` (dòng 140), `ADM-010` (dòng 147) | Chồng chéo 4 trạng thái ẩn nội dung (`Draft/Hidden/Archived/Trash`); lệch ưu tiên xóa mềm và khôi phục; `Archived` bị ngõ cụt. |
| `MAJ-04` | **Major** | (2) Thiếu sót | `LIS-001`–`002` (dòng 107–108), `PLY-004` (dòng 126), `PLY-007` (dòng 129) | Gãy hành trình "Nghe tiếp" khi tập cũ đã xong 100%, phát lại tập đã xong bị cụt cuối, thiếu quy tắc chuyển tập xuyên Phần và công thức tiến độ Bộ sách. |
| `MAJ-05` | **Major** | (2) Thiếu sót | `ADM-006` (dòng 143), `PLY-005` (dòng 127) | Thiếu danh mục Hồ sơ Giọng đọc chuẩn hóa khiến việc tự động nhớ giọng ưu tiên giữa các tập bị sai lệch khi nhập tay. |
| `MAJ-06` | **Major** | (2) Thiếu sót | `PUB-003` (dòng 157) | Thiếu xử lý xung đột khi Admin thay audio ngắn hơn mốc resume cũ, ẩn tập đang phát dở hoặc cache PWA cũ. |
| `MAJ-07` | **Major** | (2) Thiếu sót | `NFR-011` (dòng 235), `LIS-001`–`007` (dòng 107–113) | Thiếu ngưỡng dung lượng/số lượng tệp cụ thể và thiếu quy chuẩn trạng thái rỗng (Empty States) cho thư viện/bộ sách/tìm kiếm. |
| `MAJ-08` | **Major** | (3) Over-eng. & (4) CMS đa dự án | Mục 3.1 (dòng 70–75), `ADM-007` (dòng 144) | Over-eng: Crop UI trên di động & tông màu nhấn tự do dễ hỏng WCAG AA. CMS đa dự án: Đóng cứng trường *"Kỷ vật tập"* của *Lim & Mẹ Vacci* lên mọi bộ sách. |
| `MAJ-09` | **Major** | (4) Dữ liệu & Riêng tư | Mục 2.2.4 (dòng 46), `NFR-007` (dòng 231), `OPD-02` (dòng 318), `ADM-006`–`007` | Rò rỉ meta qua Link Preview ứng dụng chat; iOS Safari xóa `localStorage` sau 7 ngày; chưa xử lý tệp mồ côi khi thay thế media. |
| `MAJ-10` | **Major** | (5) Nghiệm thu | `NFR-004`–`005` (dòng 228–229), `AC-05` (dòng 272) | Thiếu thông số mạng/dữ liệu mẫu cho cam kết 2–2,5s; tiêu chí *"≤ 5 giây (sau khi làm mới)"* ở `AC-05` không đo được. |
| `MAJ-11` | **Major** | (5) Nghiệm thu | Mục 8 (dòng 240–292) | Thiếu hoàn toàn tiêu chí nghiệm thu cho 7 nhóm yêu cầu (`PLY-007`, `PLY-010`, `ADM-004`, `PUB-003`, `OPD-03`, `NFR-002`, `NFR-007`). |
| `MIN-01` | **Minor** | (1) Mâu thuẫn | Mục 3.1 (dòng 70), `OPD-04` (dòng 320) | Bảng thực thể v1.0 vẫn giữ trường *"Quyền hiển thị riêng tư theo bộ"* dù `OPD-04` đã loại bỏ khỏi v1.0. |
| `MIN-02` | **Minor** | (1) Mâu thuẫn | Dòng 1, 6, 19, 25, 295, 312 | Lẫn lộn số hiệu tài liệu `v1.1` và phạm vi `v1.0`; tiêu đề Mục 9 ghi *"còn mở"* nhưng Mục 9.3 ghi *"đã chốt"*. |
| `MIN-03` | **Minor** | (3) Over-eng. | Mục 6.1.3 (dòng 186–187) | Công thức chẻ nhánh `< 5%` vs `≥ 5%` khi đổi giọng đọc tạo điểm gãy không cần thiết. |
| `MIN-04` | **Minor** | (3) Over-eng. | `BKP-002` (dòng 162) | Yêu cầu sao lưu & khôi phục định kỳ chưa tách rõ vận hành tầng DB, dễ bị hiểu nhầm thành UI snapshot phức tạp. |
| `MIN-05` | **Minor** | (5) Nghiệm thu | `AC-03` (dòng 258–260) | Thiếu thời lượng bản thu đích và biên độ sai số giây cho phép khi kiểm thử đổi giọng đọc. |

---

## (1) Các Yêu cầu Mâu thuẫn Nội tại

### `[CRITICAL] CRIT-01` — Mâu thuẫn 3 chiều về cơ chế Mã truy cập & hiệu lực thu hồi
- **Tham chiếu:** `OPD-01` (dòng 317) · Mục 9.1.3 (dòng 302–303) · `PRV-002` (dòng 159) · `AC-07` (dòng 282–286).
- **Vấn đề:**
  1. `OPD-01` đã chốt phương án *"Nhiều mã mời có thể thu hồi lẻ"* cho v1.0, nhưng Mục 9.1.3 vẫn mô tả *"Một mã dùng chung... cân nhắc cơ chế nhiều mã mời riêng ở giai đoạn sau"*.
  2. Nghiêm trọng hơn, `AC-07` (dòng 286) chỉ kiểm tra *"người **mới** dùng Mã X không thể truy cập được nữa"*. Nếu một thiết bị đã nhập Mã X trước khi bị thu hồi và đang giữ phiên đăng nhập (cookie/session), PRD không hề yêu cầu thu hồi phiên đang hoạt động — khiến nút "Thu hồi mã" mất tác dụng với người đã từng vào thư viện.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  1. Cập nhật Mục 9.1.3 bỏ giả định "1 mã dùng chung" và phản ánh rủi ro chuyển tiếp mã mời cụ thể trong mô hình đa mã mời.
  2. Mở rộng `PRV-002` quy định mỗi mã mời có nhãn người nhận (VD: *Ông bà*, *Nhà chị Lan*), trạng thái hoạt động, và thao tác **Thu hồi mã** phải vô hiệu hóa cả các phiên đã đăng nhập bằng mã đó.
  3. Viết lại `AC-07` kiểm chứng 2 nhánh: (a) thiết bị đã đăng nhập bằng Mã `X1` trước đó bị chặn truy cập ngay ở lần mở trang hoặc phát tập kế tiếp sau khi `X1` bị thu hồi; (b) thiết bị dùng Mã `X2` khác vẫn nghe bình thường.

### `[CRITICAL] CRIT-02` — Mâu thuẫn tập trạng thái của thực thể Bộ sách (`Book`)
- **Tham chiếu:** Mục 3.1 (dòng 70) · `PUB-001` (dòng 155) · Mục 6.2.2 (dòng 216).
- **Vấn đề:** Bảng thực thể Mục 3.1 quy định Bộ sách chỉ có 3 trạng thái (`Draft` / `Published` / `Archived`), thiếu `Hidden`. Ngược lại, `PUB-001` yêu cầu vòng đời 4 trạng thái (`Nháp` → `Đã xuất bản` ↔ `Tạm ẩn` → `Lưu trữ`) ở **cả cấp Bộ sách và cấp Tập**, và Mục 6.2.2 mô tả trực tiếp hành vi *"Nếu Bộ sách bị chuyển sang `Hidden`..."*.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Đồng bộ danh sách trạng thái ở Mục 3.1 dòng 70 với `PUB-001` và Mục 6.2 (khuyến nghị rút gọn chung về 2 trạng thái xuất bản + Thùng rác theo đề xuất tại `MAJ-03`).

### `[MAJOR] MAJ-01` — Mâu thuẫn giữa sơ đồ bắt buộc có Audio (`[1..N]`) và Tập *"Chỉ đọc chữ"*
- **Tham chiếu:** Mục 3 (dòng 61) · Mục 3.1 (dòng 72) · `LIS-004` (dòng 110) · Mục 6.2.1 (dòng 212) · `OPD-03` (dòng 319).
- **Vấn đề:** Sơ đồ cấu trúc nội dung (dòng 61) ghi cứng `Audio Track [1..N]` và `LIS-004` mặc định tập nào cũng có nút phát và chọn giọng đọc, nhưng `OPD-03` và dòng 212 lại cho phép xuất bản tập không có audio (`0` track) ở chế độ *"Chỉ đọc chữ"*. PRD chưa xác định:
  - Giao diện `LIS-004` xử lý cụm nút phát/giọng đọc thế nào khi không có audio;
  - Cột thời lượng ở `LIS-003` (dòng 72, vốn lấy từ audio mặc định) hiển thị gì;
  - `PLY-007` (Auto-next khi đang nghe ru ngủ tắt màn hình) gặp tập *"Chỉ đọc chữ"* thì bỏ qua hay dừng lại.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  1. Sửa dòng 61 thành `Audio Track [0..N]` và ghi chú điều kiện hợp lệ ở Mục 6.2.1.
  2. Bổ sung vào `LIS-004` & `LIS-003`: tập *"Chỉ đọc chữ"* ẩn cụm điều khiển phát audio, hiển thị nhãn *"Chỉ đọc chữ"* kèm thời gian đọc ước tính (VD: `~8 phút đọc` từ số từ).
  3. Bổ sung vào `PLY-007`: trong luồng phát liên tục (Auto-next / chuyển tập), trình phát tự động bỏ qua các tập *"Chỉ đọc chữ"* để không làm gián đoạn giấc ngủ.

### `[MAJOR] MAJ-02` — Mâu thuẫn giữa cam kết sao lưu toàn bộ tệp đa phương tiện và thực tế `BKP-001`
- **Tham chiếu:** Mục 1.2.4 (dòng 23) · `BKP-001` (dòng 161) · `AC-08` (dòng 291).
- **Vấn đề:** Mục 1.2.4 đặt mục tiêu *"Toàn bộ nội dung và tệp đa phương tiện có thể sao lưu và xuất ra định dạng chuẩn"*, nhưng `BKP-001` và `AC-08` chỉ yêu cầu xuất file cấu trúc + bản chữ kèm *"danh sách đường dẫn/tham chiếu tới các tệp đa phương tiện"*. Một file JSON chứa link URL không bảo vệ được tệp audio/ảnh gốc nếu dịch vụ lưu trữ đám mây gặp sự cố.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Lựa chọn một trong hai hướng tường minh (theo `DEC-07`): (a) chỉnh lại Mục 1.2.4 cho khớp thực tế v1.0 là *"xuất toàn bộ dữ liệu cấu trúc, bản chữ và bảng kê đường dẫn tải lại tệp đa phương tiện, kèm hướng dẫn sao lưu bản gốc tại máy chủ thư viện"*; hoặc (b) bổ sung yêu cầu xuất gói nén tài nguyên theo từng Bộ sách.

### `[MINOR] MIN-01` — Dư thừa thuộc tính phân quyền cấp Bộ sách ở v1.0
- **Tham chiếu:** Mục 3.1 (dòng 70) · `OPD-04` (dòng 320).
- **Vấn đề:** Thuộc tính tùy chọn *"Quyền hiển thị (mặc định theo thư viện hoặc riêng tư theo bộ)"* vẫn tồn tại ở dòng 70 dù `OPD-04` đã chốt toàn bộ thư viện dùng chung 1 quyền truy cập ở v1.0.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Gỡ thuộc tính phân quyền theo Bộ sách khỏi bảng Mục 3.1 của v1.0 và ghi chú chuyển sang phạm vi *Future*.

### `[MINOR] MIN-02` — Không nhất quán số hiệu phiên bản và trạng thái phê duyệt ngay trong tài liệu
- **Tham chiếu:** Dòng 1, 6, 10 · Mục 1.2 (dòng 19) · Mục 1.3 (dòng 25) · Mục 9 (dòng 295) · Mục 9.3 (dòng 312).
- **Vấn đề:** Tiêu đề ghi `v1.1 (Đã phê duyệt)` nhưng Mục 1.2/1.3 vẫn gọi là `v1.0`; tiêu đề Mục 9 ghi *"Quyết định sản phẩm còn mở"* trong khi Mục 9.3 lại ghi *"Các quyết định sản phẩm đã chốt"*.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Tách rõ **Phiên bản sản phẩm (Release 1.0)** và **Phiên bản tài liệu (Doc v1.2)**; đổi tên Mục 9 thành *"Rủi ro, Giả định & Quyết định sản phẩm"* để không mâu thuẫn với Mục 9.3.

---

## (2) Chức năng Cốt lõi Còn thiếu

### `[CRITICAL] CRIT-04` — Thiếu cơ chế Chống dò mã (Brute-force / Rate-limiting) & Khôi phục quyền Quản trị
- **Tham chiếu:** `ADM-001` (dòng 138) · `PRV-001` (dòng 158).
- **Vấn đề:**
  1. Để ông bà, người thân dễ nhập trên điện thoại, mã mời gia đình thường ngắn và dễ đọc. Nếu cổng `PRV-001` và trang `/admin` (`ADM-001`) không có giới hạn số lần thử sai, kẻ xấu có thể chạy kịch bản dò mã tự động để xâm nhập thư viện chứa giọng nói và truyện gia đình.
  2. PRD chưa có luồng xử lý khi chủ thư viện quên mật khẩu Admin hoặc làm mất/lộ thiết bị đang đăng nhập quyền Admin.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  - Bổ sung vào `PRV-001` và `ADM-001`: khóa tạm thời theo thiết bị/IP (ví dụ 15 phút) sau 5 lần nhập sai liên tiếp; quy định độ dài/ngẫu nhiên tối thiểu cho mã mời tự tạo (VD: tối thiểu 8 ký tự chữ-số hoặc liên kết có token khó đoán).
  - Bổ sung vào `ADM-001`: chức năng **Quên/Đặt lại mật khẩu Admin** qua email đã đăng ký và nút **"Đăng xuất tất cả thiết bị quản trị"**.

### `[MAJOR] MAJ-04` — Đứt gãy trải nghiệm "Nghe tiếp", "Nghe lại tập đã xong" & Chuyển tập qua Phần
- **Tham chiếu:** `LIS-001` (dòng 107) · `LIS-002` (dòng 108) · `PLY-004` (dòng 126) · `PLY-007` (dòng 129).
- **Vấn đề:**
  1. **Tối hôm sau sau khi nghe xong 1 tập:** Nếu tối nay bé nghe xong Tập 01 (đạt ≥ 95% hoặc hết bài), tập này chuyển thành *"Đã nghe xong"*. Tối mai mở trang chủ, `LIS-002` (*"tập đang nghe dở gần nhất"*) sẽ bị trống hoặc hiển thị Tập 01 ở giây cuối, buộc phụ huynh phải lội vào từng Bộ sách tìm Tập 02.
  2. **Trẻ đòi nghe lại tập quen:** Trẻ nhỏ thường nghe đi nghe lại 1 tập yêu thích nhiều tối. Với quy tắc `PLY-004` hiện tại (đánh dấu xong ở ≥ 95%, luôn resume đúng vị trí dừng), nếu tập trước dừng ở 96% hoặc 100% mà bấm Phát lại, trình phát chưa có quy định tự reset về `00:00`.
  3. **Chuyển tập qua ranh giới Phần (`Part`):** `PLY-007` chưa định nghĩa khi đang phát tập cuối của Phần 1, nút Tập tiếp theo / Auto-next dừng lại hay chuyển sang tập đầu của Phần 2.
  4. **Công thức tiến độ Bộ sách (`LIS-001`):** Chưa làm rõ cách tính *"tiến độ nghe tổng quát"* của Bộ sách khi bên trong có lẫn tập *"Chỉ đọc chữ"* hoặc tập mới thêm.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  - Cập nhật `LIS-002`: Nếu tập gần nhất đã ở trạng thái *"Đã nghe xong"* và còn tập có audio tiếp theo trong Bộ sách, khối đầu trang tự động hiển thị gợi ý *"Nghe tiếp: Tập kế tiếp"* (1 chạm phát từ `00:00`).
  - Cập nhật `PLY-004`: Khi bấm Phát một tập đang ở trạng thái *"Đã nghe xong"* (hoặc vị trí lưu ≥ 95%), trình phát tự động bắt đầu lại từ `00:00` (với tập đang dở < 95%, lùi nhẹ 2–3 giây để bắt nhịp).
  - Cập nhật `PLY-007`: Thứ tự phát liên tiếp chạy xuyên suốt các Phần trong cùng Bộ sách theo đúng thứ tự xuất bản.
  - Cập nhật `LIS-001`: Hiển thị tiến độ theo số tập audio đã hoàn thành trên tổng số tập có audio (VD: `4/11 tập đã nghe`) thay vì phần trăm mơ hồ.

### `[MAJOR] MAJ-05` — Thiếu Danh mục Hồ sơ Giọng đọc chuẩn hóa (`Voice Profiles`)
- **Tham chiếu:** `ADM-006` (dòng 143) · `PLY-005` (dòng 127).
- **Vấn đề:** `PLY-005` yêu cầu trình phát *"ghi nhớ giọng ưu tiên của người nghe cho các tập sau nếu có giọng tương ứng"*, nhưng `ADM-006` lại để Admin tự gõ tên hiển thị giọng đọc dạng văn bản tự do ở từng tập. Chỉ cần Admin gõ lệch (`"Giọng Mẹ"`, `"Mẹ đọc"`, `"Mỹ Duyên"`, `"Giọng nữ - Mỹ Duyên"`), hệ thống không thể khớp đúng giọng ưu tiên giữa Tập 01 và Tập 02.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Bổ sung khái niệm **Hồ sơ Giọng đọc (Voice Profile)** dùng chung toàn thư viện trong `ADM-006` (gồm mã định danh cố định + tên hiển thị chuẩn). Khi thêm bản thu cho tập mới, Admin chọn từ danh sách giọng sẵn có (hoặc tạo nhanh giọng mới vào danh sách chung).

### `[MAJOR] MAJ-06` — Thiếu quy tắc xử lý xung đột thời gian thực khi cập nhật/ẩn nội dung đang mở
- **Tham chiếu:** `PUB-003` (dòng 157).
- **Vấn đề:** `PUB-003` chỉ nói chung chung *"không làm hỏng trải nghiệm người nghe đang mở thư viện"* nhưng bỏ trống 3 kịch bản lỗi thực tế:
  1. Admin thay file audio tập 01 từ 20 phút xuống bản biên tập lại còn 14 phút, trong khi máy người nghe vẫn lưu `resume = 17:30`.
  2. Admin chuyển tập sang `Hidden` hoặc xóa tập đúng lúc một máy đang mở/phát tập đó hoặc lưu trong *"Nghe tiếp"*.
  3. Ứng dụng PWA/tab trình duyệt mở từ hôm trước vẫn lưu danh mục cũ ở bộ nhớ đệm nên không thấy tập mới xuất bản.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Bổ sung vào `PUB-003`:
  - Nếu vị trí lưu cục bộ (`resume`) lớn hơn tổng thời lượng bản thu mới (hoặc bản thu được thay thế tệp khác), đặt lại vị trí về `00:00` an toàn kèm chú thích nhẹ.
  - Nếu tập đang trong danh sách *"Nghe tiếp"* bị ẩn/xóa, tự động xóa khỏi thẻ *"Nghe tiếp"* và hiển thị thông báo thân thiện khi truy cập URL trực tiếp (*"Nội dung hiện không khả dụng"*).
  - Giao diện người nghe tự kiểm tra làm mới danh mục khi ứng dụng được mở lại từ nền.

### `[MAJOR] MAJ-07` — Thiếu ngưỡng giới hạn kỹ thuật cụ thể & Trạng thái rỗng (Empty States)
- **Tham chiếu:** `NFR-011` (dòng 235) · `LIS-001`–`LIS-007` (dòng 107–113).
- **Vấn đề:**
  1. `NFR-011` nói *"từ chối sớm tệp vượt giới hạn dung lượng"* nhưng không định nghĩa con số tối đa (20MB, 50MB hay 100MB?), khiến người dùng và kỹ sư không biết chuẩn để thiết kế và kiểm thử.
  2. Chưa có quy định hành vi khi: thư viện chưa có bộ sách nào xuất bản, Bộ sách được xuất bản nhưng chưa có tập `Published` nào, hoặc tìm kiếm/lọc (`LIS-007`) không có kết quả.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  - Chốt bảng giới hạn vào `NFR-011` (theo `DEC-06`, VD đề xuất: Audio ≤ 60MB/tệp, tối đa 5 giọng/tập; Ảnh ≤ 5MB/tệp, tối đa 15 tranh/tập; Bản chữ ≤ 30.000 từ/tập).
  - Bổ sung quy tắc: không cho phép xuất bản Bộ sách chưa có tập `Published` nào (hoặc hiển thị thẻ *"Sắp ra mắt"* không bấm lỗi) và quy định thông điệp Empty State ấm áp bằng tiếng Việt cho từng màn hình.

---

## (3) Những Chỗ Over-engineering (Thiết kế thừa cho v1.0)

### `[MAJOR] MAJ-03` — Vòng đời 4 trạng thái xuất bản + Xóa mềm/Thùng rác chồng chéo
- **Tham chiếu:** `PUB-001` (dòng 155) · Mục 6.2 (dòng 197–206) · `ADM-003` (dòng 140) · `ADM-010` (dòng 147).
- **Vấn đề:**
  - Với một thư viện gia đình do 1–2 người quản lý, việc duy trì tới **4 trạng thái cùng ẩn nội dung khỏi người nghe** (`Draft`, `Hidden`, `Archived`, `Soft-deleted/Trash`) là rườm rà không cần thiết.
  - Sơ đồ Mục 6.2 biến `Archived (Lưu trữ)` thành mũi tên một chiều — một khi chuyển sang `Archived` không có đường quay lại `Draft` hoặc `Published`.
  - Xóa mềm (`ADM-003`) nằm ở *Must Have* nhưng khôi phục (`ADM-010`) lại đẩy sang *Should Have* — nếu làm xóa mềm mà không có chỗ khôi phục thì dữ liệu vẫn bị kẹt trong DB không ai dọn được.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Đơn giản hóa vòng đời về đúng **2 trạng thái xuất bản (`Nháp / Đang ẩn` ↔ `Đã xuất bản`)** + **1 Thùng rác (`Trash`)** đồng bộ ở mức *Must Have* (cho phép Khôi phục hoặc Xóa vĩnh viễn để giải phóng dung lượng media).

### `[MAJOR] MAJ-08` *(Phần Over-engineering)* — Công cụ cắt ảnh (Crop UI) trên di động & Tông màu nhấn tự do theo Bộ sách
- **Tham chiếu:** `ADM-007` (dòng 144) · Mục 3.1 (dòng 70).
- **Vấn đề:**
  - Xây dựng công cụ cắt ảnh tương tác (crop preview & crop canvas) hoạt động mượt trên trình duyệt di động, xử lý xoay EXIF ảnh chụp điện thoại là phần việc phức tạp dễ lỗi nhưng ít giá trị vì chủ thư viện thường chuẩn bị bìa sách tranh từ trước.
  - Cho phép nhập/chọn *"Tông màu nhấn"* tùy ý cho từng Bộ sách rất dễ làm hỏng tổng thể màu nước tối giản và phá vỡ cam kết độ tương phản WCAG AA (`NFR-009`) ở cả 2 chế độ Sáng/Đêm.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  - Thay Crop UI trong `ADM-007` ở v1.0 bằng **khung xem trước tỷ lệ `3:4` cố định kèm lựa chọn điểm căn (Trên / Giữa / Dưới)** và ghi rõ kích thước khuyến nghị (VD: `900×1200px`).
  - Loại bỏ tùy chỉnh màu tự do ở Mục 3.1; nếu muốn tạo nét riêng nhẹ nhàng cho từng Bộ sách, giới hạn trong 3–4 bảng sắc thái màu nước đã được kiểm định sẵn độ tương phản ở cả Warm Paper và Warm Night.

### `[MINOR] MIN-03` — Công thức chẻ nhánh `< 5%` vs `≥ 5%` khi chuyển giọng đọc
- **Tham chiếu:** Mục 6.1.3 (dòng 186–187).
- **Vấn đề:** Chia 2 nhánh xử lý theo ngưỡng chênh lệch thời lượng `< 5%` gây phức tạp logic và tạo sự thiếu nhất quán khi một cặp bản thu chênh `4,9%` hành xử khác cặp chênh `5,1%`.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Hợp nhất thành một quy tắc tuyến tính duy nhất: luôn ánh xạ theo tỷ lệ phần trăm thời lượng `vị_trí_mới = clamp((vị_trí_cũ / thời_lượng_cũ) × thời_lượng_mới, 0, thời_lượng_mới)` (với sai lệch < 5%, công thức này tự nhiên cho kết quả gần như trùng khớp số giây mà không cần rẽ nhánh).

### `[MINOR] MIN-04` — Yêu cầu sao lưu & khôi phục định kỳ ở mức ứng dụng (`BKP-002`)
- **Tham chiếu:** `BKP-002` (dòng 162).
- **Vấn đề:** Đặt `BKP-002` cạnh `BKP-001` trong bảng tính năng sản phẩm dễ khiến kỹ sư hiểu nhầm phải xây giao diện quản lý snapshot và chức năng "khôi phục đè toàn bộ thư viện" trong Admin CMS — tiềm ẩn nguy cơ bấm nhầm ghi đè mất tập vừa đăng.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Làm rõ `BKP-002` là yêu cầu vận hành tự động ở tầng lưu trữ dữ liệu (Database PITR/daily backup) phục vụ khắc phục sự cố hệ thống, không xây tính năng ghi đè khôi phục trên giao diện người dùng v1.0.

---

## (4) Rủi ro về CMS Đa dự án, Quyền riêng tư, Dữ liệu & Bản quyền

### `[CRITICAL] CRIT-03` — Hạ cấp `PRV-003` (Bảo vệ liên kết tệp đa phương tiện) làm vô hiệu hóa tính riêng tư
- **Tham chiếu:** `PRV-001`–`PRV-003` (dòng 158–160).
- **Vấn đề:** `PRV-001` (cổng mã mời) là *Must Have*, nhưng `PRV-003` (*"Tệp audio và hình ảnh không bị lộ công khai"*) lại chỉ là *Should Have*. Nếu giữ nguyên mức ưu tiên này khi phát hành v1.0:
  - Bất kỳ ai biết/đoán được URL tệp audio hoặc nhìn từ trình duyệt đều có thể tải thẳng bản thu âm giọng nói gia đình, bản thảo văn bản hoặc chia sẻ ra ngoài mà không cần mã mời;
  - Người bị thu hồi mã mời (`PRV-002`) vẫn phát/tải được tệp nếu đã lưu URL tệp media từ trước.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Nâng `PRV-003` lên **Must Have**; quy định rõ mọi tệp audio và tranh minh họa trong thư viện riêng tư chỉ được truy xuất thông qua liên kết có chữ ký tạm thời (signed URL) cấp cho phiên đã xác thực mã mời, đồng thời đủ dài cho phiên nghe ru ngủ qua đêm (VD: 12 giờ) để không làm gián đoạn trình phát trên màn hình khóa iOS.

### `[CRITICAL] CRIT-05` — Rủi ro Bản quyền Sở hữu trí tuệ khi mở rộng Đa bộ sách & Chia sẻ ngoài gia đình
- **Tham chiếu:** Mục 1.1 (dòng 17) · Mục 9.2 (dòng 309).
- **Vấn đề:**
  1. **Ranh giới "người thân và bạn bè":** Giả định dòng 309 mặc nhiên coi chủ thư viện có quyền hợp pháp, nhưng việc chia sẻ sách nói hoặc tác phẩm có bản quyền của bên thứ ba (nếu chủ thư viện tải lên sách ngoài gia đình) qua mạng cho nhiều gia đình bạn bè vượt quá phạm vi sử dụng cá nhân theo luật sở hữu trí tuệ.
  2. **Bản quyền giọng đọc & cộng tác viên:** Chưa có trường ghi nhận nguồn tác giả/họa sĩ/người thu âm và bước xác nhận điều khoản sử dụng nếu có nội dung/giọng đọc do cộng tác viên hoặc công cụ tổng hợp tạo ra.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  1. Bổ sung vào `ADM-003` và `ADM-006`: trường ghi nguồn (**Tác giả chữ, Họa sĩ minh họa, Người đọc**) và hộp xác nhận của Chủ thư viện khi xuất bản Bộ sách mới rằng nội dung thuộc quyền sở hữu gia đình hoặc có phép lưu hành nội bộ hợp lệ.
  2. Bổ sung vào `PRV-002`: giới hạn số lượng mã mời hoạt động đồng thời ở ngưỡng quy mô gia đình thân thiết (VD: tối đa 25–30 mã) để giữ đúng tính chất thư viện gia đình riêng tư.

### `[MAJOR] MAJ-08` *(Phần Rủi ro CMS Đa dự án)* — Khóa cứng cấu trúc bộ *Lim & Mẹ Vacci* lên toàn bộ CMS
- **Tham chiếu:** Mục 3.1 (dòng 72–75) · `LIS-004` (dòng 110) · `PLY-007` (dòng 129).
- **Vấn đề:**
  - Thực thể Tập ở dòng 72 gắn chết trường *"Điểm nhấn/Kỷ vật tập"* — đây là cơ chế cốt truyện đặc thù của bộ *Lim & Mẹ Vacci* (mỗi đêm nhặt 1 kỷ vật bỏ vào túi da), hoàn toàn lạc lõng nếu chủ thư viện tạo bộ sách mới như *Tuyển tập thơ ru ngủ*, *Truyện cổ tích* hay *Sách kiến thức*.
  - Tương tự, các bộ sách khác nhau có độ dài tập rất khác nhau (thơ 2 phút vs truyện 30 phút), nhưng hiện tại chưa cho cấu hình hành vi `Auto-next` mặc định theo từng Bộ sách.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  - Tổng quát hóa *"Điểm nhấn/Kỷ vật tập"* thành khối **"Ghi chú cuối tập" (tùy chọn)** có thể đặt nhãn hiển thị riêng ở cấp Bộ sách (hoặc bỏ trống để ẩn hoàn toàn).
  - Bổ sung vào Bộ sách cấu hình tùy chọn: chế độ mặc định chuyển tập (phát từng tập để ru ngủ vs tự động phát tiếp cho chuỗi truyện/thơ ngắn) và kiểu hiển thị đánh số tập (hiển thị số `Tập 01` hoặc ẩn số với tuyển tập truyện rời).

### `[MAJOR] MAJ-09` — Rò rỉ meta qua Link Preview ứng dụng chat, mất dữ liệu 7 ngày trên iOS Safari & Tệp mồ côi
- **Tham chiếu:** Mục 2.2.4 (dòng 46) · `NFR-007` (dòng 231) · `OPD-02` (dòng 318) · `ADM-006`–`ADM-007` (dòng 143–144).
- **Vấn đề:**
  1. **Link Preview trên Zalo/Messenger/iMessage:** Khi chủ thư viện gửi đường dẫn kèm mã mời qua app nhắn tin (Mục 2.2.4), bot thu thập thẻ preview của ứng dụng chat sẽ tự động truy cập URL đó. Nếu liên kết thiết kế theo kiểu tự động đăng nhập qua tham số URL hoặc trả về tên sách/ảnh bìa trong thẻ OpenGraph, thông tin thư viện riêng tư sẽ bị bộ nhớ đệm của nền tảng chat lưu lại.
  2. **Chính sách ITP 7 ngày của Safari iOS:** Theo `OPD-02`, tiến độ nghe và yêu thích lưu cục bộ trên thiết bị. Trên iOS Safari, nếu người thân mở qua trình duyệt mà không cài ra Màn hình chính (`LIS-009`), toàn bộ `localStorage` sẽ bị Safari tự động xóa sạch sau **7 ngày không truy cập**.
  3. **Rác lưu trữ (Orphaned Files):** Khi chủ thư viện tải nhầm tệp hoặc thay audio/tranh minh họa nhiều lần ở `ADM-006`/`ADM-007`, tệp cũ không được quy định cơ chế dọn dẹp sẽ tích tụ gây phình dung lượng và lọt vào bản sao lưu.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  1. Quy định trong `PRV-001` & `NFR-007`: Trang cổng chưa xác thực chỉ trả về tiêu đề chung chung (*"Litibook — Thư viện gia đình"*), không nhúng ảnh bìa/tên sách nội bộ vào thẻ OpenGraph và không tự động tiêu thụ mã mời trên request xem trước của bot (yêu cầu thao tác bấm xác nhận của người dùng).
  2. Ghi nhận rõ giới hạn 7 ngày của iOS Safari trong Mục 9.1 & `LIS-009` (nhắc nhẹ phụ huynh *"Thêm vào Màn hình chính"* để giữ lịch sử bền vững, hoặc xem xét `DEC-03`).
  3. Bổ sung vào `ADM-006`/`ADM-007`: Khi tệp media bị thay thế hoặc tập bị xóa vĩnh viễn khỏi Thùng rác, hệ thống thu dọn tệp lưu trữ không còn tham chiếu sau thời gian đệm an toàn (VD: 24–48 giờ).

---

## (5) Những Tiêu chí Nghiệm thu Chưa Kiểm thử được hoặc Thiếu sót

### `[CRITICAL] CRIT-06` — `AC-02` (Fade-out âm lượng khi khóa màn hình) bất khả thi trên iOS & dùng từ ngữ định tính
- **Tham chiếu:** `AC-02` (dòng 254–255) · `PLY-006` (dòng 128, 189).
- **Vấn đề:** Trên iOS Safari (hệ sinh thái di động phổ biến nhất của phụ huynh), Apple khóa quyền thay đổi thuộc tính `volume` của thẻ âm thanh từ mã web — đặc biệt khi màn hình đã khóa (chạy nền). Vì vậy điều kiện bắt buộc *"âm lượng giảm dần êm ái trong 5–10 giây cuối rồi tự chuyển sang `Paused`"* sẽ **luôn trượt (Fail)** khi kiểm thử trên iPhone/iPad nếu không phân tách theo năng lực hệ điều hành. Ngoài ra, tính từ *"êm ái"* không có tiêu chuẩn đo lường.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  - Sửa `PLY-006` và `AC-02` phân rõ 2 mức kiểm thử:
    - **Trên nền tảng hỗ trợ điều chỉnh âm lượng phần mềm (Android Chrome / Desktop):** âm lượng giảm dần tối thiểu 5 nấc từ `100%` về `0%` trong `8 ± 2 giây` cuối trước khi chuyển sang `Paused`.
    - **Trên nền tảng khóa điều chỉnh âm lượng nền (iOS Safari):** trình phát tự động dừng chính xác tại mốc hẹn giờ (`±2 giây`), lưu nguyên trạng vị trí dừng mà không phát tiếp tập kế tiếp.

### `[MAJOR] MAJ-10` — Thiếu thông số môi trường cho chỉ số hiệu năng & Điều kiện không đo được trong `AC-05`
- **Tham chiếu:** `NFR-004` (dòng 228) · `NFR-005` (dòng 229) · `AC-05` (dòng 272).
- **Vấn đề:**
  1. `NFR-004` (`≤ 2,5 giây`) và `NFR-005` (`≤ 2 giây`) không quy định cấu hình mạng thử nghiệm, thiết bị chuẩn, số lượng bộ sách/tập trong thư viện hay kích thước tệp audio thử nghiệm.
  2. `AC-05` dòng 272 viết *"trong vòng ≤ 5 giây (sau khi làm mới), tập mới xuất hiện..."* — cụm từ *"sau khi làm mới"* làm phép đo mất ý nghĩa vì người kiểm thử không biết bắt đầu bấm giờ từ lúc Admin bấm nút Xuất bản hay từ lúc Người nghe bấm Reload.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:**
  - Bổ sung chú thích điều kiện kiểm thử chuẩn cho Mục 7: mô phỏng mạng `Regular 4G (9 Mbps down / 1.5 Mbps up / độ trễ 150ms)`, tập dữ liệu `5 bộ sách / 100 tập`, tệp kiểm thử `MP3 128kbps dài 20 phút`.
  - Sửa `AC-05` dòng 272 thành: *"Ngay sau khi thao tác Xuất bản báo thành công (≤ 2 giây), khi Người nghe mở hoặc tải lại trang Bộ sách thì Tập mới xuất hiện ngay ở đúng thứ tự và phát được audio"*.

### `[MAJOR] MAJ-11` — Thiếu hoàn toàn Tiêu chí Nghiệm thu (AC) cho 7 nhóm yêu cầu cốt lõi
- **Tham chiếu:** Mục 8 (dòng 240–292).
- **Vấn đề:** Có tới 7 yêu cầu quan trọng (gồm nhiều yêu cầu *Must Have* và *Should Have* chủ chốt) chưa có bất kỳ kịch bản kiểm thử nào trong Mục 8:
  1. Xung đột `PLY-007` (Auto-next đang bật) vs `PLY-006` (Sleep Timer *"Hết tập này"*) và chuyển tập giữa các Phần.
  2. `PLY-010` (Khóa trẻ em Kid Lock: khóa nút tua, giữ 2 giây để mở khóa).
  3. `ADM-004` (Thêm/đổi tên/bỏ Phần khi Bộ sách đã có tập — kiểm tra không làm mất tập cũ).
  4. `PUB-003` (Sửa bản chữ / thay audio ngắn hơn khi tập đang xuất bản).
  5. `OPD-03` (Xuất bản tập *"Chỉ đọc chữ"* và kiểm chứng không lỗi trình phát).
  6. `NFR-002` (Kiểm tra vùng chạm các nút cốt lõi `≥ 44×44px` trên viewport `360×800`).
  7. `NFR-007` & `PRV-003` (Chặn bot tìm kiếm `noindex` và chặn truy cập link tệp audio/ảnh trái phép).
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Bổ sung `AC-09` đến `AC-13` vào Mục 8 theo khung mẫu sau:
  - **`AC-09` (Auto-next vs Sleep Timer & Kid Lock):** Given bật đồng thời Auto-next và Sleep Timer *"Hết tập này"*; When tập kết thúc; Then trình phát dừng hẳn không sang tập sau. Given bật Kid Lock trên Full-screen Player; When chạm nhanh vào thanh tua hoặc nút chuyển tập; Then trình phát không phản hồi cho tới khi chạm giữ nút mở khóa đủ `2 giây`.
  - **`AC-10` (Chỉnh sửa Phần & Tập Chỉ đọc chữ):** Given Bộ sách đã có 3 tập chưa phân Phần; When Admin tạo Phần 1 và gán 3 tập vào; Then không tập nào bị mất dữ liệu hay đổi trạng thái. Given Admin xuất bản tập bật cờ *"Chỉ đọc chữ"* không có audio; When Người nghe mở tập; Then giao diện hiển thị bản chữ/tranh hoàn chỉnh mà không hiện lỗi thiếu audio, và Auto-next bỏ qua tập này.
  - **`AC-11` (Cập nhật tập đang xuất bản — `PUB-003`):** Given máy người nghe đang lưu mốc `18:00` trên Tập A (20 phút); When Admin thay audio mới dài 12 phút; Then khi người nghe mở lại Tập A, hệ thống không bị lỗi tràn thời gian mà đưa về `00:00` an toàn.
  - **`AC-12` (Quy chuẩn chạm & Chặn lập chỉ mục):** Trên viewport `360×800`, 100% nút điều khiển chính có kích thước vùng chạm `≥ 44×44px` và không tràn ngang; phản hồi HTTP trang thư viện và trang quản trị chứa chỉ thị chặn lập chỉ mục (`noindex, nofollow`).
  - **`AC-13` (Bảo vệ tệp Media — `PRV-003`):** Truy cập trực tiếp URL tệp audio/ảnh khi chưa có phiên xác thực hoặc dùng liên kết đã hết hạn bị hệ thống từ chối (`401/403`).

### `[MINOR] MIN-05` — `AC-03` thiếu dữ liệu đầu vào bản thu đích và sai số cho phép
- **Tham chiếu:** `AC-03` (dòng 258–260).
- **Vấn đề:** Ghi *"tiếp tục phát từ vị trí tương ứng (~40% thời lượng)"* nhưng không cho biết tổng thời lượng bản Giọng Nam (nếu dài 10 phút luôn thì 40% là 04:00, nếu dài 15 phút là 06:00) và không quy định dấu `~` cho phép lệch tối đa bao nhiêu giây.
- **Đề xuất cách sửa cụ thể trong `PRD.md`:** Sửa thành: *"Given Giọng Nữ dài `10 phút (600s)` đang dừng tại `04:00 (240s — 40%)` và Giọng Nam dài `12 phút 30 giây (750s)`; When người nghe chuyển sang Giọng Nam; Then trình phát tiếp tục phát tại mốc `05:00 ± 3 giây (300s ± 3s)`"*.

---

## (6) Các Quyết định Sản phẩm Cần Chủ Dự án Phê duyệt

Hội đồng đề nghị Chủ dự án phê duyệt tường minh **8 quyết định (`DEC-01` → `DEC-08`)** dưới đây trước khi cập nhật `PRD.md` lên v1.2 và khóa phạm vi phát triển:

| Mã | Quyết định cần phê duyệt | Phương án A | Phương án B | Khuyến nghị của Hội đồng |
| :--- | :--- | :--- | :--- | :--- |
| **`DEC-01`** | **Hiệu lực thu hồi mã mời với thiết bị đã đăng nhập trước đó** (`CRIT-01`) | **Chặn tức thì:** Kiểm tra hiệu lực mã ở mỗi phiên tải trang/cấp link phát; thu hồi mã là mất quyền ngay ở lần mở kế tiếp. | **Chỉ chặn người mới:** Phiên cũ giữ nguyên tới khi hết hạn (VD: 90 ngày). | **Chọn A** — Thu hồi mà thiết bị cũ vẫn dùng được suốt 90 ngày sẽ gây rủi ro riêng tư thực tế. |
| **`DEC-02`** | **Phạm vi bản quyền nội dung & giới hạn chia sẻ** (`CRIT-05`) | **Chỉ tác phẩm gốc gia đình / có phép rõ ràng**, kèm xác nhận bản quyền khi tạo Bộ sách và giới hạn trần ~25–30 mã mời. | **Không kiểm soát nguồn gốc**, chỉ miễn trừ trách nhiệm trong văn bản. | **Chọn A** — Bảo vệ chủ dự án và đảm bảo đúng định vị thư viện gia đình riêng tư. |
| **`DEC-03`** | **Chống mất lịch sử nghe sau 7 ngày trên iOS Safari** (`MAJ-09`) | **Giữ lưu cục bộ thuần túy trên thiết bị**, bổ sung nhắc nhẹ cài ra Màn hình chính (`LIS-009`). | **Lưu tiến độ gắn với Mã mời trên máy chủ** (mỗi nhà 1 mã mời = chung tiến độ gia đình, không cần tài khoản email). | **Chọn A cho v1.0** (đúng `OPD-02`, tránh lộ tiến độ nếu 2 gia đình dùng nhầm chung mã), cân nhắc **B** nếu mỗi hộ có mã riêng. |
| **`DEC-04`** | **Hành vi "Nghe tiếp" khi tập gần nhất đã nghe xong & phát lại tập cũ** (`MAJ-04`) | **Tự gợi ý Tập kế tiếp** trên thẻ đầu trang; bấm vào tập đã xong sẽ **tự phát lại từ `00:00`**. | Chỉ hiển thị tập đang nghe dở; tập đã xong biến mất khỏi thẻ đầu trang. | **Chọn A** — Giải quyết đúng thói quen mở nghe tiếp mỗi tối trước khi ngủ của phụ huynh. |
| **`DEC-05`** | **Đơn giản hóa vòng đời trạng thái xuất bản** (`CRIT-02`, `MAJ-03`) | **Rút gọn còn 2 trạng thái (`Nháp/Ẩn` ↔ `Đã xuất bản`) + 1 Thùng rác (`Must Have`)**. | Giữ nguyên 4 trạng thái (`Draft`, `Published`, `Hidden`, `Archived`) + Thùng rác. | **Chọn A** — Giảm 50% độ phức tạp giao diện quản trị và loại bỏ trạng thái ngõ cụt `Archived`. |
| **`DEC-06`** | **Định mức giới hạn tệp tải lên v1.0** (`MAJ-07`) | **Chốt trần thực dụng:** Audio ≤ `60MB`/tệp (tối đa 5 giọng/tập), Ảnh ≤ `5MB`/tệp (tối đa 15 tranh/tập), Bản chữ ≤ `30.000` từ/tập. | Cho tải không giới hạn dung lượng (dễ treo trình duyệt di động và tốn lưu trữ). | **Chọn A** — Đủ dư cho tập dài 35–40 phút ở 48kHz nhưng vẫn bảo vệ thiết bị di động. |
| **`DEC-07`** | **Phạm vi sao lưu tệp đa phương tiện gốc ở v1.0** (`MAJ-02`) | **Sửa mục tiêu PRD:** Web xuất JSON (cấu trúc + bản chữ + danh sách URL tải tệp), chủ thư viện giữ bản gốc trên máy tính hoặc dùng script tải đồng bộ. | Xây tính năng nén ZIP toàn bộ file audio/ảnh ngay trên giao diện Web Admin. | **Chọn A cho v1.0** — Nén hàng trăm MB/GB audio trên serverless/trình duyệt dễ quá tải và không cần thiết ở quy mô gia đình. |
| **`DEC-08`** | **Mức độ tùy biến cấu trúc theo từng Bộ sách trong CMS** (`MAJ-08`) | **Tổng quát hóa:** Đổi *"Kỷ vật tập"* thành *"Ghi chú cuối tập"* (tắt/bật & đặt nhãn theo Bộ sách) và cho chọn mặc định `Auto-next` theo Bộ sách. | Giữ cố định mọi Bộ sách phải giống khung bộ *Lim & Mẹ Vacci*. | **Chọn A** — Điều kiện bắt buộc để Litibook thực sự là CMS đa bộ sách chứ không bị khóa vào 1 dự án mẫu. |

---

*Hết báo cáo thẩm định. `PRD.md` và mã nguồn dự án chưa bị chỉnh sửa. Mời Chủ dự án xem xét và phê duyệt `DEC-01` → `DEC-08` để Hội đồng cập nhật `PRD.md` lên phiên bản v1.2 sạch mâu thuẫn trước khi bước vào giai đoạn lập trình.*
