<script>
  // ユーザーが画像をアップロードして UI を着せ替えできる設定モーダル
  // ボタン立体感は global の .btn / .btn--primary / .btn--secondary / .btn--icon に統一
  let { assets = $bindable(), onclose } = $props();

  const SLOTS = [
    { key: 'character', label: 'キャラクター', icon: '🐱', hint: '応援してくれるよ' },
    { key: 'background', label: 'はいけい', icon: '🌈', hint: 'お部屋のかべがみ' },
    { key: 'emoji', label: 'えもじ', icon: '🎉', hint: 'できたときの おいわい' }
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

  function reset(key) {
    assets[key] = null;
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
              <img src={assets[slot.key]} alt={slot.label} />
            {:else}
              <div class="default-icon">{slot.icon}</div>
              <div class="default-text">デフォルト</div>
            {/if}
          </div>

          <div class="slot-actions">
            <label class="btn btn--primary upload-label">
              📷 がぞうを えらぶ
              <input
                type="file"
                accept="image/*"
                onchange={(e) => handleFile(e, slot.key)}
              />
            </label>
            {#if assets[slot.key]}
              <button class="btn btn--secondary" onclick={() => reset(slot.key)}>もどす</button>
            {/if}
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
