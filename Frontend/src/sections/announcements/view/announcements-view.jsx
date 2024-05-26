import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
// import Input from '@mui/material/Input';
import Dialog from '@mui/material/Dialog';
// import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
// import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
// import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
// import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
// import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { usePathname } from 'src/routes/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-components/table-no-data';
import ExpenseTableRow from '../table-components/table-row';
import ExpenseTableHead from '../table-components/table-head';
// import UserTableToolbar from '../table-components/table-toolbar';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';
import { addAnnouncement, getAnnouncements } from '../hooks/announcement-specifics';

// ----------------------------------------------------------------------

export default function AnnouncementsView() {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];
  const access = pathname.split('/')[2];

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [errorMsg, setError] = useState('');

  const [requestPopup, setRequestPopup] = useState(false);

  const [reload, setReload] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getAnnouncements(uuid, access).then((data) => {
          console.log(data);
          setAnnouncements(data);
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`Announcements API: ${error}`);
      }
    };
    if (reload) {
      fetchData();
      setReload(false);
    }
  }, [uuid, reload, access]);

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

  // const handleFilterByName = (event) => {
  //   setPage(0);
  //   setFilterName(event.target.value);
  // };

  const dataFiltered = applyFilter({
    inputData: announcements,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  // Dialog popup
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  const handleOpenRequestPopup = () => {
    setRequestPopup(true);
  };

  const handleCloseRequestPopup = () => {
    setRequestPopup(false);
  };

  const handleSubmitRequest = async () => {
    await addAnnouncement(uuid, title, description).then((data) => {
      if (data.ok) {
        console.log('Data posted successfully');
        setDescription('');
        setTitle('');
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
  };

  const tableLabels = [
    { id: 'title', label: 'Title' },
    { id: 'description', label: 'Description' },
    { id: 'date', label: 'Date' },
  ];

  const tableValues = (row) => (
    <ExpenseTableRow
      key={row.expenseID}
      id={row.expenseID}
      title={row.title}
      description={row.description}
      date={row.date}
      request={row.requestID}
      deleteRow={handleDeleteRow}
    />
  );

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Announcements</Typography>
        {access !== 'manager' ? (
          <div />
        ) : (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenRequestPopup}
          >
            New Announcement
          </Button>
        )}
      </Stack>

      <Card>
        {/* <UserTableToolbar filterName={filterName} onFilterName={handleFilterByName} /> */}

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <ExpenseTableHead
                order={order}
                orderBy={orderBy}
                rowCount={announcements.length}
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
                    emptyRows={emptyRows(page, rowsPerPage, announcements.length)}
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
          count={announcements.length}
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
        <DialogTitle id="alert-dialog-title">Make Announcement</DialogTitle>
        <Grid container>
          <Grid>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '30ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                value={title}
                id="outlined-basic"
                label="Title"
                variant="outlined"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </Box>
          </Grid>
          <Grid>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '75ch' },
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
                  setDescription(e.target.value);
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
