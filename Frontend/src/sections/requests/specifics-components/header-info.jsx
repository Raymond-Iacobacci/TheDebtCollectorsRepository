import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { changeStatus, getHeaderInfo } from '../hooks/request-specifics'

// ----------------------------------------------------------------------

export default function RequestHeaderInfo({ id }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusPopover, setStatusPopover] = useState(null);
  const [title, setTitle] = useState("");
  const [name, setName] = useState(""); 
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getHeaderInfo(id)
          .then(data => {
            setName(data.tenant);
            setDescription(data.description);
            setStatus(data.status);
            setAddress(data.address);
            setTitle(data.type);
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`HeaderInfo API: ${error}`)
      }
    };
    fetchData();
  }, [id]);

  const handleOpenStatusPopover = (event) => {
    setStatusPopover(event.currentTarget);
  };

  const handleCloseStatusPopover = (event) => {
    setStatusPopover(null);
  };

  const handleEditStatusToCompleted = async (event) => {
    await changeStatus(id, 'Resolved');
    setStatus('Resolved');
    setStatusPopover(null);
  };

  const handleEditStatusToOngoing = async (event) => {
    await changeStatus(id, 'Ongoing');
    setStatus('Ongoing');
    setStatusPopover(null);
  };

  const handleEditStatusToNotStarted = async (event) => {
    await changeStatus(id, 'Unresolved');
    setStatus('Unresolved');
    setStatusPopover(null);
  };

  return (
    <>
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
        <>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={3}
            sx={{ p: 0, pr: 3 }}
          >
            <CardHeader title={title} subheader={`${name}  @  ${address}`} />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={3}
              sx={{ p: 0, pr: 0 }}
            >
              <Label
                color={
                  (status === 'Unresolved' && 'error') ||
                  (status === 'Ongoing' && 'warning') ||
                  (status === 'Resolved' && 'success') ||
                  'error'
                }
              >
                {status}
              </Label>
              <IconButton onClick={handleOpenStatusPopover}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
              <Popover
                open={!!statusPopover}
                anchorEl={statusPopover}
                onClose={handleCloseStatusPopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <MenuItem onClick={handleEditStatusToCompleted} sx={{ pt: 1 }}>
                  <Label color="success">Resolved</Label>
                </MenuItem>
                <MenuItem onClick={handleEditStatusToOngoing}>
                  <Label color="warning">Ongoing</Label>
                </MenuItem>
                <MenuItem onClick={handleEditStatusToNotStarted} sx={{ pb: 1 }}>
                  <Label color="error">Unresolved</Label>
                </MenuItem>
              </Popover>
            </Stack>
          </Stack>

          <Scrollbar>
            <Stack sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {description}
              </Typography>
            </Stack>
          </Scrollbar>
        </>
      )}
    </>
  );
}

RequestHeaderInfo.propTypes = {
  id: PropTypes.string,
};
