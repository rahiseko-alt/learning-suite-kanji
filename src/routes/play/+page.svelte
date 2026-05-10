<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import TraceCanvas from '$lib/components/TraceCanvas.svelte';
  import AssetSettings from '$lib/components/AssetSettings.svelte';
  import { getSetById, SET_ORDER } from '$lib/data/sets.js';

  // クエリパラメータ ?set=i / ?set=fei / ?set=aichi で漢字セットを切替（未指定時は井）
  let setId = $derived($page.url.searchParams.get('set') ?? 'i');
  let activeSet = $derived(getSetById(setId));
  // Session 266: 複数文字対応（kanjis 配列 + currentIndex で順次アクティブ化）
  let kanjis = $derived(activeSet.kanji);
  // Session 267 v3: お題のひらがな（各 kanji の reading 結合・例: 愛知県 → あいちけん）
  let activeReading = $derived(kanjis.map((k) => k.reading || '').join(''));

  function goHome() {
    goto(`${base}/`);
  }
  let currentIndex = $state(0);
  let activeKanji = $derived(kanjis[currentIndex] ?? kanjis[0]);
  // 次のセット（最後尾なら null → ホームへ動線）
  let nextSetId = $derived(SET_ORDER[SET_ORDER.indexOf(setId) + 1] ?? null);

  let phase = $state('start');
  let traceComps = $state([]);
  let animationStarted = $state(false);
  let showPraise = $state(false);
  let showSettings = $state(false);
  let countdown = $state(0); // 0 = 非表示 / 3,2,1 = カウントダウン中
  let cdEl = $state();
  // Session 266 v2: 各枠の「スタート押下済み」「できた!押下済み」を独立管理
  // → 全枠で最初からスタートボタンが表示され、押された枠だけ個別に start
  let startedFlags = $state([]);
  let completedFlags = $state([]);

  // kanjis 変化時にフラグ配列を初期化
  $effect(() => {
    const len = kanjis.length;
    startedFlags = Array(len).fill(false);
    completedFlags = Array(len).fill(false);
  });

  // setId 変化時に currentIndex リセット（セット切替時の状態クリア）
  $effect(() => {
    setId; // 依存追跡
    currentIndex = 0;
    showPraise = false;
    animationStarted = false;
    phase = 'start';
  });

  // countdown 変更ごとにアニメ再起動（要素は破棄せず animation だけリセット）
  $effect(() => {
    const v = countdown;
    if (!cdEl || v <= 0) return;
    cdEl.style.animation = 'none';
    void cdEl.offsetWidth; // reflow を強制してアニメをリセット
    cdEl.style.animation = '';
  });

  // ユーザーカスタマイズ可能アセット
  let assets = $state({
    character: null, // null = デフォルト🐱 / DataURL = アップロード画像
    background: null,
    emoji: null
  });
  // Session 267 v3: 各画像の位置/拡大縮小調整（character/emoji = transform translate+scale 用、background = background-position/size 用）
  let adjustments = $state({
    character: { x: 0, y: 0, scale: 1 },
    background: { x: 50, y: 50, scale: 1 }, // background-position 単位 % / size は scale*100%
    emoji: { x: 0, y: 0, scale: 1 }
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
        if (data.background) assets.background = data.background;
        if (data.emoji) assets.emoji = data.emoji;
      }
      const savedAdj = localStorage.getItem(ADJ_KEY);
      if (savedAdj) {
        const data = JSON.parse(savedAdj);
        for (const key of ['character', 'background', 'emoji']) {
          if (data[key]) Object.assign(adjustments[key], data[key]);
        }
      }
    } catch (e) {}
  });

  function saveAssets() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
      localStorage.setItem(ADJ_KEY, JSON.stringify(adjustments));
    } catch (e) {}
  }

  function start() {
    phase = 'practice';
    animationStarted = false;
    showPraise = false;
    currentIndex = 0;
    startedFlags = Array(kanjis.length).fill(false);
    completedFlags = Array(kanjis.length).fill(false);
  }

  async function runCountdownThen(action) {
    // Session 265: カウントダウン音声は削除（マスター指示）。視覚のみで 3-2-1 表示
    // 数字表示 970ms × 3 = 2.91 秒
    for (let i = 3; i >= 1; i--) {
      countdown = i;
      await new Promise((r) => setTimeout(r, 970));
      if (!animationStarted) {
        countdown = 0;
        return;
      }
    }
    countdown = 0;
    // 余韻 300ms → ナビスタート
    await new Promise((r) => setTimeout(r, 300));
    if (!animationStarted) return;
    action?.();
  }

  // Session 267 B1 修正: 配列要素直接代入を spread (.with) に統一して reactivity を確実発火
  //   → completedFlags.every() が done 後に再評価されず praise が出ないバグを解消
  async function startKanji(i) {
    currentIndex = i;
    startedFlags = startedFlags.with(i, true);
    animationStarted = true;
    await runCountdownThen(() => traceComps[i]?.replayDemo?.());
  }

  // onRestart prop で呼ばれるエイリアス（TraceCanvas 内のやりなおしキャッチアップ）
  async function startAnimation() {
    await startKanji(currentIndex);
  }

  // Session 267 S1+S3: 各枠ローカル「できた!」（per-i）。全枠完了で praise overlay 発火
  function doneKanji(i) {
    traceComps[i]?.freezeCompleted?.();
    completedFlags = completedFlags.with(i, true);
    if (completedFlags.every((f) => f)) {
      showPraise = true;
    } else {
      animationStarted = false;
    }
  }

  // 「もういっかい」: praise から最初に戻す（全枠リセット・全スタートボタン再表示）
  function retry() {
    showPraise = false;
    currentIndex = 0;
    traceComps.forEach((t) => t?.clearAll?.());
    startedFlags = Array(kanjis.length).fill(false);
    completedFlags = Array(kanjis.length).fill(false);
    animationStarted = false;
  }

  // Session 267 S1+S2+B2: 各枠ローカル「やりなおし」（per-i）。その枠のみリセット
  async function replayKanji(i) {
    currentIndex = i;
    animationStarted = true;
    traceComps[i]?.clearAll?.();
    completedFlags = completedFlags.with(i, false);
    startedFlags = startedFlags.with(i, true);
    await runCountdownThen(() => traceComps[i]?.replayDemo?.());
  }

  function closeSettings() {
    saveAssets();
    showSettings = false;
  }
