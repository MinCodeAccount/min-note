import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.string().optional(),
			category: z.string().optional(),
			// 第2カテゴリ。src/data/subcategories/ のエントリの slug を指す（任意）
			subcategory: z.string().optional(),
			// 騰落率など（投資カテゴリで使用、例: "-1.16%"）
			change: z.string().optional(),
			// 下書き（true の記事はサイトに公開されない）
			draft: z.boolean().optional().default(false),
		}),
});

// サブカテゴリ（第2カテゴリ）の定義。1件 = 1ファイルで /admin/ の
// 「サブカテゴリ管理」から追加・編集・削除できる（public/admin/config.yml 参照）。
const subcategories = defineCollection({
	loader: glob({ base: './src/data/subcategories', pattern: '**/*.{yml,yaml,json}' }),
	schema: z.object({
		// 親カテゴリの slug（consts.ts の CATEGORIES と一致させる）
		category: z.string(),
		// URL 用スラッグ（半角英数とハイフン）: /category/{category}/{slug}
		slug: z.string().regex(/^[a-z0-9-]+$/),
		// 日本語表示名
		label: z.string(),
		// 一覧での並び順（小さいほど上）
		order: z.number().optional().default(99),
	}),
});

export const collections = { blog, subcategories };
