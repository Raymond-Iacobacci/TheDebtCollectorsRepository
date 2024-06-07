import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { usePathname } from 'src/routes/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-components/table-no-data';
import RequestTableRow from '../table-components/table-row';
import RequestTableHead from '../table-components/table-head';
import RequestTableToolbar from '../table-components/table-toolbar';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';
import { getTenantRequests, getManagerRequests } from '../hooks/request-specifics';

// ----------------------------------------------------------------------

export default function RequestsView() {
  const pathname = usePathname();
  const access = pathname.split('/')[2];
  const uuid = pathname.split('/')[3];

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState('');

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [reload, setReload] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (access === 'manager') {
          await getManagerRequests(uuid).then((data) => {
            setRequests(data);
          });
        } else {
          await getTenantRequests(uuid).then((data) => {
            setRequests(data);
          });
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
      }
    };

    if (reload) {
      fetchData();
      setReload(false);
    }
  }, [access, uuid, reload]);

  // Table Specifics
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
    inputData: requests,
    comparator: getComparator(order, orderBy),
    filterName,
    role: access,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const tableLabels =
    access === 'manager'
      ? [
          { id: 'name', label: 'Name' },
          { id: 'address', label: 'Address' },
          { id: 'type', label: 'Type' },
          { id: 'date', label: 'Date' },
          { id: 'status', label: 'Status' },
        ]
      : [
          { id: 'type', label: 'Type' },
          { id: 'description', label: 'Description' },
          { id: 'date', label: 'Date' },
          { id: 'status', label: 'Status' },
        ];

  const tableValues = (row) => {
    if (access === 'manager') {
      return (
        <RequestTableRow
          key={row.requestID}
          id={row.requestID}
          name={row.name}
          address={row.address}
          date={row.date}
          type={row.type}
          status={row.status}
          access={access}
          deleteRow={handleDeleteRow}
        />
      );
    }
    return (
      <RequestTableRow
        key={row.requestID}
        id={row.requestID}
        type={row.type}
        description={row.description}
        date={row.date}
        status={row.status}
        access={access}
        deleteRow={handleDeleteRow}
      />
    );
  };

  const handleDeleteRow = () => {
    setReload(true);
  };

  // Dialog popup
  const [requestPopup, setRequestPopup] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleOpenRequestPopup = () => {
    setRequestPopup(true);
  };

  const handleCloseRequestPopup = () => {
    setRequestPopup(false);
    setDescription('');
    setRequestType('');
    setSelectedImage(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTypeChange = (event) => {
    setRequestType(event.target.value);
  };

  const handleSubmitRequest = async () => {
    const formData = new FormData();
    formData.append('attachment', imageFile);
    formData.append('type', requestType);
    formData.append('description', description);
    await fetch(
      `${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/requests/new-request?tenant-id=${uuid}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    handleCloseRequestPopup();
    setReload(true);
  };

  const newRequestDialog = (
    <Dialog
      open={requestPopup}
      onClose={handleCloseRequestPopup}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle id="alert-dialog-title">Maintenance request</DialogTitle>
      <Grid container>
        <Stack direction="row" sx={{ width: '100%' }}>
          <Box
            component="form"
            sx={{ paddingRight: '15px', '& > :not(style)': { m: 1 } }}
            noValidate
            autoComplete="off"
          >
            <TextField
              value={requestType}
              id="outlined-basic"
              label="Type"
              variant="outlined"
              onChange={handleTypeChange}
            />
          </Box>
          <Box
            component="form"
            sx={{
              width: '50%',
              '& > :not(style)': { m: 1 },
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
              sx={{width: '100%'}}
            />
          </Box>
        </Stack>
        <Grid>
          <DialogActions>
            <Grid>
              {selectedImage ? (
                <Stack alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h4">Selected Image</Typography>
                  <img
                    src={selectedImage}
                    alt="Uploaded"
                    style={{
                      maxWidth: '50%',
                      maxHeight: '50%',
                      display: 'block',
                      margin: 'auto',
                    }}
                  />
                </Stack>
              ) : (
                <div />
              )}
            </Grid>
            <Grid>
              <Button component="label">
                Upload image
                <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              </Button>
            </Grid>

            <Button component="label" variant="contained" onClick={handleSubmitRequest} autoFocus>
              Submit
            </Button>
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  );

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Requests</Typography>
        {access !== 'tenant' ? (
          <div />
        ) : (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenRequestPopup}
          >
            New Request
          </Button>
        )}
      </Stack>

      <Card>
        <RequestTableToolbar filterName={filterName} onFilterName={handleFilterByName} />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <RequestTableHead
                order={order}
                orderBy={orderBy}
                rowCount={requests.length}
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
                    emptyRows={emptyRows(page, rowsPerPage, requests.length)}
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
          count={requests.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {newRequestDialog}
    </Container>
  );
}
