import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import DialogActions from '@mui/material/DialogActions';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import { useState, useEffect } from 'react';

import { useRouter, usePathname } from 'src/routes/hooks';

import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import PaymentTableRow from '../table-components/table-row';
import PaymentTableHead from '../table-components/table-head';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows } from '../hooks/utils';

import {
  getName,
  getLedger,
  makePayment,
  createCharge,
  createCredit,
} from '../hooks/payment-history-specifics';

// ----------------------------------------------------------------------

export default function PaymentsHistoryView() {
  const router = useRouter();
  const pathname = usePathname();
  const access = pathname.split('/')[2];
  const uuid = pathname.split('/')[3];
  const tenantID = access === 'tenant' ? pathname.split('/')[3] : pathname.split('/')[5];

  const [payments, setPayments] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  const [reload, setReload] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        await getLedger(tenantID).then((data) => {
          setPayments(data);
        });
      } catch (error) {
        console.log(`getLedger API: ${error}`);
      }
    };
    const fetchName = async () => {
      try {
        await getName(tenantID).then((data) => {
          setFirstName(data.firstName);
          setLastName(data.lastName);
        });
      } catch (error) {
        console.log(`getName API: ${error}`);
      }
    };

    fetchName();

    if (reload) {
      fetchPayments();
      setReload(false);
    }
  }, [tenantID, reload]);

  const handleGoBack = (event) => {
    router.back();
  };

  // Table Specifics
  const handleDeleteRow = () => {
    setReload(true);
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const tableLabels = [
    { id: 'description', label: 'Memo' },
    { id: 'time', label: 'Date' },
    { id: 'amount', label: 'Amount' },
    { id: 'balance', label: 'Balance' },
    { id: 'trash', label: '' },
  ];

  const tableValues = (row) => {
    <PaymentTableRow
      id={row.id}
      key={row.paymentsID}
      tenantID={uuid}
      type={row.type}
      time={row.date}
      amount={row.amount}
      balance={row.balance}
      description={row.description}
      access={access}
      deleteRow={handleDeleteRow}
    />;
  };

  // General Dialog Popup Vars
  const [paymentPopup, setPaymentPopup] = useState(false);
  const [chargePopup, setChargePopup] = useState(false);
  const [creditPopup, setCreditPopup] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  // Payment Dialog Popup
  const handleOpenPaymentPopup = () => {
    setPaymentPopup(true);
  };

  const handleClosePaymentPopup = () => {
    setPaymentPopup(false);
    setAmount('');
    setDescription('');
  };

  const handleSubmitPayment = async () => {
    await makePayment(tenantID, amount, description).then((data) => {
      if (data.ok) {
        handleClosePaymentPopup();
      }
    });
    setReload(true);
  };

  const paymentDialog = (
    <Dialog
      open={paymentPopup}
      onClose={handleClosePaymentPopup}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center' }}>
        Balance
      </DialogTitle>
      <Box sx={{ padding: '20px' }}>
        <Box sx={{ display: 'flex', gap: 0, width: '100%' }}>
          <TextField
            value={amount}
            label="Amount"
            variant="outlined"
            multiline
            onChange={(e) => {
              setAmount(e.target.value);
            }}
            sx={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          />
          <FormControl
            sx={{ flex: 1, marginLeft: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            <InputLabel id="demo-select-small-label">Categories</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={description}
              label="Categories"
              onChange={handleDescriptionChange}
              SelectProps={{ MenuProps: { sx: { maxHeight: 150 } } }}
            >
              <MenuItem value="Rent">Rent</MenuItem>
              <MenuItem value="Utilities">Utilities</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
          <Button onClick={handleSubmitPayment} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );

  // Charge Dialog Popup
  const handleOpenChargePopup = () => {
    setChargePopup(true);
  };

  const handleCloseChargePopup = () => {
    setAmount('');
    setDescription('');
    setChargePopup(false);
  };

  const handleSubmitCharge = async () => {
    await createCharge(tenantID, amount, description).then((data) => {
      if (data.ok) {
        handleCloseChargePopup();
      }
    });
    setReload(true);
  };

  const chargeDialog = (
    <Dialog open={chargePopup} onClose={handleCloseChargePopup} sx={{ textAlign: 'center' }}>
      <DialogTitle id="alert-dialog-title">Fill Charge Details</DialogTitle>
      <Box sx={{ padding: '20px' }}>
        <Grid container spacing={0} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <TextField
              value={amount}
              label="Payment Amount"
              onChange={handleAmountChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl sx={{ minWidth: 150 }} size="medium" fullWidth>
              <InputLabel id="demo-select-small-label">Categories</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={description}
                label="Description"
                onChange={handleDescriptionChange}
                SelectProps={{ MenuProps: { sx: { maxHeight: 150 } } }}
              >
                <MenuItem value="Rent">Rent</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleSubmitCharge} sx={{ mt: 2 }}>
          Create Charge
        </Button>
      </Box>
    </Dialog>
  );

  // Credit Dialog Popup
  const handleOpenCreditPopup = () => {
    setCreditPopup(true);
  };

  const handleCloseCreditPopup = () => {
    setAmount('');
    setDescription('');
    setCreditPopup(false);
  };

  const handleSubmitCredit = async () => {
    await createCredit(tenantID, amount, description).then((data) => {
      if (data.ok) {
        handleCloseCreditPopup();
      }
    });
    setReload(true);
  };

  const creditDialog = (
    <Dialog open={creditPopup} onClose={handleCloseCreditPopup} sx={{ textAlign: 'center' }}>
      <DialogTitle id="alert-dialog-title">Fill Credit Details</DialogTitle>
      <Box sx={{ padding: '20px' }}>
        <TextField
          value={amount}
          label="Credit Amount"
          onChange={handleAmountChange}
          sx={{ marginBottom: '10px' }}
        />
        <TextField
          value={description}
          label="Description"
          onChange={handleDescriptionChange}
          sx={{ marginBottom: '10px' }}
        />
        <Button variant="contained" onClick={handleSubmitCredit}>
          Create Credit
        </Button>
      </Box>
    </Dialog>
  );

  return (
    <Container>
      {access === 'manager' ? (
        <Typography variant="h4" gutterBottom mb={5}>
          {`${firstName} ${lastName}`}
        </Typography>
      ) : (
        <div />
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        {access === 'tenant' ? (
          <>
            <Typography variant="h4">Payments</Typography>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleOpenPaymentPopup}
            >
              Make Payment
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleGoBack}
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="eva:corner-down-left-fill" />}
            >
              Back
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={handleOpenCreditPopup}
                sx={{ marginRight: 1 }}
              >
                Credit Tenant
              </Button>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={handleOpenChargePopup}
              >
                Charge Tenant
              </Button>
            </Box>
          </>
        )}
      </Stack>
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
                {payments
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
      {paymentDialog}
      {chargeDialog}
      {creditDialog}
    </Container>
  );
}
