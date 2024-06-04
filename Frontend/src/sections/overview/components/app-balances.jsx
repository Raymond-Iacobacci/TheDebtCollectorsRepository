import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import Typography from '@mui/material/Typography';

import { useSearchParams } from 'react-router-dom';
import { useRouter, usePathname } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AppBalances({ title, subheader, list, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Divider sx={{ borderStyle: 'dashed', marginTop: '12px', marginBottom: '8px' }} />

      {list.length !== 0 ? (
        <>
          {list.map((tenant) => <BalanceItem key={tenant.tenantID} tenant={tenant} />)}
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
            No outstanding balances...
          </Typography>
        </Stack>
      )}
    </Card>
  );
}

AppBalances.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function BalanceItem({ tenant }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchParams] = useSearchParams();

  const uuid = pathname.split('/')[3];
  const token = searchParams.get('session');

  const handleOpenMenu = (event) => {
    router.replace(`/dashboard/manager/${uuid}/list-tenants/${tenant.tenantID}?session=${token}`);
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
      <Typography variant="subtitle2" noWrap sx={{ p: 0, pr: 1 }}>
        {`${tenant.firstName} ${tenant.lastName} has a balance of  $${tenant.balance}`}
      </Typography>
    </Stack>
  );
}

BalanceItem.propTypes = {
  tenant: PropTypes.object,
};
