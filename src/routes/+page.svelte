<script>
  import { goto } from '$app/navigation';
  import { SETS, SET_ORDER } from '$lib/data/sets.js';

  function pickSet(setId) {
    goto(`/play?set=${setId}`);
  }
</script>

<svelte:head>
  <title>かんじあそび</title>
</svelte:head>

<main>
  <h1>かんじあそび</h1>
  <p class="subtitle">どれをあそぶ？</p>

  <div class="set-grid">
    {#each SET_ORDER as id}
      {@const s = SETS[id]}
      <button class="set-card" onclick={() => pickSet(id)}>
        <div class="set-char">{s.name}</div>
        <div class="set-label">{s.label}</div>
      </button>
    {/each}
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem 1rem;
    background: #fef3c7;
  }
  h1 {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    margin: 0 0 0.5rem;
    color: #2a4d6b;
    letter-spacing: 0.1em;
  }
  .subtitle {
    font-size: clamp(1.1rem, 4vw, 1.5rem);
    color: #5a7a96;
    margin: 0 0 2rem;
  }

  .set-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    justify-content: center;
    max-width: 800px; /* Session 266: 3 枚カード（井/飛/愛知県）対応で 600 → 800px 拡張 */
  }
  .set-card {
    background: linear-gradient(180deg, #fde047 0%, #fbbf24 60%, #f59e0b 100%);
    color: #2a4d6b;
    border: none;
    border-radius: 1.5rem;
    padding: 1.5rem 2rem;
    min-width: 7.5rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      inset 0 -5px 0 rgba(146, 64, 14, 0.18),
      0 7px 0 #c2750c,
      0 9px 16px rgba(194, 117, 12, 0.3);
    transition: transform 0.1s, box-shadow 0.1s, filter 0.1s;
  }
  .set-card:hover {
    filter: brightness(1.05);
  }
  .set-card:active {
    transform: translateY(4px);
    box-shadow:
      inset 0 -2px 0 rgba(146, 64, 14, 0.18),
      0 3px 0 #c2750c,
      0 4px 8px rgba(194, 117, 12, 0.2);
  }
  .set-char {
    font-size: clamp(2.8rem, 9vw, 4rem);
    font-weight: 800;
    line-height: 1;
    margin-bottom: 0.3rem;
    text-shadow: 0 2px 0 rgba(255, 255, 255, 0.5);
  }
  .set-label {
    font-size: clamp(0.95rem, 3.5vw, 1.15rem);
    font-weight: 700;
    letter-spacing: 0.05em;
  }
</style>
