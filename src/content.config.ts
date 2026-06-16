import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default("tria team"),
    image: z.string().default("/assets/img/blog/1.jpg"),
    category: z.string().default("Technology"),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
