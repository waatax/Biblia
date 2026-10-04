# -*- coding: utf-8 -*-
"""（已併入 build_layers.py）

Strong 反向索引現在與經文分層檔一起由 build_layers.py 產生：
  app/data/strong_index_H.js、app/data/strong_index_G.js
舊的 app/data/search_index.js（4.3 MB、開站即載入）已淘汰。
保留這支腳本只是讓舊習慣的指令仍然可用。
"""
import build_layers

if __name__ == "__main__":
    build_layers.build()
