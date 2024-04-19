import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
// import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
// import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { useState, useEffect } from 'react';
import Scrollbar from 'src/components/scrollbar';

// import Iconify from 'src/components/iconify';

import TableNoData from '../table-components/table-no-data';
import PaymentTableRow from '../table-components/table-row';
import PaymentTableHead from '../table-components/table-head';
import TableEmptyRows from '../table-components/table-empty-rows';
import UserTableToolbar from '../table-components/table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';

export default function AllPaymentsView({ managerID }) {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('');
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');
    const [tenantID] = useState('');
    // const [tenants] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [filterName, setFilterName] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                fetch(
                    `${import.meta.env.VITE_MIDDLEWARE_URL}/manager/get-tenant-payments?manager-id=${managerID}`
                )
                    .then((res) => res.json())
                    .then((data) => {
                        setPayments(data);
                    });
            } catch (error) {
                console.log(`HeaderInfo API: ${error}`);
            }
        };
        fetchPayments();
    }, [managerID]);
    const handleFilterByName = (event) => {
        setPage(0);
        setFilterName(event.target.value);
    };
    // TODO: address
    const tableValues = (row) => {
        const temp = (
            <PaymentTableRow
                key={row.paymentsID}
                id={`${row.firstName} ${row.lastName}`}
                tenantID={row.tenantID}
                paymentsID={row.paymentsID}
                type={row.type}
                time={row.time}
                amount={row.amount}
                name={`${row.firstName} ${row.lastName}`}
            />
        );
        console.log(`This is the temp:`);
        console.log(temp);
        // setPayments(temp[0]);
        return temp;
    };
    const handleChangeRowsPerPage = (event) => {
        setPage(0);
        setRowsPerPage(parseInt(event.target.value, 10));
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const tableLabels = [
        { id: 'tenant', label: 'Tenant Name' },
        { id: 'type', label: 'Task Name' },
        { id: 'time', label: 'Due Date' },
        { id: 'amount', label: 'Amount Due' },
        { id: 'action', label: '' },
    ];
    const createPayment = async () => {
        await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/create-payment`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tenantID: `${tenantID}`,
                type: `${type}`,
                amount: `${amount}`,
            }),
        });
        handleClose();
    };
    // const openPopup = () => {
    //     setOpen(true);
    // };
    const handleSort = (event, id) => {
        const isAsc = orderBy === id && order === 'asc';
        if (id !== '') {
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(id);
        }
    };
    const handleClose = () => {
        setOpen(false);
    };

    const dataFiltered = applyFilter({
        inputData: payments,
        comparator: getComparator(order, orderBy),
        filterName,
    });

    return (
        <Container>
            {/* <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Tenants</Typography>
                <Button
                    variant="contained"
                    color="inherit"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={openPopup}
                >
                    Create Payment
                </Button>
            </Stack> */}
            <Dialog open={open} onClose={handleClose} sx={{ textAlign: 'center' }}>
                <div>
                    <Typography variant="h4">Payments</Typography>
                </div>
                <Grid container justifyContent="center">
                    <Grid>
                        <Box sx={{ padding: '20px' }}>
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
                                    value={type}
                                    label="Task"
                                    onChange={(e) => setType(e.target.value)}
                                    sx={{ marginBottom: '10px' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    value={amount}
                                    label="Cost"
                                    onChange={(e) => setAmount(e.target.value)}
                                    sx={{ marginBottom: '10px' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    value={time}
                                    label="Payment Deadline"
                                    onChange={(e) => setTime(e.target.value)}
                                    sx={{ marginBottom: '10px' }}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ marginTop: '20px' }}>
                                <Button component="label" variant="contained" onClick={createPayment}>
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
                            <PaymentTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={payments.length}
                                onTenantSort={handleSort}
                                headLabel={tableLabels}
                            />
                            <TableBody>
                                {dataFiltered
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => tableValues(row))}

                                <TableEmptyRows
                                    height={77}
                                    emptyRows={emptyRows(page, rowsPerPage, payments.length)}
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
                    count={payments.length}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
        </Container>
    );
}

AllPaymentsView.propTypes = {
    managerID: PropTypes.string,
};
