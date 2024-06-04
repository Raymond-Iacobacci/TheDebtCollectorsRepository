import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useSearchParams } from 'react-router-dom';
import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function TenantTableRow({ id, name, email, address }) {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('session');
  
  const handleRowClick = () => {
    router.push(`${id}?session=${token}`);
  };

  return (
    <TableRow hover tabIndex={-1} role="checkbox" onClick={handleRowClick}>
      <TableCell align="center" padding="checkbox">
        <IconButton onClick={handleRowClick}>
          <Iconify icon="eva:expand-fill" />
        </IconButton>
      </TableCell>

      <TableCell id="email">{email}</TableCell>

      <TableCell id="name">{name}</TableCell>

      <TableCell id="address">{address}</TableCell>
    </TableRow>
  );
}

TenantTableRow.propTypes = {
  id: PropTypes.any,
  name: PropTypes.any,
  email: PropTypes.any,
  address: PropTypes.any,
};
