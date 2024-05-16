import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import DialogActions from '@mui/material/DialogActions';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import DialogTitle from '@mui/material/DialogTitle';
import { useState, useEffect } from 'react';

import { useRouter, usePathname } from 'src/routes/hooks';

import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import PaymentTableRow from '../table-components/table-row';
import PaymentTableHead from '../table-components/table-head';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';

export default function PaymentsHistoryView({ access }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];
  const tenantID = (access === 'tenant')?pathname.split('/')[3]:pathname.split('/')[5];
  const [amount, setAmount] = useState('');
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [filterName] = useState('');
  const [description, setDescription] = useState(''); // TODO: potentially add in creditDescription

  const [paymentAmount, setPaymentAmount] = useState('');
  const [openPayment, setOpenPayment] = useState(false);

  const [creditAmount, setCreditAmount] = useState('');
  const [openCredit, setOpenCredit] = useState(false);

  const [reload, setReload] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // type, time, amount, balance, description
        fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/get-ledger?tenant-id=${tenantID}`)
          .then((res) => res.json())
          .then((data) => {
            setPayments(data);
          });
      } catch (error) {
        console.log(`HeaderInfo API: ${error}`);
      }
    };
    if (reload) {
      fetchPayments();
      setReload(false);
    }
  }, [tenantID, reload]);

  const handleClose = () => {
    setOpen(false);
    setAmount('');
    setDescription('');
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const dataFiltered = applyFilter({
    inputData: payments,
    comparator: getComparator(order, orderBy),
    filterName,
  });
  const tableValues = (row) => {
    const temp = (
      <PaymentTableRow
        key={row.paymentsID}
        tenantID={uuid}
        type={row.type}
        time={row.time}
        amount={row.amount}
        balance={row.balance}
        description={row.description}
      />
    );
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
  // todo: change API
  const handleSubmit = async () => {
    await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/make-payment?tenant-id=${uuid}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: `${amount}`,
        description: `${description}`,
      }),
    }).then((data) => {
      if (data.ok) {
        setAmount('');
        setDescription('');
      } else {
        console.log('Error posting data to backend');
      }
    });
    handleClose();
    setReload(true);
  };
  // TODO: access control via tenant-manager split

  const router = useRouter();
  const handleGoBack = (event) => {
    router.back();
  };

  const handlePaymentAmountChange = (event) => {
    setPaymentAmount(event.target.value);
  };

  const handleCreditAmountChange = (event) => {
    setCreditAmount(event.target.value);
  }

  const handleTypeChange = (event) => {
    setDescription(event.target.value);
  };

  const handlePaymentClose = () => {
    setPaymentAmount('');
    setDescription('');
    setOpenPayment(false);
  };

  const handlePaymentOpen = () => {
    setOpenPayment(true);
  }

  const handleCreditClose = () => {
    setCreditAmount('');
    setDescription('');
    setOpenCredit(false);
  }

  const handleCreditOpen = () => {
    setOpenCredit(true);
  }

  const handlePaymentSubmit = async () => {
    await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/create-payment`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantID: `${tenantID}`,
        description: `${description}`,
        amount: `${paymentAmount}`,
      }),
    });
    setPaymentAmount('');
    setOpenPayment(false);
    setDescription('');
    setReload(true);
  };

  const handleCreditSubmit = async () => {

    await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/create-credit`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantID: `${tenantID}`,
        description: `${description}`,
        amount: `${ creditAmount}`,
      }),
    });
    setCreditAmount('');
    setOpenCredit(false);
    setDescription('');
    setReload(true);
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        {access === 'tenant' ? (
          <>
            <Typography variant="h4">Payments</Typography>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleOpen}
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
                onClick={handleCreditOpen}
                sx={{ marginRight: 1 }} // Added marginRight to create space
              >
                Credit Tenant
              </Button>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={handlePaymentOpen}
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

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center' }}>
          Balance
        </DialogTitle>
        <Grid container sx={{ textAlign: 'center' }}>
          <Grid>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '100ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                value={amount}
                id="outlined-basic"
                label="$$"
                variant="outlined"
                multiline
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                sx={{ maxWidth: 500 }}
              />
              <TextField
                value={description}
                id="outlined-basic"
                label="Description"
                variant="outlined"
                multiline
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                sx={{ maxWidth: 500 }}
              />
            </Box>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button onClick={handleSubmit} autoFocus>
                Submit
              </Button>
            </DialogActions>
          </Grid>
        </Grid>
      </Dialog>

      <Dialog open={openCredit} onClose={handleCreditClose} sx={{ textAlign: 'center' }}>
        <DialogTitle id="alert-dialog-title">Fill Credit Details</DialogTitle>
        <Box sx={{ padding: '20px' }}>
          <TextField
            value={description}
            label="Description"
            onChange={handleTypeChange}
            sx={{ marginBottom: '10px' }}
          />
          <TextField
            value={creditAmount}
            label="Credit Amount"
            onChange={handleCreditAmountChange}
            sx={{ marginBottom: '10px' }}
          />
          <Button variant="contained" onClick={handleCreditSubmit}>
            Create Credit
          </Button>
        </Box>
      </Dialog>


      <Dialog open={openPayment} onClose={handlePaymentClose} sx={{ textAlign: 'center' }}>
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
          {/* <TextField
                        value={time}
                        label="MM-DD-YYYY"
                        onChange={handleTimeChange}
                        sx={{ marginBottom: '10px' }}
                    /> */}
          <Button variant="contained" onClick={handlePaymentSubmit}>
            Create Payment
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
}

PaymentsHistoryView.propTypes = {
  access: PropTypes.string,
};
