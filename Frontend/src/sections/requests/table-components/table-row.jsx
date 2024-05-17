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
import { useSearchParams } from "react-router-dom";

import { fDate } from 'src/utils/format-time';

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
  description, 
  date,
  access
}) {

  const router = useRouter();
  const [ searchParams ] = useSearchParams();
  const token = searchParams.get("session");

  const handleRowClick = () =>{
    const selection = window.getSelection()
    if(selection.type !== "Range") {
      router.push(`${id}?session=${token}`)
    }
  }

  return (
    <TableRow 
      hover 
      tabIndex={-1} 
      role="checkbox"
      onClick={handleRowClick}
    >
      <TableCell align="center" padding="checkbox">
        <IconButton 
          onClick={handleRowClick}
        >
          <Iconify icon="eva:expand-fill" />
        </IconButton>
      </TableCell>

      { 
        access === 'manager' ?
          <>
            <TableCell component="th" scope="row" padding="none">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar alt={name} src={avatarUrl} />
                <Typography variant="subtitle2" noWrap>
                  {name}
                </Typography>
              </Stack>
            </TableCell>

            <TableCell id="address">{address}</TableCell>

            <TableCell id="type">{type}</TableCell>
          </>
        :
          <>
            <TableCell component="th" scope="row" padding="none">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar alt={type} src={avatarUrl} />
                <Typography variant="subtitle2" noWrap>
                  {type}
                </Typography>
              </Stack>
            </TableCell>

            <TableCell id="description" noWrap>{description}</TableCell>

            <TableCell id="date">{fDate(date)}</TableCell>
          </>
      }
  
      <TableCell id="status">
        <Label color={(status === 'Unresolved' && 'error')  || (status === 'Ongoing' && 'warning') || 'success'}>{status}</Label>
      </TableCell>
      
    </TableRow>
  );
}

UserTableRow.propTypes = {
  id: PropTypes.any,
  avatarUrl: PropTypes.any,
  name: PropTypes.any,
  address: PropTypes.any,
  type: PropTypes.any,
  status: PropTypes.any,
  description: PropTypes.any,
  date: PropTypes.any,
  access: PropTypes.any,
};
