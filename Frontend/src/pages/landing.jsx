import { Helmet } from 'react-helmet-async';

import { LandingView } from 'src/sections/landing';

// ----------------------------------------------------------------------

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard | Property Management Suite </title>
      </Helmet>

      <LandingView />
    </>
  );
}
