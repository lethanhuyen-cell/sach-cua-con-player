#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CÔNG CỤ TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU THƯ VIỆN SÁCH NÓI CHO WEB APP & PWA
Dự án: Truyện Kể Thiên Nhiên Ru Ngủ Cho Bé
"""

import os
import re
import json

BASE_DIR = "/Users/mac/Desktop/SÁCH CỦA CON"
TAC_PHAM_DIR = os.path.join(BASE_DIR, "02_TAC_PHAM_HOAN_CHINH")
WEB_DIR = os.path.join(BASE_DIR, "web_sach_cua_con")
DATA_FILE = os.path.join(WEB_DIR, "data", "episodes.json")
HUB_AUDIO_DIR = os.path.join(BASE_DIR, "AUDIO_HANG_DEM_CHO_BE_48KHZ")

FOLDERS = [
    ("00", "Chuong_00_Khoi_Nguyen_Thung_Lung_Rung_Phong", "Cội nguồn", "🌳"),
    ("01", "Dem_001_Bac_Cho_Barley", "Thú kỳ diệu", "🐕"),
    ("02", "Dem_002_Co_Meo_Amber", "Thú kỳ diệu", "🐱"),
    ("03", "Dem_003_Bac_Bo_Barnaby", "Thú kỳ diệu", "🐂"),
    ("04", "Dem_004_Bac_Trau_Brook", "Thú kỳ diệu", "🐃"),
    ("05", "Dem_005_Anh_Ngua_Tawny", "Thú kỳ diệu", "🐎"),
    ("06", "Dem_006_Bac_De_Bramble", "Thú kỳ diệu", "🐐"),
    ("07", "Dem_007_Co_Cuu_Daisy", "Thú kỳ diệu", "🐑"),
    ("08", "Dem_008_Bac_Lon_Pip", "Thú kỳ diệu", "🐖"),
    ("09", "Dem_009_Ban_Tho_Hazel", "Thú kỳ diệu", "🐇"),
    ("10", "Dem_010_Chu_Chuot_Dusty", "Thú kỳ diệu", "🐭"),
]

def extract_episode_data(ep_num, folder_name, category, icon):
    folder_path = os.path.join(TAC_PHAM_DIR, folder_name)
    md_path = os.path.join(folder_path, "01_Ban_Thao_Van_Hoc_Chuan.md")
    
    if not os.path.exists(md_path):
        return None
        
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = content.strip().split("\n")
    title_line = lines[0].replace("# ", "").strip()
    
    # Tách số tập và tên
    # Ví dụ: TẬP 01: BÁC CHÓ BARLEY VÀ CHIẾC MŨI THẦN KỲ
    title_clean = title_line
    
    # Trích xuất kỷ vật túi da
    relic = "Kỷ vật thiên nhiên"
    relic_match = re.search(r'(chiếc túi da thuộc[^.\n]+?\.)', content, re.IGNORECASE)
    if relic_match:
        relic = relic_match.group(1).strip()
        
    # Trích xuất tóm tắt ngắn từ cảnh 1
    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip() and not p.startswith("#") and not p.startswith("---") and p != "❦"]
    summary = paragraphs[0] if paragraphs else ""
    if len(summary) > 180:
        summary = summary[:180] + "..."
        
    # Tìm file audio tương ứng cho cả 2 giọng (Mỹ Duyên & Thiền Tâm Đức)
    audio_female = ""
    audio_male = ""
    audio_default = ""

    if os.path.exists(HUB_AUDIO_DIR):
        for f in sorted(os.listdir(HUB_AUDIO_DIR)):
            if f.startswith(f"{ep_num}_") and f.endswith(".mp3"):
                if "Thien_Tam_Duc" in f:
                    audio_male = f"audio/{f}"
                elif "My_Duyen" in f:
                    audio_female = f"audio/{f}"
                elif not audio_default:
                    audio_default = f"audio/{f}"

    if not audio_female and audio_default:
        audio_female = audio_default
    
    word_count = len(content.split())
    
    return {
        "id": ep_num,
        "title": title_clean,
        "category": category,
        "icon": icon,
        "summary": summary,
        "relic": relic,
        "words": word_count,
        "duration": f"~{round(word_count / 150)} phút",
        "audio": audio_female or audio_default,
        "audio_female": audio_female or audio_default,
        "audio_male": audio_male,
        "content": content
    }

def sync():
    episodes = []
    for ep_num, folder, cat, icon in FOLDERS:
        data = extract_episode_data(ep_num, folder, cat, icon)
        if data:
            episodes.append(data)
            print(f"✅ Đã nạp: [{data['id']}] {data['title']} ({data['duration']})")
            
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(episodes, f, ensure_ascii=False, indent=2)
        
    print(f"\n🎉 Đã cập nhật database thành công: {DATA_FILE} ({len(episodes)} tập)")

if __name__ == "__main__":
    sync()
