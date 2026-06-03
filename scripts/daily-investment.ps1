<#
.SYNOPSIS
  Generate today's investment article DRAFT using Claude Code (subscription auth, no API billing).
.DESCRIPTION
  Reads a PDF from pdf-inbox and scripts\style-guide.md, then writes
  src\content\blog\YYYY-MM-DD.md with draft: true and commits/pushes it.
  Because it is a draft it does NOT appear on the public site. Review and publish
  it at https://min-note.com/admin (turn the "draft" toggle OFF).

  NOTE: This file is intentionally pure ASCII. Japanese text lives in
  scripts\prompt-template.txt (UTF-8) and scripts\style-guide.md, which are read
  with explicit UTF-8 decoding. Keeping Japanese OUT of this .ps1 avoids the
  Windows PowerShell 5.1 codepage problem (mojibake / parse errors).
.PARAMETER Date
  Target date (yyyy-MM-dd). Defaults to today.
.PARAMETER NoCommit
  Generate only; skip all git operations (for testing).
.PARAMETER NoPush
  Commit but do not push.
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\daily-investment.ps1 -NoPush
#>
[CmdletBinding()]
param(
    [string]$Date = (Get-Date).ToString('yyyy-MM-dd'),
    [switch]$NoCommit,
    [switch]$NoPush
)

$ErrorActionPreference = 'Stop'

$RepoRoot     = Split-Path -Parent $PSScriptRoot
$InboxDir     = Join-Path $RepoRoot 'pdf-inbox'
$BlogDir      = Join-Path $RepoRoot 'src\content\blog'
$StyleGuide   = Join-Path $PSScriptRoot 'style-guide.md'
$TemplateFile = Join-Path $PSScriptRoot 'prompt-template.txt'
$PromptFile   = Join-Path $PSScriptRoot '.daily-prompt.txt'

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Error "claude CLI not found. Install Claude Code and make sure it is on PATH."
    exit 1
}
if (-not (Test-Path $TemplateFile)) {
    Write-Error "prompt-template.txt not found: $TemplateFile"
    exit 1
}

Write-Host "==> Target date: $Date"

# 1) Find the PDF for the target date.
#    Accept both "YYYY-MM-DD.pdf" and the no-dash "YYYYMMDD.pdf" form the user uses.
#    Do NOT fall back to an arbitrary newest PDF: that once produced a wrong-dated
#    article (a late-evening run grabbed the PREVIOUS day's PDF).
$dateCompact = $Date.Replace('-', '')
$pdf = $null
foreach ($name in @("$Date.pdf", "$dateCompact.pdf")) {
    $candidate = Join-Path $InboxDir $name
    if (Test-Path $candidate) { $pdf = $candidate; break }
}
if ($null -eq $pdf) {
    Write-Host "==> No PDF for $Date in $InboxDir (looked for: $Date.pdf, $dateCompact.pdf)."
    Write-Host "==> Nothing to do. Add the PDF and re-run this script manually."
    exit 0
}
Write-Host "==> Using PDF: $(Split-Path $pdf -Leaf)"

# 2) Output path (if same date already exists, use -2, -3, ...)
$slug = $Date
$out  = Join-Path $BlogDir "$slug.md"
$n = 2
while (Test-Path $out) {
    $slug = "$Date-$n"
    $out  = Join-Path $BlogDir "$slug.md"
    $n++
}
Write-Host "==> Output: $out"

# 3) Build the (Japanese) instruction file from the UTF-8 template.
$tpl = Get-Content -Raw -Encoding UTF8 $TemplateFile
$instructions = $tpl
$instructions = $instructions.Replace('{{DATE}}',  $Date)
$instructions = $instructions.Replace('{{PDF}}',   $pdf)
$instructions = $instructions.Replace('{{OUT}}',   $out)
$instructions = $instructions.Replace('{{STYLE}}', $StyleGuide)
Set-Content -Path $PromptFile -Value $instructions -Encoding UTF8

# 4) Run Claude Code headless (subscription auth; only Read/Write/Edit allowed).
$argPrompt = "Read the UTF-8 instruction file at '$PromptFile' and follow it exactly. It lists which files to read and which markdown file to write. Do not run git."

Push-Location $RepoRoot
try {
    Write-Host "==> Generating draft with Claude Code..."
    & claude -p $argPrompt --permission-mode acceptEdits --allowedTools "Read,Write,Edit" --add-dir $RepoRoot
}
finally {
    Pop-Location
    Remove-Item $PromptFile -ErrorAction SilentlyContinue
}

if (-not (Test-Path $out)) {
    Write-Error "Article file was not created: $out (check the prompt / permission flags)"
    exit 1
}
Write-Host "==> Created: $out"

# 5) Commit and push (draft -> hidden on site; review/publish in admin)
if ($NoCommit) {
    Write-Host "==> -NoCommit set; skipping git."
    exit 0
}

git -C $RepoRoot add -- "$out"
git -C $RepoRoot commit -m "draft: daily investment $slug (AI draft, needs review)"
if ($NoPush) {
    Write-Host "==> -NoPush set; not pushing. Push manually after review."
}
else {
    # The CMS (min-note.com/admin) may have pushed new posts since the last run,
    # so the local branch can be behind. Sync first, otherwise push is rejected
    # as non-fast-forward. A new dated post file does not conflict with CMS posts.
    git -C $RepoRoot fetch origin main
    git -C $RepoRoot rebase origin/main
    if ($LASTEXITCODE -ne 0) {
        git -C $RepoRoot rebase --abort
        Write-Error "Rebase onto origin/main failed (conflict). Resolve manually, then push."
        exit 1
    }
    git -C $RepoRoot push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Error "git push failed (check credentials/remote)."
        exit 1
    }
    Write-Host "==> Pushed. Review the draft at https://min-note.com/admin"
}
