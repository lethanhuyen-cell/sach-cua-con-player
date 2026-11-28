#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CÔNG CỤ TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU THƯ VIỆN SÁCH NÓI CHO WEB APP & PWA
Dự án: Truyện Kể Thiên Nhiên Ru Ngủ Cho Bé
"""

import os
import re
import json
import shutil

BASE_DIR = "/Users/mac/Desktop/SÁCH CỦA CON"
TAC_PHAM_DIR = os.path.join(BASE_DIR, "02_TAC_PHAM_HOAN_CHINH")
WEB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(WEB_DIR, "data", "seeds", "episodes.json")
HUB_AUDIO_DIR = os.path.join(BASE_DIR, "AUDIO_HANG_DEM_CHO_BE_48KHZ")

FOLDERS = [
    ("00", "Chuong_00_Khoi_Nguyen_Thung_Lung_Rung_Phong", "Cội nguồn", "🌳"),
    ("01", "Dem_001_Bac_Cho_Barley", "Thú kỳ diệu", "🐕"),
    ("02", "Dem_002_Co_Meo_Amber", "Thú kỳ diệu", "🐱"),
    ("03", "Dem_003_Bac_Bo_Bruno", "Thú kỳ diệu", "🐂"),
    ("04", "Dem_004_Bac_Trau_Brook", "Thú kỳ diệu", "🐃"),
    ("05", "Dem_005_Anh_Ngua_Tawny", "Thú kỳ diệu", "🐎"),
    ("06", "Dem_006_Bac_De_Bramble", "Thú kỳ diệu", "🐐"),
    ("07", "Dem_007_Co_Cuu_Daisy", "Thú kỳ diệu", "🐑"),
    ("08", "Dem_008_Bac_Lon_Pip", "Thú kỳ diệu", "🐖"),
    ("09", "Dem_009_Ban_Tho_Hazel", "Thú kỳ diệu", "🐇"),
    ("10", "Dem_010_Chu_Chuot_Dusty", "Thú kỳ diệu", "🐭"),
]

CANON_RELICS = {
    "00": "Chiếc túi da mở đầu & cuốn sổ hành trình",
    "01": "Mẩu gỗ thông thơm của bác Barley",
    "02": "Sợi râu trắng bạc của cô mèo Amber",
    "03": "Nhánh cỏ ba lá khô trên đồng cỏ",
    "04": "Chiếc lông cò trắng bên đầm lầy",
    "05": "Chiếc đinh móng ngựa mộc mạc",
    "06": "Mẩu đá muối nơi vách núi cao",
    "07": "Búp lông cừu ấm nắng mùa thu",
    "08": "Mẩu vỏ hạt dẻ rừng của bác Pip",
    "09": "Chiếc lông tơ mềm mại của bạn Hazel",
    "10": "Hạt lúa mì vàng óng trong cối xay gió",
}

def extract_episode_data(ep_num, folder_name, category, icon):
    folder_path = os.path.join(TAC_PHAM_DIR, folder_name)
    md_path = os.path.join(folder_path, "01_Ban_Thao_Van_Hoc_Chuan.md")
    
    if not os.path.exists(md_path):
        return None
        
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = [l.strip() for l in content.strip().split("\n") if l.strip()]
    
    # Chuẩn hóa trích xuất Tiêu đề tập truyện
    title_clean = ""
    if ep_num == "00":
        title_clean = "CHƯƠNG MỞ ĐẦU: CHIẾC TÚI RỖNG VÀ LỜI HẸN 365 ĐÊM"
    else:
        # Tìm dòng tên tập chính
        candidate_lines = []
        for l in lines[:10]:
            clean_l = l.replace("#", "").strip()
            if not clean_l:
                continue
            if "LIM VÀ MẸ VACCI" in clean_l.upper():
                continue
            if re.match(r'^(tập\s+\d+|chuyến khám phá[^:]*):?$', clean_l, re.IGNORECASE):
                continue
            if any(k in clean_l.upper() for k in ["BÁC", "CÔ", "CHÚ", "ANH", "BẠN", "VÀ"]):
                candidate_lines.append(clean_l)
                
        if candidate_lines:
            main_name = candidate_lines[0]
        else:
            main_name = lines[0].replace("#", "").strip()
            
        title_clean = f"TẬP {ep_num}: {main_name}"
        if main_name.upper().startswith(f"TẬP {ep_num}:"):
            title_clean = main_name
    
    # Trích xuất kỷ vật túi da chuẩn Canon (hoặc tự động quét cho các tập mới)
    relic = CANON_RELICS.get(ep_num, "")
    if not relic:
        relic_match = re.search(
            r'(?:gắp lấy|nhặt lấy|đặt)\s+([^.\n]{4,70}?)\s+(?:vào\s+chiếc\s+túi|nằm\s+(?:cạnh|ngay ngắn|êm ái))',
            content,
            re.IGNORECASE,
        )
        if relic_match:
            raw_r = relic_match.group(1).strip()
            relic = raw_r[0].upper() + raw_r[1:]
        else:
            fallback_match = re.search(r'(chiếc túi da[^.\n]+?\.)', content, re.IGNORECASE)
            relic = fallback_match.group(1).strip() if fallback_match else "Kỷ vật thiên nhiên Thung Lũng Rừng Phong"
        
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
                    audio_male = f"audio/lim-va-me-vacci/{f}"
                elif "My_Duyen" in f:
                    audio_female = f"audio/lim-va-me-vacci/{f}"
                else:
                    # Các file gốc chưa gắn nhãn đều là giọng Nam (Thiền Tâm Đức)
                    if not audio_male:
                        audio_male = f"audio/lim-va-me-vacci/{f}"
                    if not audio_default:
                        audio_default = f"audio/lim-va-me-vacci/{f}"

    # Đặt file audio mặc định
    if audio_female:
        audio_default = audio_female
    elif audio_male:
        audio_default = audio_male
    
    # Tự động quét bìa và tranh minh họa màu nước Miền Dâu Dại
    illustrations = []
    cover_url = ""
    ep_img_dir = os.path.join(WEB_DIR, "public", "images", "episodes", "lim-va-me-vacci", ep_num)
    if os.path.exists(ep_img_dir):
        for img_file in sorted(os.listdir(ep_img_dir)):
            if img_file.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                rel_u = f"images/episodes/lim-va-me-vacci/{ep_num}/{img_file}"
                if img_file.startswith("cover."):
                    cover_url = rel_u
                illustrations.append({
                    "url": rel_u,
                    "caption": f"{title_clean.title()} — Minh họa màu nước Miền Dâu Dại"
                })

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
        "audio": audio_female or audio_male or "",
        "audio_female": audio_female,
        "audio_male": audio_male,
        "cover": cover_url,
        "illustrations": illustrations,
        "content": content
    }

def sync_audio_directories():
    """Đồng bộ 1-1 toàn bộ file MP3 từ HUB_AUDIO_DIR sang public/audio/lim-va-me-vacci/."""
    if not os.path.exists(HUB_AUDIO_DIR):
        return
    src_mp3s = {f for f in os.listdir(HUB_AUDIO_DIR) if f.endswith(".mp3")}
    dst_dir = os.path.join(WEB_DIR, "public", "audio", "lim-va-me-vacci")
    os.makedirs(dst_dir, exist_ok=True)
    # Xóa file mp3 cũ không còn tồn tại ở kho Master
    for existing in os.listdir(dst_dir):
        if existing.endswith(".mp3") and existing not in src_mp3s:
            os.remove(os.path.join(dst_dir, existing))
    # Sao chép file mới hoặc file có thay đổi kích thước/thời gian
    for f in sorted(src_mp3s):
        s_file = os.path.join(HUB_AUDIO_DIR, f)
        d_file = os.path.join(dst_dir, f)
        if not os.path.exists(d_file) or os.path.getsize(s_file) != os.path.getsize(d_file):
            shutil.copy2(s_file, d_file)
    print(f"Da dong bo {len(src_mp3s)} file am thanh 48kHz sang /public/audio/lim-va-me-vacci/.")

def sync():
    sync_audio_directories()
    episodes = []
    for ep_num, folder, cat, icon in FOLDERS:
        data = extract_episode_data(ep_num, folder, cat, icon)
        if data:
            episodes.append(data)
            f_tag = "Nữ✓" if data["audio_female"] else "Nữ✗"
            m_tag = "Nam✓" if data["audio_male"] else "Nam✗"
            print(f"Da nap: [{data['id']}] {data['title']} ({data['duration']}) | [{f_tag} | {m_tag}]")
            
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(episodes, f, ensure_ascii=False, indent=2)
        
    print(f"\nDa cap nhat database thanh cong: {DATA_FILE} ({len(episodes)} tap)")

if __name__ == "__main__":
    sync()
