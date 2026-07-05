// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://min-note.com',
	base: '/',
	// pagefind は build 完了後に dist を全文検索インデックス化する
	// （CI の `astro build` だけで動くのでワークフロー変更は不要）
	integrations: [mdx(), sitemap(), pagefind()],
});
