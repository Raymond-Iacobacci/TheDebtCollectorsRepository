import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';

import { useRouter, usePathname } from 'src/routes/hooks';
import { useSearchParams } from 'react-router-dom';

// import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({ 
  id, 
  type, 
  amount, 
  description, 
  date, 
  request, 
  deleteRow 
}) {
  const router = useRouter();
  const path = usePathname();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('session');

  const handleRowClick = () => {
    router.replace(`${path.split('/').slice(0, 4).join('/')}/requests/${request}?session=${token}`);
  };

  const [deletePopover, setDeletePopover] = useState(null);

  const handleOpenPopover = (event) => {
    setDeletePopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setDeletePopover(null);
  };

  const handleConfirmDelete = async () => {
    await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/delete-expense?expense-id=${id}`, {
      method: 'POST',
    });
    setDeletePopover(null);
    deleteRow();
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

      <TableCell id="description">{fCurrency(amount)}</TableCell>

      <TableCell id="description" noWrap>
        {description}
      </TableCell>

      <TableCell id="date">{fDate(date)}</TableCell>

      <TableCell align="left" padding="checkbox" id="delete">
        <IconButton id="delete" onClick={handleOpenPopover}>
          <Iconify id="delete" icon="eva:trash-2-fill" />
        </IconButton>
        <Popover
          id="delete"
          open={!!deletePopover}
          anchorEl={deletePopover}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem onClick={handleConfirmDelete} sx={{ pt: 1 }}>
            <Label color="error">Confirm delete?</Label>
          </MenuItem>
        </Popover>
      </TableCell>
    </TableRow>
  );
}

UserTableRow.propTypes = {
  id: PropTypes.any,
  type: PropTypes.any,
  amount: PropTypes.any,
  description: PropTypes.any,
  date: PropTypes.any,
  request: PropTypes.any,
  deleteRow: PropTypes.any
};
