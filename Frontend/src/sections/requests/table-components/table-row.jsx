// import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
// import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
// import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({
  id,
  name,
  avatarUrl,
  address,
  type,
  status,
}) {

  const router = useRouter();

  const handleRowClick = () =>{
    router.push(id)
  }

  return (
    <>
      <TableRow 
        hover 
        tabIndex={-1} 
        role="checkbox"
        onDoubleClick={handleRowClick}
      >
        <TableCell align="center" padding="checkbox">
          <IconButton 
            onClick={handleRowClick}
          >
            <Iconify icon="eva:expand-fill" />
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{address}</TableCell>

        <TableCell>{type}</TableCell>


        <TableCell>
          <Label color={(status === 'Not Started' && 'error') || (status === 'Ongoing' && 'warning') || 'success'}>{status}</Label>
        </TableCell>

        {/* <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell> */}
      </TableRow>

      {/* <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover> */}
    </>
  );
}

UserTableRow.propTypes = {
  id: PropTypes.any,
  avatarUrl: PropTypes.any,
  name: PropTypes.any,
  address: PropTypes.any,
  type: PropTypes.any,
  status: PropTypes.any,
};
