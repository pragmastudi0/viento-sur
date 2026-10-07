import { requireAdminPage } from '@/lib/admin';
import LoginForm from '@/components/admin/LoginForm';
export default async function PasswordPage() { await requireAdminPage(); return <LoginForm recovery />; }
