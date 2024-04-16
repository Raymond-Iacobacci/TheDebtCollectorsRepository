import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';

import { useRouter, usePathname } from 'src/routes/hooks';

import { RequestSpecificView } from 'src/sections/requests/view';

// ----------------------------------------------------------------------

export default function RequestDetailsPage() {

  const { requestID } = useParams();

  const [ searchParams ] = useSearchParams();
  const token = searchParams.get('session');
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_MIDDLEWARE_URL}/users/verify-token?userID=${uuid}&token=${token}`
        )
        // .then(res => res.json())
        .then((response) => {
          if(response.status !== 200) {
            router.replace('/404');
          }
        });
      } catch (error) {
        console.log(`verifyToken API: ${error}`);
      }
    };
    verifyToken();
  }, [token, uuid, router]);

  return (
    <>
      <Helmet>
        <title> Request Details | Property Management Suite </title>
      </Helmet>

      <RequestSpecificView id={requestID}/>
    </>
  );
}
