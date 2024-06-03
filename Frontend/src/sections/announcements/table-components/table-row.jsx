import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function UserTableRow({ title, description, date }) {
  return (
    <TableRow hover tabIndex={-1} role="checkbox">
      <TableCell align="center" padding="checkbox" />
      <TableCell id="title" noWrap size="small">
        <Typography variant="subtitle2" noWrap>
          {title}
        </Typography>
      </TableCell>

      <TableCell id="description">{description}</TableCell>

      <TableCell id="date">{fDate(date)}</TableCell>
    </TableRow>
  );
}

UserTableRow.propTypes = {
  title: PropTypes.any,
  description: PropTypes.any,
  date: PropTypes.any,
};
