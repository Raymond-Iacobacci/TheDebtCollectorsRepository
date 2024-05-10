import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '../hooks/utils';

export default function PaymentTableHead({
  order,
  orderBy,
  headLabel,
  onPaymentSort,
}) {
  const onSort = (property) => (event) => {
    onPaymentSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" />

        {headLabel.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.align || 'left'}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{ width: headCell.width, minWidth: headCell.minWidth }}
            >
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.paymentID}
                direction={orderBy === headCell.dueDate ? order : 'asc'}
                onClick={onSort(headCell.paymentID)}
              >
                {headCell.label}
                {orderBy === headCell.paymentID ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

PaymentTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  onPaymentSort: PropTypes.func,
};
