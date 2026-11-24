# ARCHITECTURE — Litibook (Phiên bản 1.2)

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Tham chiếu sản phẩm** | [GEMINI.md](./GEMINI.md) · [PRD.md](./PRD.md) Release 1.0 · Tài liệu v1.3 (Đã phê duyệt chính thức) |
| **Mục tiêu kiến trúc** | Tối giản vận hành, mở thẳng không cổng mã mời, tương thích tốt iOS Safari/Android Chrome, dữ liệu mở không khóa nền tảng |
| **Trạng thái** | Đã đồng bộ theo Hiến pháp [GEMINI.md](./GEMINI.md) & PRD v1.3 |

---

## 1. Tổng quan Kiến trúc Hệ thống

```text
┌────────────────────────────────────────────────────────────────────┐
│                    Người nghe (Mobile-first)                       │
│     PWA / Web App (iOS Safari, Android Chrome, Desktop)            │
│   • Mở thẳng Thư viện (không cổng mã mời / không bắt đăng nhập)   │
│   • Persistent Audio Player (Media Session API + Local Resume)     │
└───────────────────────────────┬────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼────────────────────────────────────┐
│              Litibook Web App & API (Next.js App Router)           │
│                     Triển khai trên Vercel                         │
│   • Route Người nghe: /, /books/[slug], /episodes/[id]             │
│   • Route Quản trị:   /admin/* (Xác thực Admin tách biệt)          │
│   • API Layer:        CRUD nội dung, Upload Media, Backup JSON     │
└──────────────┬──────────────────────────────────┬──────────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────────┐   ┌─────────────────────────────────┐
│   Cơ sở dữ liệu & Auth       │   │   Lưu trữ Media (Audio & Ảnh)   │
│   Supabase (PostgreSQL)      │   │   Cloudflare R2 (10GB · 0đ BW)  │
│ • books, parts, episodes     │   │ • Audio MP3/M4A (Range Request) │
│ • voice_profiles, audio      │   │ • Ảnh bìa 3:4 & Tranh xen kẽ    │
│ • illustrations              │   │ • Tải trực tiếp Presigned PUT   │
│ • Supabase Auth (chỉ Admin)  │   │ • Không giới hạn băng thông nghe│
└──────────────────────────────┘   └─────────────────────────────────┘
```

### Lý do chọn ngăn xếp (Tech Stack Rationale)
1. **Next.js (App Router + TypeScript + Tailwind CSS) trên Vercel:**
   - Tận dụng trực tiếp kho GitHub & hạ tầng Vercel hiện có của dự án (`thuviencualiti`).
   - Hỗ trợ Persistent Layout để **Mini-player không bao giờ bị ngắt âm thanh** khi người nghe chuyển trang giữa Trang chủ → Bộ sách → Tập.
   - Gộp chung giao diện Người nghe, giao diện Quản trị và API trong 1 dự án duy nhất — cực kỳ gọn để bảo trì lâu dài.
2. **Supabase (PostgreSQL + Auth):**
   - Lưu trữ cấu trúc quan hệ sạch (`books → parts → episodes → audio_tracks / illustrations`, kèm `voice_profiles`).
   - Xác thực tài khoản Chủ thư viện (`ADM-001`) sẵn sàng, an toàn, có Row Level Security (RLS).
   - Cho phép xuất dữ liệu chuẩn SQL/JSON bất cứ lúc nào (`BKP-001`, `NFR-012`).
3. **Cloudflare R2 cho Audio & Hình ảnh:**
   - Tệp audiobook 48kHz có dung lượng lớn (~10–20MB/tập). R2 miễn phí 10GB lưu trữ và **0 đồng phí băng thông tải ra (Zero Egress)** — tránh phát sinh chi phí bất ngờ khi cả nhà nghe lại mỗi tối.
   - Hỗ trợ chuẩn **HTTP Range Requests (`206 Partial Content`)** bắt buộc để tua mượt và phát nền ổn định trên iOS Safari (`NFR-005`).
   - Upload trực tiếp từ trình duyệt bằng **Presigned PUT URL** (không bị giới hạn kích thước 4.5MB của Vercel Serverless Function khi chủ thư viện tải file audio 20MB).
   - *(Phương án thay thế gọn 1 nhà cung cấp: dùng **Supabase Storage** nếu muốn chỉ quản lý 1 tài khoản duy nhất; tuy nhiên gói miễn phí Supabase giới hạn 1GB storage và 2GB egress/tháng, dễ chạm trần khi thư viện có >30 tập audio 48kHz).*

