import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { RequestSpecificView } from 'src/sections/requests/view';

// ----------------------------------------------------------------------

export default function RequestDetailsPage() {

  const { requestID } = useParams();

  return (
    <>
      <Helmet>
        <title> Request Details | Property Management Suite </title>
      </Helmet>

      <RequestSpecificView id={requestID}/>
    </>
  );
}
