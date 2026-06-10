# learning-suite-kanji failures.md

> 1 失敗 = 1 行。具体策のみ。経緯禁止。200 行上限。読み: check-in / 書き: check-out

- 2026-05-25 UX 設計で複数版差し戻された時点 (目安 3 版以上) で構造的問題を疑い Plan Mode 再入で設計案を網羅列挙せよ・パラメータ調整で逃げるな
- 2026-06-02 plan-schema-gate: 受け入れ基準は各行に backtick/コロン(:／：)/検証keyword(grep,npm,git,EXIT,test -f 等) を最低1つ含めよ。「dev目視」「Playwright スクショ」だけは検証手段欠落で reject される
- 2026-06-02 既存 plan ファイルの全面書換は Write 不可 (plan-mode hook が既存 path を block)→ Edit で差し替えよ。新規明示の path も実在すると同 hook が発火する
- 2026-06-11 import-kanji.mjs --force は既存 JS を空スケルトンで上書きし reading/meaning/word/動作語を全破壊する。既存字へのデータ追加は PDF のみ別経路 DL + 専用置換スクリプト(正規表現で songLyric/label/songFragment のみ置換・字形 d/viewBox と既存値は保持)で行え。画数=strokes 数の機械検証を必ず噛ませる
- 2026-06-11 smileplanet 1年生基本漢字(三千田玉手木石本口青森等)は「よみかたプリント型」で覚え歌動作語リストが無い。覚え歌の忠実移植は不可で KanjiVG 字形(部品名・筆順名)で補完するしかない。漢字追加時は動作語あり/なしを PDF 種別で先に切り分けよ
