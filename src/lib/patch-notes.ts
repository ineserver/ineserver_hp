import fs from 'fs';
import path from 'path';
import { parseFrontMatter } from '../../lib/front-matter-parser';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

// MarkdownをパースしてHTMLに変換する関数
async function processMarkdown(markdown: string): Promise<string> {
  // 引用符で囲まれた文字列から、Markdownの**を正しく処理するため、
  // 文字列をそのままMarkdownとして扱う
  const result = await remark()
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return result.toString();
}



export interface PatchNote {
  id: string;
  slug: string;
  version: string;
  date: string;
  description: string;
  isLatest?: boolean;
  sections: {
    type: 'fixes' | 'features' | 'other';
    title: string;
    items: string[];
    itemsHtml?: string[]; // HTML変換された項目
  }[];
  published: boolean;
}

// 軽量版: メタデータのみ取得（最新1件、HTMLレンダリングなし）
export function getLatestPatchNoteLight(): PatchNote | null {
  const patchNotesDirectory = path.join(contentDirectory, 'patch-notes');
  
  if (!fs.existsSync(patchNotesDirectory)) {
    return null;
  }

  const fileNames = fs.readdirSync(patchNotesDirectory);
  const allPatchNotes = fileNames
    .filter(name => name.endsWith('.md'))
    .map((name) => {
      const id = name.replace(/\.md$/, '');
      const fullPath = path.join(patchNotesDirectory, name);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = parseFrontMatter(fileContents);

      const sectionsWithTitles = ((data.sections as unknown[]) || []).map((section: unknown) => {
        if (typeof section !== 'object' || section === null) return null;
        type Section = { items?: string[]; title?: string; type?: string };
        const s = section as Section;
        return {
          ...s,
          title: s.title || getAutoTitle(typeof s.type === 'string' ? s.type : ''),
          items: s.items || []
        };
      }).filter(Boolean);

      return {
        id,
        slug: id.replace(/\./g, '-'),
        version: data.version as string,
        date: data.date ? new Date(data.date as string).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : '',
        description: (data.description as string) || '',
        sections: sectionsWithTitles,
        published: (data.published as boolean) ?? true,
        rawDate: data.date ? new Date(data.date as string) : new Date(0),
      } as PatchNote & { rawDate: Date };
    });

  const sortedPatchNotes = allPatchNotes
    .filter(patchNote => patchNote.published)
    .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  if (sortedPatchNotes.length === 0) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { rawDate, ...patchNote } = sortedPatchNotes[0];
  return {
    ...patchNote,
    isLatest: true
  };
}

export async function getAllPatchNotes(): Promise<PatchNote[]> {
  const patchNotesDirectory = path.join(contentDirectory, 'patch-notes');
  
  // ディレクトリが存在しない場合は空配列を返す
  if (!fs.existsSync(patchNotesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(patchNotesDirectory);
  const allPatchNotes = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async (name) => {
        const id = name.replace(/\.md$/, '');
        const fullPath = path.join(patchNotesDirectory, name);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = parseFrontMatter(fileContents);

        // タイプに基づいてタイトルを自動生成（既存のタイトルがある場合はそれを優先）
        const sectionsWithTitles = await Promise.all(
  ((data.sections as unknown[]) || []).map(async (section: unknown) => {
    if (typeof section !== 'object' || section === null) return null;
    type Section = { items?: string[]; title?: string; type?: string };
    const s = section as Section;
    const itemsHtml = await Promise.all(
      (s.items || []).map(async (item: string) => {
        return await processMarkdown(item);
      })
    );
    return {
      ...s,
      title: s.title || getAutoTitle(typeof s.type === 'string' ? s.type : ''),
      itemsHtml
    };
  })
        );

        return {
          id,
          slug: id.replace(/\./g, '-'), // バージョン番号をslugに変換（例: 4.19.0.1 → 4-19-0-1）
          version: data.version as string,
          date: data.date ? new Date(data.date as string).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : '',
          description: (data.description as string) || '',
          sections: sectionsWithTitles,
          published: (data.published as boolean) ?? true,
          rawDate: data.date ? new Date(data.date as string) : new Date(0), // ソート用の生の日付
        } as PatchNote & { rawDate: Date };
      })
  );

  const sortedPatchNotes = allPatchNotes
    .filter(patchNote => patchNote.published)
    .sort((a, b) => {
      // 日付で降順にソート（新しいものが上）
      return b.rawDate.getTime() - a.rawDate.getTime();
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ rawDate, ...patchNote }, index) => ({
      ...patchNote,
      isLatest: index === 0 // 最初のアイテム（最新）にisLatestフラグを設定
    }));

  return sortedPatchNotes;
}

// タイプに基づいてタイトルを自動生成する関数
function getAutoTitle(type: string): string {
  switch (type) {
    case 'features':
      return '追加・変更要素';
    case 'fixes':
      return '不具合修正';
    case 'other':
      return 'その他';
    default:
      return 'その他';
  }
}

export async function getPatchNoteBySlug(slug: string): Promise<PatchNote | null> {
  const allPatchNotes = await getAllPatchNotes();
  return allPatchNotes.find(note => note.slug === slug) || null;
}

export async function getLatestPatchNote(): Promise<PatchNote | null> {
  const allPatchNotes = await getAllPatchNotes();
  return allPatchNotes.length > 0 ? allPatchNotes[0] : null;
}
