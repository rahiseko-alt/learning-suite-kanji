// 漢字セット定義
//
// セット = 1 つ以上の漢字を 1 セッションで練習する単位
// MVP-0 第 1 弾: 「飛」（1 文字セット）
// MVP-0 第 2 弾: 「愛知県」（3 文字横並び）
// MVP-0 第 3 弾以降: 「東京都」（3 文字横並び）

import { KANJI_FEI } from './kanji/fei.js';
import { KANJI_AI, KANJI_CHI, KANJI_KEN } from './kanji/aichi.js';

export const SETS = {
  fei: {
    id: 'fei',
    name: '飛',
    label: '飛（とぶ）',
    kanji: [KANJI_FEI],
  },
  aichi: {
    id: 'aichi',
    name: '愛知県',
    label: '愛知県（あいちけん）',
    kanji: [KANJI_AI, KANJI_CHI, KANJI_KEN],
  },
  // tokyoto は次コミットで追加予定
};

// トップ画面の選択 UI 表示順
export const SET_ORDER = ['fei', 'aichi'];

// デフォルトセット（パラメータ未指定時）
export const DEFAULT_SET_ID = 'fei';

export function getSetById(id) {
  return SETS[id] || SETS[DEFAULT_SET_ID];
}
