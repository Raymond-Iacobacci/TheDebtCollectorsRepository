// import PropTypes from 'prop-types';
// import TableRow from '@mui/material/TableRow';
// import TableCell from '@mui/material/TableCell';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
import { useState } from 'react';
// @author Claude
import Popover from '@mui/material/Popover';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell'; // Import TableCell
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function PaymentTableRow({ id, type, time, amount, description, balance, access, deleteRow }) {
  const [firstWord, ...restWords] = type.split(' ');
  // const parts = time.split('T');
  // const datePart = parts[0];
  // const timeFinal = `${datePart.split('-')[1]}/${datePart.split('-')[2]}/${datePart.split('-')[0]}`;
  const [deletePopover, setDeletePopover] = useState(null);
  const handleOpenPopover = (event) => {
    setDeletePopover(event.currentTarget);
  };
  const handleClosePopover = () => {
    setDeletePopover(null);
  };
  const handleConfirmDelete = async () => {
    await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/transactions/delete-charge?payment-id=${id}`, {
      method: 'POST',
    });
    setDeletePopover(null);
    deleteRow();
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
    >
      {/* <TableCell>{paymentsID}</TableCell> */}
      <TableCell />
      <TableCell>
        <Box display="flex" flexDirection="column">
          <Typography variant="body1" fontWeight="bold">{firstWord}</Typography>
          <Box>{restWords.join(' ')}</Box>
          {description && <Box mt={1}>{description}</Box>}
        </Box>
      </TableCell>
      <TableCell>{fDate(time)}</TableCell>
      <TableCell>{amount}</TableCell>
      <TableCell>{balance}</TableCell>


      {type === 'Charge' && access === 'manager' ? (
        <TableCell align="left" padding="none" id="delete">
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
      ) : (
        <TableCell />
      )}


    </TableRow>
  );
}


PaymentTableRow.propTypes = {
  id: PropTypes.any,
  type: PropTypes.any,
  time: PropTypes.any,
  amount: PropTypes.any,
  description: PropTypes.any,
  balance: PropTypes.any,
  access: PropTypes.any,
  deleteRow: PropTypes.any,
};