---

## 2. Mô hình Dữ liệu (PostgreSQL Schema)

```text
voice_profiles (1) ──< audio_tracks
books (1) ──< parts (0..N) ──< episodes (1..N) ──< audio_tracks (0..N)
   │                                │
   └────────< episodes (khi không   └──< illustrations (0..N)
              chia phần)
```

### Bảng chính
1. **`books`** (Bộ sách)
   - `id` (UUID, PK), `slug` (text, unique), `title` (text, not null)
   - `description` (text), `author` (text), `illustrator` (text), `age_range` (text)
   - `rights_confirmed` (boolean, default false — xác nhận quyền sử dụng hợp lệ, `DEC-02`)
   - `cover_url` (text — tỷ lệ chuẩn `3:4`), `cover_focal_point` (`top` | `center` | `bottom`)
   - `theme_preset` (`moss` | `ochre` | `rosewood` | `lavender` — 4 preset chuẩn WCAG AA)
   - `default_auto_next` (boolean, default false), `show_episode_numbers` (boolean, default true)
   - `sort_order` (int, default 0)
   - `status` (`draft` | `published`)
   - `created_at`, `updated_at`, `deleted_at` (Thùng rác / soft delete, `DEC-05`)

2. **`parts`** (Phần / Mùa — tùy chọn trong bộ sách)
   - `id` (UUID, PK), `book_id` (UUID, FK → `books.id`)
   - `title` (text, not null), `description` (text), `cover_url` (text)
   - `sort_order` (int, default 0)

3. **`episodes`** (Tập)
   - `id` (UUID, PK), `book_id` (UUID, FK → `books.id`), `part_id` (UUID, nullable, FK → `parts.id`)
   - `episode_code` (text — VD: `00`, `01`), `title` (text, not null), `summary` (text)
   - `category_tag` (text)
   - `cover_url` (text, nullable — rỗng sẽ kế thừa từ `part` → `book`)
   - `content_markdown` (text — bản chữ chuẩn Markdown, tối đa `30.000` từ)
   - `word_count` (int, tự tính khi lưu)
   - `is_text_only` (boolean, default false — hỗ trợ `OPD-03`)
   - `sort_order` (int, default 0)
   - `status` (`draft` | `published`)
   - `published_at`, `created_at`, `updated_at`, `deleted_at` (Thùng rác)

4. **`voice_profiles`** (Danh mục Hồ sơ Giọng đọc dùng chung toàn thư viện — `MAJ-05`)
   - `id` (UUID, PK), `voice_key` (text, unique — VD: `female_my_duyen`, `male_thien_tam_duc`)
   - `display_name` (text, not null — VD: `Giọng Nữ · Mỹ Duyên`)
   - `narrator_name` (text), `notes` (text), `created_at`

5. **`audio_tracks`** (Bản thu âm / Đa giọng đọc)
   - `id` (UUID, PK), `episode_id` (UUID, FK → `episodes.id`), `voice_profile_id` (UUID, FK → `voice_profiles.id`)
   - `audio_key` (text — đường dẫn object trong R2, VD: `books/{book_id}/ep-{id}/{random-id}.mp3`)
   - `duration_seconds` (int — tự trích xuất trên trình duyệt khi tải lên)
   - `file_size_bytes` (bigint — trần `≤ 60MB`), `mime_type` (text)
   - `is_default` (boolean, default false), `sort_order` (int), `updated_at` (phát hiện bản thu thay thế cho `PUB-003`)

