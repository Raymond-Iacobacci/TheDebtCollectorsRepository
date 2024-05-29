import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Input from '@mui/material/Input';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { usePathname } from 'src/routes/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-components/table-no-data';
import ExpenseTableRow from '../table-components/table-row';
import ExpenseTableHead from '../table-components/table-head';
import UserTableToolbar from '../table-components/table-toolbar';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';
import { addExpense, getRequests, getExpenses } from '../hooks/expense-specifics';

// ----------------------------------------------------------------------

export default function ExpensesView() {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [errorMsg, setError] = useState('');

  const [requestPopup, setRequestPopup] = useState(false);

  const [reload, setReload] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getExpenses(uuid).then((data) => {
          console.log(data);
          setExpenses(data);
        });
        await getRequests(uuid).then((data) => {
          setRequests(data);
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`Expenses API: ${error}`);
      }
    };
    if( reload ) {
      fetchData();
      setReload(false);
    }
  }, [uuid, reload]);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: expenses,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  // Dialog popup
  const [expenseType, setExpenseType] = useState('');
  const [description, setExpenseDescription] = useState('');
  const [amount, setExpenseAmount] = useState('');
  const [expenseRequest, setExpenseRequest] = useState(null);
  // const [expenseRequestLabel, setExpenseRequestLabel] = useState('');

  const handleOpenRequestPopup = () => {
    setRequestPopup(true);
  };

  const handleCloseRequestPopup = () => {
    setRequestPopup(false);
  };

  const handleChange = (event) => {
    setExpenseType(event.target.value);
  };

  const handleExpenseRequestChange = (event) => {
    console.log(event.target.value)
    setExpenseRequest(event.target.value);
  }

  const handleSubmitRequest = async () => {
    if (expenseType !== 'Maintenance Request') setExpenseRequest(null);
    await addExpense(uuid, amount, expenseType, expenseRequest, description).then((data) => {
      if (data.ok) {
        console.log('Data posted successfully');
        setExpenseDescription('');
        setExpenseType('');
        setExpenseAmount('');
        setExpenseRequest(null);
        setRequestPopup(false);
        setReload(true);
      } else {  
        console.log('Error posting data to backend');
      }
    });
    handleCloseRequestPopup();
  };

  const handleDeleteRow = () => {
    setReload(true);
  }

  const tableLabels = [
    { id: 'type', label: 'Type' },
    { id: 'amount', label: 'Amount' },
    { id: 'description', label: 'Description' },
    { id: 'date', label: 'Date' },
  ];

  const tableValues = (row) => (
    <ExpenseTableRow
      key={row.expenseID}
      id={row.expenseID}
      type={row.type}
      amount={row.amount}
      description={row.description}
      date={row.date}
      request={row.requestID}
      deleteRow={handleDeleteRow}
    />
  );

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Expenses</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenRequestPopup}
        >
          New Expense
        </Button>
      </Stack>

      <Card>
        <UserTableToolbar filterName={filterName} onFilterName={handleFilterByName} />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <ExpenseTableHead
                order={order}
                orderBy={orderBy}
                rowCount={expenses.length}
                onRequestSort={handleSort}
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
                    emptyRows={emptyRows(page, rowsPerPage, expenses.length)}
                  />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={expenses.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Dialog
        open={requestPopup}
        onClose={handleCloseRequestPopup}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle id="alert-dialog-title">Add Expense</DialogTitle>
        <Grid container>
          <Grid>
            <FormControl sx={{ m: 1, minWidth: 150 }} size="medium">
              <InputLabel id="demo-select-small-label">Expense Type</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={expenseType}
                label="Expense Type"
                onChange={handleChange}
                SelectProps={{ MenuProps: { sx: { maxHeight: 150 } } }}
              >
                <MenuItem value="Maintenance Request">Maintenance Request</MenuItem>
                <MenuItem value="Wages">Wages</MenuItem>
                <MenuItem value="Mortgage Interest">Mortgage Interest</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1 }}>
              <InputLabel>Amount</InputLabel>
              <Input
                onChange={(e) => {
                  setExpenseAmount(e.target.value);
                }}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
              />
            </FormControl>

            {expenseType === 'Maintenance Request' ? (
              <FormControl sx={{ m: 1, minWidth: 150 }} size="medium">
                <InputLabel id="demo-select-small-label">Request</InputLabel>
                <Select
                  labelId="demo-select-small-label"
                  id="demo-select-small"
                  value={expenseRequest}
                  label="Expense Type"
                  onChange={handleExpenseRequestChange}
                  SelectProps={{ MenuProps: { sx: { maxHeight: 150 } } }}
                >
                  {requests.map((req) => (
                    <MenuItem value={req.requestID}>{`${req.type} for ${req.name}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <div />
            )}
          </Grid>
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
                value={description}
                id="outlined-basic"
                label="Description"
                variant="outlined"
                multiline
                onChange={(e) => {
                  setExpenseDescription(e.target.value);
                }}
              />
            </Box>
          </Grid>
          <Grid>
            <DialogActions>
              <Button onClick={handleSubmitRequest} autoFocus>
                Submit
              </Button>
            </DialogActions>
          </Grid>
        </Grid>
      </Dialog>
    </Container>
  );
}
