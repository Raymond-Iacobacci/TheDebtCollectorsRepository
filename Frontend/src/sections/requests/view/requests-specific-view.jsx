import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';

import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

import RequestComments from '../specifics-components/comment-list';
import RequestHeaderInfo from '../specifics-components/header-info';
import RequestAttachments from '../specifics-components/attachment-list';
// import RequestLogTimeline from '../specifics-components/request-log-timeline';

// ----------------------------------------------------------------------

export default function RequestSpecificView({ id }) {

  const router = useRouter();

  const handleGoBack = (event) => {
    router.back();
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Button
              onClick={handleGoBack}
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="eva:corner-down-left-fill" />}
            >
              Back
            </Button>
          </Stack>
          <Grid container spacing={3}>
            <Grid xs={12} md={10} lg={10}>
              <Card>
                <RequestHeaderInfo id={id} />
                <Divider sx={{ borderStyle: 'dashed' }} />
                <RequestAttachments id={id} />
                <Divider sx={{ borderStyle: 'dashed' }} />
                <RequestComments id={id} />
              </Card>
            </Grid>
            {/* <Grid xs={12} md={5} lg={4}>
              <RequestLogTimeline id={id} />
            </Grid> */}
          </Grid>
    </Container>
  );
}

RequestSpecificView.propTypes = {
  id: PropTypes.string,
};
