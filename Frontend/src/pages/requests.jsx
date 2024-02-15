import { Helmet } from 'react-helmet-async';

import { RequestsView } from 'src/sections/requests/view';

// ----------------------------------------------------------------------

export default function RequestPage() {
  return (
    <>
      <Helmet>
        <title> Requests | Property Management Suite </title>
      </Helmet>

      <RequestsView/>
    </>
  );
}
