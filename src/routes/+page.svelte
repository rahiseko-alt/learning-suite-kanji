<script>
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { SETS, SET_ORDER } from '$lib/data/sets.js';
  import { onMount } from 'svelte';

  // Session 267 v5: トップページ全面リニューアル
  // 1. タイトル降下（画面外上から → 中央 60%）
  // 2. 0.5 秒後にボタンフェードイン
  // 3. 「あそぶ」押下でカードスライド出現（無限ループ・右→左）
  // 4. カードタップで複数選択トグル + 揺れアニメ
  // 5. 左右矢印で手動フリック（一時的にスピード倍率変更）
  // 6. 1 つ以上選択で確定ボタン表示 → /play?sets= に遷移

  let titleVisible = $state(false);
  let buttonVisible = $state(false);
  let cardSliderVisible = $state(false);
  let selectedIds = $state([]);
  let scrollSpeed = $state(1); // 1 = 通常 / 5 = 矢印フリック時

  // SET_ORDER を 3 重ループ化（無限スクロールの錯視のため）
  const beltItems = [...SET_ORDER, ...SET_ORDER, ...SET_ORDER];

  onMount(() => {
    setTimeout(() => { titleVisible = true; }, 80);
    setTimeout(() => { buttonVisible = true; }, 1500);
  });

  function startSlider() {
    cardSliderVisible = true;
  }

  function toggleSelect(id) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter((x) => x !== id);
    } else {
      selectedIds = [...selectedIds, id];
    }
  }

  function startPlay() {
    if (selectedIds.length === 0) return;
    // SET_ORDER の並び順で並び替え（井 / 飛 / 愛知県 の順）
    const ordered = SET_ORDER.filter((id) => selectedIds.includes(id));
    const sets = ordered.join(',');
    goto(`${base}/play?sets=${sets}`);
  }

  function flickLeft() {
    scrollSpeed = -5;
    setTimeout(() => { scrollSpeed = 1; }, 700);
  }
  function flickRight() {
    scrollSpeed = 5;
    setTimeout(() => { scrollSpeed = 1; }, 700);
  }
</script>

<svelte:head>
  <title>かんじでアソボ！</title>
</svelte:head>

