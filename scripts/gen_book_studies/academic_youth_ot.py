# -*- coding: utf-8 -*-
"""
Master Academic Paper Caliber Research & Youth/Beginner Field Guides for Old Testament (Books 1-39).
Combines Part 1 (1-10), Part 2 (11-22), and Part 3 (23-39).
"""
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from academic_youth_ot_part1 import ACADEMIC_YOUTH_OT_PART1
from academic_youth_ot_part2 import ACADEMIC_YOUTH_OT_PART2
from academic_youth_ot_part3 import ACADEMIC_YOUTH_OT_PART3

ACADEMIC_YOUTH_OT = {}
ACADEMIC_YOUTH_OT.update(ACADEMIC_YOUTH_OT_PART1)
ACADEMIC_YOUTH_OT.update(ACADEMIC_YOUTH_OT_PART2)
ACADEMIC_YOUTH_OT.update(ACADEMIC_YOUTH_OT_PART3)

assert len(ACADEMIC_YOUTH_OT) == 39, f"Expected 39 OT books, got {len(ACADEMIC_YOUTH_OT)}"

if __name__ == "__main__":
    print(f"Successfully loaded all {len(ACADEMIC_YOUTH_OT)} Old Testament Academic & Youth guides.")
    for b_no in range(1, 40):
        assert b_no in ACADEMIC_YOUTH_OT, f"Missing OT book #{b_no}"
        d = ACADEMIC_YOUTH_OT[b_no]
        assert "academicPaper" in d and d["academicPaper"]["thesis"]
        assert "youthGuide" in d and d["youthGuide"]["hookQuestion"]
        assert "macroStructureChart" in d and len(d["macroStructureChart"]["stages"]) >= 3
    print("All 39 OT books verified successfully!")
