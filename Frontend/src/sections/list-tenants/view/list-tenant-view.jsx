import { useState, useEffect } from 'react';

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import DialogTitle from '@mui/material/DialogTitle';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-components/table-no-data';
import UserTableRow from '../table-components/table-row';
import TenantTableHead from '../table-components/table-head';
import UserTableToolbar from '../table-components/table-toolbar';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';

export default function ListTenantView({ managerID }) {
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
    
    useEffect(() => {
        console.log("this is the manager ID:", managerID);
        const fetchTenants = async () => {
            try {
                fetch(
                    `${import.meta.env.VITE_MIDDLEWARE_URL}/manager/get-tenants?manager-id=${managerID}`
                )
                    .then((res) => res.json())
                    .then((data) => {
                        console.log("THIS S DATA", data);
                        setTenants(data);
                    });
            } catch (error) {
                console.log(`HeaderInfo API: ${error}`);
            }
        }
        fetchTenants();
    }, [managerID]);

        const openPopup = () => {
            setOpen(true);
        };
        const handleClose = () => {
            setOpen(false);
        };
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
            console.log("this is the row", row);
            return <UserTableRow
                key={row.email}
                id={row.firstName + row.lastName}
                email={row.email}
                name={row.firstName + row.lastName}
                address={row.address}
            />;
        };
        const dataFiltered = applyFilter({
            inputData: tenants,
            comparator: getComparator(order, orderBy),
            filterName,
        });
        const tableLabels = [
            { id: 'email', label: 'Email' },
            { id: "name", label: "Name" },
            { id: 'address', label: 'Address' },
        ];

        return (
            <Container>
                <Button component="label" variant="contained" onClick={openPopup}>
                    Create Tenant
                </Button>
                <Dialog open={open} onClose={handleClose} sx={{ textAlign: 'center' }}>
                    <Grid container justifyContent="center">
                        <Grid>
                            <Box sx={{ padding: '20px' }}>
                                <Grid item xs={12}>
                                    <DialogTitle
                                        id="alert-dialog-title"
                                        sx={{ textAlign: 'center' }}
                                    >
                                        New Tenant
                                    </DialogTitle>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        value={firstName}
                                        label="First Name"
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        value={lastName}
                                        label="Last Name"
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField value={email} label="Email" onChange={(e) => setEmail(e.target.value)} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        value={address}
                                        label="Address"
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
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
                <Box sx={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5' }}>
                    <h2>Current Tenants</h2>
                </Box>

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
                                <TableBody >
                                    {dataFiltered
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => tableValues(row))}

                                    <TableEmptyRows
                                        height={77}
                                        emptyRows={emptyRows(page, rowsPerPage, tenants.length)}
                                    />

                                    {filterName !== '' && <TableNoData query={filterName} />}
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
