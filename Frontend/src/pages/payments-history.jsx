import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { PaymentsHistoryView } from 'src/sections/payments-history/view';



// ----------------------------------------------------------------------

export default function PaymentsHistory({tenantID}) {

  return (
    <>
      <Helmet>
        <title> List Payments | Property Management Suite </title>
      </Helmet>
      <PaymentsHistoryView tenantID={tenantID}/>
    </>
  );
}

PaymentsHistory.propTypes = {
    tenantID: PropTypes.string,
};