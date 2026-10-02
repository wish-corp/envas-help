import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import remarkBreaks from 'remark-breaks';
import remarkDirective from 'remark-directive';
import { remarkDirectiveBlocks } from './src/markdown/directives';
import { rehypeHeadingPermalinks } from './src/markdown/heading-ids';

export default defineConfig({
  site: 'https://help.envas.jp',
  markdown: {
    processor: unified({
      smartypants: false,
      remarkRehype: {
        // 既定の h2 だと見出し id の付け替えと目次の対象になり、aria-describedby の参照先が切れる。
        // 見出しにしない要素で出し、視覚的に隠すクラスはサイトで定義済みの .sr を使う
        footnoteLabelTagName: 'p',
        footnoteLabelProperties: { className: ['sr'] },
      },
      remarkPlugins: [remarkDirective, remarkDirectiveBlocks, remarkBreaks],
      rehypePlugins: [rehypeHeadingPermalinks],
    }),
  },
});
