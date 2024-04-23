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

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/get-payment-history?tenant-id=${tenantID}`)
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
        console.log('this is the payment ID', row.paymentsID);
        const temp = <PaymentTableRow key={row.paymentsID} tenantID={tenantID} paymentsID={row.paymentsID} type={row.type} time={row.time} amount={row.amount} />
        console.log(`This is the temp:`);
        console.log(temp);
        // setPayments(temp[0]);
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
        { id: 'type', label: 'Task Name' },
        { id: 'time', label: 'Date Paid' },
        { id: 'amount', label: 'Amount Paid' },
        { id: 'action', label: '' },
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
                            <Grid item xs={12}>
                                <TextField
                                    value={type}
                                    label="Job"
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
