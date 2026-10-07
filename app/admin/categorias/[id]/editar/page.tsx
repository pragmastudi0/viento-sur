import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/admin';
import { toCategory } from '@/lib/category-types';
import AdminHeader from '@/components/admin/AdminHeader';
import CategoryForm from '@/components/admin/CategoryForm';
export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireAdminPage(); const { id } = await params;
  const { data, error } = await client.from('viento_sur_categories').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error('No pudimos cargar la categoría.'); if (!data) notFound();
  return <><AdminHeader /><section className="container-page py-10"><h1 className="text-3xl">Editar categoría</h1><CategoryForm key={data.updated_at} category={toCategory(data)} /></section></>;
}
