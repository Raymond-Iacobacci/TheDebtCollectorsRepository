import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import { fToNow, fDateTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function RequestDescription({ title, subheader, description, list, commentList, request, ...other }) {
  return (
    <Card {...other}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3} sx={{ p: 0, pr: 3 }}>
        <CardHeader title={title} subheader={subheader} />
        <Label color={(request.status === 'Not Started' && 'error') || (request.status === 'Ongoing' && 'warning') || 'success'}>{request.status}</Label>
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
            {list.map((news) => (
              <AttachmentItem key={news.id} news={news} />
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
            {commentList.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3} sx={{ pt: 2, pr: 3 }}>
            <IconButton >
              <Iconify icon="eva:plus-circle-outline" />
            </IconButton>
            <TextField
              id="filled-multiline"
              label="Comment"
              multiline
              fullWidth
              variant="filled"
              size="small"
            />
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

function AttachmentItem({ news }) {
  const { image, title, description, postedAt } = news;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        component="img"
        alt={title}
        src={image}
        sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }}
      />

      <Box sx={{ minWidth: 240, flexGrow: 1 }}>
        <Typography color="inherit" variant="subtitle2" underline="hover" noWrap>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ pr: 1, flexShrink: 0, color: 'text.secondary' }}>
        {fToNow(postedAt)}
      </Typography>
    </Stack>
  );
}

AttachmentItem.propTypes = {
  news: PropTypes.shape({
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