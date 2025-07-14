import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export interface PatchNote {
  id: string;
  slug: string;
  version: string;
  title: string;
  date: string;
  description: string;
  sections: {
    type: 'fixes' | 'features' | 'breaking' | 'performance' | 'security';
    title: string;
    items: string[];
  }[];
  published: boolean;
}

export async function getAllPatchNotes(): Promise<PatchNote[]> {
  const patchNotesDirectory = path.join(contentDirectory, 'patch-notes');
  
  // ディレクトリが存在しない場合は空配列を返す
  if (!fs.existsSync(patchNotesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(patchNotesDirectory);
  const allPatchNotes = fileNames
    .filter(name => name.endsWith('.md'))
    .map((name) => {
      const id = name.replace(/\.md$/, '');
      const fullPath = path.join(patchNotesDirectory, name);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        id,
        slug: id.replace(/\./g, '-'), // バージョン番号をslugに変換（例: 4.19.0.1 → 4-19-0-1）
        version: data.version,
        title: data.title,
        date: new Date(data.date).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        description: data.description,
        sections: data.sections || [],
        published: data.published ?? true,
      } as PatchNote;
    })
    .filter(patchNote => patchNote.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return allPatchNotes;
}

export async function getPatchNoteBySlug(slug: string): Promise<PatchNote | null> {
  const allPatchNotes = await getAllPatchNotes();
  return allPatchNotes.find(note => note.slug === slug) || null;
}

export async function getLatestPatchNote(): Promise<PatchNote | null> {
  const allPatchNotes = await getAllPatchNotes();
  return allPatchNotes.length > 0 ? allPatchNotes[0] : null;
}
