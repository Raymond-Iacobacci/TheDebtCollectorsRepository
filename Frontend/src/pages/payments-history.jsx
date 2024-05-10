import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { PaymentsHistoryView } from 'src/sections/payments-history/view';



// ----------------------------------------------------------------------

export default function PaymentsHistory({access}) {

  return (
    <>
      <Helmet>
        <title> List Payments | Property Management Suite </title>
      </Helmet>
      <PaymentsHistoryView access={access}/>
    </>
  );
}

PaymentsHistory.propTypes = {
    access: PropTypes.string,
};