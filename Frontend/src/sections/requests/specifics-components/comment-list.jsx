import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { usePathname } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { newComment, getComments } from '../hooks/request-specifics'

// ----------------------------------------------------------------------

export default function RequestComments({ id }) {
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [commentList, setCommentList] = useState([]);
  const [commentField, setCommentField] = useState("");
  const [errorMsg, setError] = useState("");

  const [commentLabel, setCommentLabel] = useState("New Comment");
  const [validate, setValidate] = useState(true);

  const fetchData = useCallback( async () => {
    try {
      setLoading(true);
      await getComments(id)
        .then(data => {
          setCommentList(data);
      });
      setLoading(false);
    } catch (error) {
      setError(error.message);
      console.log(`Comments API: ${error}`)
    }
  }, [id]);

  const handleAddComment = async (event) => {
    const user = (pathname.search("/manager") !== -1)?import.meta.env.VITE_TEST_MANAGER_ID:import.meta.env.VITE_TEST_TENANT_ID;
    if( commentField !== "" ) {
      await newComment(id, user, commentField);
      setCommentField("");
      setCommentLabel("New comment");
      setValidate(true);
      await fetchData();
    }
    else {
      setValidate(false);
      setCommentLabel("Comment cannot be empty")
    }
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Scrollbar>
      <Stack sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
          Comments
        </Typography>
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
            <Stack spacing={3} sx={{ pt: 2, pr: 0 }}>
              {(commentList.length === 0)?
                <Paper
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" paragraph>
                    No comments.
                  </Typography>
                </Paper>
              : commentList.map((comment) => (
                  <CommentItem key={comment.commentID} item={comment} />
                ))
              }
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
          </>
        )}
      </Stack>
    </Scrollbar>
  );
}

RequestComments.propTypes = {
  id: PropTypes.string,
};

// ----------------------------------------------------------------------

function CommentItem({ item }) {
  const { user, comment, datePosted } = item;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box sx={{ minWidth: 240, flexGrow: 1 }}>
        <Typography color="inherit" variant="subtitle2" underline="hover" noWrap>
          {user}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {comment}
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ pr: 1, flexShrink: 0, color: 'text.secondary' }}>
        {fDateTime(datePosted)}
      </Typography>
    </Stack>
  );
}

CommentItem.propTypes = {
  item: PropTypes.shape({
    user: PropTypes.string,
    comment: PropTypes.string,
    datePosted: PropTypes.string,
  }),
};