import { useState } from 'react';
// import PropTypes from 'prop-types';
// import { faker } from '@faker-js/faker';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { requests } from 'src/_mock/request';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableHead from '../user-table-head';
import UserTableRow from '../request-table-row';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import RequestDescription from '../request-description';
import RequestLogTimeline from '../request-log-timeline';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function RequestPage() {

  const [popup, setPopup] = useState(null);

  const [currentRequest, setCurrentRequest] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleExpand = (event, name) => {
    handleSelectRequest(name);
    handleOpenPopup();
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

  const handleOpenPopup = () => {
    setPopup(true);
  }
  
  const handleClosePopup = () => {
    setPopup(null);
  }

  const handleSelectRequest = (id) => {
    setCurrentRequest(requests.find(req => req.id === id))
  }

  const dataFiltered = applyFilter({
    inputData: requests,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      {
        !popup ? 
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4">Requests</Typography>

            {/* <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
              New Request
            </Button> */}
          </Stack>
          
          <Card>
            <UserTableToolbar
              filterName={filterName}
              onFilterName={handleFilterByName}
            />

            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <UserTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={requests.length}
                    onRequestSort={handleSort}
                    headLabel={[
                      { id: 'name', label: 'Name' },
                      { id: 'address', label: 'Address' },
                      { id: 'type', label: 'Type' },
                      { id: 'status', label: 'Status'},
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <UserTableRow
                          key={row.id}
                          avatarUrl={row.avatarUrl}
                          name={row.name}
                          address={row.address}
                          type={row.type}
                          status={row.status}
                          handleClick={(event) => handleExpand(event, row.id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={77}
                      emptyRows={emptyRows(page, rowsPerPage, requests.length)}
                    />

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
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
        </> : 
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Button onClick={handleClosePopup} variant="contained" color="inherit" startIcon={<Iconify icon="eva:corner-down-left-fill" />}>
              Back
            </Button>
            <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:edit-fill" />}>
              Edit
            </Button>
          </Stack>
          <Grid container spacing={3}>
            <Grid xs={12} md={6} lg={8}>
              <RequestDescription
                title={currentRequest.type}
                subheader={`${currentRequest.name} @ ${currentRequest.address}`}
                description={currentRequest.description}
                list={currentRequest.attachments}
                request={currentRequest}
                commentList={currentRequest.comments}
              />
            </Grid>
            <Grid xs={12} md={6} lg={4}>
              <RequestLogTimeline
                title="Recent Updates"
                list={currentRequest.logs}
              />
            </Grid>
          </Grid>
        </>
      }
    </Container>
  );
}
