import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { PaymentsView } from 'src/sections/payments/view';



// ----------------------------------------------------------------------

export default function Payments({tenantID}) {

  return (
    <>
      <Helmet>
        <title> List Tenants | Property Management Suite </title>
      </Helmet>
      <PaymentsView tenantID={tenantID}/>
    </>
  );
}

Payments.propTypes = {
    tenantID: PropTypes.string,
};