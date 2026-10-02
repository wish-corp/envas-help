import { getCollection, type CollectionEntry } from 'astro:content';
import { NAV } from '../nav';

export type DocEntry = CollectionEntry<'docs'>;

export const INDEX_ID = 'index';

export function docPath(id: string): string {
  return id === INDEX_ID ? '/' : `/${id}/`;
}

export async function getNavDocs(): Promise<DocEntry[]> {
  const entries = new Map((await getCollection('docs')).map((entry) => [entry.id, entry]));
  const unlisted = [...entries.keys()].filter((id) => !NAV.includes(id));
  if (unlisted.length > 0) {
    throw new Error(`src/nav.ts に無いページがある: ${unlisted.join(', ')}`);
  }
  return NAV.map((id) => {
    const entry = entries.get(id);
    if (!entry) {
      throw new Error(`src/nav.ts の ${id} に対応する src/content/docs/${id}.md が無い`);
    }
    // glob loader は変換時の例外をログに出すだけで握りつぶし、本文が空のままビルドが通ってしまう
    if (!entry.rendered) {
      throw new Error(`${id}: Markdown の変換に失敗した（直前の "Error rendering" ログを参照）`);
    }
    return entry;
  });
}
