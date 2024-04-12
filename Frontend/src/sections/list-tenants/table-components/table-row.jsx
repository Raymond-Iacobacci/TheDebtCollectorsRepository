import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function UserTableRow({
  id,
  firstName,
  lastName,
  email,
  address,
}) {
  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
    >
      <>
        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {id}
            </Typography>
          </Stack>
        </TableCell>
        {/* What?? */}

        <TableCell id="lastName">{lastName}</TableCell>

        <TableCell id="email">{email}</TableCell>

        <TableCell id="address">{address}</TableCell>
      </>
    </TableRow>
  );
}

UserTableRow.propTypes = {
  id: PropTypes.any,
  firstName: PropTypes.any,
  lastName: PropTypes.any,
  email: PropTypes.any,
  address: PropTypes.any,
};
