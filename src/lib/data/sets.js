// 漢字セット定義
//
// セット = 1 つ以上の漢字を 1 セッションで練習する単位
// MVP-0 第 1 弾: 「飛」（1 文字セット）
// MVP-0 第 2 弾以降: 都道府県セット
// Session 273: 熟語の読み方（reading）+ 各漢字の文脈読み（kanjiReadings）を追加
//   → タイトル表示: 「ほっかいどう」 をかこう！
//   → 各記入枠 reading-badge: 「ほっ」「かい」「どう」

import { KANJI_FEI } from './kanji/fei.js';
import { KANJI_AI } from './kanji/ai.js';
import { KANJI_CHI } from './kanji/chi.js';
import { KANJI_KEN } from './kanji/ken.js';
import { KANJI_KITA } from './kanji/kita.js';
import { KANJI_KAI } from './kanji/kai.js';
import { KANJI_DOU } from './kanji/dou.js';
import { KANJI_HIGASHI } from './kanji/higashi.js';
import { KANJI_KYOU } from './kanji/kyou.js';
import { KANJI_TO } from './kanji/to.js';
import { KANJI_FU } from './kanji/fu.js';
import { KANJI_OO } from './kanji/oo.js';
import { KANJI_SAKA } from './kanji/saka.js';
import { KANJI_GI } from './kanji/gi.js';
import { KANJI_OKA } from './kanji/oka.js';
import { KANJI_WA } from './kanji/wa.js';
import { KANJI_KA } from './kanji/ka.js';
import { KANJI_YAMA } from './kanji/yama.js';
import { KANJI_SHIKA } from './kanji/shika.js';
import { KANJI_JI } from './kanji/ji.js';
import { KANJI_SHIMA } from './kanji/shima.js';
import { KANJI_IBARA } from './kanji/ibara.js';
import { KANJI_JOU } from './kanji/jou.js';
import { KANJI_KAMI } from './kanji/kami.js';
import { KANJI_NA } from './kanji/na.js';
import { KANJI_KAWA } from './kanji/kawa.js';

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
    reading: 'あいちけん',
    kanjiReadings: ['あい', 'ち', 'けん'],
    kanji: [KANJI_AI, KANJI_CHI, KANJI_KEN],
  },
  hokkaido: {
    id: 'hokkaido',
    name: '北海道',
    label: '北海道（ほっかいどう）',
    reading: 'ほっかいどう',
    kanjiReadings: ['ほっ', 'かい', 'どう'],
    kanji: [KANJI_KITA, KANJI_KAI, KANJI_DOU],
  },
  tokyoto: {
    id: 'tokyoto',
    name: '東京都',
    label: '東京都(とうきょうと)',
    reading: 'とうきょうと',
    kanjiReadings: ['とう', 'きょう', 'と'],
    kanji: [KANJI_HIGASHI, KANJI_KYOU, KANJI_TO],
  },
  kyoto: {
    id: 'kyoto',
    name: '京都府',
    label: '京都府(きょうとふ)',
    reading: 'きょうとふ',
    kanjiReadings: ['きょう', 'と', 'ふ'],
    kanji: [KANJI_KYOU, KANJI_TO, KANJI_FU],
  },
  osaka: {
    id: 'osaka',
    name: '大阪府',
    label: '大阪府(おおさかふ)',
    reading: 'おおさかふ',
    kanjiReadings: ['おお', 'さか', 'ふ'],
    kanji: [KANJI_OO, KANJI_SAKA, KANJI_FU],
  },
  gifu: {
    id: 'gifu',
    name: '岐阜県',
    label: '岐阜県(ぎふけん)',
    reading: 'ぎふけん',
    kanjiReadings: ['ぎ', 'ふ', 'けん'],
    kanji: [KANJI_GI, KANJI_OKA, KANJI_KEN],
  },
  wakayama: {
    id: 'wakayama',
    name: '和歌山県',
    label: '和歌山県(わかやまけん)',
    reading: 'わかやまけん',
    kanjiReadings: ['わ', 'か', 'やま', 'けん'],
    kanji: [KANJI_WA, KANJI_KA, KANJI_YAMA, KANJI_KEN],
  },
  kagoshima: {
    id: 'kagoshima',
    name: '鹿児島県',
    label: '鹿児島県(かごしまけん)',
    reading: 'かごしまけん',
    kanjiReadings: ['か', 'ご', 'しま', 'けん'],
    kanji: [KANJI_SHIKA, KANJI_JI, KANJI_SHIMA, KANJI_KEN],
  },
  ibaraki: {
    id: 'ibaraki',
    name: '茨城県',
    label: '茨城県(いばらきけん)',
    reading: 'いばらきけん',
    kanjiReadings: ['いばら', 'き', 'けん'],
    kanji: [KANJI_IBARA, KANJI_JOU, KANJI_KEN],
  },
  kanagawa: {
    id: 'kanagawa',
    name: '神奈川県',
    label: '神奈川県(かながわけん)',
    reading: 'かながわけん',
    kanjiReadings: ['かな', 'が', 'わ', 'けん'],
    kanji: [KANJI_KAMI, KANJI_NA, KANJI_KAWA, KANJI_KEN],
  },
};

// トップ画面の選択 UI 表示順
export const SET_ORDER = [
  'fei',
  'aichi',
  'hokkaido',
  'tokyoto',
  'kyoto',
  'osaka',
  'gifu',
  'wakayama',
  'kagoshima',
  'ibaraki',
  'kanagawa',
];

// デフォルトセット（パラメータ未指定時）
export const DEFAULT_SET_ID = 'fei';

export function getSetById(id) {
  return SETS[id] || SETS[DEFAULT_SET_ID];
}
