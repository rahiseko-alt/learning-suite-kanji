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
</style>
