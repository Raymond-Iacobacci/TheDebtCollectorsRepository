import { sample } from 'lodash';
import PropTypes from 'prop-types';
import { faker } from '@faker-js/faker';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { fDateTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { getComments } from '../hooks/request-specifics'

// ----------------------------------------------------------------------

export default function RequestComments({ id }) {
  const [loading, setLoading] = useState(true);
  const [commentList, setCommentList] = useState({comment: 'test'});
  const [commentField, setCommentField] = useState("");
  const [errorMsg, setError] = useState("");

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
    const fetchData = async () => {
      try {
        setLoading(true);
        await getComments(id)
          .then(data => {
            console.log(data);
            setCommentList(data);
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`Comments API: ${error}`)
      }
    };
    fetchData();

    // const request = requests.find((req) => req.id === id); // API CALL HERE
  }, [id]);

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
        <Scrollbar>
          <Stack sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
              Comments
            </Typography>
            <Stack spacing={3} sx={{ pt: 2, pr: 0 }}>
              {/* {(commentList.length === 0)?
                <Paper
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" paragraph>
                    No comments...
                  </Typography>
                </Paper>
              : commentList.map((comment) => (
                  <CommentItem key={comment.id} item={comment} />
                ))
              } */}
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
