# learning-suite-kanji memory.md（目標 100 行 / 上限 200 行）

> 自エージェント専用・他エージェントは書込み禁止
> memory.md 分散運用 v2.0（β 統合型・Session 295 〜）

## P1: 引継ぎミッション（5 件枠・Check-out で完了消去+新規追加）
- [importance:H][2026-06-06] **井上氏FB待ち（ナビ＋フィルタUI）**: 本番デプロイ済 https://rahiseko-alt.github.io/learning-suite-kanji/ 。最新 commit cb324d2（先行ナビを筆数カウント方式に変更）/ 8bb251a（4タブフィルタUI：一覧/画数↑/あいうえお/⭐保存）。ナビ動作確認を井上氏から取得し、NG なら `git revert HEAD` で距離判定方式に即戻し。**PC 表 P1#4「コア機能 △」の ○ 昇格もこのFBと併せ判断**
- [importance:M][2026-06-02] **R4 軌跡判定 ADR 作成**: `docs/adr/0001-pause-resume-strategy.md` 新規（継続・未着手）。「軌跡 vs path カバー率方式」を Nygard 標準で。設計詳細は `docs/design/2026-05-25-pause-resume-strategy.md`
- [importance:L][2026-06-02] **未追跡ファイル整理**: `pc-progress.html.bak-v10.0-pre-reclassify` / `pc-progress.html.bak-v9.3` / `override-log.md` の削除可否（Check-out で再確認・依然 untracked）
- [importance:L][2026-06-02] **応援メッセージ軽微改善**: `play/+page.svelte` floatMsgs の `setTimeout` を `onDestroy` で cleanup（コンポーネント破棄後発火・code-review 指摘・低優先・実害なし）

## P2: ADR 索引（直近 5 件・本体は docs/adr/NNNN-*.md）
（P1#1 で 0001 作成予定）

## P3: 失敗事例（7 客観基準のいずれか 1 件以上で登録）
→ failures.md 参照

## P4: その他永続教訓（importance タグ付き自由領域）
- [importance:H][2026-06-02] **児童応援メッセージ設計原則（井上氏指摘）**: 書字の「出来栄え」を褒める語（きれい/じょうず/なめらか/ていねい等）は禁止。はみ出し等で外れると矛盾し信頼を損なう。出来に依存しない**メンタル/ペース応援**（いいかんじ/ゆっくりでいいよ/あせらなくていいよ）に限定。称賛は行動と同時でなく**約2呼吸遅らせる**（早いと急かし感）。**開始前は褒めない**（始まってないのに称賛は不自然）。フェーズ（カウントダウン→書き途中→もうすぐ→完了）と書き順ナビ（TraceCanvas onStroke）に同期。H5 過剰ほめ仮説の運用上の重要ガードレール
- [importance:H][2026-05-25] **児童 UX のペース可変問題**: ユーザーペース可変（児童書字速度・休憩タイミング）がある場合、時間ベース判定（pointerup + idle）は構造的に破綻する。pointerup イベント自体が「動作語完了」「連結書字完了」「思考中」「休憩」の 4 通り意味を持ち客観判定不可。客観的な状態判定（軌跡 vs 期待 path 等の物理量）で解くべき
- [importance:M][2026-05-25] **本番 prod-edit マーカー運用**: TraceCanvas など本番デプロイ済みファイルは pre-edit hook で 10 分マーカーが必要。Edit 連続作業時はマーカー期限切れが頻発（実績 8 回更新）。マスター入力 `! touch ...` のスペース有無で bash 実行成否が分かれる（行頭スペースなしが必須）。長時間作業時はマスターに前もって運用説明を

---
運用規律:
- 110 行超で archive 候補（importance L 優先・`archive/learning-suite-kanji-memory-YYYYMM.md`）
- ADR は別ファイル化・本 memory には索引のみ
- 失敗事例は role/事象ベース・個人名禁止（blameless）
- 自エージェントのみ書込み（他エージェントは Read のみ）
