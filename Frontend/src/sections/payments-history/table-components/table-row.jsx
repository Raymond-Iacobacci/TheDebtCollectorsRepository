// import PropTypes from 'prop-types';
// import TableRow from '@mui/material/TableRow';
// import TableCell from '@mui/material/TableCell';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';

// @author Claude
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell'; // Import TableCell
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function PaymentTableRow({ type, time, amount, description, balance }) {
  const [firstWord, ...restWords] = type.split(' ');
  const formattedDate = new Date(time).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

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
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{amount}</TableCell>
      <TableCell>{balance}</TableCell>
    </TableRow>
  );
}


PaymentTableRow.propTypes = {
  type: PropTypes.any,
  time: PropTypes.any,
  amount: PropTypes.any,
  description: PropTypes.any,
  balance: PropTypes.any,
};
