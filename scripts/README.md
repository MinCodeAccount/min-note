# AI 自動「今日の投資記事」下書き

毎日、用意したPDFから投資記事の**下書き**を Claude Code（サブスク／API課金なし）で自動生成し、
GitHub に push します。**下書き(draft)はサイトには表示されません。**
`https://min-note.com/admin` で内容を確認・修正し、「下書き」を OFF にすると公開されます。

## 仕組み

```
pdf-inbox\YYYY-MM-DD.pdf            ← あなたが毎日PDFを置く
   ↓ 毎日 22:00（既定）に Windows タスクが起動
scripts\daily-investment.ps1
   ↓ Claude Code が PDF と style-guide.md を読み、記事を執筆
src\content\blog\YYYY-MM-DD.md     ← draft: true で生成
   ↓ スクリプトが commit & push
GitHub → min-note.com/admin に「下書き」として表示
   ↓ あなたが確認・修正し「下書き」OFF で公開
```

## 前提
- Claude Code に**ログイン済み**（一度 `claude` を起動して `/login`）。サブスク認証を使います。
- **`ANTHROPIC_API_KEY` を環境変数に設定しない**（設定すると有料APIに課金されます）。
- git に push できる状態（普段どおり push できればOK）。

## 毎日やること
1. その日のPDFを `pdf-inbox\` に `YYYY-MM-DD.pdf`（例 `2026-06-02.pdf`）の名前で置く。
   - 別名でもOK（その場合フォルダ内の最新PDFを使用）。
2. あとは自動。夜に下書きが push されます。
3. `https://min-note.com/admin` →「ブログ記事」→ 当日の下書きを開く → 確認・修正 → **下書きを OFF** → 公開。

## まず手動でテスト（push しない）
```powershell
# リポジトリ直下で実行
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\daily-investment.ps1 -NoPush
```
生成された `src\content\blog\YYYY-MM-DD.md` を確認。プレビューは：
```powershell
npm run dev   # http://localhost:4321 （draft はサイトには出ません）
```

## 毎日の自動実行を登録
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\register-task.ps1 -Time 22:00
```
- 実行時刻はお好みで（例 `-Time 21:30`）。
- PCが起動・ログオンしている必要があります（ローカル実行のため）。
- 解除：`Unregister-ScheduledTask -TaskName MinNote-DailyInvestment -Confirm:$false`

## うまくいかないとき
- **権限プロンプトで止まる**：`daily-investment.ps1` の `--permission-mode acceptEdits` を
  `--permission-mode bypassPermissions` に変えてみてください。
- **`claude` が見つからない**：Claude Code をインストールし PATH を通す。
- **文体を変えたい**：`scripts\style-guide.md` を編集。
- **API課金が心配**：`echo $env:ANTHROPIC_API_KEY` が空であることを確認（空ならサブスク認証）。
