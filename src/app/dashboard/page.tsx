import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import DashboardContent from '@/components/admin/DashboardContent';

export default async function DashboardPage() {
    // Server-side authentication check
    const session = await auth();

    if (!session || session.user.userType !== 'staff') {
        redirect('/');
    }

    return (
        <div className="container mx-auto py-24 px-4">
            <h1 className="text-4xl font-display text-center mb-12">Admin Dashboard</h1>
            <DashboardContent />
        </div>
    );
}