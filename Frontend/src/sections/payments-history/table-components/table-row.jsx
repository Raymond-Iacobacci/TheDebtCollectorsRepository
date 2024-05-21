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

import { fDate } from 'src/utils/format-time';


// ----------------------------------------------------------------------

export default function PaymentTableRow({ type, time, amount, description, balance }) {
  const [firstWord, ...restWords] = type.split(' ');
  // const parts = time.split('T');
  // const datePart = parts[0];
  // const timeFinal = `${datePart.split('-')[1]}/${datePart.split('-')[2]}/${datePart.split('-')[0]}`;

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
