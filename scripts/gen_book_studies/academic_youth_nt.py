# -*- coding: utf-8 -*-
"""
Master Academic Paper Caliber Research & Youth/Beginner Field Guides for New Testament (Books 40-66).
Combines Part 1 (40-52), Part 2 (53-57), and Part 3 (58-66).
"""
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from academic_youth_nt_part1 import ACADEMIC_YOUTH_NT_PART1
from academic_youth_nt_part2 import ACADEMIC_YOUTH_NT_PART2
from academic_youth_nt_part3 import ACADEMIC_YOUTH_NT_PART3

ACADEMIC_YOUTH_NT = {}
ACADEMIC_YOUTH_NT.update(ACADEMIC_YOUTH_NT_PART1)
ACADEMIC_YOUTH_NT.update(ACADEMIC_YOUTH_NT_PART2)
ACADEMIC_YOUTH_NT.update(ACADEMIC_YOUTH_NT_PART3)

assert len(ACADEMIC_YOUTH_NT) == 27, f"Expected 27 NT books, got {len(ACADEMIC_YOUTH_NT)}"

if __name__ == "__main__":
    print(f"Successfully loaded all {len(ACADEMIC_YOUTH_NT)} New Testament Academic & Youth guides.")
    for b_no in range(40, 67):
        assert b_no in ACADEMIC_YOUTH_NT, f"Missing NT book #{b_no}"
        d = ACADEMIC_YOUTH_NT[b_no]
        assert "academicPaper" in d and d["academicPaper"]["thesis"]
        assert "youthGuide" in d and d["youthGuide"]["hookQuestion"]
        assert "macroStructureChart" in d and len(d["macroStructureChart"]["stages"]) >= 3
    print("All 27 NT books verified successfully!")
