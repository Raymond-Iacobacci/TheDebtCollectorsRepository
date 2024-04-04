import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { RequestsView } from 'src/sections/requests/view';

// ----------------------------------------------------------------------

export default function RequestPage({ access }) {
  return (
    <>
      <Helmet>
        <title> Requests | Property Management Suite </title>
      </Helmet>

      <RequestsView access={access} />
    </>
  );
}

RequestPage.propTypes = {
  access: PropTypes.string,
};