6. **`illustrations`** (Tranh minh họa gắn với tập — tối đa `20` tranh/tập, `≤ 5MB`/ảnh)
   - `id` (UUID, PK), `episode_id` (UUID, FK → `episodes.id`)
   - `image_url` (text), `alt_text` (text — phục vụ trợ năng; trên trang đọc, ảnh `![alt](url)` hiển thị gọn theo chiều dọc trang, giới hạn chiều cao hợp lý mà không cắt xén hình và **0 hộp chú thích**)
   - `sort_order` (int, default 0)

---

## 3. Truy cập Trực tiếp, Chặn Lập chỉ mục & Xác thực Quản trị

1. **Mở thẳng cho Người nghe & Chặn máy tìm kiếm (`PRV-001`, `NFR-007`):**
   - Người nghe mở đường dẫn là vào thẳng Trang chủ Thư viện (không cổng mã mời, không bắt đăng nhập).
   - `robots.txt` chặn toàn bộ bot (`Disallow: /`), header HTTP `X-Robots-Tag: noindex, nofollow, noarchive` trên mọi route.
2. **Luồng xác thực Quản trị tách biệt (`ADM-001`):**
   - Đường dẫn riêng `/admin/login` dùng Supabase Auth (Email + Mật khẩu của Chủ thư viện), khóa tạm 15 phút sau 5 lần nhập sai liên tiếp, hỗ trợ đặt lại mật khẩu qua email và nút **"Đăng xuất tất cả thiết bị quản trị"**.
   - Row Level Security (RLS) & API phía server chỉ cho phép đọc các bản ghi `status = 'published' AND deleted_at IS NULL` với người nghe và khóa toàn bộ thao tác ghi (`POST/PUT/DELETE` sách, tập, voice profiles, upload media) cho phiên Admin hợp lệ.

---

## 4. Chiến lược Kỹ thuật Trình phát Audio & Di động

1. **Persistent Player Architecture:**
   - `<audio>` element đặt ở tầng Root Layout (Context/Store dùng chung), đảm bảo chuyển trang không làm tải lại hay ngắt tiếng.
2. **Media Session API (`PLY-003`):**
   - Cập nhật `navigator.mediaSession.metadata` (tên tập, tên bộ sách, ảnh bìa) và gắn handler `play`, `pause`, `seekbackward (-15s)`, `seekforward (+15s)`, `previoustrack`, `nexttrack`.
3. **Sleep Timer Fade-out trên iOS Safari (`PLY-006`, `CRIT-06`):**
   - *Lưu ý kỹ thuật quan trọng:* Trên iOS Safari, thuộc tính `audio.volume` là chỉ đọc (read-only) theo chính sách của Apple khi phát nền.
   - *Giải pháp:* Trên Desktop/Android giảm dần `audio.volume` từ `100% -> 0%` trong `8 ± 2 giây` cuối trước khi `Paused`; trên iOS Safari khóa màn hình đảm bảo dừng chính xác tại mốc hẹn giờ (`±2 giây`), lưu nguyên vị trí và không chuyển sang tập sau.
4. **Lưu tiến độ cục bộ (`OPD-02`, `PLY-004`, `DEC-04`):**
   - Lưu vào `localStorage` (throttle 5 giây/lần và ngay khi `pause` / `pagehide`): `{ episodeId, voiceKey, trackUpdatedAt, positionSeconds, durationSeconds, completed, updatedAt }`.
   - Tập đang dở (< 95%) phát tiếp lùi lại `2–3 giây`; tập đã xong (`completed = true` hoặc `≥ 95%`) bấm Phát lại tự về `00:00`. Nếu `trackUpdatedAt` thay đổi và vị trí cũ vượt quá thời lượng bản thu mới (hoặc lệch `> 10%`), tự đặt lại `00:00`.
