// import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';

import { useRouter, usePathname } from 'src/routes/hooks';
import { useSearchParams } from 'react-router-dom';

// import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number'

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({ type, amount, description, date, request }) {
  const router = useRouter();
  const path = usePathname();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('session');

  const handleRowClick = () => {
    router.replace(`${path.split('/').slice(0, 4).join('/')}/requests/${request}?session=${token}`)
  };

  return (
    <TableRow hover tabIndex={-1} role="checkbox">
      {request !== null ? (
        <TableCell align="center" padding="checkbox">
          <IconButton onClick={handleRowClick}>
            <Iconify icon="eva:expand-fill" />
          </IconButton>
        </TableCell>
      ) : (
        <div />
      )}

      <TableCell component="th" scope="row" padding="none">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {type}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell id="description">
        {fCurrency(amount)}
      </TableCell>

      <TableCell id="description" noWrap>
        {description}
      </TableCell>

      <TableCell id="date">{fDate(date)}</TableCell>
    </TableRow>
  );
}

UserTableRow.propTypes = {
  type: PropTypes.any,
  amount: PropTypes.any,
  description: PropTypes.any,
  date: PropTypes.any,
  request: PropTypes.any,
};
