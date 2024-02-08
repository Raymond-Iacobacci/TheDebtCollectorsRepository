import { Helmet } from 'react-helmet-async';

import { RequestView } from 'src/sections/requests/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> User | Property Management Suite </title>
      </Helmet>

      <RequestView />
    </>
  );
}
