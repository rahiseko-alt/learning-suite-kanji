// 画像ファイルを最大辺 max px にダウンスケールして dataURL を返す。
// ボタン背景など小サイズ用途で localStorage 容量超過（QuotaExceeded）を防ぐ。
// ブラウザ専用（canvas / Image 使用）。呼び出しは必ずクライアント側で行うこと。
export function resizeImage(file, max = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image decode failed'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        // 透過を保つため PNG 優先。容量が大きすぎる場合のみ JPEG にフォールバック。
        let url = canvas.toDataURL('image/png');
        if (url.length > 200_000) url = canvas.toDataURL('image/jpeg', 0.85);
        resolve(url);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
