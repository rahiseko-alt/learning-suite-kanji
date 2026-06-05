<script>
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { SETS, SET_ORDER } from '$lib/data/sets.js';
  import AssetSettings from '$lib/components/AssetSettings.svelte';
  import { onMount } from 'svelte';

  // Session 267 v5: トップページ全面リニューアル
  // 1. タイトル降下（画面外上から → 中央 60%）
  // 2. 0.5 秒後にボタンフェードイン
  // 3. 「あそぶ」押下でカードスライド出現（無限ループ・右→左）
  // 4. カードタップで複数選択トグル + 揺れアニメ
  // 5. 左右矢印で手動フリック（一時的にスピード倍率変更）
  // 6. 1 つ以上選択で確定ボタン表示 → /play?sets= に遷移
  // Session 273: 設定ボタン追加（play 画面と同じ AssetSettings モーダル・localStorage 共有）

  let titleVisible = $state(false);
  let buttonVisible = $state(false);
  let listVisible = $state(false);
  let selectedIds = $state([]);
  let showSettings = $state(false);

  // ユーザーカスタマイズ可能アセット（play 画面と同一 STORAGE_KEY で共有）
  let assets = $state({
    character: null,
    emoji: null,
    icon: null,
    // play 画面の「次へ進む系」ボタン背景画像。同一 STORAGE_KEY 共有のため既定を揃え、トップ保存で消さない
    next1: null,
    next2: null,
    next3: null,
    doneButton: null
  });
  let adjustments = $state({
    character: { x: 0, y: 0, scale: 1 },
    emoji: { x: 0, y: 0, scale: 1 },
    icon: { x: 0, y: 0, scale: 1 },
    next1: { x: 0, y: 0, scale: 1 },
    next2: { x: 0, y: 0, scale: 1 },
    next3: { x: 0, y: 0, scale: 1 },
    doneButton: { x: 0, y: 0, scale: 1 }
  });

  const STORAGE_KEY = 'learning-suite:kanji:assets';
  const ADJ_KEY = 'learning-suite:kanji:adjustments';

  $effect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.character) assets.character = data.character;
        if (data.emoji) assets.emoji = data.emoji;
        if (data.icon) assets.icon = data.icon;
        for (const k of ['next1', 'next2', 'next3', 'doneButton']) {
          if (data[k]) assets[k] = data[k];
        }
      }
      const savedAdj = localStorage.getItem(ADJ_KEY);
      if (savedAdj) {
        const data = JSON.parse(savedAdj);
        for (const key of ['character', 'emoji']) {
          if (data[key]) Object.assign(adjustments[key], data[key]);
        }
      }
    } catch (e) {}
  });

  // user upload icon があれば apple-touch-icon を動的に差し替え（play 画面と同様）
  $effect(() => {
    if (typeof document === 'undefined') return;
    const link = document.getElementById('apple-touch-icon');
    if (!link) return;
    if (assets.icon) {
      link.href = assets.icon;
    }
  });

  function saveAssets() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
      localStorage.setItem(ADJ_KEY, JSON.stringify(adjustments));
    } catch (e) {}
  }

  function closeSettings() {
    saveAssets();
    showSettings = false;
  }

  onMount(() => {
    setTimeout(() => { titleVisible = true; }, 80);
    setTimeout(() => { buttonVisible = true; }, 1500);
  });

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
</script>

<svelte:head>
  <title>かんじでアソボ！</title>
</svelte:head>

