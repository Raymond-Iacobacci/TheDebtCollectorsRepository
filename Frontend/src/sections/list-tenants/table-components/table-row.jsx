import PropTypes from 'prop-types';

// import Stack from '@mui/material/Stack';
// import TableRow from '@mui/material/TableRow';
// import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function TenantTableRow({
  id,
  name,
  email,
  address,
}) {
  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
    >
      
        <TableCell id="id">{}</TableCell>

        <TableCell id="email">{email}</TableCell>
        
        <TableCell id="name">{name}</TableCell>

        <TableCell id="address">{address}</TableCell>
      
    </TableRow>
  );
}

TenantTableRow.propTypes = {
  id: PropTypes.any,
  name: PropTypes.any,
  email: PropTypes.any,
  address: PropTypes.any,
};
