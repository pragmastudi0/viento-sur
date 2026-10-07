import { requireAdminPage } from '@/lib/admin';
import { getAdminCategories } from '@/lib/categories';
import AdminHeader from '@/components/admin/AdminHeader';
import CategoryManager from '@/components/admin/CategoryManager';
export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { client } = await requireAdminPage(); const categories = await getAdminCategories(client); const params = await searchParams;
  return <><AdminHeader /><section className="container-page py-10 sm:py-14"><CategoryManager categories={categories} success={params.success} /></section></>;
}
