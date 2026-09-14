# -*- coding: utf-8 -*-
"""
Biblia Expert Council 66-Book Master Database.
Combines Part 1 (OT1: 1-17), Part 2 (OT2: 18-39), and Part 3 (NT: 40-66).
Total: 66 books, 7 seats each.
"""
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from expert_data_ot1 import EXPERT_DATA_OT1
from expert_data_ot2 import EXPERT_DATA_OT2
from expert_data_nt import EXPERT_DATA_NT

EXPERT_COUNCIL_ALL_BOOKS = {}
EXPERT_COUNCIL_ALL_BOOKS.update(EXPERT_DATA_OT1)
EXPERT_COUNCIL_ALL_BOOKS.update(EXPERT_DATA_OT2)
EXPERT_COUNCIL_ALL_BOOKS.update(EXPERT_DATA_NT)

assert len(EXPERT_COUNCIL_ALL_BOOKS) == 66, f"Expected 66 books, got {len(EXPERT_COUNCIL_ALL_BOOKS)}"

# Expert Seat Meta Definitions
EXPERT_SEATS_INFO = [
    {
        "id": "covenantTheology",
        "seatNo": 1,
        "name": "正統聖約神學席",
        "title": "Covenant Theology",
        "icon": "fa-scroll",
        "desc": "救贖歷史推進、恩典之約階段定位與神聖主權護理"
    },
    {
        "id": "originalLanguages",
        "seatNo": 2,
        "name": "閃族與希臘語文學席",
        "title": "Philology & Strong Exegesis",
        "icon": "fa-language",
        "desc": "希伯來文/希臘文詞形語義、字根探源與 Strong 原文微膠囊"
    },
    {
        "id": "archaeology",
        "seatNo": 3,
        "name": "古代近東考古與地理席",
        "title": "Archaeology & Geography",
        "icon": "fa-monument",
        "desc": "古代泥版、碑文、年表、古城火燒層與第一世紀考古實證"
    },
    {
        "id": "christologyTypology",
        "seatNo": 4,
        "name": "正典互文與基督論席",
        "title": "Canonical Christology",
        "icon": "fa-cross",
        "desc": "舊約影子預表、彌賽亞預言與新約耶穌基督終極應驗"
    },
    {
        "id": "apologeticsOrthodoxy",
        "seatNo": 5,
        "name": "正統教義防衛與護教學席",
        "title": "Apologetics & Orthodoxy",
        "icon": "fa-shield-halved",
        "desc": "駁斥自由派質疑、消解難題、建立反異端神學防線"
    },
    {
        "id": "pastoralDiscipleship",
        "seatNo": 6,
        "name": "教牧釋經與信徒門訓席",
        "title": "Pastoral & Discipleship",
        "icon": "fa-hands-holding-child",
        "desc": "威斯敏斯特/海德堡要理問答對應、成聖生活、家庭與苦難安慰"
    },
    {
        "id": "literaryArtistry",
        "seatNo": 7,
        "name": "文學修辭與和風文庫工藝席",
        "title": "Literary & Japanese Aesthetics",
        "icon": "fa-feather-pointed",
        "desc": "希伯來平行對偶、交錯結構 (Chiasm)、戲劇張力與文庫閱讀呼吸節奏"
    }
]

if __name__ == "__main__":
    print(f"Verified EXPERT_COUNCIL_ALL_BOOKS: {len(EXPERT_COUNCIL_ALL_BOOKS)} books present!")
    for i in range(1, 67):
        assert i in EXPERT_COUNCIL_ALL_BOOKS, f"Book {i} missing!"
        for seat in EXPERT_SEATS_INFO:
            seat_id = seat["id"]
            assert seat_id in EXPERT_COUNCIL_ALL_BOOKS[i], f"Book {i} missing seat {seat_id}!"
    print("ALL 66 BOOKS & 7 SEATS 100% VALIDATED!")
