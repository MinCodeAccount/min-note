import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: "d686d883-f701-4077-b919-9d21b99bbbf6",
  // Get this from tina.io
  token: process.env.TINA_TOKEN || "",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "assets",
      publicFolder: "public",
    },
  },
  
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "src/content/blog",
        format: "md",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              // Create a default slug from the title
              return `${(values?.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date Published",
            required: true,
            ui: {
              dateFormat: 'YYYY-MM-DD'
            }
          },
          {
            type: "datetime",
            name: "updatedDate",
            label: "Date Updated",
            ui: {
              dateFormat: 'YYYY-MM-DD'
            }
          },
          {
            type: "image",
            name: "heroImage",
            label: "Hero Image",
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: [
              { label: "📺 アニメ (Anime)", value: "anime" },
              { label: "📈 投資 (Investment)", value: "investment" },
              { label: "☕ 日常 (Daily)", value: "daily" },
            ]
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
