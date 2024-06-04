import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fDateTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';

import { getAttachments } from '../hooks/request-specifics'

// ----------------------------------------------------------------------

export default function RequestAttachments({ id }) {
  const [loading, setLoading] = useState(true);
  const [attachmentList, setAttachmentList] = useState([]);
  const [errorMsg, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getAttachments(id)
          .then(data => {
            console.log(data);
            setAttachmentList(data);
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`Comments API: ${error}`)
      }
    };
    fetchData();
    setLoading(false);
  }, [id]);

  return (
    <>
      {loading ? (
        <Stack direction="column" alignItems="center" spacing={3} sx={{ p: 3 }}>
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
        <Scrollbar>
          <Stack sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
              Attachments
            </Typography>
            <Stack spacing={3} sx={{ pt: 2, pr: 0 }}>
              {(attachmentList.length === 0)?
                <Paper
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" paragraph>
                    No attachments.
                  </Typography>
                </Paper>
              : attachmentList.map((item) => (
                  <AttachmentItem key={item.id} item={item} />
                ))
              }
            </Stack>
          </Stack>
        </Scrollbar>
      )}
    </>
  );
}

RequestAttachments.propTypes = {
  id: PropTypes.string,
};

// ----------------------------------------------------------------------

function AttachmentItem({ item }) {
  const { attachment, title, description, datePosted } = item;

  const [popover, setPopover] = useState(null);

  const handleOpen = (event) => {
    setPopover(event.currentTarget);
  };

  const handleClose = (event) => {
    setPopover(null);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        onClick={handleOpen}
        component="img"
        alt={title}
        src={`data:image/png;base64, ${attachment}`}
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1.5,
          flexShrink: 0,
          '&:hover': {
            opacity: 0.75,
          },
        }}
      />
      <Popover
        open={!!popover}
        anchorEl={popover}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        style={{
          display: 'flex',
          padding: '30px',
          position: 'absolute',
          maxWidth: '65%',
          maxHeight: 'auto',
        }}
      >
        <Box onClick={handleClose} component="img" alt={title} src={`data:image/png;base64, ${attachment}`} />
      </Popover>

      <Box sx={{ minWidth: 240, flexGrow: 1 }}>
        <Typography color="inherit" variant="subtitle2" underline="hover" noWrap>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ pr: 1, flexShrink: 0, color: 'text.secondary' }}>
        {fDateTime(datePosted)}
      </Typography>
    </Stack>
  );
}

AttachmentItem.propTypes = {
  item: PropTypes.shape({
    attachment: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    datePosted: PropTypes.string,
  }),
};
