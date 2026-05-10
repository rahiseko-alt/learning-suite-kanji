# Third-Party Licenses

本アプリは以下のサードパーティ素材を利用しています。

---

## KanjiVG

- **作品名**: KanjiVG
- **著作者**: Copyright (C) 2009-2011 Ulrich Apel
- **公式サイト**: http://kanjivg.tagaini.net
- **ライセンス**: Creative Commons Attribution-Share Alike 3.0 (CC BY-SA 3.0)
- **ライセンス本文**: https://creativecommons.org/licenses/by-sa/3.0/

### 利用箇所

- `apps/kanji/static/svg/04e95.svg`（「井」字形 SVG・原本そのまま配置）
- `apps/kanji/src/lib/data/kanji-i.js`（KanjiVG の path 属性データを各画別に取り込み・色割当のみ独自）

### 出典表記

> Stroke order data from KanjiVG by Ulrich Apel,
> licensed under CC BY-SA 3.0
> (https://creativecommons.org/licenses/by-sa/3.0/)

### 義務の履行

- **Attribution（表示）**: 本ファイル + 各利用ファイルのコメントヘッダ + アプリ内クレジット画面（実装予定）に上記出典を記載
- **ShareAlike（継承）**: KanjiVG データの改変版（座標調整・別形式変換等）を頒布する場合、改変部分は CC BY-SA 3.0 で公開する。アプリ本体のコード（自作部分）は独立して別ライセンスで頒布可能

### 改変の有無

- **未改変**: `static/svg/04e95.svg` は KanjiVG 原本ファイルをそのまま配置
- **データ抽出のみ**: `kanji-i.js` 内の path d 属性は KanjiVG SVG から取り出した値・座標は未改変
