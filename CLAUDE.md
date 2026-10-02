# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

WEB席次表 envas のヘルプサイト。Astro で静的ビルドし、GitHub Pages（gh-pages ブランチ）で配信する。構成と見た目はお知らせサイト（envas-info）とそろえている。

- 本番URL: https://help.envas.jp/
- デプロイ: mainブランチへのpushで GitHub Actions がビルドし、gh-pages へ反映する

## 開発コマンド

```bash
npm ci           # 依存のインストール（Node.js 24、.nvmrc 参照）
npm run dev      # 開発サーバー（http://localhost:4321）
npm run build    # 静的ビルドと Pagefind の索引作成（dist/）
npm run preview  # ビルド結果の確認。検索はこちらでしか動かない
npm run check    # 型検査
```

## ファイル構成

- `src/content/docs/` - ページの Markdown。ファイル名が URL になる
- `src/nav.ts` - ページの並び順（左のページ一覧とトップのカードの順）
- `src/pages/` - トップ、各ページ、検索、404、sitemap、OG 画像
- `src/markdown/` - Markdown の変換（見出し id、注意書き・動画の記法）
- `src/styles/global.css` - サイト全体と本文の CSS
- `public/` - そのまま配信するファイル（画像、動画、CNAME、.nojekyll）

## Markdown の書き方

詳しくは README.md の「ページの追加」にある。要点は次のとおり。

- frontmatter に `title` を書き、本文に `# 見出し` は書かない
- 見出しには ` {#id}` を付ける。既存の id は外部からリンクされているので変えない
- 他ページへのリンクは `/<id>/` の形で書く
- 注意書きは `:::warning[タイトル]`、動画は `::video{src="/movies/xxx.mp4"}`
- 段落内の改行はそのまま改行になる
