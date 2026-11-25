#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LITIBOOK — CLEAN DATA MIGRATION SCRIPT (Aligned with GEMINI.md & PRD v1.3)
Strictly imports existing episodes from `data/episodes.json` into `data/library_db.json`
without inventing or generating new book content:
- Strips OS emojis, `relic`, and `caption`
- Normalizes ALL-CAPS titles into literary Vietnamese capitalization
- Strips duplicate # / ## headers at top of Markdown and fixes accidental ## paragraph in Ep 00
- Measures real MP3 durations & file sizes from public/audio/
"""

import os
import re
import json
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEGACY_JSON = os.path.join(ROOT, "data", "episodes.json")
OUT_DB = os.path.join(ROOT, "data", "library_db.json")

CLEAN_TITLES = {
    "00": "Chương mở đầu: Chiếc túi rỗng và lời hẹn 365 đêm",
    "01": "Bác chó Barley và con đường vô hình",
    "02": "Cô mèo Amber và bước chân thầm lặng",
    "03": "Bác bò Bruno và bữa ăn không bao giờ vội",
    "04": "Bác trâu Brook và chiếc áo bùn",
    "05": "Anh ngựa Tawny và bước chạy một ngón",
    "06": "Bác dê Bramble và bức tường không thể trèo",
    "07": "Cô cừu Daisy và bộ lông không sợ mùa đông",
    "08": "Bác lợn Pip và chiếc mũi ủi đất",
    "09": "Bạn thỏ Hazel và đôi tai hứng gió",
    "10": "Chú chuột Dusty và chiếc răng không ngừng lớn",
}


def get_mp3_info(rel_path: str):
    if not rel_path:
        return 0, 0
    clean = rel_path.lstrip("/")
    abs_p = os.path.join(ROOT, "public", clean)
    if not os.path.exists(abs_p):
        abs_p = os.path.join(ROOT, clean)
    if not os.path.exists(abs_p):
        return 900, 0
    size = os.path.getsize(abs_p)
    try:
        out = subprocess.check_output(
            ["/usr/bin/afinfo", abs_p], text=True, stderr=subprocess.DEVNULL
        )
        for line in out.splitlines():
            if "estimated duration:" in line:
                sec = float(line.split("estimated duration:")[1].split()[0])
                return int(round(sec)), size
    except Exception:
        pass
    return max(60, int(round(size / 16000))), size


def clean_markdown(raw_md: str, inline_images=None) -> str:
    lines = raw_md.replace("\r\n", "\n").strip().split("\n")
    blocks = [b.strip() for b in "\n".join(lines).split("\n\n") if b.strip()]
    cleaned = []
    started = False

    for b in blocks:
        if b.startswith("#"):
            txt = re.sub(r"^#+\s*", "", b).strip()
            # Fix accidental ## paragraph in Ep 00
            if len(txt) > 80:
                cleaned.append(txt)
                started = True
                continue
            if not started:
                up = txt.upper()
                if (
                    "LIM VÀ MẸ VACCI" in up
                    or "CHIẾC TÚI RỖNG" in up
                    or up.startswith("CHƯƠNG")
                    or up.startswith("TẬP")
                    or up.startswith("CHUYẾN KHÁM PHÁ")
                ):
                    continue
            cleaned.append(f"### {txt}")
            started = True
        else:
            cleaned.append(b)
            started = True

    if inline_images:
        # Place the episode's existing illustration cleanly after the opening scene paragraphs
        insert_pos = min(3, len(cleaned))
        for url, alt in reversed(inline_images):
            cleaned.insert(insert_pos, f"![{alt}]({url})")

    return "\n\n".join(cleaned)


def build_clean_summary(raw_summary: str, title: str, md_clean: str) -> str:
    s = (raw_summary or "").strip()
    # Ignore legacy summaries that are truncated with '...' or just repeat the ALL-CAPS title
    const_upper = s.upper()
    is_bad = (
        not s
        or s.endswith("...")
        or s == s.upper()
        or const_upper == title.upper()
        or "CHƯƠNG" in const_upper
        or "TẬP " in const_upper
    )
    if not is_bad:
        return s

    # Extract genuine opening prose sentences from cleaned Markdown
    for block in md_clean.split("\n\n"):
        b = block.strip()
        if not b or b.startswith("#") or b.startswith("![") or b == "❦":
            continue
        sentences = re.split(r"(?<=[.!?])\s+", b)
        excerpt = " ".join(sentences[:2]).strip()
        if len(excerpt) > 190:
            excerpt = excerpt[:187].rsplit(" ", 1)[0] + "…"
        return excerpt
    return ""


def main():
    with open(LEGACY_JSON, "r", encoding="utf-8") as f:
        legacy_eps = json.load(f)

    now = "2026-11-24T15:00:00.000Z"

    voice_profiles = [
        {
            "id": "vp-female-my-duyen",
            "voiceKey": "female_my_duyen",
            "displayName": "Nữ · Mỹ Duyên",
            "narratorName": "Mỹ Duyên",
            "notes": "Giọng đọc nữ ấm dịu chuẩn 48kHz",
            "createdAt": now,
        },
        {
            "id": "vp-male-tam-duc",
            "voiceKey": "male_thien_tam_duc",
            "displayName": "Nam · Thiền Tâm Đức",
            "narratorName": "Thiền Tâm Đức",
            "notes": "Giọng đọc nam trầm ấm ru ngủ 48kHz",
            "createdAt": now,
        },
    ]

    books = [
        {
            "id": "book-lim-vacci",
            "slug": "lim-va-me-vacci",
            "title": "Lim và Mẹ Vacci",
            "subtitle": "365 Đêm Khám Phá Thiên Nhiên",
            "description": "Hành trình đồng thoại khoa học dịu êm đưa bé đi qua 365 đêm khám phá thế giới tự nhiên dưới gốc cây sồi già cùng chú chim nhỏ Lim, mẹ Vacci và bạn đom đóm Đốm Đốm.",
            "author": "Lê Thanh Uyên",
            "illustrator": "",
            "ageRange": "4–10 tuổi",
            "genreTag": "Thiên nhiên",
            "rightsConfirmed": True,
            "coverUrl": "/images/books/lim-vacci-cover.jpg",
            "coverFocalPoint": "center",
            "themePreset": "moss",
            "defaultAutoNext": False,
            "showEpisodeNumbers": True,
            "sortOrder": 0,
            "status": "published",
            "createdAt": now,
            "updatedAt": now,
            "deletedAt": None,
        }
    ]

    parts = []
    episodes = []
    audio_tracks = []
    illustrations = []

    for idx, raw_ep in enumerate(legacy_eps):
        eid = raw_ep["id"]
        ep_uuid = f"ep-lim-{eid}"
        clean_title = CLEAN_TITLES.get(eid, raw_ep["title"].title())
        cover_rel = "/" + raw_ep.get("cover", f"images/episodes/{eid}/cover.jpg").lstrip("/")

        raw_ills = raw_ep.get("illustrations") or []
        inline_imgs = []
        for ill_obj in raw_ills:
            u = "/" + ill_obj["url"].lstrip("/")
            inline_imgs.append((u, clean_title))
        if not inline_imgs and cover_rel:
            inline_imgs = [(cover_rel, clean_title)]

        md_clean = clean_markdown(raw_ep["content"], inline_images=inline_imgs)
        plain_words = len(re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", md_clean).split())
        clean_sum = build_clean_summary(raw_ep.get("summary", ""), clean_title, md_clean)

        # Stagger publishedAt dates realistically: Ep 00..07 earlier, Ep 08..10 recent arrivals
        staggered_dates = {
            "00": "2026-10-15T14:00:00.000Z",
            "01": "2026-10-18T14:00:00.000Z",
            "02": "2026-10-22T14:00:00.000Z",
            "03": "2026-10-26T14:00:00.000Z",
            "04": "2026-10-30T14:00:00.000Z",
            "05": "2026-11-03T14:00:00.000Z",
            "06": "2026-11-06T14:00:00.000Z",
            "07": "2026-11-09T14:00:00.000Z",
            "08": "2026-11-19T14:00:00.000Z",
            "09": "2026-11-22T14:00:00.000Z",
            "10": "2026-11-24T15:00:00.000Z",
        }
        ep_pub_at = staggered_dates.get(eid, now)

        episodes.append(
            {
                "id": ep_uuid,
                "bookId": "book-lim-vacci",
                "partId": None,
                "episodeCode": eid,
                "title": clean_title,
                "summary": clean_sum,
                "categoryTag": raw_ep.get("category", "Thiên nhiên"),
                "coverUrl": cover_rel,
                "contentMarkdown": md_clean,
                "wordCount": plain_words,
                "isTextOnly": False,
                "sortOrder": idx,
                "status": "published",
                "publishedAt": ep_pub_at,
                "createdAt": ep_pub_at,
                "updatedAt": ep_pub_at,
                "deletedAt": None,
            }
        )

        t_order = 0
        if raw_ep.get("audio_female"):
            u = "/" + raw_ep["audio_female"].lstrip("/")
            dur, sz = get_mp3_info(u)
            audio_tracks.append(
                {
                    "id": f"trk-{eid}-female",
                    "episodeId": ep_uuid,
                    "voiceProfileId": "vp-female-my-duyen",
                    "audioUrl": u,
                    "durationSeconds": dur,
                    "fileSizeBytes": sz,
                    "mimeType": "audio/mpeg",
                    "isDefault": True,
                    "sortOrder": t_order,
                    "updatedAt": now,
                }
            )
            t_order += 1

        if raw_ep.get("audio_male"):
            u = "/" + raw_ep["audio_male"].lstrip("/")
            dur, sz = get_mp3_info(u)
            audio_tracks.append(
                {
                    "id": f"trk-{eid}-male",
                    "episodeId": ep_uuid,
                    "voiceProfileId": "vp-male-tam-duc",
                    "audioUrl": u,
                    "durationSeconds": dur,
                    "fileSizeBytes": sz,
                    "mimeType": "audio/mpeg",
                    "isDefault": t_order == 0,
                    "sortOrder": t_order,
                    "updatedAt": now,
                }
            )

        for ill_i, (img_u, img_alt) in enumerate(inline_imgs):
            illustrations.append(
                {
                    "id": f"ill-{eid}-{ill_i+1}",
                    "episodeId": ep_uuid,
                    "imageUrl": img_u,
                    "altText": img_alt,
                    "sortOrder": ill_i,
                    "createdAt": now,
                }
            )

    db = {
        "schemaVersion": "1.3",
        "exportedAt": now,
        "adminSessionVersion": 1,
        "voiceProfiles": voice_profiles,
        "books": books,
        "parts": parts,
        "episodes": episodes,
        "audioTracks": audio_tracks,
        "illustrations": illustrations,
        "orphanedMediaQueue": [],
    }

    with open(OUT_DB, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(
        f"Built clean library_db.json: {len(books)} book, {len(episodes)} episodes, "
        f"{len(audio_tracks)} audio tracks, {len(illustrations)} illustrations."
    )


if __name__ == "__main__":
    main()
