<script>
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { SETS, SET_ORDER } from '$lib/data/sets.js';
  import { loadSavedSets, toggleSavedSet } from '$lib/utils/savedSets.js';
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

  let selectedIds = $state([]);
  let showSettings = $state(false);

  let sortMode = $state('default');
  let savedSetIds = $state([]);

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
    savedSetIds = loadSavedSets();
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

  function handleToggleSave(e, id) {
    e.stopPropagation();
    savedSetIds = toggleSavedSet(id);
  }
  function totalStrokes(set) {
    return set.kanji.reduce((sum, k) => sum + k.strokeCount, 0);
  }
  function getReading(set) {
    return set.reading || set.kanji[0]?.reading || '';
  }

  let displaySets = $derived.by(() => {
    let sets = SET_ORDER.map(id => SETS[id]);
    if (sortMode === 'saved')  sets = sets.filter(s => savedSetIds.includes(s.id));
    if (sortMode === 'stroke') sets = [...sets].sort((a, b) => totalStrokes(a) - totalStrokes(b));
    if (sortMode === 'aiueo')  sets = [...sets].sort((a, b) => getReading(a).localeCompare(getReading(b), 'ja'));
    return sets;
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

  <!-- 漢字選択（フルスクリーン） -->
  <div class="filter-bar">
      <button class="filter-tab" class:active={sortMode==='default'} onclick={() => sortMode='default'}>一覧</button>
      <button class="filter-tab" class:active={sortMode==='stroke'} onclick={() => sortMode='stroke'}>画数↑</button>
      <button class="filter-tab" class:active={sortMode==='aiueo'}  onclick={() => sortMode='aiueo'}>あいうえお</button>
      <button class="filter-tab" class:active={sortMode==='saved'}  onclick={() => sortMode='saved'}>⭐保存</button>
    </div>

    <div class="set-list-card">
      <div class="set-grid">
        {#each displaySets as s}
          <div class="set-tile" class:selected={selectedIds.includes(s.id)}>
            <button class="tile-main" onclick={() => toggleSelect(s.id)}>
              <span class="tile-kanji">{s.name}</span>
              <span class="tile-strokes">{totalStrokes(s)}画</span>
            </button>
            <button class="tile-save" class:saved={savedSetIds.includes(s.id)}
                    onclick={(e) => handleToggleSave(e, s.id)}>
              {savedSetIds.includes(s.id) ? '★' : '☆'}
            </button>
          </div>
        {/each}
      </div>
      {#if sortMode === 'saved' && displaySets.length === 0}
        <p class="empty-saved">まだ ☆ していないよ</p>
      {/if}
    </div>

    {#if selectedIds.length > 0}
      <button class="btn btn--primary big start-play-btn" onclick={startPlay}>
        ✨ えらんだ {selectedIds.length} つで あそぶ
      </button>
    {/if}

  {#if showSettings}
    <AssetSettings bind:assets bind:adjustments onclose={closeSettings} />
  {/if}
</main>

<style>
  .page {
    position: relative;
    height: 100dvh;
    overflow: hidden;
    background: radial-gradient(circle at 30% 20%, #fef9c3 0%, #fef3c7 60%, #fde68a 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem 1rem;
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

  /* === 縦一覧セット選択（カード内スクロール形式） === */
  .set-list-card {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    width: 100%;
    max-width: 480px;
    margin: 6px auto 0;
    background: #FDFBF7;
    border-radius: 0.8rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 8px 16px;
    position: relative;
    z-index: 2;
  }
  .set-list-card::-webkit-scrollbar { width: 6px; }
  .set-list-card::-webkit-scrollbar-track { background: rgba(245,240,230,0.5); border-radius: 4px; }
  .set-list-card::-webkit-scrollbar-thumb { background: rgba(100,100,100,0.3); border-radius: 4px; }

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
    flex-shrink: 0;
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

  /* === フィルタバー（4タブ均等） === */
  .filter-bar {
    display: flex;
    gap: 6px;
    margin-top: 4rem;
    width: 100%;
    max-width: 480px;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }
  .filter-tab {
    flex: 1;
    font-family: inherit;
    font-weight: 800;
    font-size: 1.1rem;
    padding: 0;
    min-height: 4.5rem;
    border-radius: 14px;
    border: 2.5px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.2;
  }
  .filter-tab.active {
    border-color: #6366f1;
    background: #eef2ff;
    color: #4338ca;
  }
  .filter-tab:last-child { border-color: #fde68a; color: #92400e; }
  .filter-tab:last-child.active { background: #fef3c7; border-color: #fbbf24; color: #92400e; }

  /* === グリッド表示 === */
  .set-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 4px 0;
  }
  .set-tile {
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .set-tile.selected { border-color: #6366f1; background: #eef2ff; }
  .tile-main {
    flex: 1;
    padding: 0.6rem 0.3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
    -webkit-tap-highlight-color: transparent;
  }
  .tile-kanji { font-size: 1.1rem; font-weight: 900; color: #1e293b; }
  .tile-strokes { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }
  .tile-save {
    border: none;
    border-top: 1px solid #f1f5f9;
    background: transparent;
    color: #fbbf24;
    opacity: 0.35;
    font-size: 0.85rem;
    padding: 0.2rem;
    cursor: pointer;
    width: 100%;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
  }
  .tile-save.saved { opacity: 1; background: #fffbeb; }

  .empty-saved {
    text-align: center;
    color: #94a3b8;
    font-size: 1rem;
    padding: 2rem 0;
  }
</style>
