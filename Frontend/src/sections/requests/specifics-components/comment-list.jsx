import { sample } from 'lodash';
import PropTypes from 'prop-types';
import { faker } from '@faker-js/faker';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { fDateTime } from 'src/utils/format-time';

import { requests } from 'src/_mock/request';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function RequestComments({ id }) {
  const [loading, setLoading] = useState(true);
  const [commentList, setCommentList] = useState([]);
  const [commentField, setCommentField] = useState("");

  const [commentLabel, setCommentLabel] = useState("New Comment");
  const [validate, setValidate] = useState(true);

  const handleAddComment = (event) => {
    if( commentField !== "" ) {
      const newCommentArr = [...commentList, {
        id: faker.string.uuid(),
        user: sample(["Manager", "Tenant"]),
        text: commentField,
        postedAt: new Date(),
      }]
      setCommentList(newCommentArr);
      setCommentField("");
      setCommentLabel("");
      setValidate(true);
    }
    else {
      setValidate(false);
      setCommentLabel("Comment cannot be empty")
    }
  }

  useEffect(() => {
    const request = requests.find((req) => req.id === id); // API CALL HERE
    setCommentList(request.comments);
    setLoading(false);
  }, [id]);

  return (
    <>
      {loading ? (
        <Stack direction="column" alignItems="center" spacing={3} sx={{ p: 3 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : (
        <Scrollbar>
          <Stack sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
              Comments
            </Typography>
            <Stack spacing={3} sx={{ pt: 2, pr: 0 }}>
              {commentList.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={3}
              sx={{ pt: 2, pr: 3 }}
            >
              <TextField
                id="filled-multiline"
                error={!validate}
                label={commentLabel}
                multiline
                fullWidth
                variant="filled"
                size="small"
                value={commentField}
                onChange={(event) => {
                  setCommentField(event.target.value);
                }}
              />
              <IconButton onClick={handleAddComment} size="large">
                <Iconify icon="eva:plus-circle-outline" />
              </IconButton>
            </Stack>
          </Stack>
        </Scrollbar>
      )}
    </>
  );
}

RequestComments.propTypes = {
  id: PropTypes.string,
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
    postedAt: PropTypes.instanceOf(Date),
  }),
};
