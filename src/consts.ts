// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'みん の日常';
export const SITE_DESCRIPTION = '投資（日経平均の毎日の振り返り）を中心に、アニメ・ゲーム・日常をゆる〜く発信する個人ブログです。';

// カテゴリの単一定義。表示名・絵文字・テーマ色はここだけを直せば全ページに反映される。
// slug は URL・frontmatter の category 値・CMS (public/admin/config.yml) の選択肢と一致させること。
export type CategoryDef = {
	slug: string;
	label: string;
	emoji: string;
	color: string; // セクション枠などに使うパステル色
};

export const CATEGORIES: CategoryDef[] = [
	{ slug: 'anime', label: 'アニメ', emoji: '📺', color: '#bdf1f6' },
	{ slug: 'investment', label: '投資', emoji: '📈', color: '#fff3b0' },
	{ slug: 'daily', label: '日常', emoji: '☕', color: '#ffc6c7' },
	{ slug: 'game', label: 'ゲーム', emoji: '🎮', color: '#a0fca5' },
];

export function getCategory(slug: string | undefined): CategoryDef | undefined {
	return CATEGORIES.find((c) => c.slug === slug);
}

// 未定義カテゴリは slug をそのまま表示（typo した記事でもリンク切れ表示にしない）
export function categoryLabel(slug: string | undefined): string {
	const c = getCategory(slug);
	return c ? `${c.emoji} ${c.label}` : (slug ?? '');
}
