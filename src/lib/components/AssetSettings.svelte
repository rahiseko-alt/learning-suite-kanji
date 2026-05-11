<script>
  // ユーザーが画像をアップロードして UI を着せ替えできる設定モーダル
  // ボタン立体感は global の .btn / .btn--primary / .btn--secondary / .btn--icon に統一
  let { assets = $bindable(), adjustments = $bindable(), onclose } = $props();

  // Session 267 v3: 各 slot に位置・拡大縮小スライダー追加
  // character/emoji は transform translate 用に -50〜50%
  const SLOTS = [
    {
      key: 'character', label: 'キャラクター', icon: '🐱', hint: '応援してくれるよ',
      xMin: -50, xMax: 50, yMin: -50, yMax: 50,
      defaults: { x: 0, y: 0, scale: 1 }
    },
    {
      key: 'emoji', label: 'えもじ', icon: '🎉', hint: 'できたときの おいわい',
      xMin: -50, xMax: 50, yMin: -50, yMax: 50,
      defaults: { x: 0, y: 0, scale: 1 }
    },
    {
      key: 'icon', label: 'ホームアイコン', icon: '📱',
      hint: 'スマホのホーム画面に追加したときのアイコン',
      noAdjuster: true,
      defaults: { x: 0, y: 0, scale: 1 }
    }
  ];

  function handleFile(e, key) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選んでね');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      assets[key] = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function reset(slot) {
    assets[slot.key] = null;
    Object.assign(adjustments[slot.key], slot.defaults);
  }
</script>

<div
  class="settings-overlay"
  role="dialog"
  aria-modal="true"
  onclick={(e) => {
    if (e.target === e.currentTarget) onclose?.();
  }}
>
  <div class="settings-card">
    <header>
      <h2>がぞうを かえる</h2>
      <button class="btn btn--icon" onclick={onclose} aria-label="閉じる">✕</button>
    </header>

    <div class="slots">
      {#each SLOTS as slot}
        <section class="slot">
          <div class="slot-head">
            <span class="slot-icon">{slot.icon}</span>
            <div class="slot-label-wrap">
              <div class="slot-label">{slot.label}</div>
              <div class="slot-hint">{slot.hint}</div>
            </div>
          </div>

          <div class="slot-preview" class:has-img={assets[slot.key]}>
            {#if assets[slot.key]}
              <img
                src={assets[slot.key]}
                alt={slot.label}
                style:transform={`translate(${adjustments[slot.key].x}%, ${adjustments[slot.key].y}%) scale(${adjustments[slot.key].scale})`}
              />
            {:else}
              <div class="default-icon">{slot.icon}</div>
              <div class="default-text">デフォルト</div>
            {/if}
          </div>

          {#if !slot.noAdjuster}
            <div class="adjuster">
              <label class="adj-row">
                <span class="adj-label">ひだり ↔ みぎ</span>
                <input type="range" min={slot.xMin} max={slot.xMax} step="1" bind:value={adjustments[slot.key].x} />
                <span class="adj-val">{adjustments[slot.key].x}</span>
              </label>
              <label class="adj-row">
                <span class="adj-label">うえ ↕ した</span>
                <input type="range" min={slot.yMin} max={slot.yMax} step="1" bind:value={adjustments[slot.key].y} />
                <span class="adj-val">{adjustments[slot.key].y}</span>
              </label>
              <label class="adj-row">
                <span class="adj-label">おおきさ</span>
                <input type="range" min="0.5" max="3" step="0.1" bind:value={adjustments[slot.key].scale} />
                <span class="adj-val">{adjustments[slot.key].scale.toFixed(1)}x</span>
              </label>
            </div>
          {/if}

          <div class="slot-actions">
            <label class="btn btn--primary upload-label">
              📷 がぞうを えらぶ
              <input
                type="file"
                accept="image/*"
                onchange={(e) => handleFile(e, slot.key)}
              />
            </label>
            <button class="btn btn--secondary" onclick={() => reset(slot)}>もどす</button>
          </div>
        </section>
      {/each}
    </div>

    <button class="btn btn--primary big done-full" onclick={onclose}>✨ できた</button>
  </div>
</div>

<style>
  .settings-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
    padding: 1rem;
    animation: fadeIn 0.2s ease-out;
  }
  .settings-card {
    background: #fff;
    border-radius: 1.5rem;
    padding: 1.2rem;
    max-width: 460px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
    animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  header h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #1f2937;
  }

  .slots {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .slot {
    background: linear-gradient(180deg, #fffbeb, #fef3c7);
    border-radius: 1rem;
    padding: 0.9rem;
    border: 2px solid #fde68a;
  }
  .slot-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.6rem;
  }
  .slot-icon {
    font-size: 1.6rem;
  }
  .slot-label-wrap {
    flex: 1;
  }
  .slot-label {
    font-size: 1.05rem;
    font-weight: 700;
    color: #1f2937;
  }
  .slot-hint {
    font-size: 0.8rem;
    color: #78716c;
  }

  .slot-preview {
    width: 100%;
    aspect-ratio: 16/9;
    background: #ffffff;
    border-radius: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 0.6rem;
    border: 2px dashed #cbd5e1;
  }
  .slot-preview.has-img {
    border-style: solid;
    border-color: #fde68a;
  }
  .slot-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .default-icon {
    font-size: 2.5rem;
    line-height: 1;
  }
  .default-text {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 700;
  }

  /* Session 267 v3: 位置/拡大縮小スライダー */
  .adjuster {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 0.6rem;
    padding: 0.5rem 0.6rem;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 0.5rem;
  }
  .adj-row {
    display: grid;
    grid-template-columns: 5.5rem 1fr 2.6rem;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }
  .adj-label {
    color: #475569;
    font-weight: 700;
  }
  .adj-row input[type='range'] {
    width: 100%;
    accent-color: #f59e0b;
  }
  .adj-val {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: #1f2937;
    font-weight: 800;
  }

  .slot-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  /* upload-label は <label class="btn btn--primary"> として使うので file input は隠す */
  .upload-label {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
  .upload-label input[type='file'] {
    display: none;
  }

  .done-full {
    width: 100%;
    margin-top: 1rem;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes pop {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
</style>
