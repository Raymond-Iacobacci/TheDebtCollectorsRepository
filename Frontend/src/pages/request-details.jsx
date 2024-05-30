import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';

import { useRouter, usePathname } from 'src/routes/hooks';

import { RequestSpecificView } from 'src/sections/requests/view';

import { verifyToken } from './verifyToken';

// ----------------------------------------------------------------------

export default function RequestDetailsPage() {
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

  const { requestID } = useParams();

  return (
    <>
      <Helmet>
        <title> Request Details | Property Management Suite </title>
      </Helmet>

      <RequestSpecificView id={requestID} />
    </>
  );
}
