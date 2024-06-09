import { useState, useEffect } from 'react';

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
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { usePathname } from 'src/routes/hooks';

import TenantTableRow from '../table-components/table-row';
import TableNoData from '../table-components/table-no-data';
import TenantTableHead from '../table-components/table-head';
import TenantTableToolbar from '../table-components/table-toolbar';
import TableEmptyRows from '../table-components/table-empty-rows';

import { emptyRows, applyFilter, getComparator } from '../hooks/utils';
import { createTenant, getListTenants } from '../hooks/list-tenants-specifics';

// ----------------------------------------------------------------------

export default function ListTenantView() {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];

  const [tenants, setTenants] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('email');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState('');
  const [popup, setPopup] = useState(false);

  const [reload, setReload] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        await getListTenants(uuid).then((data) => {
          setTenants(data);
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
      }
    };
    if (reload) {
      fetchTenants();
      setReload(false);
    }
  }, [uuid, reload]);

  // Table Display
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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

  const dataFiltered = applyFilter({
    inputData: tenants,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const tableValues = (row) => {
    const fullName = `${row.firstName} ${row.lastName}`;
    return (
      <TenantTableRow
        key={row.email}
        id={row.tenantID}
        email={row.email}
        name={fullName}
        address={row.address}
        rent={row.rent}
      />
    );
  };

  const tableLabels = [
    { id: 'email', label: 'Email' },
    { id: 'name', label: 'Name' },
    { id: 'address', label: 'Address' },
  ];

  // Dialog Popup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [rent, setRent] = useState('');

  const handleOpenPopup = () => {
    setPopup(true);
  };

  const handleClosePopup = () => {
    setPopup(false);
  };

  const createNewTenant = async () => {
    await createTenant(uuid, firstName, lastName, email, address, rent).then((data) => {
      if (data.ok) {
        setFirstName('');
        setLastName('');
        setEmail('');
        setAddress('');
        setRent('');
        setReload(true);
      }
    });
    setPopup(false);
  };

  const newTenantDialog = (
    <Dialog open={popup} onClose={handleClosePopup} sx={{ textAlign: 'center' }}>
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
              <Button component="label" variant="contained" onClick={createNewTenant}>
                Submit
              </Button>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Dialog>
  );

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Tenants</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenPopup}
        >
          Create Tenant
        </Button>
      </Stack>

      {newTenantDialog}

      <Card>
        <TenantTableToolbar filterName={filterName} onFilterName={handleFilterByName} />

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
              {loading ? (
                <Stack direction="column" alignItems="center" spacing={3} sx={{ p: 3 }}>
                  {errorMsg ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={3}
                      sx={{ p: 0, pr: 3 }}
                    >
                      <Label color="error">{errorMsg}</Label>
                    </Stack>
                  ) : (
                    <CircularProgress color="primary" />
                  )}
                </Stack>
              ) : (
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
              )}
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
