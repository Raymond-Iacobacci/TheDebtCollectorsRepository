import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
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
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

// import { requests } from 'src/_mock/request';

import { usePathname } from 'src/routes/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-components/table-no-data';
import RequestTableRow from '../table-components/table-row';
import RequestTableHead from '../table-components/table-head';
import UserTableToolbar from '../table-components/table-toolbar';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';
import { getTenantRequests, getManagerRequests } from '../hooks/request-specifics';

// ----------------------------------------------------------------------

export default function RequestsView({ access }) {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [errorMsg, setError] = useState('');

  const [requestPopup, setRequestPopup] = useState(false);

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
            console.log(data);
          });
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`HeaderInfo API: ${error}`);
      }
    };
    fetchData();
    
  }, [access, uuid]);

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
  });

  const notFound = !dataFiltered.length && !!filterName;

  // Dialog popup
  const [selectedImage, setSelectedImage] = useState(null);
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleOpenRequestPopup = () => {
    setRequestPopup(true);
  };

  const handleCloseRequestPopup = () => {
    setRequestPopup(false);
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

  const handleChange = (event) => {
    setRequestType(event.target.value);
  };

  const handleSubmitRequest = async () => {
    const formData = new FormData();
    formData.append('attachment', imageFile);
    formData.append('type', requestType);
    formData.append('description', description);
    console.log(`This is the formData: ${formData}`);
    await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/new?tenant-id=${uuid}`, {
      method: 'POST',
      body: formData, // Convert data to JSON string
    }).then((data) => {
      if (data.ok) {
        console.log('Data posted successfully');
        setDescription('');
        setSelectedImage(null);
        setRequestType();
      } else {
        console.log('Error posting data to backend');
      }
    });
    handleCloseRequestPopup();
  };

  const tableLabels =
    access === 'manager'
      ? [
        { id: 'name', label: 'Name' },
        { id: 'address', label: 'Address' },
        { id: 'type', label: 'Type' },
        { id: 'date', label: 'Date'},
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
          avatarUrl={row.avatarUrl}
          name={row.name}
          address={row.address}
          date={row.date}
          type={row.type}
          status={row.status}
          access={access}
        />
      );
    }
    return (
      <RequestTableRow
        key={row.requestID}
        id={row.requestID}
        avatarUrl={row.avatarUrl}
        type={row.type}
        description={row.description}
        date={row.date}
        status={row.status}
        access={access}
      />
    );
  };

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
        <UserTableToolbar filterName={filterName} onFilterName={handleFilterByName} />

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
                  setDescription(e.target.value);
                }}
              />
            </Box>
          </Grid>
          <Grid>
            <FormControl sx={{ m: 1, minWidth: 150 }} size="medium">
              <InputLabel id="demo-select-small-label">Request Type</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={requestType}
                label="Request Type"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Leakage">Leakage</MenuItem>
                <MenuItem value="Electrical">Electrical</MenuItem>
                <MenuItem value="Kitchen">Kitchen</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            <DialogActions>
              <Grid>
                {selectedImage && (
                  <div>
                    <h2>Selected Image</h2>
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
                  </div>
                )}
              </Grid>
              <Grid>
                <Button component="label" variant="contained">
                  Upload image
                  <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                </Button>
              </Grid>

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

RequestsView.propTypes = {
  access: PropTypes.string,
};
