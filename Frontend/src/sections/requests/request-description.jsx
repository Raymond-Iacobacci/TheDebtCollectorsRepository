import { sample } from 'lodash';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { faker } from '@faker-js/faker';

import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
// import { alpha } from '@mui/material/styles';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import { fDateTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function RequestDescription({ title, subheader, description, list, commentList, request, ...other }) {

  const [comments, setComments] = useState(commentList);
  const [commentField, setCommentField] = useState("");

  const [status, setStatus] = useState(request.status);
  const [statusPopover, setStatusPopover] = useState(null);

  const [errorStr, setErrorStr] = useState("");
  const [validate, setValidate] = useState(true);

  const handleAddComment = (event) => {
    if( commentField !== "" ) {
      const newCommentArr = [...comments, {
        id: faker.string.uuid(),
        user: sample(["Manager", "Tenant"]),
        text: commentField,
        postedAt: new Date(),
      }]
      setComments(newCommentArr);
      setCommentField("");
      setErrorStr("");
      setValidate(true);
    }
    else {
      setValidate(false);
      setErrorStr("Comment cannot be empty")
    }
  }

  const handleOpenStatusPopover = (event) => {
    setStatusPopover(event.currentTarget);
  };

  const handleCloseStatusPopover = (event) => {
    setStatusPopover(null);
  }

  const handleEditStatusToCompleted = (event) => {
    setStatus('Completed');
    setStatusPopover(null);
  };
  
  const handleEditStatusToOngoing = (event) => {
    setStatus('Ongoing');
    setStatusPopover(null);
  };

  const handleEditStatusToNotStarted = (event) => {
    setStatus('Not Started');
    setStatusPopover(null);
  };

  return (
    <Card {...other}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3} sx={{ p: 0, pr: 3 }}>
        <CardHeader title={title} subheader={subheader} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3} sx={{ p: 0, pr: 0 }}>
          <Label color={(status === 'Not Started' && 'error') || (status === 'Ongoing' && 'warning') || (status === 'Completed' && 'success')}>{status}</Label>
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
              <Label color='success'>Completed</Label>
            </MenuItem>
            <MenuItem onClick={handleEditStatusToOngoing}>
              <Label color='warning'>Ongoing</Label>
            </MenuItem>
            <MenuItem onClick={handleEditStatusToNotStarted} sx={{ pb: 1 }}>
              <Label color='error'>Not Started</Label>
            </MenuItem>
          </Popover>
        </Stack>
      </Stack>

      <Scrollbar>
        <Stack  sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            Description
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {request.description}
          </Typography>
        </Stack>
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar>
        <Stack  sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            Attachments
          </Typography>
          <Stack spacing={3} sx={{ pt: 2, pr: 0 }}>
            {list.map((attachment) => (
              <AttachmentItem key={attachment.id} attachment={attachment} />
            ))}
          </Stack>
        </Stack>
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar>
        <Stack  sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            Comments
          </Typography>
          <Stack spacing={3} sx={{ pt: 2, pr: 0 }}>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3} sx={{ pt: 2, pr: 3 }}>
            <TextField
              id="filled-multiline"
              error={!validate}
              label={errorStr}
              multiline
              fullWidth
              variant="filled"
              size="small"
              value={commentField}
              onChange={(event) => {setCommentField(event.target.value)}}
            />
            <IconButton onClick={handleAddComment} size="large" >
              <Iconify icon="eva:plus-circle-outline" />
            </IconButton>
          </Stack>
        </Stack>
      </Scrollbar>
    </Card>
  );
}

RequestDescription.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  description: PropTypes.string,
  list: PropTypes.array.isRequired,
  commentList: PropTypes.array,
  request: PropTypes.object
};

// ----------------------------------------------------------------------

function AttachmentItem({ attachment }) {
  const { image, title, description, postedAt } = attachment;

  const [popover, setPopover] = useState(null);

  const handleOpen = (event) => {
    setPopover(event.currentTarget);
  };

  const handleClose = (event) => {
    setPopover(null);
  }

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        onClick={handleOpen}
        component="img"
        alt={title}
        src={image}
        sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: 1.5, 
          flexShrink: 0,
          '&:hover': {
            opacity: 0.75
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
          maxHeight: 'auto'
      }}
      >
        <Box
        onClick={handleClose}
        component="img"
        alt={title}
        src={image}
        />
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
        {fDateTime(postedAt)}
      </Typography>
    </Stack>
  );
}

AttachmentItem.propTypes = {
  attachment: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    postedAt: PropTypes.instanceOf(Date),
  }),
};

// ----------------------------------------------------------------------

function CommentItem({ comment }) {
  const { user, text, postedAt } = comment;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box sx={{ minWidth: 240, flexGrow: 1 }}>
        <Typography color="inherit" variant="subtitle2" underline="hover" noWrap>
          {user}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {text}
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ pr: 1, flexShrink: 0, color: 'text.secondary' }}>
        {fDateTime(postedAt)}
      </Typography>
    </Stack>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.shape({
    user: PropTypes.string,
    text: PropTypes.string,
    postedAt: PropTypes.instanceOf(Date)
  }),
};