<main class="page">
  <!-- 設定ボタン（左上・play 画面と同位置） -->
  <button
    class="btn btn--icon settings-pos"
    onclick={() => (showSettings = true)}
    aria-label="設定"
  >⚙</button>

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

  <!-- マスコット（Session 273: 王道シンプル路線・タイトル上方に拡大配置） -->
  <div class="title-mascot" class:visible={titleVisible} aria-hidden="true">
    {#if assets.character}
      <img src={assets.character} alt="" />
    {:else}
      🐱
    {/if}
  </div>

  <!-- タイトル：画面外（上）から中央位置へ降下 -->
  <h1 class="app-title" class:visible={titleVisible}>かんじでアソボ！</h1>

  <!-- 「あそぶ」ボタン（タイトル降下後 0.5 秒でフェードイン） -->
  {#if !listVisible}
    <button
      class="btn btn--primary big play-btn"
      class:visible={buttonVisible}
      onclick={() => { listVisible = true; }}
      disabled={!buttonVisible}
    >▶ あそぶ</button>
  {/if}

  <!-- 縦一覧セット選択（押下後に出現） -->
  {#if listVisible}
    <div class="set-list">
      {#each SET_ORDER as id}
        {@const s = SETS[id]}
        <button
          class="set-card"
          class:selected={selectedIds.includes(id)}
          onclick={() => toggleSelect(id)}
        >
          <span class="set-kanji">{s.name}</span>
          <span class="set-label">{s.label}</span>
        </button>
      {/each}
    </div>

    {#if selectedIds.length > 0}
      <button class="btn btn--primary big start-play-btn" onclick={startPlay}>
        ✨ えらんだ {selectedIds.length} つで あそぶ
      </button>
    {/if}
  {/if}

  {#if showSettings}
    <AssetSettings bind:assets bind:adjustments onclose={closeSettings} />
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

  /* === マスコット（Session 273: 王道シンプル路線・タイトル上方に拡大） === */
  .title-mascot {
    position: relative;
    z-index: 2;
    margin-top: 8vh;
    font-size: clamp(5rem, 22vw, 9rem);
    line-height: 1;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.18));
    /* 初期 = 透明・少し小さい */
    opacity: 0;
    transform: translateY(20px) scale(0.7);
    transition:
      opacity 0.5s ease-out 0.4s,
      transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s;
  }
  .title-mascot.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    animation: mascot-bob 2.4s ease-in-out 1.2s infinite;
  }
  .title-mascot img {
    width: clamp(5rem, 22vw, 9rem);
    height: clamp(5rem, 22vw, 9rem);
    object-fit: contain;
    border-radius: 50%;
  }
  @keyframes mascot-bob {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-12px) scale(1); }
  }

  /* === タイトル：画面外（上）→ 中央位置へ降下（Session 273 王道シンプル化） === */
  .app-title {
    position: relative;
    z-index: 2;
    margin: 0;
    margin-top: 1.2rem; /* マスコットからの間隔 */
    font-size: clamp(2.4rem, 8.5vw, 4.5rem);
    font-weight: 900;
    color: #b91c1c;
    letter-spacing: 0.08em;
    text-align: center;
    /* 丸ゴシック優先 → 学校で習う字形に近づける */
    font-family: "Hiragino Maru Gothic ProN", "Hiragino Maru Gothic Std", "Yu Gothic UI", "Meiryo", system-ui, sans-serif;
    -webkit-text-stroke: 4px #ffffff;
    paint-order: stroke fill;
    /* 単一の下方シャドウのみ（多層立体は撤去） */
    text-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
    /* 初期位置 = 画面外上 */
    transform: translateY(-150vh) rotate(-12deg);
    opacity: 0;
    transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out;
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

  /* === 縦一覧セット選択 === */
  .set-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 480px;
    width: 100%;
    margin: 16px auto 0;
    padding: 0 16px;
    position: relative;
    z-index: 2;
  }

  .set-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 20px;
    background: #fff;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: border-color 0.15s, background 0.15s;
    -webkit-tap-highlight-color: transparent;
  }

  .set-card.selected {
    border-color: #6366f1;
    background: #eef2ff;
  }

  .set-card:hover {
    border-color: #a5b4fc;
    background: #f5f3ff;
  }

  .set-kanji {
    font-size: 1.5rem;
    font-weight: 900;
    color: #1e293b;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  .set-label {
    font-size: 0.9rem;
    color: #475569;
  }

  @keyframes fadeUp {
    0%   { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
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
  /* icon（円形・小型立体）— play 画面と同一定義 */
  :global(.btn--icon) {
    width: 3.25rem;
    height: 3.25rem;
    padding: 0;
    border-radius: 999px;
    font-size: 1.5rem;
    background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
    color: #475569;
    box-shadow:
      inset 0 -2px 0 rgba(100, 116, 139, 0.12),
      0 3px 0 #94a3b8,
      0 4px 8px rgba(100, 116, 139, 0.18);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  :global(.btn--icon:active) {
    transform: translateY(2px);
    box-shadow:
      inset 0 -1px 0 rgba(100, 116, 139, 0.12),
      0 1px 0 #94a3b8,
      0 2px 4px rgba(100, 116, 139, 0.15);
  }
  /* 設定ボタンの位置（左上） */
  .settings-pos {
    position: absolute;
    top: 0.7rem;
    left: 0.7rem;
    z-index: 4;
  }
</style>
