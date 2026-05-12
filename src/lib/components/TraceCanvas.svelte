<script>
  import { base } from '$app/paths';
  // 描画＋お手本筆順アニメ＋覚え歌連動
  // kanji: 練習対象の漢字データ（lib/data/kanji/ 配下から渡される）
  // onRestart: 「やりなおし」が押されたら親に通知（スタート相当を発動）
  // active: 現在アクティブか（複数文字横並び時に親が制御。単漢字セットでは true 固定）
  //         false のときは pointer 入力受付なし・opacity を下げる・覚え歌窓を隠す
  let { kanji, onRestart = () => {}, active = true, onNaviDone = () => {} } = $props();

  let canvas = $state();
  let ctx;
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  // アニメ state
  let progress = $state(kanji.strokes.map(() => 0));
  let pathLengths = $state(kanji.strokes.map(() => 200));
  let currentStrokeIdx = $state(-1);
  let animFrameId = null;

  const PEN_WIDTH = 8;
  const PEN_COLOR = '#1e293b';
  // Session 266: 描画速度一定化（マスター指示「画数に限らず 1 ナビの速度を一定」）
  // 各画の duration = pathLength / VELOCITY * 1000 で計算 → 短い path は短時間・長い path は長時間（速度は同じ）
  const STROKE_VELOCITY = 60;          // SVG ユニット/秒（viewBox 109 単位系）
  const MIN_STROKE_DURATION_MS = 700;  // 極短画の最低時間（点など）
  const MAX_STROKE_DURATION_MS = 3500; // 極長画の最大時間（長いはらいなど）
  const STROKE_GAP_MS = 400;           // 画と画の間（変更なし）

  let preferredVoice = null;
  let currentAudio = null;

  // 覚え歌の縦スライド: 現在の画の動作語が窓の中央に来るよう transform で制御
  let lyricStripEl = $state();
  let lyricOffset = $state(0);

  // Session 266: 連続する同じ songFragment を 1 つにマージしたユニーク動作語列
  // 例 愛 13 画: 'ノ','ツ','ツ','ツ','ワ','ワ','心','心','心','心','ク','ク','右はらい'
  //   → uniqueFragments 6 個: ノ(0)/ツ(1)/ワ(4)/心(6)/ク(10)/右はらい(12)
  // 同じ動作語が連続する画では音声を再発火せず・ストリップも 1 つだけ表示する
  let uniqueFragments = $derived.by(() => {
    const arr = [];
    let lastFrag = null;
    kanji.strokes.forEach((s, i) => {
      if (s.songFragment !== lastFrag) {
        arr.push({ fragment: s.songFragment, color: s.color, startIdx: i });
        lastFrag = s.songFragment;
      }
    });
    return arr;
  });

  // currentStrokeIdx → uniqueFragments の対応 idx を取得
  function uniqueIdxFor(strokeIdx) {
    if (strokeIdx < 0) return -1;
    const arr = uniqueFragments;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].startIdx <= strokeIdx) return i;
    }
    return 0;
  }

  $effect(() => {
    if (!lyricStripEl) return;
    const total = uniqueFragments.length;
    if (total === 0) return;
    // currentStrokeIdx が -1 (開始前) は 0、終了状態は last を中央に
    const uniIdx = currentStrokeIdx < 0
      ? 0
      : currentStrokeIdx >= kanji.strokes.length
        ? total - 1
        : Math.min(total - 1, Math.max(0, uniqueIdxFor(currentStrokeIdx)));
    const fragEls = lyricStripEl.querySelectorAll('.lyric-frag');
    const frag = fragEls[uniIdx];
    if (!frag) return;
    const win = lyricStripEl.parentElement;
    if (!win) return;
    const winHeight = win.offsetHeight;
    const fragTop = frag.offsetTop;
    const fragHeight = frag.offsetHeight;
    lyricOffset = winHeight / 2 - fragTop - fragHeight / 2;
  });

  function loadVoices() {
    if (typeof window === 'undefined') return;
    const pick = () => {
      const voices = speechSynthesis.getVoices();
      const ja = voices.filter((v) => v.lang.toLowerCase().startsWith('ja'));
      preferredVoice =
        ja.find((v) => /child|kid|young/i.test(v.name)) ||
        ja.find((v) => /female|woman|kyoko|haruka|nanami|sayaka/i.test(v.name)) ||
        ja[0] ||
        null;
    };
    pick();
    speechSynthesis.onvoiceschanged = pick;
  }

  $effect(() => {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    setupCanvas();

    const ns = 'http://www.w3.org/2000/svg';
    pathLengths = kanji.strokes.map((s) => {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', s.d);
      return p.getTotalLength();
    });

    loadVoices();

    const ro = new ResizeObserver(setupCanvas);
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (typeof window !== 'undefined') speechSynthesis.cancel();
    };
  });

  function setupCanvas() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const newWidth = Math.round(rect.width * dpr);
    const newHeight = Math.round(rect.height * dpr);

    // Session 266 v2: サイズ不変なら何もしない（ユーザー記入を保持）
    if (canvas.width === newWidth && canvas.height === newHeight) return;

    // サイズが変わる場合（flex-grow 変化等）は、既存の内容を保存し新サイズに scale して再描画
    let snapshot = null;
    if (canvas.width > 0 && canvas.height > 0) {
      // tmpCanvas に現在内容をコピー（getImageData は raw pixel なので tmpCanvas 経由で drawImage scale）
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width;
      tmpCanvas.height = canvas.height;
      tmpCanvas.getContext('2d').drawImage(canvas, 0, 0);
      snapshot = tmpCanvas;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = PEN_WIDTH;
    ctx.strokeStyle = PEN_COLOR;
    ctx.fillStyle = PEN_COLOR;
    ctx.globalCompositeOperation = 'source-over';

    // ユーザー記入を新サイズで復元（scale）
    if (snapshot) {
      ctx.drawImage(snapshot, 0, 0, rect.width, rect.height);
    }
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function pointerDown(e) {
    // Session 266 v3: 全枠で書字可能（マスター指示「同じ見え方」）→ active チェックを撤回
    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);
    const p = getPos(e);
    drawing = true;
    lastX = p.x;
    lastY = p.y;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function pointerMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
  }

  function pointerUp(e) {
    if (!drawing) return;
    drawing = false;
    if (canvas.hasPointerCapture?.(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }

  function clearAll() {
    // 1. Canvas クリア
    if (ctx && canvas) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    // 2. アニメ停止
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    // 3. ボイス停止（mp3 + Web Speech 両方）
    if (typeof window !== 'undefined') {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
      speechSynthesis.cancel();
    }
    // 4. ナビ・進捗リセット（お手本ゴーストも非表示に戻す）
    progress = kanji.strokes.map(() => 0);
    currentStrokeIdx = -1;
  }

  // 動作語 → mp3 ファイル名マップ（static/audio/ 配下）
  const FRAG_TO_FILE = { 'よこ': 'yoko', 'たて': 'tate', 'ノ': 'no' };

  function speakFragment(idx) {
    if (typeof window === 'undefined') return;
    const fragment = kanji.strokes[idx].songFragment;
    const filename = FRAG_TO_FILE[fragment];

    if (filename) {
      // 既存音声を停止してから再生（重なり防止）
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      currentAudio = new Audio(`${base}/audio/${filename}.mp3`);
      currentAudio.volume = 1.0;
      currentAudio.play().catch(() => {
        speakFallback(fragment);
      });
    } else {
      speakFallback(fragment);
    }
  }

  function speakFallback(fragment) {
    if (typeof window === 'undefined') return;
    const u = new SpeechSynthesisUtterance(fragment + 'ー');
    u.lang = 'ja-JP';
    u.rate = 0.85;
    u.pitch = 1.4;
    u.volume = 1.0;
    if (preferredVoice) u.voice = preferredVoice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function replayDemo() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (typeof window !== 'undefined') speechSynthesis.cancel();
    progress = kanji.strokes.map(() => 0);
    currentStrokeIdx = -1;

    let strokeIdx = 0;
    let strokeStartTs = null;
    let inGap = false;
    let gapStartTs = null;

    function step(ts) {
      if (strokeIdx >= kanji.strokes.length) {
        progress = kanji.strokes.map(() => 1);
        currentStrokeIdx = kanji.strokes.length;
        animFrameId = null;
        onNaviDone();
        return;
      }

      if (inGap) {
        if (gapStartTs == null) gapStartTs = ts;
        if (ts - gapStartTs >= STROKE_GAP_MS) {
          strokeIdx++;
          inGap = false;
          gapStartTs = null;
          strokeStartTs = null;
        }
        animFrameId = requestAnimationFrame(step);
        return;
      }

      if (strokeStartTs == null) {
        strokeStartTs = ts;
        currentStrokeIdx = strokeIdx;
        // Session 266: 動作語が前画と同じ場合は再発火しない（連続する同じ動作語は最初の画だけ発動）
        const prevFrag = strokeIdx > 0 ? kanji.strokes[strokeIdx - 1].songFragment : null;
        if (kanji.strokes[strokeIdx].songFragment !== prevFrag) {
          speakFragment(strokeIdx);
        }
      }
      // Session 266: 描画速度一定（pathLength / VELOCITY * 1000 で duration 計算 + MIN/MAX clamp）
      const rawDur = (pathLengths[strokeIdx] / STROKE_VELOCITY) * 1000;
      const dur = Math.max(MIN_STROKE_DURATION_MS, Math.min(MAX_STROKE_DURATION_MS, rawDur));
      const t = Math.min((ts - strokeStartTs) / dur, 1);
      const next = progress.slice();
      next[strokeIdx] = t;
      progress = next;

      if (t >= 1) {
        inGap = true;
      }
      animFrameId = requestAnimationFrame(step);
    }

    animFrameId = requestAnimationFrame(step);
  }

  // Session 266: 「できた!」で次漢字に遷移する時、現在漢字を完了状態固定（既書字保持・アニメ停止）
  function freezeCompleted() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (typeof window !== 'undefined') {
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      speechSynthesis.cancel();
    }
    progress = kanji.strokes.map(() => 1);
    currentStrokeIdx = kanji.strokes.length;
  }

  export { clearAll, replayDemo, freezeCompleted };
</script>

<div class="trace-wrap">
  <div class="canvas-stack">
    <svg
      class="ghost-svg"
      viewBox={kanji.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="54.5" y1="0" x2="54.5" y2="109" class="grid" />
      <line x1="0" y1="54.5" x2="109" y2="54.5" class="grid" />
      {#each kanji.strokes as s, i}
        <path
          d={s.d}
          stroke={s.color}
          class="ghost-stroke"
          style:stroke-dasharray={pathLengths[i]}
          style:stroke-dashoffset={pathLengths[i] * (1 - progress[i])}
        />
      {/each}
      {#each kanji.strokes as s, i}
        {#if progress[i] >= 1}
          <text x={s.numPos.x} y={s.numPos.y} fill={s.color} class="num-text">
            {s.id}
          </text>
        {/if}
      {/each}
    </svg>

    <canvas
      bind:this={canvas}
      onpointerdown={pointerDown}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
      onpointercancel={pointerUp}
      onpointerleave={pointerUp}
      oncontextmenu={(e) => e.preventDefault()}
    ></canvas>
  </div>

  <!-- 覚え歌（PDF 準拠・別カラム縦スライド・現在の画を中央表示） -->
  <div class="lyric-window" aria-live="polite">
    <div
      class="lyric-strip"
      bind:this={lyricStripEl}
      style:transform={`translateY(${lyricOffset}px)`}
    >
      {#each uniqueFragments as uf, i}
        {@const curUniIdx = uniqueIdxFor(currentStrokeIdx)}
        {@const isDone = currentStrokeIdx >= kanji.strokes.length || (curUniIdx > i)}
        <span
          class="lyric-frag"
          class:current={i === curUniIdx && currentStrokeIdx < kanji.strokes.length && currentStrokeIdx >= 0}
          class:done={isDone && i !== curUniIdx}
          style:--c={uf.color}
        >
          {uf.fragment}
        </span>
      {/each}
    </div>
  </div>
</div>

<style>
  .trace-wrap {
    /* Session 267 v2: grid → 1 column で canvas-stack を全幅化（中心線をスタート/できた!ボタンと揃える）。lyric-window は canvas の右に absolute overlay */
    position: relative;
    width: 100%;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }

  /* Session 267 v2: 覚え歌の表示窓（canvas-stack 右辺に absolute overlay。書字の邪魔にならないよう pointer-events: none） */
  .lyric-window {
    position: absolute;
    top: 0;
    right: 0;
    width: clamp(2rem, 7vw, 2.6rem);
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 2;
  }
  .lyric-strip {
    /* Session 265: position: absolute で lyric-window の高さに影響を与えない（grid row 高さ = canvas-stack のみ） */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }
  .lyric-frag {
    writing-mode: vertical-rl;
    -webkit-writing-mode: vertical-rl;
    flex-shrink: 0;
    font-weight: 700;
    font-size: clamp(1rem, 4vw, 1.3rem);
    letter-spacing: 0.08em;
    padding: 0.5rem 0.3rem;
    border-radius: 0.5rem;
    color: #cbd5e1;
    opacity: 0.18;
    transition: color 0.15s, opacity 0.15s, transform 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .lyric-frag.done {
    color: var(--c, #94a3b8);
    opacity: 0.35;
  }
  .lyric-frag.current {
    color: var(--c, #1f2937);
    background: color-mix(in srgb, var(--c, #fbbf24) 20%, white);
    transform: scale(1.18);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    opacity: 1;
  }

  .canvas-stack {
    /* Session 265: 正方形（井と同じ枠）。grid 内で aspect-ratio が row 高さを決定 */
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border: 2px solid #1f2937;
    border-radius: 4px;
    background: #ffffff;
    overflow: hidden;
  }
  .ghost-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .grid {
    stroke: #cbd5e1;
    stroke-width: 0.5;
    stroke-dasharray: 2 2;
  }
  .ghost-stroke {
    fill: none;
    stroke-width: 6;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.55;
  }
  .num-text {
    font-size: 8px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: central;
    pointer-events: none;
    opacity: 0.7;
  }
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    touch-action: none;
    cursor: crosshair;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
  }

  /* Session 265: tools セクション削除（ボタンは play/+page.svelte 側に統合） */

  /* Session 266 v3: マスター指示「書いている時も書いていない時も書き終わった後も同じ枠の大きさ・同じ見え方」
     → .trace-wrap.inactive の opacity / pointer-events / display: none を全削除（見た目の差別化を撤回） */
</style>
