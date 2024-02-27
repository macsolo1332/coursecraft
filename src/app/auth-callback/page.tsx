import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { useEffect } from 'react';

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const origin = searchParams.get('origin');

    const { data, isLoading } = trpc.authCallback.useQuery(undefined);

    useEffect(() => {
        if (data?.success) {
            // user is synced to db
            router.push(origin ? `/${origin}` : '/dashboard');
        }
    }, [data, router, origin]);

    // You can render your component contents here
    return (
        <div>
            {/* Your component contents */}
        </div>
    );
};

export default Page;
