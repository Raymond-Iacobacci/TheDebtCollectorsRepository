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

import AnnouncementTableRow from '../table-components/table-row';
import AnnouncemenTableHead from '../table-components/table-head';
import TableEmptyRows from '../table-components/table-empty-rows';

import { emptyRows } from '../hooks/utils';
import { addAnnouncement, getAnnouncements } from '../hooks/announcement-specifics';

// ----------------------------------------------------------------------

export default function AnnouncementsView() {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];
  const access = pathname.split('/')[2];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [errorMsg, setError] = useState('');
  const [popup, setPopup] = useState(false);

  const [reload, setReload] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getAnnouncements(uuid, access).then((data) => {
          setAnnouncements(data);
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
      }
    };
    if (reload) {
      fetchData();
      setReload(false);
    }
  }, [uuid, reload, access]);

  // Dialog popup
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  const handleOpenPopup = () => {
    setPopup(true);
  };

  const handleClosePopup = () => {
    setPopup(false);
  };

  const handleSubmit = async () => {
    await addAnnouncement(uuid, title, description).then((data) => {
      if (data.ok) {
        setDescription('');
        setTitle('');
        setPopup(false);
        setReload(true);
      }
    });
    handleClosePopup();
  };

  const newAnnouncementDialog = (
    <Dialog
      open={popup}
      onClose={handleClosePopup}
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
            <Button onClick={handleSubmit} autoFocus>
              Submit
            </Button>
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  );

  // Table Specifics
  const tableLabels = [
    { id: 'title', label: 'Title' },
    { id: 'description', label: 'Description' },
    { id: 'date', label: 'Date' },
  ];

  const tableValues = (row) => (
    <AnnouncementTableRow
      key={row.announcementID}
      id={row.announcementID}
      title={row.title}
      description={row.description}
      date={row.date}
      deleteRow={handleDeleteRow}
    />
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDeleteRow = () => {
    setReload(true);
  };

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
            onClick={handleOpenPopup}
          >
            New Announcement
          </Button>
        )}
      </Stack>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <AnnouncemenTableHead headLabel={tableLabels} />
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
                  {announcements
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => tableValues(row))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, announcements.length)}
                  />
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

      {newAnnouncementDialog}
    </Container>
  );
}
