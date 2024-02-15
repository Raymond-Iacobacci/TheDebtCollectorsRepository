// import { useState } from 'react';
import PropTypes from 'prop-types';
// import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';

import { useRouter } from 'src/routes/hooks';

import { requests } from 'src/_mock/request';

import Iconify from 'src/components/iconify';

import RequestDescription from '../request-description';
import RequestLogTimeline from '../request-log-timeline';

// ----------------------------------------------------------------------

export default function RequestSpecificView({ id }) {

  const currentRequest = requests.find(req => req.id === id);

  const router = useRouter();

  const handleGoBack = (event) => {
    router.back();
  };

  return (
    <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Button onClick={handleGoBack} variant="contained" color="inherit" startIcon={<Iconify icon="eva:corner-down-left-fill" />}>
                Back
            </Button>
            </Stack>
            <Grid container spacing={3}>
            <Grid xs={12} md={7} lg={8}>
                <RequestDescription
                title={currentRequest.type}
                subheader={`${currentRequest.name}  @  ${currentRequest.address}`}
                description={currentRequest.description}
                list={currentRequest.attachments}
                request={currentRequest}
                commentList={currentRequest.comments}
                />
            </Grid>
            <Grid xs={12} md={5} lg={4}>
                <RequestLogTimeline
                title="Recent Updates"
                list={currentRequest.logs}
                />
            </Grid>
        </Grid>
    </Container>
  );
}

RequestSpecificView.propTypes = {
    id: PropTypes.string,
}
