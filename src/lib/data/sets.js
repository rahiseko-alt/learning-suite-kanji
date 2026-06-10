// 漢字セット定義
//
// セット = 1 つ以上の漢字を 1 セッションで練習する単位
// MVP-0 第 1 弾: 「飛」（1 文字セット）
// MVP-0 第 2 弾以降: 都道府県セット
// Session 273: 熟語の読み方（reading）+ 各漢字の文脈読み（kanjiReadings）を追加
//   → タイトル表示: 「ほっかいどう」 をかこう！
//   → 各記入枠 reading-badge: 「ほっ」「かい」「どう」

import { KANJI_FEI } from './kanji/fei.js';
import { KANJI_KITA } from './kanji/kita.js';
import { KANJI_KAI } from './kanji/kai.js';
import { KANJI_DOU } from './kanji/dou.js';
import { KANJI_AO } from './kanji/ao.js';
import { KANJI_MORI } from './kanji/mori.js';
import { KANJI_KEN } from './kanji/ken.js';
import { KANJI_IWA } from './kanji/iwa.js';
import { KANJI_TE } from './kanji/te.js';
import { KANJI_MIYA } from './kanji/miya.js';
import { KANJI_JOU } from './kanji/jou.js';
import { KANJI_AKI } from './kanji/aki.js';
import { KANJI_TA } from './kanji/ta.js';
import { KANJI_YAMA } from './kanji/yama.js';
import { KANJI_KATA } from './kanji/kata.js';
import { KANJI_FUKU } from './kanji/fuku.js';
import { KANJI_SHIMA } from './kanji/shima.js';
import { KANJI_IBARA } from './kanji/ibara.js';
import { KANJI_TOCHI } from './kanji/tochi.js';
import { KANJI_KI } from './kanji/ki.js';
import { KANJI_GUN } from './kanji/gun.js';
import { KANJI_UMA } from './kanji/uma.js';
import { KANJI_SAI } from './kanji/sai.js';
import { KANJI_TAMA } from './kanji/tama.js';
import { KANJI_SEN } from './kanji/sen.js';
import { KANJI_HA } from './kanji/ha.js';
import { KANJI_HIGASHI } from './kanji/higashi.js';
import { KANJI_KYOU } from './kanji/kyou.js';
import { KANJI_TO } from './kanji/to.js';
import { KANJI_KAMI } from './kanji/kami.js';
import { KANJI_NA } from './kanji/na.js';
import { KANJI_KAWA } from './kanji/kawa.js';
import { KANJI_SHIN } from './kanji/shin.js';
import { KANJI_GATA } from './kanji/gata.js';
import { KANJI_TOMI } from './kanji/tomi.js';
import { KANJI_ISHI } from './kanji/ishi.js';
import { KANJI_I } from './kanji/i.js';
import { KANJI_NASHI } from './kanji/nashi.js';
import { KANJI_NAGA } from './kanji/naga.js';
import { KANJI_NO } from './kanji/no.js';
import { KANJI_GI } from './kanji/gi.js';
import { KANJI_OKA } from './kanji/oka.js';
import { KANJI_OKA2 } from './kanji/oka2.js';
import { KANJI_SHIZU } from './kanji/shizu.js';
import { KANJI_AI } from './kanji/ai.js';
import { KANJI_CHI } from './kanji/chi.js';
import { KANJI_SAN } from './kanji/san.js';
import { KANJI_JUU } from './kanji/juu.js';
import { KANJI_SHI } from './kanji/shi.js';
import { KANJI_GA } from './kanji/ga.js';
import { KANJI_FU } from './kanji/fu.js';
import { KANJI_OO } from './kanji/oo.js';
import { KANJI_SAKA } from './kanji/saka.js';
import { KANJI_HEI } from './kanji/hei.js';
import { KANJI_KO } from './kanji/ko.js';
import { KANJI_RA } from './kanji/ra.js';
import { KANJI_WA } from './kanji/wa.js';
import { KANJI_KA } from './kanji/ka.js';
import { KANJI_TORI } from './kanji/tori.js';
import { KANJI_TORU } from './kanji/toru.js';
import { KANJI_NE } from './kanji/ne.js';
import { KANJI_HIRO } from './kanji/hiro.js';
import { KANJI_KUCHI } from './kanji/kuchi.js';
import { KANJI_TOKU } from './kanji/toku.js';
import { KANJI_KOU } from './kanji/kou.js';
import { KANJI_HIME } from './kanji/hime.js';
import { KANJI_TAKA } from './kanji/taka.js';
import { KANJI_SA } from './kanji/sa.js';
import { KANJI_SAKI } from './kanji/saki.js';
import { KANJI_KUMA } from './kanji/kuma.js';
import { KANJI_HON } from './kanji/hon.js';
import { KANJI_BUN } from './kanji/bun.js';
import { KANJI_OKI } from './kanji/oki.js';
import { KANJI_NAWA } from './kanji/nawa.js';
import { KANJI_SHIKA } from './kanji/shika.js';
import { KANJI_JI } from './kanji/ji.js';

