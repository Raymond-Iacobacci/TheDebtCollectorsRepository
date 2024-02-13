// import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

export default function RequestPopup({
  handleClosePopup
}) {
  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Request Specifics</Typography>

          <Button onClick={handleClosePopup} variant="contained" color="inherit" startIcon={<Iconify icon="eva:edit-fill" />}>
            Temporary Close Popup
          </Button>
      </Stack>
      <Card>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h4">Name</Typography>
        <Typography variant="h4">Date</Typography>
      </Stack>
      </Card>
    </>
  );
}

RequestPopup.propTypes = {
  handleClosePopup: PropTypes.func,
};