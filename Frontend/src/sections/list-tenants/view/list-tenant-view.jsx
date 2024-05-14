import { useState, useEffect } from 'react';

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { useRouter } from 'src/routes/hooks';
import { useSearchParams } from "react-router-dom";

import TableNoData from '../table-components/table-no-data';
// import UserTableRow from '../table-components/table-row';
import TenantTableHead from '../table-components/table-head';
import UserTableToolbar from '../table-components/table-toolbar';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';

function TenantTableRow({ id, name, email, address, onClick }) {
  return (
    <TableRow hover tabIndex={-1} role="checkbox" onClick={onClick}>
      <TableCell align="center" padding="checkbox">
        <IconButton onClick={onClick}>
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
  onClick: PropTypes.func,
};

export default function ListTenantView({ managerID }) {
  // const [selectedTenant, setSelectedTenant] = useState(null);
  // const [paymentAmount, setPaymentAmount] = useState('');

  // const [tenantRow, setTenantRow] = useState(null);
  // const [openPayment, setOpenPayment] = useState(false);
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [tenants, setTenants] = useState([]);
  const [filterName, setFilterName] = useState(''); // Changes the starting value of the thing in the search tenant field
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [rent, setRent] = useState('');
  // const [description, setDescription] = useState('');
  // const [time, setTime] = useState('');
  // const [dueDate, setDueDate] = useState('');
  const router = useRouter();
  const [ searchParams ] = useSearchParams();
  const token = searchParams.get("session");

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/get-tenants?manager-id=${managerID}`)
          .then((res) => res.json())
          .then((data) => {
            setTenants(data);
          });
      } catch (error) {
        console.log(`HeaderInfo API: ${error}`);
      }
    };
    fetchTenants();
  }, [managerID, tenants.length]);

  // const handleDueDateChange = (event) => {
  //     setDueDate(event.target.value);
  // };
  // const handleTypeChange = (event) => {
  //   setDescription(event.target.value);
  // };
  // const handlePaymentAmountChange = (event) => {
  //   setPaymentAmount(event.target.value);
  // };

  const openPopup = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  // const handleTimeChange = (event) => {
  //     setTime(event.target.value);
  // }
  // const handlePaymentSubmit = async () => {
  //   // Should call an API here
  //   await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/create-payment`, {
  //     method: 'POST',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       email: `${tenantRow.email}`,
  //       description: `${description}`,
  //       amount: `${paymentAmount}`,
  //     }),
  //   });
  //   setOpenPayment(false);
  // };
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const createTenant = async () => {
    await fetch(
      `${import.meta.env.VITE_MIDDLEWARE_URL}/manager/create-tenant?manager-id=${managerID}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: `${firstName}`,
          lastName: `${lastName}`,
          email: `${email}`,
          address: `${address}`,
          rent: `${rent}`,
        }),
      }
    );
    handleClose();
  };
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };
  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };
  const tableValues = (row) => {
    console.log('this is the row', row);
    const fullName = `${row.firstName} ${row.lastName}`;
    return (
      <TenantTableRow
        key={row.email}
        id={row.tenantID}
        email={row.email}
        name={fullName}
        address={row.address}
        rent={row.rent}
        onClick={() => handleRowClick(row)}
      />
    );
  };

  const handleRowClick = async (tenant) => {
    router.push(`${tenant.tenantID}?session=${token}`)
  };

  // const handlePaymentClose = () => {
  //   // setSelectedTenant('');
  //   // setDueDate('');
  //   setPaymentAmount('');
  //   setOpenPayment(false);
  // };
  const dataFiltered = applyFilter({
    inputData: tenants,
    comparator: getComparator(order, orderBy),
    filterName,
  });
  const tableLabels = [
    { id: 'email', label: 'Email' },
    { id: 'name', label: 'Name' },
    { id: 'address', label: 'Address' },
  ];

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Tenants</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={openPopup}
        >
          Create Tenant
        </Button>
      </Stack>
      {/* <Dialog open={openPayment} onClose={handlePaymentClose} sx={{ textAlign: 'center' }}>
        <DialogTitle id="alert-dialog-title">Fill Payment Details</DialogTitle>
        <Box sx={{ padding: '20px' }}>
          <TextField
            value={description}
            label="Description"
            onChange={handleTypeChange}
            sx={{ marginBottom: '10px' }}
          />
          <TextField
            value={paymentAmount}
            label="Payment Amount"
            onChange={handlePaymentAmountChange}
            sx={{ marginBottom: '10px' }}
          />
          <Button variant="contained" onClick={handlePaymentSubmit}>
            Create Payment
          </Button>
        </Box>
      </Dialog> */}
      <Dialog open={open} onClose={handleClose} sx={{ textAlign: 'center' }}>
        <Grid container justifyContent="center">
          <Grid>
            <Box sx={{ padding: '20px' }}>
              <Grid item xs={12}>
                <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center' }}>
                  New Tenant
                </DialogTitle>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  value={firstName}
                  label="First Name"
                  onChange={(e) => setFirstName(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  value={lastName}
                  label="Last Name"
                  onChange={(e) => setLastName(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  value={email}
                  label="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  value={address}
                  label="Address"
                  onChange={(e) => setAddress(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField value={rent} label="Rent" onChange={(e) => setRent(e.target.value)} />
              </Grid>
              <Grid item xs={12} sx={{ marginTop: '20px' }}>
                <Button component="label" variant="contained" onClick={createTenant}>
                  Submit
                </Button>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Dialog>

      <Card>
        <UserTableToolbar filterName={filterName} onFilterName={handleFilterByName} />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TenantTableHead
                order={order}
                orderBy={orderBy}
                rowCount={tenants.length}
                onTenantSort={handleSort}
                headLabel={tableLabels}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => tableValues(row))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, tenants.length)}
                />

                {filterName !== '' && dataFiltered.length === 0 && (
                  <TableNoData query={filterName} />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={tenants.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}

ListTenantView.propTypes = {
  managerID: PropTypes.string,
};
