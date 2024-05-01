import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { useRouter, usePathname } from 'src/routes/hooks';
import { useSearchParams } from 'react-router-dom';

import { ExpensesView } from 'src/sections/expenses/view';

// ----------------------------------------------------------------------

export default function ExpensePage({ access }) {

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
        <title> Expenses | Property Management Suite </title>
      </Helmet>
        
      <ExpensesView />
    </>
  );
}

ExpensePage.propTypes = {
  access: PropTypes.string,
};
