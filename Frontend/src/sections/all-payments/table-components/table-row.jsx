import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

export default function PaymentTableRow({
  paymentsID,
  name,
  type,
  time,
  amount,
}) {
  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
    >
      <TableCell>{name}</TableCell>
      <TableCell>{paymentsID}</TableCell>
      <TableCell>{type}</TableCell>
      <TableCell>{time}</TableCell>
      <TableCell>{amount}</TableCell>
    </TableRow>
  );
}

PaymentTableRow.propTypes = {
  paymentsID: PropTypes.any,
  name: PropTypes.any,
  time: PropTypes.any,
  amount: PropTypes.any,
  type: PropTypes.any,
};
