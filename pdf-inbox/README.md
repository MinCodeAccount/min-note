# pdf-inbox

「今日の投資記事」の**元データPDF**を置く場所です。

- 毎日、その日のPDFを `YYYY-MM-DD.pdf`（例: `2026-06-02.pdf`）の名前で置いてください。
- 別名でも動きますが、その場合はフォルダ内で**最も新しいPDF**が使われます。
- PDF自体は Git にコミットされません（`.gitignore` 済み）。
- このPDFを元に `scripts\daily-investment.ps1` が記事の下書きを生成します。
