import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AllReservationsContent from '@/components/admin/AllReservationsContent';

export default async function AllReservationsPage() {
    // Server-side authentication check
    const session = await auth();

    if (!session || session.user.userType !== 'staff') {
        redirect('/');
    }

    return <AllReservationsContent />;
}