import type { Element, Root } from 'hast';
import { toString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

const SEPARATOR = '-';
const ID_COUNT_PATTERN = /^(.*)_([0-9]+)$/;
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
// Python-Markdown の attr_list と同じく、{ の前に 1 個以上の空白を要求する
const EXPLICIT_ID_PATTERN = / +\{#([^\s}]+)\} *$/;
const EXPLICIT_ID_MARK = '{#';

// Python-Markdown の toc 拡張の slugify を移植したもの。現サイトの見出し id を維持するため、挙動を変えないこと
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, SEPARATOR);
}

// Python-Markdown の toc 拡張の unique を移植したもの
export function unique(id: string, used: Set<string>): string {
  let candidate = id;
  while (used.has(candidate) || candidate === '') {
    const match = ID_COUNT_PATTERN.exec(candidate);
    candidate = match ? `${match[1]}_${Number(match[2]) + 1}` : `${candidate}_1`;
  }
  used.add(candidate);
  return candidate;
}

function takeExplicitId(heading: Element): string | undefined {
  const last = heading.children.at(-1);
  if (last?.type !== 'text') return undefined;
  const match = EXPLICIT_ID_PATTERN.exec(last.value);
  if (!match) return undefined;
  last.value = last.value.slice(0, match.index);
  return match[1];
}

export function rehypeHeadingPermalinks() {
  return (tree: Root, file: VFile) => {
    const frontmatter = (file.data as { astro?: { frontmatter?: Record<string, unknown> } }).astro?.frontmatter;
    const title = frontmatter?.title;
    if (typeof title !== 'string' || title === '') {
      file.fail('frontmatter の title が無いため見出し id を決められません');
    }
    const headings: Element[] = [];
    visit(tree, 'element', (node: Element) => {
      if (HEADING_TAGS.has(node.tagName)) headings.push(node);
    });

    // Python-Markdown の toc と同じく、明示 id を文書全体から先に使用済みにしてから自動の id を振る
    const used = new Set<string>();
    for (const heading of headings) {
      const id = takeExplicitId(heading);
      if (id === undefined) continue;
      if (used.has(id)) file.fail(`見出しの id が重複しています: ${id}`, heading);
      heading.properties.id = id;
      used.add(id);
    }
    for (const heading of headings) {
      const text = toString(heading);
      if (text.includes(EXPLICIT_ID_MARK)) {
        file.fail(`見出しの id は「見出し {#id}」の形で書いてください: ${text}`, heading);
      }
    }

    // h1 はレイアウトが title から出す。現サイトは h1 から連番を振っているので、その 1 回分を先に消費する。
    // ページ側は new Set() で同じ id を求めるので、明示 id と重なるとページ側とずれる
    const titleId = unique(slugify(title), new Set());
    if (used.has(titleId)) file.fail(`見出しの id「${titleId}」がページタイトルの id と重なっています`);
    used.add(titleId);

    for (const heading of headings) {
      const text = toString(heading);
      const id = typeof heading.properties.id === 'string' ? heading.properties.id : unique(slugify(text), used);
      heading.properties.id = id;
      heading.children.push({
        type: 'element',
        tagName: 'a',
        properties: { className: ['anchor'], href: `#${id}`, ariaLabel: `「${text}」へのリンク` },
        children: [],
      });
    }
  };
}
