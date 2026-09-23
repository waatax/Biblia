# -*- coding: utf-8 -*-
"""
Master Biblical Geography Maps & Theological Matrix Datasets for Old Testament (Books 1-39).
Combines Part 1 (1-10), Part 2 (11-22), and Part 3 (23-39).
"""
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from geo_theology_ot_part1 import GEO_THEOLOGY_OT_PART1
from geo_theology_ot_part2 import GEO_THEOLOGY_OT_PART2
from geo_theology_ot_part3 import GEO_THEOLOGY_OT_PART3

GEO_THEOLOGY_OT = {}
GEO_THEOLOGY_OT.update(GEO_THEOLOGY_OT_PART1)
GEO_THEOLOGY_OT.update(GEO_THEOLOGY_OT_PART2)
GEO_THEOLOGY_OT.update(GEO_THEOLOGY_OT_PART3)

assert len(GEO_THEOLOGY_OT) == 39, f"Expected 39 OT books, got {len(GEO_THEOLOGY_OT)}"

if __name__ == "__main__":
    print(f"Successfully loaded all {len(GEO_THEOLOGY_OT)} Old Testament Geography & Theology Matrices.")
    for b_no in range(1, 40):
        assert b_no in GEO_THEOLOGY_OT, f"Missing OT book #{b_no}"
        d = GEO_THEOLOGY_OT[b_no]
        assert "geographyMap" in d and len(d["geographyMap"]["routeStages"]) >= 3
        assert "theologyMatrixChart" in d and len(d["theologyMatrixChart"]["comparisonRows"]) >= 2
    print("All 39 OT books verified successfully!")
