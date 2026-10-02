# envas-help
![envas-help-deploy-status](https://github.com/wish-corp/envas-help/actions/workflows/deploy.yml/badge.svg)

WEB 席次表 envas のヘルプサイト

## セットアップと起動

Node.js 24（`.nvmrc` 参照）が必要です。

```bash
npm ci
npm run dev
```

http://localhost:4321 で確認できます。検索は dev サーバーでは動かないので、検索を確かめるときは `npm run build && npm run preview` を使います。型検査は `npm run check` です。

## ページの追加

`src/content/docs/<id>.md` を作り、`src/nav.ts` の並びの表示したい位置に `'<id>'` を足します。ファイル名がそのまま URL（`/<id>/`）になるので、公開後は変えないでください。`index.md` はトップページ（`/`）の本文です。

先頭に frontmatter を書きます。

```md
---
title: "ページのタイトル"
---
```

- 本文に `# 見出し` は書きません。タイトルは frontmatter から出ます。
- 段落内の改行はそのまま改行として表示されます。

### 見出し

見出しの末尾に、空白を 1 つ以上空けて `{#id}` を付けます。

```md
## 2. ゲストを CSV で一括登録・更新する {#import-guests-csv}
```

id はそのまま URL のアンカー（`/guest/#import-guests-csv`）になり、アプリやお知らせサイトからリンクされます。公開後は変えないでください。

`{#id}` を付けない日本語の見出しは `_2` のような連番になり、前に見出しを足すと番号がずれます。新しく書く見出しには必ず付けてください。同じページで同じ id を 2 回使ったときや、`{#id}` の前に空白が無いときは、ビルドが止まります。

### リンク

ほかのページへは `/` から始まるパスで書きます。`guest.md` のようなファイル名では書けません。

```md
[席次表の使い方](/seating-chart/)
[CSV で一括登録する](/guest/#import-guests-csv)
```

### 注意書き

```md
:::warning[タイトル]
本文
:::

:::danger[タイトル]
本文
:::
```

### 動画

```md
::video{src="/movies/xxx.mp4"}
::video[説明]{src="/movies/xxx.mp4"}
::youtube[説明]{id="動画ID"}
```

動画のファイルは `public/movies/` に置きます。1 ファイル 100 MB 未満にしてください。

### 画像

```md
![説明](./images/<id>/xxx.png)
```

画像のファイルは `src/content/docs/images/<id>/` に置きます。

### 記法を誤ったとき

ビルドが「Markdown の変換に失敗した」で止まります。直前の `Error rendering` のログに原因が出ます。

## デプロイ

main への push で GitHub Actions がビルドし、gh-pages ブランチへ反映します。
