import type { APIContext } from 'astro';
import { docPath, getNavDocs } from '../lib/docs';

export async function GET(context: APIContext) {
  const entries = await getNavDocs();
  const urls = entries
    .map((entry) => `  <url><loc>${new URL(docPath(entry.id), context.site).href}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
