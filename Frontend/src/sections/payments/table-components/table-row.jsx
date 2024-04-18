import PropTypes from 'prop-types';

// import Stack from '@mui/material/Stack';
// import TableRow from '@mui/material/TableRow';
// import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function PaymentTableRow({
  paymentID,
  dueDate,
  amount,
  task,
}) {
  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
    >
      
        <TableCell id="paymentID">{}</TableCell>

        <TableCell id="dueDate">{dueDate}</TableCell>
        
        <TableCell id="amount">{amount}</TableCell>

        <TableCell id="task">{task}</TableCell>
      
    </TableRow>
  );
}

PaymentTableRow.propTypes = {
  paymentID: PropTypes.any,
  dueDate: PropTypes.any,
  amount: PropTypes.any,
  task: PropTypes.any,
};
