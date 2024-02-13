import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { fToNow } from 'src/utils/format-time';

import Label from 'src/components/label';
// import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function RequestDescription({ title, subheader, description, list, request, ...other }) {
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
          <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
            {list.map((news) => (
              <NewsItem key={news.id} news={news} />
            ))}
          </Stack>
        </Stack>
      </Scrollbar>

      {/* <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          View all
        </Button>
      </Box> */}
    </Card>
  );
}

RequestDescription.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  description: PropTypes.string,
  list: PropTypes.array.isRequired,
  request: PropTypes.object
};

// ----------------------------------------------------------------------

function NewsItem({ news }) {
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

      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
        {fToNow(postedAt)}
      </Typography>
    </Stack>
  );
}

NewsItem.propTypes = {
  news: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    postedAt: PropTypes.instanceOf(Date),
  }),
};
