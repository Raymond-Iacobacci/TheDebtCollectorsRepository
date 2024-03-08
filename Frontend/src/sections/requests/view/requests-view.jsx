import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

// import { requests } from 'src/_mock/request';

import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-components/table-no-data';
import RequestTableRow from '../table-components/table-row';
import RequestTableHead from '../table-components/table-head';
import { getManagerRequests } from '../hooks/request-specifics';
import UserTableToolbar from '../table-components/table-toolbar';
import TableEmptyRows from '../table-components/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../hooks/utils';

// ----------------------------------------------------------------------

export default function RequestsView() {

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [errorMsg, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getManagerRequests()
          .then(data => {
            console.log(data);
            setRequests(data);
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`HeaderInfo API: ${error}`)
      }
    };
    fetchData();
  }, []);

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

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Requests</Typography>
      </Stack>
      
      <Card>
        <UserTableToolbar
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <RequestTableHead
                order={order}
                orderBy={orderBy}
                rowCount={requests.length}
                onRequestSort={handleSort}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'address', label: 'Address' },
                  { id: 'type', label: 'Type' },
                  { id: 'status', label: 'Status'},
                ]}
              />
              {loading ? (
                <Stack
                  direction="column"
                  alignItems="center"
                  spacing={3}
                  sx={{ p: 3 }}
                >
                  {errorMsg ? 
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={3}
                      sx={{ p: 0, pr: 3 }}
                    >
                      <Label color='error'>{errorMsg}</Label>
                    </Stack>
                    :
                    <CircularProgress color="primary" />
                  }
                </Stack>
              ) : (
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <RequestTableRow
                        key={row.id}
                        id={row.requestID}
                        avatarUrl={row.avatarUrl}
                        name={row.name}
                        address={row.address}
                        type={row.type}
                        status={row.status}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, requests.length)}
                  />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
                )
              }
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
    </Container>
  );
}
