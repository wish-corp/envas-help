import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string().min(1),
  }),
});

export const collections = { docs };
