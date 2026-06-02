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
			// 騰落率など（投資カテゴリで使用、例: "-1.16%"）
			change: z.string().optional(),
			// 下書き（true の記事はサイトに公開されない）
			draft: z.boolean().optional().default(false),
		}),
});

export const collections = { blog };
