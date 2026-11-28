# Thư viện Đồi Mơ

Sách đọc và nghe trước giờ ngủ — **Copyright © Nancy & Liti**.

Dự án này là nền tảng thư viện giới thiệu, lưu trữ, trình bày sách đọc / sách nói gia đình và quản trị xuất bản qua `/admin`. Mọi quy tắc giao diện, màu sắc giấy cotton, typography tiếng Việt và trải nghiệm đọc đều tuân thủ tuyệt đối Hiến pháp [GEMINI.md](./GEMINI.md) (*tách biệt hoàn toàn với khâu sáng tác nội dung gốc và vẽ tranh minh họa bên ngoài*).

---

## Cấu trúc Thư mục Chuẩn

```text
.
├── GEMINI.md                     # Hiến pháp bất khả xâm phạm (Điều 1–3)
├── AGENTS.md                     # Chỉ dẫn khung Next.js App Router
├── README.md                     # Bản đồ tổng quan dự án
├── next.config.mjs               # Cấu hình Next.js, headers & rewrites tương thích ngược
├── package.json                  # Scripts & dependencies (Next.js 16, React 19, Tailwind)
├── tsconfig.json                 # Cấu hình TypeScript (@/* -> ./src/*)
├── index.html / 404.html / sw.js # Tệp chuyển hướng liên kết GitHub Pages cũ sang Vercel
│
├── src/
│   ├── app/                      # Next.js App Router pages & API routes (/admin, /api)
│   ├── components/
│   │   ├── admin/                # Bảng điều khiển & trình biên tập CMS (/admin)
│   │   ├── layout/               # AppShell, LibraryWayfinder 5 nấc, SearchAndSavedSheet
│   │   ├── library/              # Trang Kệ sách, Chi tiết bộ sách, Trang đọc văn học
│   │   └── ui/                   # BookCover, Icons SVG nét mảnh, StorybookHeroStage
│   ├── context/                  # LibraryPlayerContext (Web Audio GainNode & tiến độ đọc/nghe)
│   └── lib/                      # Repository kép (JSON/Supabase), R2, halls, knowledge, presets
│
├── data/
│   ├── library_db.json           # Cơ sở dữ liệu thư viện cục bộ hiện hành
│   └── seeds/                    # Dữ liệu nguồn đồng bộ ban đầu (episodes.json, tieu_hat_de_episodes.json)
│
├── public/
│   ├── audio/                    # Kho âm thanh 48kHz chia theo [slug] bộ sách
│   │   ├── lim-va-me-vacci/
│   │   └── tieu-hat-de/
│   ├── icons/                    # Favicon & biểu tượng PWA (32, 180, 192, 512)
│   ├── images/
│   │   ├── books/                # Tranh bìa đại diện bộ sách (3:4)
│   │   ├── episodes/             # Bìa tập & tranh minh họa chia theo [slug]/[tap]
│   │   ├── halls/                # Cặp tranh Ngày/Đêm cho các Kệ sách
│   │   └── home/                 # Cặp tranh Ngày/Đêm Cổng Đồi Mơ & Sảnh sách
│   └── uploads/                  # Thư mục nhận tệp tải lên cục bộ qua /admin
│
├── docs/
│   ├── handbook/                 # Sổ tay vận hành, nhật ký bàn giao & kiến trúc tri thức
│   ├── specs/                    # Hồ sơ đặc tả PRD, UX Flows, Design System, Architecture
│   └── mockups/                  # Bộ mockup đối chiếu 390px (package-a, spatial-v2)
│
├── scripts/                      # Công cụ Python đồng bộ và dựng dữ liệu sạch
├── supabase/                     # Lược đồ PostgreSQL dự phòng cloud (schema.sql)
└── _archive/                     # Lưu trữ cục bộ không đẩy Git (ảnh tham chiếu, kệ v1, backup cũ)
```

---

## Bản đồ Tài liệu

### Nền tảng & Sổ tay Vận hành (`docs/handbook/`)
- [GEMINI.md](./GEMINI.md) — Hiến pháp quy chuẩn Giao diện Đọc, truy cập mở và thẩm mỹ *Ấn Bản Giấy Cotton*.
- [PROJECT_JOURNAL.md](./docs/handbook/PROJECT_JOURNAL.md) — Nhật ký tiến hóa qua các chặng và trạng thái bàn giao dự án.
- [CAM_NANG_THU_VIEN_DOI_MO.md](./docs/handbook/CAM_NANG_THU_VIEN_DOI_MO.md) — Cẩm nang thiết kế, bảng màu, chuẩn tiếng Việt 134/134 dấu và thông số media.
- [QUY_TRINH_THU_VIEN_DOI_MO.md](./docs/handbook/QUY_TRINH_THU_VIEN_DOI_MO.md) — Quy trình vận hành Không gian 6 Lớp, xuất bản `/admin` và kiểm duyệt nâng cấp.
- [KIEN_TRUC_TRI_THUC_DOI_MO.md](./docs/handbook/KIEN_TRUC_TRI_THUC_DOI_MO.md) — Kiến trúc Tri thức v2.0 và danh mục xuất bản khai phóng (11–15 tuổi).

### Đặc tả Kỹ thuật & Mockup (`docs/specs/`, `docs/mockups/`)
- [ARCHITECTURE.md](./docs/specs/ARCHITECTURE.md) — Kiến trúc Dual-Engine (JSON cục bộ & Supabase + Cloudflare R2).
- [DESIGN_SYSTEM.md](./docs/specs/DESIGN_SYSTEM.md) — Hệ thống token thị giác *Ấn Bản Giấy Cotton*.
- [OPTIMAL_UX_DESIGN_BRIEF.md](./docs/specs/OPTIMAL_UX_DESIGN_BRIEF.md) — Đặc tả trải nghiệm Không gian 6 Lớp.
- [PRD.md](./docs/specs/PRD.md) · [PRD_REVIEW.md](./docs/specs/PRD_REVIEW.md) · [UX_FLOWS.md](./docs/specs/UX_FLOWS.md) · [SCREEN_SPECIFICATIONS.md](./docs/specs/SCREEN_SPECIFICATIONS.md) — Bộ hồ sơ đặc tả ban đầu.
- [Mockup Spatial v2](./docs/mockups/spatial-v2/README.md) · [Mockup Package A](./docs/mockups/package-a/README.md) — Bộ màn hình đối chiếu `390px`.

---

## Khởi chạy & Kiểm tra Cục bộ

```bash
# Chạy môi trường phát triển tại http://localhost:3000
npm run dev

# Kiểm tra toàn vẹn TypeScript và đóng gói sản phẩm Next.js
npm run typecheck && npm run build
```
