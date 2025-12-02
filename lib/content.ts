import fs from 'fs'
import path from 'path'
import { parseFrontMatter } from './front-matter-parser'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import remarkDirective from 'remark-directive'
import remarkCustomDirectives from './remark-custom-directives'
import rehypeStringify from 'rehype-stringify'
import rehypeTableWrapper from './rehype-table-wrapper'

const contentDirectory = path.join(process.cwd(), 'content')

// Content data types
export interface ContentData {
  id: string;
  contentHtml?: string;
  content?: string;
  title?: string;
  description?: string;
  date?: string;
  category?: string;
  type?: string;
  order?: number;
  [key: string]: unknown;
}

// 軽量版: メタデータのみ取得（HTMLレンダリングなし）
export function getAnnouncementFilesLight(): ContentData[] {
  const announcementDir = path.join(contentDirectory, 'announcements')

  if (!fs.existsSync(announcementDir)) {
    return []
  }

  const fileNames = fs.readdirSync(announcementDir)

  const allAnnouncementsData = fileNames
    .filter(name => name.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '')
      const fullPath = path.join(announcementDir, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = parseFrontMatter(fileContents)

      return {
        id,
        ...matterResult.data,
      }
    })

  // 日付でソート（新しい順）
  function hasDate(obj: unknown): obj is { date: string } {
    return typeof obj === 'object' && obj !== null && 'date' in obj && typeof (obj as { date?: unknown }).date === 'string';
  }
  return allAnnouncementsData.sort((a, b) => {
    const dateA = hasDate(a) ? a.date : '';
    const dateB = hasDate(b) ? b.date : '';
    if (dateA < dateB) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getAnnouncementFiles(): Promise<ContentData[]> {
  const announcementDir = path.join(contentDirectory, 'announcements')

  if (!fs.existsSync(announcementDir)) {
    return []
  }

  const fileNames = fs.readdirSync(announcementDir)

  const allAnnouncementsData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(announcementDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = parseFrontMatter(fileContents)

        // Markdownを HTMLに変換
        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkDirective)
          .use(remarkCustomDirectives)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeSlug)
          .use(rehypeTableWrapper)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  // 日付でソート（新しい順）
  // 型ガードでdateプロパティがあるか確認
  function hasDate(obj: unknown): obj is { date: string } {
    return typeof obj === 'object' && obj !== null && 'date' in obj && typeof (obj as { date?: unknown }).date === 'string';
  }
  return allAnnouncementsData.sort((a, b) => {
    const dateA = hasDate(a) ? a.date : '';
    const dateB = hasDate(b) ? b.date : '';
    if (dateA < dateB) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getAnnouncementData(id: string): Promise<ContentData | null> {
  const fullPath = path.join(contentDirectory, 'announcements', `${id}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = parseFrontMatter(fileContents)

  // Markdownを HTMLに変換
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCustomDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeTableWrapper)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getRulesFiles(): Promise<ContentData[]> {
  const rulesDir = path.join(contentDirectory, 'rules')

  if (!fs.existsSync(rulesDir)) {
    return []
  }

  const fileNames = fs.readdirSync(rulesDir)

  const allRulesData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(rulesDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = parseFrontMatter(fileContents)

        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkDirective)
          .use(remarkCustomDirectives)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeSlug)
          .use(rehypeTableWrapper)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  // 順序でソート
  return allRulesData.sort((a, b) => {
    function hasOrder(obj: unknown): obj is { order?: number } {
      return typeof obj === 'object' && obj !== null && 'order' in obj;
    }
    const orderA = hasOrder(a) && typeof a.order === 'number' ? a.order : 0;
    const orderB = hasOrder(b) && typeof b.order === 'number' ? b.order : 0;
    return orderA - orderB
  })
}

export async function getEconomyFiles(): Promise<ContentData[]> {
  const economyDir = path.join(contentDirectory, 'economy')

  if (!fs.existsSync(economyDir)) {
    return []
  }

  const fileNames = fs.readdirSync(economyDir)

  const allEconomyData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(economyDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = parseFrontMatter(fileContents)

        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkDirective)
          .use(remarkCustomDirectives)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeSlug)
          .use(rehypeTableWrapper)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allEconomyData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      // typeの型ガード
      function hasType(obj: unknown): obj is { type?: string } {
        return typeof obj === 'object' && obj !== null && 'type' in obj;
      }
      // numberの型ガード
      function hasNumber(obj: unknown): obj is { number?: number } {
        return typeof obj === 'object' && obj !== null && 'number' in obj;
      }

      const typeA = hasType(a) && typeof a.type === 'string' ? a.type : 'other';
      const typeB = hasType(b) && typeof b.type === 'string' ? b.type : 'other';

      // typeの優先順位を定義
      const typeOrder: Record<string, number> = {
        'item': 1,
        'license': 2,
        'other': 999
      };

      const orderA = typeOrder[typeA] || 999;
      const orderB = typeOrder[typeB] || 999;

      // まずtypeの優先順位で比較
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 同じtypeの場合、numberで比較
      const numberA = hasNumber(a) && typeof a.number === 'number' ? a.number : 999999;
      const numberB = hasNumber(b) && typeof b.number === 'number' ? b.number : 999999;
      return numberA - numberB;
    });
}

// サーバーガイドのコンテンツを取得
export async function getServerGuideFiles(): Promise<ContentData[]> {
  const serverGuideDir = path.join(contentDirectory, 'server-guide')

  if (!fs.existsSync(serverGuideDir)) {
    return []
  }

  const fileNames = fs.readdirSync(serverGuideDir)

  const allServerGuideData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(serverGuideDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = parseFrontMatter(fileContents)

        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkDirective)
          .use(remarkCustomDirectives)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeSlug)
          .use(rehypeTableWrapper)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allServerGuideData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      // orderでソート
      // orderまたはnumberでソート
      function hasOrder(obj: unknown): obj is { order?: number } {
        return typeof obj === 'object' && obj !== null && 'order' in obj;
      }
      function hasNumber(obj: unknown): obj is { number?: number } {
        return typeof obj === 'object' && obj !== null && 'number' in obj;
      }

      const orderA = hasOrder(a) && typeof a.order === 'number' ? a.order : (hasNumber(a) && typeof a.number === 'number' ? a.number : 999);
      const orderB = hasOrder(b) && typeof b.order === 'number' ? b.order : (hasNumber(b) && typeof b.number === 'number' ? b.number : 999);

      return orderA - orderB;
    })
}

// 建築・居住のコンテンツを取得
export async function getLifeFiles(): Promise<ContentData[]> {
  const lifeDir = path.join(contentDirectory, 'life')

  if (!fs.existsSync(lifeDir)) {
    return []
  }

  const fileNames = fs.readdirSync(lifeDir)

  const allLifeData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(lifeDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = parseFrontMatter(fileContents)

        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkDirective)
          .use(remarkCustomDirectives)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeSlug)
          .use(rehypeTableWrapper)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allLifeData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      // typeの型ガード
      function hasType(obj: unknown): obj is { type?: string } {
        return typeof obj === 'object' && obj !== null && 'type' in obj;
      }
      // numberの型ガード
      function hasNumber(obj: unknown): obj is { number?: number } {
        return typeof obj === 'object' && obj !== null && 'number' in obj;
      }

      const typeA = hasType(a) && typeof a.type === 'string' ? a.type : 'other';
      const typeB = hasType(b) && typeof b.type === 'string' ? b.type : 'other';

      // typeの優先順位を定義: 保護 → 便利機能 → ガイドライン → その他
      const typeOrder: Record<string, number> = {
        'protection': 1,
        'utility': 2,
        'guideline': 3,
        'other': 999
      };

      const orderA = typeOrder[typeA] || 999;
      const orderB = typeOrder[typeB] || 999;

      // まずtypeの優先順位で比較
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 同じtypeの場合、numberで比較
      const numberA = hasNumber(a) && typeof a.number === 'number' ? a.number : 999999;
      const numberB = hasNumber(b) && typeof b.number === 'number' ? b.number : 999999;
      return numberA - numberB;
    })
}

// 冒険・娯楽のコンテンツを取得
export async function getAdventureFiles(): Promise<ContentData[]> {
  const adventureDir = path.join(contentDirectory, 'adventure')

  if (!fs.existsSync(adventureDir)) {
    return []
  }

  const fileNames = fs.readdirSync(adventureDir)

  const allAdventureData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(adventureDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = parseFrontMatter(fileContents)

        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkDirective)
          .use(remarkCustomDirectives)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeSlug)
          .use(rehypeTableWrapper)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allAdventureData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      function hasNumber(obj: unknown): obj is { number?: number } {
        return typeof obj === 'object' && obj !== null && 'number' in obj;
      }
      const numberA = hasNumber(a) && typeof a.number === 'number' ? a.number : 999999;
      const numberB = hasNumber(b) && typeof b.number === 'number' ? b.number : 999999;
      return numberA - numberB;
    })
}

// ワールド・交通のコンテンツを取得
export async function getTransportFiles(): Promise<ContentData[]> {
  const transportDir = path.join(contentDirectory, 'transport')

  if (!fs.existsSync(transportDir)) {
    return []
  }

  const fileNames = fs.readdirSync(transportDir)

  const allTransportData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(transportDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = parseFrontMatter(fileContents)

        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkDirective)
          .use(remarkCustomDirectives)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeSlug)
          .use(rehypeTableWrapper)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allTransportData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      function hasNumber(obj: unknown): obj is { number?: number } {
        return typeof obj === 'object' && obj !== null && 'number' in obj;
      }
      const numberA = hasNumber(a) && typeof a.number === 'number' ? a.number : 999999;
      const numberB = hasNumber(b) && typeof b.number === 'number' ? b.number : 999999;
      return numberA - numberB;
    })
}



// 個別データ取得関数
export async function getServerGuideData(id: string): Promise<ContentData | null> {
  const fullPath = path.join(contentDirectory, 'server-guide', `${id}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = parseFrontMatter(fileContents)

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCustomDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeTableWrapper)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getLifeData(id: string): Promise<ContentData | null> {
  const fullPath = path.join(contentDirectory, 'life', `${id}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = parseFrontMatter(fileContents)

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCustomDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeTableWrapper)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getTransportData(id: string): Promise<ContentData | null> {
  const fullPath = path.join(contentDirectory, 'transport', `${id}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = parseFrontMatter(fileContents)

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCustomDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeTableWrapper)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getEconomyData(id: string): Promise<ContentData | null> {
  const fullPath = path.join(contentDirectory, 'economy', `${id}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = parseFrontMatter(fileContents)

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCustomDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeTableWrapper)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getAdventureData(id: string): Promise<ContentData | null> {
  const fullPath = path.join(contentDirectory, 'adventure', `${id}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = parseFrontMatter(fileContents)

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCustomDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeTableWrapper)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export const getEntertainmentData = getAdventureData
export const getEntertainmentFiles = getAdventureFiles

// lifestyleはlifeと同じ
export const getLifestyleFiles = getLifeFiles
export const getLifestyleData = getLifeData

// tourismはadventureと同じ
export const getTourismFiles = getAdventureFiles
export const getTourismData = getAdventureData

// transportationはtransportと同じ
export const getTransportationFiles = getTransportFiles
export const getTransportationData = getTransportData

export type AnnouncementType = 'important' | 'normal' | 'pickup'

export interface Announcement {
  id: string
  title: string
  date: string
  type: AnnouncementType
  description: string
  contentHtml: string
  published: boolean
}