</script>

<svelte:head>
  <title>「{activeSet.name}」をかこう</title>
</svelte:head>

<main
  class="page"
  style:background-image={assets.background ? `url("${assets.background}")` : null}
  style:background-position={assets.background ? `${adjustments.background.x}% ${adjustments.background.y}%` : null}
  style:background-size={assets.background ? `${Math.round(adjustments.background.scale * 100)}% auto` : null}
>
  <!-- 背景装飾（デフォルト時のみ表示・子供向けポップアート風の雲） -->
  {#if !assets.background}
    <div class="bg-decor" aria-hidden="true">
      <span class="cloud cloud-1">☁</span>
      <span class="cloud cloud-2">☁</span>
      <span class="cloud cloud-3">☁</span>
      <span class="star star-1">⭐</span>
      <span class="star star-2">✨</span>
      <span class="star star-3">🌟</span>
    </div>
  {/if}

  <!-- 設定ボタン（start phase のみ左上・practice phase では topbar 内に配置） -->
  {#if phase === 'start'}
    <button
      class="btn btn--icon settings-pos"
      onclick={() => (showSettings = true)}
      aria-label="設定"
    >⚙</button>
  {/if}

  <!-- 応援キャラクター（右上 floating・Session 267 v3 で位置・スケール調整可。char-bob は inner に分離） -->
  <div
    class="character"
    aria-hidden="true"
    style:transform={`translate(${adjustments.character.x}%, ${adjustments.character.y}%) scale(${adjustments.character.scale})`}
  >
    <div class="character-inner">
      {#if assets.character}
        <img src={assets.character} alt="" />
      {:else}
        <div class="default-char">🐱</div>
      {/if}
    </div>
  </div>

  {#if phase === 'start'}
    <div class="start-screen">
      <div class="kanji-display">{activeReading}</div>
      <h1>「{activeReading}」を かこう！</h1>
      <button class="btn btn--primary big" onclick={start}>▶ はじめる</button>
    </div>

  {:else if phase === 'practice'}
    <div class="topbar topbar-sticky">
      <button class="btn btn--icon home-btn" onclick={goHome} aria-label="ホームへ">🏠</button>
      <div class="title-small">「{activeReading}」</div>
      <button class="btn btn--icon settings-btn" onclick={() => (showSettings = true)} aria-label="設定">⚙</button>
    </div>

    <!-- Session 267 S4: 上部グローバルボタン撤去（各枠ボタンが代替） -->

    <div class="play-area" class:multi={kanjis.length > 1}>
      <div class="canvas-area">
        {#each kanjis as k, i (k.char)}
          <div class="canvas-wrap">
            <!-- Session 267 S1+S2: 上=スタート/やりなおし切替 -->
            <div class="frame-action frame-action-top">
              {#if !startedFlags[i]}
                <button
                  class="btn btn--primary frame-btn"
                  onclick={() => startKanji(i)}
                >▶ スタート</button>
              {:else}
                <button
                  class="btn btn--secondary frame-btn"
                  onclick={() => replayKanji(i)}
                >↻ やりなおし</button>
              {/if}
            </div>

            <div class="canvas-host">
              <div class="reading-badge" aria-hidden="true">{k.reading ?? ''}</div>
              <TraceCanvas
                bind:this={traceComps[i]}
                kanji={k}
                onRestart={() => startKanji(i)}
              />
              {#if i === currentIndex && countdown > 0}
                <div class="countdown-overlay" aria-live="assertive">
                  <div class="countdown-num" bind:this={cdEl}>{countdown}</div>
                </div>
              {/if}
            </div>

            <!-- Session 267 S1+S2: 下=できた! -->
            <div class="frame-action frame-action-bottom">
              <button
                class="btn btn--primary frame-btn"
                onclick={() => doneKanji(i)}
                disabled={!startedFlags[i] || completedFlags[i]}
              >できた！</button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    {#if showPraise}
      <div class="praise-overlay" role="dialog" aria-modal="true">
        <div class="praise-card">
          <div class="confetti">
            <span class="conf c1">🎉</span>
            <span class="conf c2">⭐</span>
            <span class="conf c3">✨</span>
            <span class="conf c4">💫</span>
            <span class="conf c5">🌟</span>
          </div>
          <div
            class="praise-emoji"
            style:transform={`translate(${adjustments.emoji.x}%, ${adjustments.emoji.y}%) scale(${adjustments.emoji.scale})`}
          >
            <div class="praise-emoji-inner">
              {#if assets.emoji}
                <img src={assets.emoji} alt="" />
              {:else}
                🎉
              {/if}
            </div>
          </div>
          <h2>やったね！！</h2>
          <p>{kanjis.length > 1 ? `「${activeSet.name}」ぜんぶかけたね！` : 'かんぺきにかけたね！'}</p>
          <div class="praise-actions">
            <button class="btn btn--primary big" onclick={retry}>もういっかい</button>
            {#if nextSetId}
              <button class="btn btn--primary big next-btn" onclick={() => goto(`${base}/play?set=${nextSetId}`)}>
                つぎへ →
              </button>
            {:else}
              <button class="btn btn--secondary big" onclick={() => goto(`${base}/`)}>
                ホームへ
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {/if}

  {#if showSettings}
    <AssetSettings bind:assets bind:adjustments onclose={closeSettings} />
  {/if}
</main>

<style>
  .page {
    min-height: 100vh;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    position: relative;
    background-color: #fef3c7;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  /* === 背景装飾（雲・星 ふわふわ漂う・デフォルト時のみ） === */
  .bg-decor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }
  .bg-decor > * {
    position: absolute;
    opacity: 0.45;
  }
  .cloud {
    font-size: 3rem;
    color: #ffffff;
    animation: drift 14s ease-in-out infinite alternate;
  }
  .cloud-1 { top: 8%;  left: 5%; }
  .cloud-2 { top: 30%; right: 8%; animation-delay: 4s; font-size: 2.4rem; }
  .cloud-3 { bottom: 15%; left: 15%; animation-delay: 8s; font-size: 2.8rem; }
  .star {
    font-size: 1.6rem;
    animation: twinkle 3s ease-in-out infinite;
  }
  .star-1 { top: 22%; left: 20%; animation-delay: 0.5s; }
  .star-2 { top: 50%; right: 22%; animation-delay: 1.5s; }
  .star-3 { bottom: 25%; right: 10%; animation-delay: 2.2s; }

  @keyframes drift {
    0%   { transform: translateX(0) translateY(0); }
    100% { transform: translateX(20px) translateY(-8px); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(0.85); }
    50% { opacity: 0.7; transform: scale(1.15); }
  }

  /* === 設定ボタンの位置（立体感は global .btn--icon） === */
  .settings-pos {
    position: absolute;
    top: 0.7rem;
    left: 0.7rem;
    z-index: 4;
  }

  /* === 応援キャラクター（右上 floating・Session 267 v3 で +50% 拡大 + 位置/スケール調整可） === */
  /* .character には user の transform、char-bob アニメは .character-inner に分離（衝突回避） */
  .character {
    position: absolute;
    top: 0.6rem;
    right: 0.8rem;
    z-index: 3;
    width: clamp(5.25rem, 18vw, 7.5rem);
    height: clamp(5.25rem, 18vw, 7.5rem);
  }
  .character-inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: char-bob 2.6s ease-in-out infinite;
  }
  .character img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
  }
  .default-char {
    font-size: clamp(4.2rem, 15vw, 6rem);
    line-height: 1;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
  }
  @keyframes char-bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }

  /* === start phase === */
  .start-screen {
    position: relative;
    z-index: 1;
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 1.5rem;
  }
  .kanji-display {
    font-size: clamp(4.5rem, 18vw, 7.5rem);
    line-height: 1;
    color: #1f2937;
    text-shadow: 0 4px 0 rgba(255, 255, 255, 0.6), 0 8px 20px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.6);
    border-radius: 1.5rem;
    padding: 0.5rem 2rem;
  }
  .start-screen h1 {
    font-size: clamp(1.4rem, 5vw, 1.9rem);
    color: #1f2937;
    margin: 0;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 1rem;
    padding: 0.5rem 1.2rem;
  }

  /* === practice phase === */
  /* Session 267 v3: topbar を sticky 化 + 左 home / 中央 title / 右 settings */
  .topbar {
    z-index: 10;
    width: 100%;
    max-width: 480px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .topbar-sticky {
    position: sticky;
    top: 0;
    background: rgba(254, 243, 199, 0.92);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    padding: 0.5rem 0.75rem;
    border-radius: 0 0 1rem 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }
  .home-btn,
  .settings-btn {
    flex: 0 0 auto;
  }
  .title-small {
    flex: 1;
    text-align: center;
    font-size: clamp(1.5rem, 6vw, 2rem);
    font-weight: 700;
    color: #1f2937;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 999px;
    padding: 0.3rem 1.2rem;
  }
  /* Session 267 v3: 各記入枠の左上に永続表示するひらがなラベル */
  .reading-badge {
    position: absolute;
    top: 0.4rem;
    left: 0.4rem;
    z-index: 4;
    font-size: clamp(1.1rem, 4vw, 1.5rem);
    font-weight: 800;
    color: #1f2937;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #f59e0b;
    border-radius: 0.6rem;
    padding: 0.1rem 0.5rem;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  /* Session 266: 複数文字横並び対応 — 単漢字は max-width 480px、複数は 800px に拡張 */
  .play-area {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 480px;
    display: flex;
    justify-content: center;
  }
  .play-area.multi {
    max-width: 900px;
  }
  /* Session 266 v3: マスター指示「枠の大きさはいつも全部同じ」 → 動的サイズ変化を撤回し常に均等表示 */
  .canvas-area {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    width: 100%;
    align-items: flex-start;
    justify-content: center;
  }
  /* Session 267 S1+S2: 各枠は flex column（上=スタート/やりなおし、中=Canvas、下=できた!） */
  .canvas-wrap {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .canvas-host {
    position: relative;
    width: 100%;
  }
  .frame-action {
    display: flex;
    justify-content: center;
  }
  .frame-action :global(.frame-btn) {
    width: 100%;
    padding: 0.55rem 0.6rem;
    font-size: clamp(0.85rem, 3vw, 1rem);
    white-space: nowrap;
  }
  .frame-action :global(.frame-btn[disabled]) {
    opacity: 0.5;
    cursor: default;
    filter: brightness(0.97);
  }

  /* Session 267 R1+R2: スマホ縦配置（PC・タブレット 横配置を維持） */
  @media (max-width: 600px) {
    .play-area.multi {
      max-width: 100%;
    }
    .play-area.multi .canvas-area {
      flex-direction: column;
      gap: 1rem;
    }
    .play-area.multi .canvas-wrap {
      width: 100%;
      max-width: 380px;
      margin: 0 auto;
    }
  }

  /* === カウントダウンオーバーレイ（背景透明・数字だけ） === */
  .countdown-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 6;
    pointer-events: none;
    background: transparent;
  }
  .countdown-num {
    font-size: clamp(6rem, 26vw, 10rem);
    font-weight: 900;
    color: #f59e0b;
    text-shadow:
      0 4px 0 #c2750c,
      0 8px 0 rgba(146, 64, 14, 0.5),
      0 14px 30px rgba(0, 0, 0, 0.3);
    /* setTimeout(970ms) と完全同期 → 数字切替時の空白フレームをゼロに */
    animation: countdown-pop 0.97s ease-out forwards;
    line-height: 1;
  }
  @keyframes countdown-pop {
    0%   { transform: scale(0.3); opacity: 0; }
    18%  { transform: scale(1.35); opacity: 1; }
    80%  { transform: scale(1.0); opacity: 1; }
    100% { transform: scale(1.0); opacity: 1; } /* 終端で消えない・次の値に上書きされて再生 */
  }

  /* === 評価オーバーレイ === */
  .praise-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    animation: fadeIn 0.25s ease-out;
  }
  .praise-card {
    position: relative;
    background: #ffffff;
    border-radius: 1.5rem;
    padding: 2.5rem 2rem;
    text-align: center;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
    max-width: 88vw;
    animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: visible;
  }
  /* Session 267 v3: user transform 効くように .praise-emoji-inner に bounce 分離 */
  .praise-emoji {
    font-size: clamp(3.5rem, 14vw, 5rem);
    line-height: 1;
    margin-bottom: 0.5rem;
  }
  .praise-emoji-inner {
    display: inline-block;
    animation: bounce 0.7s ease-in-out infinite alternate;
  }
  .praise-emoji img {
    width: clamp(4.5rem, 18vw, 6rem);
    height: clamp(4.5rem, 18vw, 6rem);
    object-fit: contain;
  }
  .praise-card h2 {
    font-size: clamp(2rem, 7vw, 2.8rem);
    color: #b91c1c;
    margin: 0 0 0.5rem;
  }
  .praise-card p {
    font-size: clamp(1.1rem, 4.5vw, 1.4rem);
    color: #1f2937;
    margin: 0 0 1.5rem;
  }
  /* Session 265: praise overlay 内に「もういっかい」+「つぎへ」or「ホームへ」を縦並び */
  .praise-actions {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    align-items: stretch;
  }
  .confetti {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .conf {
    position: absolute;
    font-size: 1.8rem;
    opacity: 0;
    animation: confetti-pop 1.6s ease-out infinite;
  }
  .c1 { top: -10px; left: 12%; animation-delay: 0.1s; }
  .c2 { top: -5px; right: 14%; animation-delay: 0.4s; }
  .c3 { top: 30%; left: -10px; animation-delay: 0.7s; }
  .c4 { top: 28%; right: -10px; animation-delay: 1.0s; }
  .c5 { bottom: -10px; left: 40%; animation-delay: 1.3s; }

  @keyframes confetti-pop {
    0% { opacity: 0; transform: scale(0.4) rotate(0deg); }
    20% { opacity: 1; transform: scale(1.2) rotate(20deg); }
    60% { opacity: 1; transform: scale(1) rotate(-10deg); }
    100% { opacity: 0; transform: scale(0.6) rotate(30deg); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pop {
    0% { transform: scale(0.6); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-12px); }
  }

  /* === ボタン統一デザイン（全ファイル共通の立体感） === */
  /* base */
  :global(.btn) {
    font-family: inherit;
    font-weight: 800;
    cursor: pointer;
    border-radius: 999px;
    border: none;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: transform 0.08s, box-shadow 0.08s, filter 0.08s;
    position: relative;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
    line-height: 1.2;
  }
  /* primary（メイン CTA・黄色立体） */
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
  :global(.btn--primary:hover) {
    filter: brightness(1.05);
  }
  :global(.btn--primary:active) {
    transform: translateY(4px);
    box-shadow:
      inset 0 -2px 0 rgba(146, 64, 14, 0.18),
      0 2px 0 #c2750c,
      0 3px 6px rgba(194, 117, 12, 0.2);
  }
  /* secondary（補助・白〜灰立体） */
  :global(.btn--secondary) {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 60%, #e2e8f0 100%);
    color: #334155;
    padding: 0.55rem 1.3rem;
    font-size: clamp(0.95rem, 3.6vw, 1.1rem);
    box-shadow:
      inset 0 -3px 0 rgba(100, 116, 139, 0.12),
      0 4px 0 #94a3b8,
      0 5px 10px rgba(100, 116, 139, 0.2);
  }
  :global(.btn--secondary:hover) {
    filter: brightness(1.03);
  }
  :global(.btn--secondary:active) {
    transform: translateY(3px);
    box-shadow:
      inset 0 -1px 0 rgba(100, 116, 139, 0.15),
      0 1px 0 #94a3b8,
      0 2px 4px rgba(100, 116, 139, 0.15);
  }
  /* icon（円形・小型立体・Session 267 v3 で +25% 拡大） */
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
  :global(.btn--disabled),
  :global(.btn[disabled]) {
    cursor: default;
    filter: brightness(0.97);
  }
</style>
