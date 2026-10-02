import { getNavDocs, INDEX_ID } from '../../lib/docs';
import { renderOgImage } from '../../og/render';

export async function getStaticPaths() {
  const entries = await getNavDocs();
  return entries
    .filter((entry) => entry.id !== INDEX_ID)
    .map((entry) => ({ params: { id: entry.id }, props: { title: entry.data.title } }));
}

export async function GET({ props }: { props: { title: string } }) {
  return new Response(await renderOgImage(props.title), { headers: { 'Content-Type': 'image/png' } });
}
