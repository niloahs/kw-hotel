import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AccountContent from '@/components/account/AccountContent';

export default async function AccountPage() {
    // Server-side authentication check
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    return <AccountContent />;
}