<main class="page">
  <!-- 背景装飾 -->
  <div class="bg-decor" aria-hidden="true">
    <span class="cloud cloud-1">☁</span>
    <span class="cloud cloud-2">☁</span>
    <span class="cloud cloud-3">☁</span>
    <span class="star star-1">⭐</span>
    <span class="star star-2">✨</span>
    <span class="star star-3">🌟</span>
    <span class="planet planet-1">🪐</span>
    <span class="planet planet-2">🌙</span>
  </div>

  <!-- タイトル：画面外（上）から中央 60% 位置へ降下 -->
  <h1 class="app-title" class:visible={titleVisible}>かんじでアソボ！</h1>

  <!-- 「あそぶ」ボタン（タイトル降下後 0.5 秒でフェードイン） -->
  {#if !cardSliderVisible}
    <button
      class="btn btn--primary big play-btn"
      class:visible={buttonVisible}
      onclick={startSlider}
      disabled={!buttonVisible}
    >▶ あそぶ</button>
  {/if}

  <!-- カードスライダー（押下後に出現） -->
  {#if cardSliderVisible}
    <div class="slider-wrap">
      <button class="arrow arrow-left" onclick={flickLeft} aria-label="ひだりへ">◀</button>

      <div class="slider-viewport">
        <div
          class="card-belt"
          style:animation-duration="{Math.max(2, 28 / Math.abs(scrollSpeed))}s"
          style:animation-direction={scrollSpeed > 0 ? 'normal' : 'reverse'}
        >
          {#each beltItems as id, idx (idx)}
            {@const s = SETS[id]}
            <button
              class="kanji-card"
              class:selected={selectedIds.includes(id)}
              onclick={() => toggleSelect(id)}
              aria-pressed={selectedIds.includes(id)}
            >
              <div class="kanji-card-text">{s.name}</div>
              {#if selectedIds.includes(id)}
                <div class="check-mark" aria-hidden="true">✓</div>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <button class="arrow arrow-right" onclick={flickRight} aria-label="みぎへ">▶</button>
    </div>

    {#if selectedIds.length > 0}
      <button class="btn btn--primary big start-play-btn" onclick={startPlay}>
        ✨ えらんだ {selectedIds.length} つで あそぶ
      </button>
    {/if}
  {/if}
</main>

<style>
  .page {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background: radial-gradient(circle at 30% 20%, #fef9c3 0%, #fef3c7 60%, #fde68a 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }

  /* === 背景装飾 === */
  .bg-decor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }
  .bg-decor > * {
    position: absolute;
    opacity: 0.55;
  }
  .cloud { font-size: 3.2rem; color: #ffffff; animation: drift 14s ease-in-out infinite alternate; }
  .cloud-1 { top: 8%;  left: 5%; }
  .cloud-2 { top: 32%; right: 8%; animation-delay: 4s; font-size: 2.6rem; }
  .cloud-3 { bottom: 18%; left: 18%; animation-delay: 8s; font-size: 3rem; }
  .star { font-size: 1.8rem; animation: twinkle 3s ease-in-out infinite; }
  .star-1 { top: 22%; left: 25%; animation-delay: 0.5s; }
  .star-2 { top: 50%; right: 25%; animation-delay: 1.5s; }
  .star-3 { bottom: 30%; right: 12%; animation-delay: 2.2s; }
  .planet { font-size: 2.4rem; animation: drift 18s ease-in-out infinite alternate; }
  .planet-1 { top: 12%; right: 18%; animation-delay: 2s; }
  .planet-2 { bottom: 22%; left: 8%; animation-delay: 6s; }

  @keyframes drift {
    0%   { transform: translateX(0)    translateY(0); }
    100% { transform: translateX(20px) translateY(-8px); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(0.85); }
    50%      { opacity: 0.8; transform: scale(1.15); }
  }

  /* === タイトル：画面外（上）→ 中央上 60% 位置へ降下 === */
  .app-title {
    position: relative;
    z-index: 2;
    margin: 0;
    font-size: clamp(2.4rem, 8vw, 4.5rem);
    font-weight: 900;
    color: #2a4d6b;
    letter-spacing: 0.08em;
    text-align: center;
    text-shadow:
      0 3px 0 rgba(255, 255, 255, 0.8),
      0 6px 20px rgba(0, 0, 0, 0.15);
    background: linear-gradient(180deg, #fde047, #fbbf24);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    /* 初期位置 = 画面外上 */
    transform: translateY(-150vh) rotate(-12deg);
    opacity: 0;
    transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out;
    /* 中央 60% 位置（top 30vh 周辺）に絶対配置 */
    margin-top: 18vh;
  }
  .app-title.visible {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }

  /* === 「あそぶ」ボタン === */
  .play-btn {
    position: relative;
    z-index: 2;
    margin-top: 3rem;
    opacity: 0;
    transform: translateY(20px) scale(0.9);
    transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
  }
  .play-btn.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
    animation: btn-pulse 1.4s ease-in-out 0.5s infinite;
  }
  @keyframes btn-pulse {
    0%, 100% { box-shadow: inset 0 -5px 0 rgba(146, 64, 14, 0.18), 0 7px 0 #c2750c, 0 10px 18px rgba(194, 117, 12, 0.3), 0 0 0 0 rgba(251, 191, 36, 0.6); }
    50%      { box-shadow: inset 0 -5px 0 rgba(146, 64, 14, 0.18), 0 7px 0 #c2750c, 0 10px 18px rgba(194, 117, 12, 0.3), 0 0 0 18px rgba(251, 191, 36, 0); }
  }

  /* === カードスライダー === */
  .slider-wrap {
    position: relative;
    z-index: 2;
    width: 100%;
    margin-top: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fadeUp 0.5s ease-out;
  }
  @keyframes fadeUp {
    0%   { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .arrow {
    flex: 0 0 auto;
    width: 2.8rem;
    height: 6rem;
    border: none;
    background: linear-gradient(180deg, #fde047 0%, #fbbf24 60%, #f59e0b 100%);
    color: #1f2937;
    font-size: 1.6rem;
    font-weight: 900;
    border-radius: 0.8rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    box-shadow: inset 0 -3px 0 rgba(146, 64, 14, 0.2), 0 4px 0 #c2750c, 0 6px 12px rgba(194, 117, 12, 0.25);
    transition: transform 0.08s, box-shadow 0.08s;
  }
  .arrow:active {
    transform: translateY(2px);
    box-shadow: inset 0 -1px 0 rgba(146, 64, 14, 0.2), 0 2px 0 #c2750c, 0 3px 6px rgba(194, 117, 12, 0.2);
  }

  /* スライダービューポート（透明ベルト・カードのみ浮遊） */
  .slider-viewport {
    flex: 1;
    overflow: hidden;
    padding: 1rem 0;
  }
  .card-belt {
    display: flex;
    gap: 1rem;
    width: max-content;
    animation: scroll-belt linear infinite;
  }
  @keyframes scroll-belt {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-33.3333%); }
  }

  /* === カード === */
  .kanji-card {
    flex: 0 0 auto;
    width: clamp(5rem, 16vw, 7rem);
    aspect-ratio: 3 / 4;
    border: none;
    background: linear-gradient(180deg, #ffffff 0%, #fffbeb 50%, #fef3c7 100%);
    border-radius: 1rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    box-shadow:
      inset 0 -4px 0 rgba(146, 64, 14, 0.12),
      0 6px 0 #d4a36a,
      0 8px 14px rgba(194, 117, 12, 0.25);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0.6rem 0.3rem;
  }
  .kanji-card:hover {
    filter: brightness(1.05);
  }
  .kanji-card.selected {
    background: linear-gradient(180deg, #fde047 0%, #fbbf24 60%, #f59e0b 100%);
    transform: translateY(-8px) scale(1.06);
    box-shadow:
      inset 0 -4px 0 rgba(146, 64, 14, 0.2),
      0 10px 0 #c2750c,
      0 14px 22px rgba(194, 117, 12, 0.4),
      0 0 0 4px rgba(251, 191, 36, 0.55);
    animation: card-wiggle 0.5s ease-in-out;
  }
  @keyframes card-wiggle {
    0%, 100% { transform: translateY(-8px) scale(1.06) rotate(0deg); }
    25%      { transform: translateY(-10px) scale(1.08) rotate(-3deg); }
    75%      { transform: translateY(-10px) scale(1.08) rotate(3deg); }
  }

  /* カードの漢字：縦書き・上揃え・中央寄せ */
  .kanji-card-text {
    writing-mode: vertical-rl;
    -webkit-writing-mode: vertical-rl;
    font-size: clamp(1.6rem, 5.5vw, 2.4rem);
    font-weight: 800;
    color: #2a4d6b;
    letter-spacing: 0.1em;
    line-height: 1.1;
    margin: 0 auto;
    text-shadow: 0 2px 0 rgba(255, 255, 255, 0.6);
  }
  .check-mark {
    position: absolute;
    bottom: 0.3rem;
    left: 50%;
    transform: translateX(-50%);
    width: 1.5rem;
    height: 1.5rem;
    background: #16a34a;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    font-weight: 900;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  /* 確定ボタン */
  .start-play-btn {
    position: relative;
    z-index: 2;
    margin-top: 1.5rem;
    animation: fadeUp 0.4s ease-out, start-pulse 1.6s ease-in-out 0.4s infinite;
  }
  @keyframes start-pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.06); }
  }

  /* === ボタン共通（play では別途・root はインライン定義） === */
  :global(.btn) {
    font-family: inherit;
    font-weight: 800;
    cursor: pointer;
    border-radius: 999px;
    border: none;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: transform 0.08s, box-shadow 0.08s, filter 0.08s;
  }
  :global(.btn--primary) {
    background: linear-gradient(180deg, #fde047 0%, #fbbf24 55%, #f59e0b 100%);
    color: #1f2937;
    padding: 0.75rem 2.2rem;
    font-size: clamp(1.05rem, 4.2vw, 1.3rem);
    box-shadow:
      inset 0 -4px 0 rgba(146, 64, 14, 0.15),
      0 6px 0 #c2750c,
      0 8px 14px rgba(194, 117, 12, 0.25);
  }
  :global(.btn--primary.big) {
    padding: 1rem 3rem;
    font-size: clamp(1.3rem, 5vw, 1.7rem);
    box-shadow:
      inset 0 -5px 0 rgba(146, 64, 14, 0.18),
      0 7px 0 #c2750c,
      0 10px 18px rgba(194, 117, 12, 0.3);
  }
  :global(.btn--primary:active) {
    transform: translateY(4px);
    box-shadow:
      inset 0 -2px 0 rgba(146, 64, 14, 0.18),
      0 2px 0 #c2750c,
      0 3px 6px rgba(194, 117, 12, 0.2);
  }
</style>
