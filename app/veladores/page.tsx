import { notFound } from 'next/navigation';
import CategoryCollection, { categoryMetadata } from '@/components/CategoryCollection';
import { getLegacyCategory } from '@/lib/categories';
export const dynamic = 'force-dynamic';
async function category() { const value = await getLegacyCategory('velador'); if (!value) notFound(); return value; }
export async function generateMetadata() { return categoryMetadata(await category()); }
export default async function Page() { return <CategoryCollection category={await category()} />; }
