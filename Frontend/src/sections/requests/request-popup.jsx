// import { useState } from 'react';
import PropTypes from 'prop-types';
import { faker } from '@faker-js/faker';

// import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
// import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

import RequestLogTimeline from './request-log-timeline';

export default function RequestPopup({
  handleClosePopup
}) {
  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Button onClick={handleClosePopup} variant="contained" color="inherit" startIcon={<Iconify icon="eva:corner-down-left-fill" />}>
          Back
        </Button>

        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:edit-fill" />}>
          Edit
        </Button>
      </Stack>
      
      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={4}>
          <RequestLogTimeline
            title="Payment Timeline"
            list={[...Array(5)].map((_, index) => ({
              id: faker.string.uuid(),
              title: [
                '1983, orders, $4220',
                '12 Invoices have been paid',
                'Order #37745 from September',
                'New order placed #XF-2356',
                'New order placed #XF-2346',
              ][index],
              type: `order${index + 1}`,
              time: faker.date.past(),
            }))}
          />
        </Grid>
      </Grid>
    </>
  );
}

RequestPopup.propTypes = {
  handleClosePopup: PropTypes.func,
};