import { useState } from 'react';

import Container from '@mui/material/Container';

import RequestTable from '../request-table';
import RequestPopup from '../request-popup';

// ----------------------------------------------------------------------

export default function RequestPage() {

  const [popup, setPopup] = useState(null);

  const handleOpenPopup = () => {
    setPopup(true);
  }
  
  const handleClosePopup = () => {
    setPopup(null);
  }

  return (
    <Container>
      {!popup ? <RequestTable handleOpenPopup={handleOpenPopup} /> : <RequestPopup handleClosePopup={handleClosePopup}/>}
    </Container>
  );
}
