import type { Element, Root } from 'hast';
import { toString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

const SEPARATOR = '-';
const ID_COUNT_PATTERN = /^(.*)_([0-9]+)$/;
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

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

export function rehypeHeadingPermalinks() {
  return (tree: Root, file: VFile) => {
    const frontmatter = (file.data as { astro?: { frontmatter?: Record<string, unknown> } }).astro?.frontmatter;
    const title = frontmatter?.title;
    if (typeof title !== 'string' || title === '') {
      file.fail('frontmatter の title が無いため見出し id を決められません');
    }
    const used = new Set<string>();
    // h1 はレイアウトが title から出す。現サイトは h1 から連番を振っているので、その 1 回分を先に消費する
    unique(slugify(title), used);
    visit(tree, 'element', (node: Element) => {
      if (!HEADING_TAGS.has(node.tagName)) return;
      const text = toString(node);
      const id = unique(slugify(text), used);
      node.properties.id = id;
      node.children.push({
        type: 'element',
        tagName: 'a',
        properties: { className: ['anchor'], href: `#${id}`, ariaLabel: `「${text}」へのリンク` },
        children: [],
      });
    });
  };
}
