import { useState } from 'react';
import PropTypes from 'prop-types';

import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { usePathname } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import { deleteAnnouncement } from '../hooks/announcement-specifics';

// ----------------------------------------------------------------------

export default function AnnouncementTableRow({ id, title, description, date, deleteRow }) {
  const pathname = usePathname();
  const access = pathname.split('/')[2];

  const [deletePopover, setDeletePopover] = useState(null);

  const handleOpenPopover = (event) => {
    setDeletePopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setDeletePopover(null);
  };

  const handleConfirmDelete = async () => {
    await deleteAnnouncement(id).then((data) => {
      if (data.ok) {
        deleteRow();
      }
    });
    setDeletePopover(null);
  };

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

      {access !== 'manager' ? (
        <div />
      ) : (
        <TableCell align="left" padding="checkbox" id="delete">
          <IconButton id="delete" onClick={handleOpenPopover}>
            <Iconify id="delete" icon="eva:trash-2-fill" />
          </IconButton>
          <Popover
            id="delete"
            open={!!deletePopover}
            anchorEl={deletePopover}
            onClose={handleClosePopover}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <MenuItem onClick={handleConfirmDelete} sx={{ pt: 1 }}>
              <Label color="error">Confirm delete?</Label>
            </MenuItem>
          </Popover>
        </TableCell>
      )}
    </TableRow>
  );
}

AnnouncementTableRow.propTypes = {
  id: PropTypes.any,
  title: PropTypes.any,
  description: PropTypes.any,
  date: PropTypes.any,
  deleteRow: PropTypes.any,
};
