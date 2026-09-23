# -*- coding: utf-8 -*-
"""
Master Book Dossier & Canonical Intertextuality Datasets for New Testament (Books 40-66).
Combines Part 1 (40-53) and Part 2 (54-66).
"""
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from dossier_intertext_nt_part1 import DOSSIER_INTERTEXT_NT_PART1
from dossier_intertext_nt_part2 import DOSSIER_INTERTEXT_NT_PART2

DOSSIER_INTERTEXT_NT = {}
DOSSIER_INTERTEXT_NT.update(DOSSIER_INTERTEXT_NT_PART1)
DOSSIER_INTERTEXT_NT.update(DOSSIER_INTERTEXT_NT_PART2)

assert len(DOSSIER_INTERTEXT_NT) == 27, f"Expected 27 NT books, got {len(DOSSIER_INTERTEXT_NT)}"

if __name__ == "__main__":
    print(f"Successfully loaded all {len(DOSSIER_INTERTEXT_NT)} New Testament Dossier & Intertextuality datasets.")
    for b_no in range(40, 67):
        assert b_no in DOSSIER_INTERTEXT_NT, f"Missing NT book #{b_no}"
        d = DOSSIER_INTERTEXT_NT[b_no]
        assert "bookDossier" in d and len(d["bookDossier"]) >= 6
        assert "canonicalIntertextuality" in d and len(d["canonicalIntertextuality"]["citations"]) >= 2
    print("All 27 NT books verified successfully!")
