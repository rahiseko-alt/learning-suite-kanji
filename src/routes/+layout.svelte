<script>
  let { children } = $props();
</script>

{@render children()}

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    background: #fef3c7;
    color: #2a4d6b;
    font-family: system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif;
    overflow-x: hidden;
  }
  :global(*) {
    box-sizing: border-box;
  }
  :global(button) {
    font-family: inherit;
    cursor: pointer;
  }
  /* ボタン画像着せ替え（井上氏要望・背景画像＋文字オーバーレイ）。
     文字は box-shadow（背景扱い）の上に描画されるため追加 DOM 不要。
     白ハロー＋細縁取り＋inset 暗帯の三重で写真上でも可読性を担保。
     .btn.btn--skinned の 2 クラス詳細度で .btn--primary の background ショートハンドに勝たせる。 */
  :global(.btn.btn--skinned) {
    background-image: var(--skin-img);
    background-size: cover;
    background-position: center;
    color: #fff;
    -webkit-text-stroke: 0.6px rgba(0, 0, 0, 0.45);
    text-shadow: 0 0 3px #fff, 0 0 6px #fff, 0 1px 2px rgba(0, 0, 0, 0.6);
    box-shadow:
      inset 0 0 0 999px rgba(0, 0, 0, 0.1),
      inset 0 -2.2em 1.4em -1em rgba(0, 0, 0, 0.45),
      0 4px 10px rgba(0, 0, 0, 0.2);
  }
</style>
