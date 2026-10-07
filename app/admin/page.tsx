import { requireAdminPage } from '@/lib/admin';
import { toProduct, type ProductRow } from '@/lib/catalog';
import AdminHeader from '@/components/admin/AdminHeader';
import CatalogManager from '@/components/admin/CatalogManager';
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { client } = await requireAdminPage();
  const { data, error } = await client.from('products').select('*').is('deleted_at', null).order('sort_order').order('id');
  if (error) throw new Error('No se pudo cargar el administrador.');
  const params = await searchParams;
  return <><AdminHeader /><section className="container-page py-10 sm:py-14"><CatalogManager products={(data as ProductRow[]).map(toProduct)} success={params.success} /></section></>;
}
