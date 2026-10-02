import { SITE_TITLE } from '../../consts';
import { renderOgImage } from '../../og/render';

export async function GET() {
  return new Response(await renderOgImage(SITE_TITLE), { headers: { 'Content-Type': 'image/png' } });
}
