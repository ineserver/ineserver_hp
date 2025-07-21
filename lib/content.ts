import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const contentDirectory = path.join(process.cwd(), 'content')

export async function getAnnouncementFiles() {
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
        const matterResult = matter(fileContents)
        
        // Markdownを HTMLに変換
        const processedContent = await remark()
          .use(html)
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

export async function getAnnouncementData(id: string) {
  const fullPath = path.join(contentDirectory, 'announcements', `${id}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)

  // Markdownを HTMLに変換
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getRulesFiles() {
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
        const matterResult = matter(fileContents)
        
        const processedContent = await remark()
          .use(html)
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

export async function getEconomyFiles() {
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
        const matterResult = matter(fileContents)
        
        const processedContent = await remark()
          .use(html)
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
  return allEconomyData.sort((a, b) => {
    function hasOrder(obj: unknown): obj is { order?: number } {
      return typeof obj === 'object' && obj !== null && 'order' in obj;
    }
    const orderA = hasOrder(a) && typeof a.order === 'number' ? a.order : 0;
    const orderB = hasOrder(b) && typeof b.order === 'number' ? b.order : 0;
    return orderA - orderB;
  });
}

// 生活・くらしのコンテンツを取得
export async function getLifestyleFiles() {
  const lifestyleDir = path.join(contentDirectory, 'lifestyle')
  
  if (!fs.existsSync(lifestyleDir)) {
    return []
  }
  
  const fileNames = fs.readdirSync(lifestyleDir)
  
  const allLifestyleData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(lifestyleDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = matter(fileContents)
        
        const processedContent = await remark()
          .use(html)
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allLifestyleData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      function hasOrder(obj: unknown): obj is { order?: number } {
        return typeof obj === 'object' && obj !== null && 'order' in obj;
      }
      const orderA = hasOrder(a) && typeof a.order === 'number' ? a.order : 0;
      const orderB = hasOrder(b) && typeof b.order === 'number' ? b.order : 0;
      return orderA - orderB;
    })
}

// 観光コンテンツを取得
export async function getTourismFiles() {
  const tourismDir = path.join(contentDirectory, 'tourism')
  
  if (!fs.existsSync(tourismDir)) {
    return []
  }
  
  const fileNames = fs.readdirSync(tourismDir)
  
  const allTourismData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(tourismDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = matter(fileContents)
        
        const processedContent = await remark()
          .use(html)
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allTourismData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      function hasOrder(obj: unknown): obj is { order?: number } {
        return typeof obj === 'object' && obj !== null && 'order' in obj;
      }
      const orderA = hasOrder(a) && typeof a.order === 'number' ? a.order : 0;
      const orderB = hasOrder(b) && typeof b.order === 'number' ? b.order : 0;
      return orderA - orderB;
    })
}

// 交通コンテンツを取得
export async function getTransportationFiles() {
  const transportationDir = path.join(contentDirectory, 'transportation')
  
  if (!fs.existsSync(transportationDir)) {
    return []
  }
  
  const fileNames = fs.readdirSync(transportationDir)
  
  const allTransportationData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(transportationDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = matter(fileContents)
        
        const processedContent = await remark()
          .use(html)
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allTransportationData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      function hasOrder(obj: unknown): obj is { order?: number } {
        return typeof obj === 'object' && obj !== null && 'order' in obj;
      }
      const orderA = hasOrder(a) && typeof a.order === 'number' ? a.order : 0;
      const orderB = hasOrder(b) && typeof b.order === 'number' ? b.order : 0;
      return orderA - orderB;
    })
}

// 娯楽コンテンツを取得
export async function getEntertainmentFiles() {
  const entertainmentDir = path.join(contentDirectory, 'entertainment')
  
  if (!fs.existsSync(entertainmentDir)) {
    return []
  }
  
  const fileNames = fs.readdirSync(entertainmentDir)
  
  const allEntertainmentData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(entertainmentDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = matter(fileContents)
        
        const processedContent = await remark()
          .use(html)
          .process(matterResult.content)
        const contentHtml = processedContent.toString()

        return {
          id,
          contentHtml,
          ...matterResult.data,
        }
      })
  )

  return allEntertainmentData
    .filter(item => typeof item === 'object' && item !== null && 'published' in item ? (item as { published?: boolean }).published !== false : true)
    .sort((a, b) => {
      function hasOrder(obj: unknown): obj is { order?: number } {
        return typeof obj === 'object' && obj !== null && 'order' in obj;
      }
      const orderA = hasOrder(a) && typeof a.order === 'number' ? a.order : 0;
      const orderB = hasOrder(b) && typeof b.order === 'number' ? b.order : 0;
      return orderA - orderB;
    });
}

// 個別データ取得関数
export async function getLifestyleData(id: string) {
  const fullPath = path.join(contentDirectory, 'lifestyle', `${id}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getTourismData(id: string) {
  const fullPath = path.join(contentDirectory, 'tourism', `${id}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getTransportationData(id: string) {
  const fullPath = path.join(contentDirectory, 'transportation', `${id}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getEconomyData(id: string) {
  const fullPath = path.join(contentDirectory, 'economy', `${id}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

export async function getEntertainmentData(id: string) {
  const fullPath = path.join(contentDirectory, 'entertainment', `${id}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  }
}

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
