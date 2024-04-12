// import { useState } from 'react';
import PropTypes from 'prop-types';
// import { faker } from '@faker-js/faker';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import CircularProgress from '@mui/material/CircularProgress';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

import { requests } from 'src/_mock/request';

// ----------------------------------------------------------------------

export default function RequestLogTimeline({ id }) {
  const [loading, setLoading] = useState(true);
  const [logList, setLogList] = useState([]);

  useEffect(() => {
    const request = requests.find((req) => req.id === id); // API CALL HERE
    setLogList(request.logs);
    setLoading(false);
  }, [id]);

  return (
    <>
      {loading ? (
        <Stack direction="column" alignItems="center" spacing={3} sx={{ p: 3 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : (
        <Card>
          <CardHeader title="Recent Updates" />
          <Timeline
            sx={{
              m: 0,
              p: 3,
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            {logList.map((log, index) => (
              <LogItem key={log.id} log={log} lastTimeline={index === logList.length - 1} />
            ))}
          </Timeline>
        </Card>
      )}
    </>
  );
}

RequestLogTimeline.propTypes = {
  id: PropTypes.string
};

// ----------------------------------------------------------------------

function LogItem({ log, lastTimeline }) {
  const { type, title, time } = log;
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
          color={
            (type === 'start' && 'error') ||
            (type === 'completed' && 'success') ||
            (type === 'info' && 'primary') ||
            (type === 'ongoing' && 'warning') ||
            'error'
          }
        />
        {lastTimeline ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant="subtitle2">{title}</Typography>

        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {fDateTime(time)}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
}

LogItem.propTypes = {
  log: PropTypes.object,
  lastTimeline: PropTypes.bool,
};
