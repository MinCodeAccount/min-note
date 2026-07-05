// 既存記事の frontmatter に subcategory を一括付与するワンショットスクリプト。
// 使い方:  node scripts/backfill-subcategories.mjs          … dry-run（変更内容の表示のみ）
//          node scripts/backfill-subcategories.mjs --apply  … 実際にファイルを書き換える
//
// 分類ルール（タイトル基準。ファイル名の日付は記事内容とズレる例があるため使わない）:
//   investment: タイトルが「M/D」の日付で始まる → daily-report / それ以外 → theme
//               （例外: 2026-03-04-3.md「一時的なLNG供給危機」はテーマ記事として個別指定）
//   anime:      「転スラ|転生したらスライムだった件」→ tensura、「無職転生」→ mushoku、
//               その他 → 付与しない（「その他」表示）
//   game:       「ポケモン」→ pokoa-pokemon、「マイクラ|マインクラフト」→ minecraft
//   daily:      付与しない
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog');

const stripQuotes = (s) => {
	const t = s.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		return t.slice(1, -1);
	}
	return t;
};

// ファイル単位の個別指定（自動ルールの例外）
const FILE_OVERRIDES = {
	'2026-03-04-3.md': 'theme', // 「3/4 一時的なLNG供給危機」— 日付始まりだがテーマ記事
};

function classify(category, title) {
	switch (category) {
		case 'investment':
			// 日次レポートはタイトルが「M/D 」の日付で始まる（例: 6/22 日経平均7万円…）
			return /^\d{1,2}\/\d{1,2}/.test(title) ? 'daily-report' : 'theme';
		case 'anime':
			if (title.includes('転スラ') || title.includes('転生したらスライムだった件')) return 'tensura';
			if (title.includes('無職転生')) return 'mushoku';
			return null;
		case 'game':
			if (title.includes('ポケモン')) return 'pokoa-pokemon';
			if (title.includes('マイクラ') || title.includes('マインクラフト')) return 'minecraft';
			return null;
		default:
			return null;
	}
}

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
const results = [];

for (const file of files) {
	const path = join(BLOG_DIR, file);
	const text = readFileSync(path, 'utf8');

	// 先頭の frontmatter ブロックだけを対象にする（本文中の --- は無視）
	const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!fm) {
		results.push({ file, action: 'SKIP', reason: 'frontmatterなし' });
		continue;
	}
	const fmBody = fm[1];

	if (/^subcategory:/m.test(fmBody)) {
		results.push({ file, action: 'SKIP', reason: 'subcategory付与済み' });
		continue;
	}

	const catMatch = fmBody.match(/^category:\s*(.+)$/m);
	const titleMatch = fmBody.match(/^title:\s*(.+)$/m);
	const category = catMatch ? stripQuotes(catMatch[1]) : undefined;
	const title = titleMatch ? stripQuotes(titleMatch[1]) : '';

	if (!category) {
		results.push({ file, action: 'SKIP', reason: 'categoryなし', title });
		continue;
	}

	const sub = FILE_OVERRIDES[file] ?? classify(category, title);
	if (!sub) {
		results.push({ file, action: 'NONE', category, title, reason: '該当サブカテゴリなし' });
		continue;
	}

	// category 行の直後に subcategory 行を挿入（改行コードは元ファイルに合わせる）
	const eol = text.includes('\r\n') ? '\r\n' : '\n';
	const catLine = catMatch[0];
	const newText = text.replace(catLine, `${catLine}${eol}subcategory: ${sub}`);

	if (APPLY) {
		writeFileSync(path, newText, 'utf8');
	}
	results.push({ file, action: APPLY ? 'WRITE' : 'PLAN', category, sub, title });
}

// 結果表示
const pad = (s, n) => String(s ?? '').padEnd(n);
for (const r of results) {
	console.log(
		`${pad(r.action, 6)} ${pad(r.file, 22)} ${pad(r.category ?? '-', 12)} → ${pad(r.sub ?? '-', 14)} ${r.title ?? r.reason ?? ''}`
	);
}
const counts = results.reduce((m, r) => ((m[r.action] = (m[r.action] ?? 0) + 1), m), {});
console.log('\n集計:', JSON.stringify(counts), APPLY ? '(適用済み)' : '(dry-run: --apply で書き込み)');
