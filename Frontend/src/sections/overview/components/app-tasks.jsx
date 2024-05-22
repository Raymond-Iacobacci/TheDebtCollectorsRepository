// import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import Typography from '@mui/material/Typography';

import { useSearchParams } from "react-router-dom";
import { useRouter, usePathname } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AnalyticsTasks({ title, subheader, list, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      {list.map((tenant) => (
        <TaskItem key={tenant.tenantID} tenant={tenant} />
      ))}
    </Card>
  );
}

AnalyticsTasks.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function TaskItem({ tenant }) {
  const pathname = usePathname();
  const router = useRouter();
  const uuid = pathname.split('/')[3];
  const [searchParams ] = useSearchParams();
  const token = searchParams.get("session");

  const handleOpenMenu = (event) => {
    router.replace(`/dashboard/manager/${uuid}/list-tenants/${tenant.tenantID}?session=${token}`)
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
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
      <IconButton onClick={handleOpenMenu}>
          <Iconify icon="eva:expand-fill" />
        </IconButton>
      <Typography variant="subtitle2" noWrap sx={{ p: 0, pr: 1 }}>
        {`${tenant.firstName} ${tenant.lastName} has a balance of `}
      </Typography>
      <Typography variant="subtitle1" noWrap sx={{ p: 0, pr: 3 }}>
        {`$${tenant.balance}`}
      </Typography>
    </Stack>
  );
}

TaskItem.propTypes = {
  tenant: PropTypes.object,
};
