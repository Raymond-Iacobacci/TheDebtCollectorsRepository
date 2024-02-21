// import { useState } from 'react';
import PropTypes from 'prop-types';
// import { faker } from '@faker-js/faker';

import Card from '@mui/material/Card';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function RequestLogTimeline({ title, subheader, logList, ...other }) {

  // const [logs, setLogs] = useState(logList);

  // const handleAddLog = (event) => {
  //   const newLogArr = [...logs, {
  //     id: faker.string.uuid(),
  //     title: "TBD",
  //     type: "TBD",
  //     time: new Date(),
  //   }]
  //   setLogs(newLogArr);
  // }

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
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
        {logList.map((item, index) => (
          <OrderItem key={item.id} item={item} lastTimeline={index === logList.length - 1} />
        ))}
      </Timeline>
    </Card>
  );
}

RequestLogTimeline.propTypes = {
  logList: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function OrderItem({ item, lastTimeline }) {
  const { type, title, time } = item;
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

OrderItem.propTypes = {
  item: PropTypes.object,
  lastTimeline: PropTypes.bool,
};
