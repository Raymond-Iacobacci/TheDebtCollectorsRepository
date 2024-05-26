// import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
// import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import Typography from '@mui/material/Typography';

import { useSearchParams } from 'react-router-dom';
import { useRouter, usePathname } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AnalyticsRequests({ title, subheader, list, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Divider sx={{ borderStyle: 'dashed', marginTop: '12px', marginBottom: '8px' }} />

      {list.length !== 0 ? (
        <>
          {list.map((request) => <TaskItem key={request.tenantID} request={request} />)}
        </>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={3}
          sx={{
            pl: 2,
            pr: 1,
            py: 1,
            '&:not(:last-of-type)': {
              borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
            },
          }}
        >
          <Typography variant="subtitle2" noWrap sx={{ p: 4 }}>
            No unresolved requests...
          </Typography>
        </Stack>
      )}
    </Card>
  );
}

AnalyticsRequests.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function TaskItem({ request }) {
  const pathname = usePathname();
  const router = useRouter();
  const uuid = pathname.split('/')[3];
  const [searchParams] = useSearchParams();
  const token = searchParams.get('session');

  const handleOpenMenu = (event) => {
    router.replace(`/dashboard/manager/${uuid}/requests/${request.requestID}?session=${token}`);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={3}
      onClick={handleOpenMenu}
      sx={{
        pl: 2,
        pr: 1,
        py: 1,
        '&:not(:last-of-type)': {
          borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
        },
      }}
    >
      <IconButton onClick={handleOpenMenu}>
        <Iconify icon="eva:expand-fill" />
      </IconButton>
      <Typography variant="subtitle2" sx={{ p: 0, pr: 1 }}>
        {`${request.name} has a ${request.type} request that is ${request.status}`}
      </Typography>
    </Stack>
  );
}

TaskItem.propTypes = {
    request: PropTypes.object,
};
