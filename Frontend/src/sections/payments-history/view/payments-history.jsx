import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
// import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { useState, useEffect } from 'react';
import Scrollbar from 'src/components/scrollbar';
import PaymentTableRow from '../table-components/table-row';
import PaymentTableHead from '../table-components/table-head';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';

export default function PaymentsHistoryView({ tenantID }) {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('');
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');
    const [filterName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                // type, time, amount, balance, description
                // fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/get-payment-history?tenant-id=${tenantID}`)
                fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/get-ledger?tenant-id=${tenantID}`)
                    .then((res) => res.json())
                    .then((data) => {
                        setPayments(data);
                    });
            } catch (error) {
                console.log(`HeaderInfo API: ${error}`);
            }
        };
        fetchPayments();
    }, [tenantID]);
    // *** May warrant deletion *** //
    const handleClose = () => {
        setOpen(false);
    };
    const dataFiltered = applyFilter({
        inputData: payments,
        comparator: getComparator(order, orderBy),
        filterName,
    });
    const tableValues = (row) => {
        const temp = <PaymentTableRow key={row.paymentsID} tenantID={tenantID} type={row.type} time={row.time} amount={row.amount} balance={row.balance} description={row.description} />
        return (
            temp
        );
    };
    const handleChangeRowsPerPage = (event) => {
        setPage(0);
        setRowsPerPage(parseInt(event.target.value, 10));
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const tableLabels = [
        // { id: 'type', label: '' },
        { id: 'description', label: 'Memo' }, // Including charge/payment and description
        { id: 'time', label: 'Date' },
        { id: 'amount', label: 'Amount' },
        { id: 'balance', label: 'Balance' },
        // Charge or Payment
    ];
    const handleSort = (event, id) => {
        const isAsc = orderBy === id && order === 'asc';
        if (id !== '') {
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(id);
        }
    };
    return (
        <Container>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Payments</Typography>
            </Stack>
            <Dialog open={open} onClose={handleClose} sx={{ textAlign: 'center' }}>
                <div>
                    <Typography variant="h4">Payments</Typography>
                </div>
                <Grid container justifyContent="center">
                    <Grid>
                        <Box sx={{ padding: '20px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        value={type}
                                        label="Type"
                                        onChange={(e) => setType(e.target.value)}
                                        sx={{ marginBottom: '10px' }}
                                    />
                                    <TextField
                                        value={description}
                                        label="Description"
                                        onChange={(e) => setDescription(e.target.value)}
                                        sx={{ marginBottom: '10px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                        label="Date"
                                        onChange={(e) => setTime(e.target.value)}
                                        sx={{ marginBottom: '10px' }}
                                    />
                                </Grid>
                                {/* Add in box to display description underneath the code type */}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Dialog>
            <Card>
                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <PaymentTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={payments.length}
                                onPaymentSort={handleSort}
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
PaymentsHistoryView.propTypes = {
    // paymentID: PropTypes.string,
    tenantID: PropTypes.string,
};
