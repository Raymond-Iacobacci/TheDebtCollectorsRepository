import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { AllPaymentsView } from 'src/sections/all-payments/view';



// ----------------------------------------------------------------------

export default function AllPayments({managerID}) {

  return (
    <>
      <Helmet>
        <title> List Payments | Property Management Suite </title>
      </Helmet>
      <AllPaymentsView managerID={managerID}/>
    </>
  );
}

AllPayments.propTypes = {
    managerID: PropTypes.string,
};