5. **Tải tệp bền bỉ & Dọn tệp mồ côi phía Admin (`ADM-006`, `ADM-007`, `DEC-06`):**
   - Kiểm tra sớm giới hạn tệp ngay trên trình duyệt: Audio `≤ 60MB` (`MP3/M4A`), Hình ảnh `≤ 5MB` (`JPG/PNG/WebP`), tối đa `5` giọng/tập, `20` tranh/tập, `30.000` từ/tập.
   - Tải trực tiếp từ trình duyệt lên R2 bằng Presigned URL (XMLHttpRequest để đọc tiến độ `%` chính xác); tự động lưu nháp form soạn thảo vào `localStorage` mỗi 3 giây (`draft:{episodeId}`).
   - Thay Crop canvas phức tạp bằng **khung xem trước `3:4` chọn điểm căn (`top` | `center` | `bottom`)** (`MAJ-08`).
   - Tệp media bị thay thế hoặc thuộc tập/bộ sách xóa vĩnh viễn khỏi Thùng rác được đánh dấu dọn dẹp khỏi R2 sau thời gian đệm an toàn `24–48 giờ` (`MAJ-09`).

---

## 5. Di chuyển Dữ liệu hiện có (`OPD-05`) & Sao lưu (`BKP-001`)

- **Script di chuyển 1 lần (`scripts/migrate_lim_vacci.ts`):**
  - Đọc `data/episodes.json` hiện tại, tạo Bộ sách đầu tiên (*"Lim và Mẹ Vacci — 365 Đêm Khám Phá Thiên Nhiên"*).
  - Tải toàn bộ audio song giọng (`audio_female`, `audio_male`) và ảnh minh họa (`images/episodes/`) lên R2, tự đo thời lượng audio và chèn đầy đủ bản ghi vào PostgreSQL ở trạng thái `published`.
- **Sao lưu 1 chạm (`BKP-001`):**
  - Nút **"Xuất dữ liệu thư viện (.json)"** trong `/admin/settings` tạo file JSON đầy đủ gồm toàn bộ `books`, `parts`, `episodes` (kèm `content_markdown`), `voice_profiles`, `audio_tracks`, `illustrations` và danh sách URL tải tệp gốc.

---

## 6. Lộ trình Triển khai (4 Milestones)

| Giai đoạn | Phạm vi chính | Kết quả kiểm chứng |
| :--- | :--- | :--- |
| **M1 — Nền tảng & Xác thực Quản trị** | Khởi tạo Next.js + Tailwind (Phương án A) + Supabase Schema (`6` bảng: `books`, `parts`, `episodes`, `voice_profiles`, `audio_tracks`, `illustrations`) + Kho lưu trữ Media + Đăng nhập Admin tách biệt (`/admin/login`, khóa 15p/5 lần sai) + Header `noindex` | Người nghe mở thẳng `/` không rào cản; `/admin` bảo mật chặt chẽ; đạt `AC-07`, `AC-12`. |
| **M2 — Trải nghiệm Người nghe, Giao diện Đọc & Audio Player** | Trang chủ, Tủ sách đa dự án, Chi tiết Bộ/Phần/Mục lục Tập, **Giao diện Đọc nhiều chữ chuẩn Hiến pháp** (0 hộp phụ, 1 thanh chọn giọng `36px`, tranh gọn không chú thích), Persistent Mini/Full Player, Đổi giọng tuyến tính, Sleep Timer, Sáng/Đêm ấm, Kid Lock | Đạt `AC-01` → `AC-04`, `AC-09`, `AC-10`, `AC-11` trên iOS Safari & Android Chrome. |
| **M3 — Giao diện Quản trị & Xuất bản** | CRUD Bộ/Phần/Tập, Voice Profiles, Upload audio/ảnh có `%` & giới hạn dung lượng, Khung bìa `3:4` chọn điểm căn, Trình soạn thảo lưu nháp, Xem trước `390px`, Vòng đời `Nháp/Đang ẩn ↔ Đã xuất bản` + `Thùng rác` | Đạt `AC-05`, `AC-06` — tự đăng tập mới 100% không chạm code. |
| **M4 — Chuẩn hóa dữ liệu, Backup & Tinh chỉnh** | Nhập & làm sạch bộ *Lim & Mẹ Vacci* (`OPD-05`: bỏ `relic`/`icon`/`caption`, chuẩn hóa tiêu đề & Markdown), Xuất Backup JSON (`BKP-001`), PWA Manifest, kiểm thử hiệu năng 4G & toàn bộ `AC-01..12` | Đạt `AC-08` và toàn bộ tiêu chí nghiệm thu Release 1.0 + Hiến pháp `GEMINI.md`. |
