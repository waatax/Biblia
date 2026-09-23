# -*- coding: utf-8 -*-
"""
Master Book Dossier & Canonical Intertextuality Datasets for Old Testament (Books 1-39).
Combines Part 1 (1-10), Part 2 (11-22), and Part 3 (23-39).
"""
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from dossier_intertext_ot_part1 import DOSSIER_INTERTEXT_OT_PART1
from dossier_intertext_ot_part2 import DOSSIER_INTERTEXT_OT_PART2
from dossier_intertext_ot_part3 import DOSSIER_INTERTEXT_OT_PART3

DOSSIER_INTERTEXT_OT = {}
DOSSIER_INTERTEXT_OT.update(DOSSIER_INTERTEXT_OT_PART1)
DOSSIER_INTERTEXT_OT.update(DOSSIER_INTERTEXT_OT_PART2)
DOSSIER_INTERTEXT_OT.update(DOSSIER_INTERTEXT_OT_PART3)

assert len(DOSSIER_INTERTEXT_OT) == 39, f"Expected 39 OT books, got {len(DOSSIER_INTERTEXT_OT)}"

if __name__ == "__main__":
    print(f"Successfully loaded all {len(DOSSIER_INTERTEXT_OT)} Old Testament Dossier & Intertextuality datasets.")
    for b_no in range(1, 40):
        assert b_no in DOSSIER_INTERTEXT_OT, f"Missing OT book #{b_no}"
        d = DOSSIER_INTERTEXT_OT[b_no]
        assert "bookDossier" in d and len(d["bookDossier"]) >= 6
        assert "canonicalIntertextuality" in d and len(d["canonicalIntertextuality"]["citations"]) >= 2
    print("All 39 OT books verified successfully!")
