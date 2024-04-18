import PropTypes from 'prop-types';
import { useState } from 'react';
// import Stack from '@mui/material/Stack';
// import TableRow from '@mui/material/TableRow';
// import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export default function PaymentTableRow({ paymentsID, type, time, amount }) {
  const [isVisible, setIsVisible] = useState(true);

  const handlePay = () => {
    // Implement pay functionality here
    setIsVisible(false); // Set isVisible to false to trigger the exit animation
    // call the api
    // remove payment in payment-view.jsx
    // removePayment(paymentsID);
    console.log(`Payment for ${type} clicked`);
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
      style={{ display: isVisible ? 'table-row' : 'none', transition: 'opacity 0.5s ease-in-out' }}
    >
      <TableCell>{paymentsID}</TableCell>
      <TableCell>{type}</TableCell>
      <TableCell>{time}</TableCell>
      <TableCell>{amount}</TableCell>
      <TableCell>
        <Button variant="contained" onClick={handlePay}>
          Pay
        </Button>
      </TableCell>
    </TableRow>
  );
}

PaymentTableRow.propTypes = {
  paymentsID: PropTypes.any,
  time: PropTypes.any,
  amount: PropTypes.any,
  type: PropTypes.any,
};
