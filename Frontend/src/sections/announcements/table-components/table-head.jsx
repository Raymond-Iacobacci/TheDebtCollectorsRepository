import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import { usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function AnnouncementTableHead({ headLabel }) {
  const pathname = usePathname();
  const access = pathname.split('/')[2];

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" />

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            <TableSortLabel hideSortIcon>{headCell.label}</TableSortLabel>
          </TableCell>
        ))}
        {access !== 'manager' ? (
        <div />
      ) : (
        <TableCell padding="checkbox" />
      )}
      </TableRow>
    </TableHead>
  );
}

AnnouncementTableHead.propTypes = {
  headLabel: PropTypes.array,
};
