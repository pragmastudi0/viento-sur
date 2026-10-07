import { randomUUID } from 'node:crypto';
import { requireAdminPage } from '@/lib/admin';
import { getAdminCategories } from '@/lib/categories';
import AdminHeader from '@/components/admin/AdminHeader';
import CategoryForm from '@/components/admin/CategoryForm';
export default async function NewCategoryPage() {
  const { client } = await requireAdminPage(); const categories = await getAdminCategories(client);
  return <><AdminHeader /><section className="container-page py-10"><h1 className="text-3xl">Crear categoría</h1><CategoryForm newId={randomUUID()} nextOrder={Math.min(2147483647, Math.max(0, ...categories.map(c => c.sortOrder)) + 1)} /></section></>;
}
