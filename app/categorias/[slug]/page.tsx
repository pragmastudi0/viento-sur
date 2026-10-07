import { notFound, permanentRedirect } from 'next/navigation';
import CategoryCollection, { categoryMetadata } from '@/components/CategoryCollection';
import { getCategoryBySlug } from '@/lib/categories';
import { categoryHref } from '@/lib/category-types';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
async function resolve(params: Props['params']) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const canonical = categoryHref(category);
  if (canonical !== `/categorias/${slug}`) permanentRedirect(canonical);
  return category;
}
export async function generateMetadata({ params }: Props) { return categoryMetadata(await resolve(params)); }
export default async function Page({ params }: Props) { return <CategoryCollection category={await resolve(params)} />; }
