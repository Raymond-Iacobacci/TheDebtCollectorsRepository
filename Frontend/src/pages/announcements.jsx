import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { useRouter, usePathname } from 'src/routes/hooks';
import { useSearchParams } from 'react-router-dom';

import { AnnouncementsView } from 'src/sections/announcements/view';

import { verifyToken } from './verifyToken';

// ----------------------------------------------------------------------

export default function AnnouncementsPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('session');
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];
  const router = useRouter();

  // Verifying token for user access
  useEffect(() => {
    if (!verifyToken(uuid, token)) {
      router.replace('/404');
    }
  }, [token, uuid, router]);

  return (
    <>
      <Helmet>
        <title> Announcements | Property Management Suite </title>
      </Helmet>

      <AnnouncementsView />
    </>
  );
}
