import type { ElementContent } from 'hast';
import type { Root } from 'mdast';
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive';
import { toString } from 'mdast-util-to-string';
import { SKIP, visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

const CALLOUT_NAMES = new Set(['warning', 'danger']);
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_EMBED_BASE = 'https://www.youtube-nocookie.com/embed/';
const YOUTUBE_DEFAULT_TITLE = 'YouTube 動画';
const YOUTUBE_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
const LOCAL_VIDEO_PREFIX = '/movies/';

function figcaption(caption: string): ElementContent[] {
  if (caption === '') return [];
  return [{ type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] }];
}

function transformCallout(node: ContainerDirective, file: VFile) {
  if (!CALLOUT_NAMES.has(node.name)) file.fail(`未対応の記法です: :::${node.name}`, node);
  const [label] = node.children;
  if (!label || label.type !== 'paragraph' || !label.data?.directiveLabel) {
    file.fail(`:::${node.name} にはタイトル（:::${node.name}[タイトル]）が必要です`, node);
  }
  // ParagraphData には hName が無く、オブジェクトリテラルでは余剰プロパティとして弾かれるので Object.assign で渡す
  label.data = Object.assign({}, label.data, { hName: 'p', hProperties: { className: ['callout-title'] } });
  node.data = { hName: 'div', hProperties: { className: ['callout'], role: 'note' } };
}

function transformMedia(node: LeafDirective, file: VFile) {
  const caption = toString(node);
  if (node.name === 'youtube') {
    const id = node.attributes?.id ?? '';
    if (!YOUTUBE_ID_PATTERN.test(id)) file.fail(`YouTube の動画 ID が不正です: ${id}`, node);
    node.data = {
      hName: 'figure',
      hProperties: { className: ['media'] },
      hChildren: [
        {
          type: 'element',
          tagName: 'iframe',
          properties: {
            src: `${YOUTUBE_EMBED_BASE}${id}`,
            title: caption || YOUTUBE_DEFAULT_TITLE,
            loading: 'lazy',
            allow: YOUTUBE_ALLOW,
            allowFullScreen: true,
            referrerPolicy: 'strict-origin-when-cross-origin',
          },
          children: [],
        },
        ...figcaption(caption),
      ],
    };
    return;
  }
  if (node.name === 'video') {
    const src = node.attributes?.src ?? '';
    if (!src.startsWith(LOCAL_VIDEO_PREFIX)) file.fail(`動画は ${LOCAL_VIDEO_PREFIX} 配下に置いてください: ${src}`, node);
    node.data = {
      hName: 'figure',
      hProperties: { className: ['media'] },
      hChildren: [
        {
          type: 'element',
          tagName: 'video',
          properties: { src, controls: true, preload: 'metadata', playsInline: true },
          children: [],
        },
        ...figcaption(caption),
      ],
    };
    return;
  }
  file.fail(`未対応の記法です: ::${node.name}`, node);
}

export function remarkDirectiveBlocks() {
  return (tree: Root, file: VFile) => {
    const source = String(file.value);
    // 文中の「:英字」は text directive と解釈されて文字が消えるので、元の文字列に戻す。
    // 動画のキャプションは親の leaf directive を変換する時点で文字列化するので、変換より先に全体を戻しておく
    visit(tree, 'textDirective', (node, index, parent) => {
      if (!parent || index === undefined || !node.position) return;
      const { start, end } = node.position;
      parent.children.splice(index, 1, { type: 'text', value: source.slice(start.offset, end.offset) });
      return [SKIP, index];
    });
    visit(tree, (node) => {
      if (node.type === 'containerDirective') transformCallout(node, file);
      if (node.type === 'leafDirective') transformMedia(node, file);
    });
  };
}
