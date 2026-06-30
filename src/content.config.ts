import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The "projects" collection powers the card grid on the home page.
 * Adding a project = drop a new .md file in src/data/projects/ (see README).
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    // url is required only for live projects; omit for building/planned cards.
    url: z.string().optional(),
    // live = clickable & shipped · building = in progress · planned = coming soon
    status: z.enum(['live', 'building', 'planned']).default('planned'),
    // lower numbers sort first
    order: z.number().default(99),
  }),
});

export const collections = { projects };
