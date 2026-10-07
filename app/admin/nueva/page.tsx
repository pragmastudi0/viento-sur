import { getAdminCategories } from '@/lib/categories';
import { randomUUID } from 'node:crypto';
import { requireAdminPage } from '@/lib/admin';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/ProductForm';
export default async function NewPage() {
  const { client } = await requireAdminPage();
  const categories = (await getAdminCategories(client)).filter(c => c.isActive);
  return <><AdminHeader /><section className="container-page py-10"><h1 className="text-3xl">Agregar lámpara</h1><p className="mt-3 text-sm text-ink/65">Cargá los datos y una foto. El resto es opcional.</p><ProductForm newId={randomUUID()} categories={categories} /></section></>;
}
