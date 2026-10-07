import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/admin';
import { toProduct, type ProductRow } from '@/lib/catalog';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/ProductForm';
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireAdminPage();
  const { id } = await params;
  const { data, error } = await client.from('products').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw new Error('No se pudo cargar la lámpara.');
  if (!data) notFound();
  return <><AdminHeader /><section className="container-page py-10"><h1 className="text-3xl">Editar lámpara</h1><ProductForm key={data.updated_at} product={toProduct(data as ProductRow)} /></section></>;
}
