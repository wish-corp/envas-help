# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

WEB席次表 envas のヘルプサイト。MkDocs Material テーマを使用した静的ドキュメントサイト。

- 本番URL: https://help.envas.jp/
- デプロイ: mainブランチへのpushで GitHub Actions により自動デプロイ

## 開発コマンド

```bash
# ローカル開発サーバー起動（http://localhost:8000）
docker compose up -d

# サーバー停止
docker compose down
```

## ファイル構成

- `docs/` - Markdownドキュメント（ここにページを追加）
- `docs/stylesheets/extra.css` - カスタムCSS
- `docs/images/` - 画像ファイル
- `mkdocs.yml` - MkDocs設定（サイト名、ナビゲーション、テーマ設定）

## MkDocs設定

- テーマ: Material for MkDocs
- 言語: 日本語（ja）
- Markdown拡張: nl2br（改行を`<br>`に変換）