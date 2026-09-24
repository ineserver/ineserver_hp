// R2（img.1necat.net）の画像を Cloudflare Images で縮小・AVIF/WebP化して配信するためのURLを生成
// https://developers.cloudflare.com/images/transform-images/transform-via-url/

const CLOUDFLARE_IMAGE_HOST = 'img.1necat.net';
const DEFAULT_QUALITY = 75;

/**
 * img.1necat.net の画像URLを、指定幅に縮小した変換URLに置き換える
 * それ以外のURL（ローカル画像や外部サイトの画像）はそのまま返す
 */
export function cfImageUrl(src: string, width: number, quality: number = DEFAULT_QUALITY): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (url.hostname !== CLOUDFLARE_IMAGE_HOST || url.pathname.startsWith('/cdn-cgi/')) {
    return src;
  }

  // fit=scale-down: 元画像より大きい幅を指定されても拡大しない
  // format=auto: ブラウザの対応状況に応じて AVIF / WebP / 元の形式を自動で選択
  const options = `width=${width},quality=${quality},fit=scale-down,format=auto`;
  return `https://${CLOUDFLARE_IMAGE_HOST}/cdn-cgi/image/${options}${url.pathname}`;
}
