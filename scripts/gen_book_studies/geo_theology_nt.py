# -*- coding: utf-8 -*-
"""
Master Biblical Geography Maps & Theological Matrix Datasets for New Testament (Books 40-66).
Combines Part 1 (40-53) and Part 2 (54-66).
"""
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from geo_theology_nt_part1 import GEO_THEOLOGY_NT_PART1
from geo_theology_nt_part2 import GEO_THEOLOGY_NT_PART2

GEO_THEOLOGY_NT = {}
GEO_THEOLOGY_NT.update(GEO_THEOLOGY_NT_PART1)
GEO_THEOLOGY_NT.update(GEO_THEOLOGY_NT_PART2)

assert len(GEO_THEOLOGY_NT) == 27, f"Expected 27 NT books, got {len(GEO_THEOLOGY_NT)}"

if __name__ == "__main__":
    print(f"Successfully loaded all {len(GEO_THEOLOGY_NT)} New Testament Geography & Theology Matrices.")
    for b_no in range(40, 67):
        assert b_no in GEO_THEOLOGY_NT, f"Missing NT book #{b_no}"
        d = GEO_THEOLOGY_NT[b_no]
        assert "geographyMap" in d and len(d["geographyMap"]["routeStages"]) >= 3
        assert "theologyMatrixChart" in d and len(d["theologyMatrixChart"]["comparisonRows"]) >= 2
    print("All 27 NT books verified successfully!")
