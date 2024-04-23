import PropTypes from 'prop-types';
import { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export default function PaymentTableRow({ tenantID, paymentsID, type, time, amount }) {
  const [isVisible, setIsVisible] = useState(true);
  const handlePay = async () => {
    setIsVisible(false); // Set isVisible to false to trigger the exit animation
    try {
      await fetch(
        `${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/make-payment?tenant-id=${tenantID}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: `${type}`,
            amount: `${amount}`,
            paymentsID: `${paymentsID}`,
          }),
        }
      );
    } catch (error) {
      console.log();
    }
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
  tenantID: PropTypes.any,
  time: PropTypes.any,
  amount: PropTypes.any,
  type: PropTypes.any,
};