export const SETS = {
  fei: {
    id: 'fei',
    name: '飛',
    label: '飛（とぶ）',
    kanji: [KANJI_FEI],
  },
  hokkaido: {
    id: 'hokkaido',
    name: '北海道',
    label: '北海道（ほっかいどう）',
    reading: 'ほっかいどう',
    kanjiReadings: ['ほっ', 'かい', 'どう'],
    kanji: [KANJI_KITA, KANJI_KAI, KANJI_DOU],
  },
  aomori: {
    id: 'aomori',
    name: '青森県',
    label: '青森県(あおもりけん)',
    reading: 'あおもりけん',
    kanjiReadings: ['あお', 'もり', 'けん'],
    kanji: [KANJI_AO, KANJI_MORI, KANJI_KEN],
  },
  iwate: {
    id: 'iwate',
    name: '岩手県',
    label: '岩手県(いわてけん)',
    reading: 'いわてけん',
    kanjiReadings: ['いわ', 'て', 'けん'],
    kanji: [KANJI_IWA, KANJI_TE, KANJI_KEN],
  },
  miyagi: {
    id: 'miyagi',
    name: '宮城県',
    label: '宮城県(みやぎけん)',
    reading: 'みやぎけん',
    kanjiReadings: ['みや', 'ぎ', 'けん'],
    kanji: [KANJI_MIYA, KANJI_JOU, KANJI_KEN],
  },
  akita: {
    id: 'akita',
    name: '秋田県',
    label: '秋田県(あきたけん)',
    reading: 'あきたけん',
    kanjiReadings: ['あき', 'た', 'けん'],
    kanji: [KANJI_AKI, KANJI_TA, KANJI_KEN],
  },
  yamagata: {
    id: 'yamagata',
    name: '山形県',
    label: '山形県(やまがたけん)',
    reading: 'やまがたけん',
    kanjiReadings: ['やま', 'がた', 'けん'],
    kanji: [KANJI_YAMA, KANJI_KATA, KANJI_KEN],
  },
  fukushima: {
    id: 'fukushima',
    name: '福島県',
    label: '福島県(ふくしまけん)',
    reading: 'ふくしまけん',
    kanjiReadings: ['ふく', 'しま', 'けん'],
    kanji: [KANJI_FUKU, KANJI_SHIMA, KANJI_KEN],
  },
  ibaraki: {
    id: 'ibaraki',
    name: '茨城県',
    label: '茨城県(いばらきけん)',
    reading: 'いばらきけん',
    kanjiReadings: ['いばら', 'き', 'けん'],
    kanji: [KANJI_IBARA, KANJI_JOU, KANJI_KEN],
  },
  tochigi: {
    id: 'tochigi',
    name: '栃木県',
    label: '栃木県(とちぎけん)',
    reading: 'とちぎけん',
    kanjiReadings: ['とち', 'ぎ', 'けん'],
    kanji: [KANJI_TOCHI, KANJI_KI, KANJI_KEN],
  },
  gunma: {
    id: 'gunma',
    name: '群馬県',
    label: '群馬県(ぐんまけん)',
    reading: 'ぐんまけん',
    kanjiReadings: ['ぐん', 'ま', 'けん'],
    kanji: [KANJI_GUN, KANJI_UMA, KANJI_KEN],
  },
  saitama: {
    id: 'saitama',
    name: '埼玉県',
    label: '埼玉県(さいたまけん)',
    reading: 'さいたまけん',
    kanjiReadings: ['さい', 'たま', 'けん'],
    kanji: [KANJI_SAI, KANJI_TAMA, KANJI_KEN],
  },
  chiba: {
    id: 'chiba',
    name: '千葉県',
    label: '千葉県(ちばけん)',
    reading: 'ちばけん',
    kanjiReadings: ['ち', 'ば', 'けん'],
    kanji: [KANJI_SEN, KANJI_HA, KANJI_KEN],
  },
  tokyoto: {
    id: 'tokyoto',
    name: '東京都',
    label: '東京都(とうきょうと)',
    reading: 'とうきょうと',
    kanjiReadings: ['とう', 'きょう', 'と'],
    kanji: [KANJI_HIGASHI, KANJI_KYOU, KANJI_TO],
  },
  kanagawa: {
    id: 'kanagawa',
    name: '神奈川県',
    label: '神奈川県(かながわけん)',
    reading: 'かながわけん',
    kanjiReadings: ['かな', 'が', 'わ', 'けん'],
    kanji: [KANJI_KAMI, KANJI_NA, KANJI_KAWA, KANJI_KEN],
  },
  niigata: {
    id: 'niigata',
    name: '新潟県',
    label: '新潟県(にいがたけん)',
    reading: 'にいがたけん',
    kanjiReadings: ['にい', 'がた', 'けん'],
    kanji: [KANJI_SHIN, KANJI_GATA, KANJI_KEN],
  },
  toyama: {
    id: 'toyama',
    name: '富山県',
    label: '富山県(とやまけん)',
    reading: 'とやまけん',
    kanjiReadings: ['と', 'やま', 'けん'],
    kanji: [KANJI_TOMI, KANJI_YAMA, KANJI_KEN],
  },
  ishikawa: {
    id: 'ishikawa',
    name: '石川県',
    label: '石川県(いしかわけん)',
    reading: 'いしかわけん',
    kanjiReadings: ['いし', 'かわ', 'けん'],
    kanji: [KANJI_ISHI, KANJI_KAWA, KANJI_KEN],
  },
  fukui: {
    id: 'fukui',
    name: '福井県',
    label: '福井県(ふくいけん)',
    reading: 'ふくいけん',
    kanjiReadings: ['ふく', 'い', 'けん'],
    kanji: [KANJI_FUKU, KANJI_I, KANJI_KEN],
  },
  yamanashi: {
    id: 'yamanashi',
    name: '山梨県',
    label: '山梨県(やまなしけん)',
    reading: 'やまなしけん',
    kanjiReadings: ['やま', 'なし', 'けん'],
    kanji: [KANJI_YAMA, KANJI_NASHI, KANJI_KEN],
  },
  nagano: {
    id: 'nagano',
    name: '長野県',
    label: '長野県(ながのけん)',
    reading: 'ながのけん',
    kanjiReadings: ['なが', 'の', 'けん'],
    kanji: [KANJI_NAGA, KANJI_NO, KANJI_KEN],
  },
  gifu: {
    id: 'gifu',
    name: '岐阜県',
    label: '岐阜県(ぎふけん)',
    reading: 'ぎふけん',
    kanjiReadings: ['ぎ', 'ふ', 'けん'],
    kanji: [KANJI_GI, KANJI_OKA, KANJI_KEN],
  },
  shizuoka: {
    id: 'shizuoka',
    name: '静岡県',
    label: '静岡県(しずおかけん)',
    reading: 'しずおかけん',
    kanjiReadings: ['しず', 'おか', 'けん'],
    kanji: [KANJI_SHIZU, KANJI_OKA2, KANJI_KEN],
  },
  aichi: {
    id: 'aichi',
    name: '愛知県',
    label: '愛知県(あいちけん)',
    reading: 'あいちけん',
    kanjiReadings: ['あい', 'ち', 'けん'],
    kanji: [KANJI_AI, KANJI_CHI, KANJI_KEN],
  },
  mie: {
    id: 'mie',
    name: '三重県',
    label: '三重県(みえけん)',
    reading: 'みえけん',
    kanjiReadings: ['み', 'え', 'けん'],
    kanji: [KANJI_SAN, KANJI_JUU, KANJI_KEN],
  },
  shiga: {
    id: 'shiga',
    name: '滋賀県',
    label: '滋賀県(しがけん)',
    reading: 'しがけん',
    kanjiReadings: ['し', 'が', 'けん'],
    kanji: [KANJI_SHI, KANJI_GA, KANJI_KEN],
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
  hyogo: {
    id: 'hyogo',
    name: '兵庫県',
    label: '兵庫県(ひょうごけん)',
    reading: 'ひょうごけん',
    kanjiReadings: ['ひょう', 'ご', 'けん'],
    kanji: [KANJI_HEI, KANJI_KO, KANJI_KEN],
  },
  nara: {
    id: 'nara',
    name: '奈良県',
    label: '奈良県(ならけん)',
    reading: 'ならけん',
    kanjiReadings: ['な', 'ら', 'けん'],
    kanji: [KANJI_NA, KANJI_RA, KANJI_KEN],
  },
  wakayama: {
    id: 'wakayama',
    name: '和歌山県',
    label: '和歌山県(わかやまけん)',
    reading: 'わかやまけん',
    kanjiReadings: ['わ', 'か', 'やま', 'けん'],
    kanji: [KANJI_WA, KANJI_KA, KANJI_YAMA, KANJI_KEN],
  },
  tottori: {
    id: 'tottori',
    name: '鳥取県',
    label: '鳥取県(とっとりけん)',
    reading: 'とっとりけん',
    kanjiReadings: ['とっ', 'とり', 'けん'],
    kanji: [KANJI_TORI, KANJI_TORU, KANJI_KEN],
  },
  shimane: {
    id: 'shimane',
    name: '島根県',
    label: '島根県(しまねけん)',
    reading: 'しまねけん',
    kanjiReadings: ['しま', 'ね', 'けん'],
    kanji: [KANJI_SHIMA, KANJI_NE, KANJI_KEN],
  },
  okayama: {
    id: 'okayama',
    name: '岡山県',
    label: '岡山県(おかやまけん)',
    reading: 'おかやまけん',
    kanjiReadings: ['おか', 'やま', 'けん'],
    kanji: [KANJI_OKA2, KANJI_YAMA, KANJI_KEN],
  },
  hiroshima: {
    id: 'hiroshima',
    name: '広島県',
    label: '広島県(ひろしまけん)',
    reading: 'ひろしまけん',
    kanjiReadings: ['ひろ', 'しま', 'けん'],
    kanji: [KANJI_HIRO, KANJI_SHIMA, KANJI_KEN],
  },
  yamaguchi: {
    id: 'yamaguchi',
    name: '山口県',
    label: '山口県(やまぐちけん)',
    reading: 'やまぐちけん',
    kanjiReadings: ['やま', 'ぐち', 'けん'],
    kanji: [KANJI_YAMA, KANJI_KUCHI, KANJI_KEN],
  },
  tokushima: {
    id: 'tokushima',
    name: '徳島県',
    label: '徳島県(とくしまけん)',
    reading: 'とくしまけん',
    kanjiReadings: ['とく', 'しま', 'けん'],
    kanji: [KANJI_TOKU, KANJI_SHIMA, KANJI_KEN],
  },
  kagawa: {
    id: 'kagawa',
    name: '香川県',
    label: '香川県(かがわけん)',
    reading: 'かがわけん',
    kanjiReadings: ['か', 'がわ', 'けん'],
    kanji: [KANJI_KOU, KANJI_KAWA, KANJI_KEN],
  },
  ehime: {
    id: 'ehime',
    name: '愛媛県',
    label: '愛媛県(えひめけん)',
    reading: 'えひめけん',
    kanjiReadings: ['え', 'ひめ', 'けん'],
    kanji: [KANJI_AI, KANJI_HIME, KANJI_KEN],
  },
  kochi: {
    id: 'kochi',
    name: '高知県',
    label: '高知県(こうちけん)',
    reading: 'こうちけん',
    kanjiReadings: ['こう', 'ち', 'けん'],
    kanji: [KANJI_TAKA, KANJI_CHI, KANJI_KEN],
  },
  fukuoka: {
    id: 'fukuoka',
    name: '福岡県',
    label: '福岡県(ふくおかけん)',
    reading: 'ふくおかけん',
    kanjiReadings: ['ふく', 'おか', 'けん'],
    kanji: [KANJI_FUKU, KANJI_OKA2, KANJI_KEN],
  },
  saga: {
    id: 'saga',
    name: '佐賀県',
    label: '佐賀県(さがけん)',
    reading: 'さがけん',
    kanjiReadings: ['さ', 'が', 'けん'],
    kanji: [KANJI_SA, KANJI_GA, KANJI_KEN],
  },
  nagasaki: {
    id: 'nagasaki',
    name: '長崎県',
    label: '長崎県(ながさきけん)',
    reading: 'ながさきけん',
    kanjiReadings: ['なが', 'さき', 'けん'],
    kanji: [KANJI_NAGA, KANJI_SAKI, KANJI_KEN],
  },
  kumamoto: {
    id: 'kumamoto',
    name: '熊本県',
    label: '熊本県(くまもとけん)',
    reading: 'くまもとけん',
    kanjiReadings: ['くま', 'もと', 'けん'],
    kanji: [KANJI_KUMA, KANJI_HON, KANJI_KEN],
  },
  oita: {
    id: 'oita',
    name: '大分県',
    label: '大分県(おおいたけん)',
    reading: 'おおいたけん',
    kanjiReadings: ['おお', 'いた', 'けん'],
    kanji: [KANJI_OO, KANJI_BUN, KANJI_KEN],
  },
  miyazaki: {
    id: 'miyazaki',
    name: '宮崎県',
    label: '宮崎県(みやざきけん)',
    reading: 'みやざきけん',
    kanjiReadings: ['みや', 'ざき', 'けん'],
    kanji: [KANJI_MIYA, KANJI_SAKI, KANJI_KEN],
  },
  kagoshima: {
    id: 'kagoshima',
    name: '鹿児島県',
    label: '鹿児島県(かごしまけん)',
    reading: 'かごしまけん',
    kanjiReadings: ['か', 'ご', 'しま', 'けん'],
    kanji: [KANJI_SHIKA, KANJI_JI, KANJI_SHIMA, KANJI_KEN],
  },
  okinawa: {
    id: 'okinawa',
    name: '沖縄県',
    label: '沖縄県(おきなわけん)',
    reading: 'おきなわけん',
    kanjiReadings: ['おき', 'なわ', 'けん'],
    kanji: [KANJI_OKI, KANJI_NAWA, KANJI_KEN],
  },
};

// トップ画面の選択 UI 表示順（47都道府県のみ・fei は含まない）
export const SET_ORDER = [
  'hokkaido',
  'aomori',
  'iwate',
  'miyagi',
  'akita',
  'yamagata',
  'fukushima',
  'ibaraki',
  'tochigi',
  'gunma',
  'saitama',
  'chiba',
  'tokyoto',
  'kanagawa',
  'niigata',
  'toyama',
  'ishikawa',
  'fukui',
  'yamanashi',
  'nagano',
  'gifu',
  'shizuoka',
  'aichi',
  'mie',
  'shiga',
  'kyoto',
  'osaka',
  'hyogo',
  'nara',
  'wakayama',
  'tottori',
  'shimane',
  'okayama',
  'hiroshima',
  'yamaguchi',
  'tokushima',
  'kagawa',
  'ehime',
  'kochi',
  'fukuoka',
  'saga',
  'nagasaki',
  'kumamoto',
  'oita',
  'miyazaki',
  'kagoshima',
  'okinawa',
];

// デフォルトセット（パラメータ未指定時）
export const DEFAULT_SET_ID = 'hokkaido';

export function getSetById(id) {
  return SETS[id] || SETS[DEFAULT_SET_ID];
}
