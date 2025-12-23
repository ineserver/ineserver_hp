import { MetadataRoute } from 'next';
import { getAnnouncementFilesLight } from '../../lib/content';
import fs from 'fs';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.1necat.net';
  const currentDate = new Date();

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/server-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/announcements`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/patch-notes`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/life`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/economy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/transport`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/adventure`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/qa`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tutorial`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/lp`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // お知らせページ
  const announcements = getAnnouncementFilesLight();
  const announcementPages: MetadataRoute.Sitemap = announcements.map((item) => ({
    url: `${baseUrl}/announcements/${item.id}`,
    lastModified: item.date ? new Date(item.date) : currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // パッチノートページ
  const patchNotesDir = path.join(process.cwd(), 'content', 'patch-notes');
  let patchNotePages: MetadataRoute.Sitemap = [];

  if (fs.existsSync(patchNotesDir)) {
    const patchNoteFiles = fs.readdirSync(patchNotesDir).filter(file => file.endsWith('.md'));
    patchNotePages = patchNoteFiles.map((file) => ({
      url: `${baseUrl}/patch-notes/${file.replace('.md', '')}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  }

  // サーバーガイドページ
  const serverGuideDir = path.join(process.cwd(), 'content', 'server-guide');
  let serverGuidePages: MetadataRoute.Sitemap = [];

  if (fs.existsSync(serverGuideDir)) {
    const serverGuideFiles = fs.readdirSync(serverGuideDir).filter(file => file.endsWith('.md'));
    serverGuidePages = serverGuideFiles.map((file) => ({
      url: `${baseUrl}/server-guide/${file.replace('.md', '')}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  }

  // 生活系ページ
  const lifeDir = path.join(process.cwd(), 'content', 'life');
  let lifePages: MetadataRoute.Sitemap = [];

  if (fs.existsSync(lifeDir)) {
    const lifeFiles = fs.readdirSync(lifeDir).filter(file => file.endsWith('.md'));
    lifePages = lifeFiles.map((file) => ({
      url: `${baseUrl}/life/${file.replace('.md', '')}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  }

  // 経済系ページ
  const economyDir = path.join(process.cwd(), 'content', 'economy');
  let economyPages: MetadataRoute.Sitemap = [];

  if (fs.existsSync(economyDir)) {
    const economyFiles = fs.readdirSync(economyDir).filter(file => file.endsWith('.md'));
    economyPages = economyFiles.map((file) => ({
      url: `${baseUrl}/economy/${file.replace('.md', '')}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  }

  // 移動系ページ
  const transportDir = path.join(process.cwd(), 'content', 'transport');
  let transportPages: MetadataRoute.Sitemap = [];

  if (fs.existsSync(transportDir)) {
    const transportFiles = fs.readdirSync(transportDir).filter(file => file.endsWith('.md'));
    transportPages = transportFiles.map((file) => ({
      url: `${baseUrl}/transport/${file.replace('.md', '')}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  }

  // 冒険系ページ
  const adventureDir = path.join(process.cwd(), 'content', 'adventure');
  let adventurePages: MetadataRoute.Sitemap = [];

  if (fs.existsSync(adventureDir)) {
    const adventureFiles = fs.readdirSync(adventureDir).filter(file => file.endsWith('.md'));
    adventurePages = adventureFiles.map((file) => ({
      url: `${baseUrl}/adventure/${file.replace('.md', '')}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  }

  return [
    ...staticPages,
    ...announcementPages,
    ...patchNotePages,
    ...serverGuidePages,
    ...lifePages,
    ...economyPages,
    ...transportPages,
    ...adventurePages,
  ];
}
