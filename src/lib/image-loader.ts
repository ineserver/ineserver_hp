'use client';

import { cfImageUrl } from './cloudflare-image';

// next/image のカスタムローダー（next.config.ts の images.loaderFile で指定）
// 画像の変換をAzure上のNext.jsサーバーではなく Cloudflare Images で行う
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return cfImageUrl(src, width, quality);
}
