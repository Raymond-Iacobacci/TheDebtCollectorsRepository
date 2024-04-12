import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { ListTenantView } from 'src/sections/list-tenants/view';



// ----------------------------------------------------------------------

export default function ListTenant({managerID}) {

  return (
    <>
      <Helmet>
        <title> List Tenants | Property Management Suite </title>
      </Helmet>
      <ListTenantView managerID={managerID}/>
    </>
  );
}

ListTenant.propTypes = {
    managerID: PropTypes.string,
};