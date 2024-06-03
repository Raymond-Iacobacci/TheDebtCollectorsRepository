import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';
import { useSearchParams } from 'react-router-dom';

import { fDate } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import { deleteRequest } from '../hooks/request-specifics'

// ----------------------------------------------------------------------

export default function UserTableRow({
  id,
  name,
  address,
  type,
  status,
  description,
  date,
  access,
  deleteRow,
}) {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('session');

  const handleRowClick = (event) => {
    const isClickedElementInStopElement = (element, elemID) => {
      while (element) {
        if (element.id === elemID) {
          return true;
        }
        element = element.parentElement;
      }
      return false;
    };

    if (isClickedElementInStopElement(event.target, 'delete')) {
      return;
    }

    const selection = window.getSelection();
    console.log(event.target);
    if (selection.type !== 'Range') {
      router.push(`${id}?session=${token}`);
    }
  };

  const [deletePopover, setDeletePopover] = useState(null);

  const handleOpenPopover = (event) => {
    setDeletePopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setDeletePopover(null);
  };

  const handleConfirmDelete = async () => {
    await deleteRequest(id).then((data) => {
      if( data.ok ) {
        deleteRow();
      }
    })
    setDeletePopover(null);
  };

  return (
    <TableRow hover tabIndex={-1} role="checkbox" onClick={handleRowClick}>
      <TableCell align="center" padding="checkbox">
        <IconButton onClick={handleRowClick}>
          <Iconify icon="eva:expand-fill" />
        </IconButton>
      </TableCell>

      {access === 'manager' ? (
        <>
          <TableCell component="th" scope="row" padding="none">
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* <Avatar alt={name} src={avatarUrl} /> */}
              <Typography variant="subtitle2" noWrap>
                {name}
              </Typography>
            </Stack>
          </TableCell>

          <TableCell id="address">{address}</TableCell>

          <TableCell id="type">{type}</TableCell>
          {/* <TableCell id="status">{type}</TableCell> */}

          <TableCell id="date">{fDate(date)}</TableCell>
        </>
      ) : (
        <>
          <TableCell component="th" scope="row" padding="none">
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* <Avatar alt={type} src={avatarUrl} /> */}
              <Typography variant="subtitle2" noWrap>
                {type}
              </Typography>
            </Stack>
          </TableCell>

          <TableCell id="description" noWrap>
            {description}
          </TableCell>

          <TableCell id="date">{fDate(date)}</TableCell>
        </>
      )}

      <TableCell id="status">
        <Label
          color={
            (status === 'Unresolved' && 'error') || (status === 'Ongoing' && 'warning') || 'success'
          }
        >
          {status}
        </Label>
      </TableCell>

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
  name: PropTypes.any,
  address: PropTypes.any,
  type: PropTypes.any,
  date: PropTypes.any,
  status: PropTypes.any,
  description: PropTypes.any,
  access: PropTypes.any,
  deleteRow: PropTypes.any,
};
