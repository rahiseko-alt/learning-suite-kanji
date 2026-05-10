# 音声アセット（覚え歌・動作語）

書字困難児フレンドリーな子供向け声を、AI TTS で生成して mp3 として同梱する。本ファイルが配置されると `TraceCanvas.svelte` が Web Speech API ではなくこの mp3 を再生する。

## 必要ファイル（3 種）

| ファイル名 | 発声内容 | 用途 |
|---|---|---|
| `yoko.mp3` | 「よこー」 | 第1画・第2画（横画） |
| `tate.mp3` | 「たてー」 | 第4画（縦画） |
| `no.mp3`   | 「ノー」 | 第3画（左払い） |

## 推奨 AI TTS サービス

### 1. ElevenLabs（推奨・高品質）
- URL: https://elevenlabs.io
- 無料枠あり（月 10,000 字）
- 日本語子供 voice を選択（"Kid" / "Child" / "Young" 検索）
- 設定推奨: Stability 60-70 / Similarity 70 / Style 30（楽しい）

### 2. Narakeet
- URL: https://www.narakeet.com/create/text-to-speech-child-voice-online.html
- 「Child voice TTS」専用ページあり
- 日本語子供 voice 利用可（child-jp 系）

### 3. SpeechGen
- URL: https://speechgen.io/en/child-tts/
- 無料枠あり

## 生成手順

1. 上記いずれかの AI TTS サービスにアクセス
2. 言語: 日本語（Japanese）/ Voice: 子供 / 性別: お好みで（井上氏の子の好みで男児風 or 女児風）
3. 各テキストで生成:
   - `よこー` → ダウンロードして `yoko.mp3` にリネーム
   - `たてー` → `tate.mp3`
   - `ノー` → `no.mp3`
4. 本ディレクトリ（`apps/kanji/static/audio/`）に配置
5. dev サーバ稼働中なら HMR で即時反映

## 表現ガイドライン（書字困難児向け）

- **楽しい・温かい感情**で発声（無機質な平坦読みは避ける）
- 語尾は自然に伸ばす（「よこー」「たてー」「ノー」）
- 速度はゆっくりめ（0.8〜0.9 倍速相当）
- 音量は最大に近く

## ライセンス

- AI TTS で生成した音声は、サービスのライセンス条件に従う（多くは商用可・帰属表示不要）
- マスター/井上氏の子の生声を録音した場合は本品 Phase 1 の私的使用範囲

## 配置確認

mp3 を配置したら以下で確認:
- `http://localhost:5173/audio/yoko.mp3` を直接ブラウザで叩く → 再生される = OK
- アプリでスタートボタン → 各画開始時に mp3 が鳴る
