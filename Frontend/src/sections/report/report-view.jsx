import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { usePathname } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ReportView() {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];

  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState('');

  const [paid, setPaid] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [credits, setCredits] = useState([]);

  const [timePeriod, setTimePeriod] = useState('monthly');
  const [timePopover, setTimePopover] = useState(null);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const quarters = [
    'Q1',
    'Q2',
    'Q3',
    'Q4'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetch(
          `${
            import.meta.env.VITE_MIDDLEWARE_URL
          }/manager/report/get-report?manager-id=${uuid}&schedule=${timePeriod}`
        )
          .then((res) => res.json())
          .then((data) => {
            let finalPaid = [];
            let finalExpenses = [];
            let finalCredits = []; 
            for (let i = 0; i < data.length; i += 1) {
              const period = data[i];
              const parsedIncome = {};
              const parsedExpenses = {};
              const parsedCredits = {};
              Object.entries(period).forEach(([key, value]) => {
                let category;
                if (key.includes('income')) {
                  category = 'income';
                } else if (key.includes('expense')) {
                  category = 'expenses';
                } else if (key.includes('credit')) {
                  category = 'credits';
                } else {
                  category = 'misc';
                }
                switch (category) {
                  case 'income':
                    parsedIncome[key.substring(7)] = value;
                    break;
                  case 'expenses':
                    parsedExpenses[key.substring(9)] = value;
                    break;
                  case 'credits':
                    parsedCredits.credits = value;
                    break;
                  default:
                    break;
                }
              });
              finalPaid = [...finalPaid, parsedIncome];
              finalExpenses = [...finalExpenses, parsedExpenses];
              finalCredits = [...finalCredits, parsedCredits];
            }
            setPaid(finalPaid);
            setExpenses(finalExpenses);
            setCredits(finalCredits);
          });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`Report API: ${error}`);
      }
    };
    fetchData();
  }, [uuid, timePeriod]);

  const renderColumnLegend = (map) => (
    <Stack justifyContent="space-between" sx={{ paddingRight: '10px' }}>
      <Grid item xs={3} sx={{ paddingLeft: '16px' }}>
        <Typography variant="subtitle1">Category</Typography>
      </Grid>
      {map.length !== 0 ? (
        Object.entries(map[0]).map(([key, value]) => (
          <Grid item xs={3} sx={{ paddingLeft: '16px' }}>
            <Typography variant="body1">{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
          </Grid>
        ))
      ) : (
        <div />
      )}
    </Stack>
  );

  const renderColumnData = (map) => (
    <>
      {map.length !== 0 ? (
        <Stack direction="row" alignItems="center" sx={{ overflowX: 'scroll' }}>
          {Object.entries(map).map(([key, value]) => (
            <Stack alignItems="center">
              <Grid item xs={1} sx={{ paddingLeft: '20px' }}>
                  {timePeriod === 'monthly' ? (
                    <Typography variant="subtitle1">{months[key]}</Typography>
                  ) : (
                    <div />
                  )}
                  {timePeriod === 'quarterly' ? (
                    <Typography variant="subtitle1">{quarters[key]}</Typography>
                  ) : (
                    <div />
                  )}
                  {timePeriod === 'yearly' ? (
                    <Typography variant="subtitle1">{new Date().getFullYear()}</Typography>
                  ) : (
                    <div />
                  )}
              </Grid>
              {Object.entries(map[key]).map(([k, v]) => (
                <Grid item xs={1} sx={{ paddingLeft: '20px' }}>
                  <Typography align="right" variant="body1">
                    {fCurrency(v.toString())}
                  </Typography>
                </Grid>
              ))}
            </Stack>
          ))}
        </Stack>
      ) : (
        <div />
      )}
    </>
  );

  const renderData = (map, label) => (
    <>
      <Typography gutterBottom variant="h5" sx={{ margin: '8px' }}>
        {label}
      </Typography>
      <Grid container spacing={1} wrap>
        <Grid item sx={{ padding: '10px', marginRight: '35px' }}>
          {renderColumnLegend(map)}
        </Grid>
        <Grid item sx={{ padding: '10px', width: '100%' }}>
          {renderColumnData(map)}
        </Grid>
      </Grid>
    </>
  );

  const renderOverallTotals = (map, category) => (
    <Grid container>
      <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
        <Typography variant="body1">{category}</Typography>
      </Grid>
      <Grid item xs={6} sx={{ paddingRight: '32px' }}>
        <Typography align="right" variant="body1">
          {fCurrency(calculateOverallTotal(map))}
        </Typography>
      </Grid>
    </Grid>
  );

  const calculateOverallTotal = (data) => {
    let total = 0;
    data.forEach((period) => {
      Object.entries(period).forEach(([key, value]) => {
        total += value;
      });
    });
    return total.toString();
  };

  const renderNet = (
    <Grid container>
      <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
        <Typography variant="subtitle1">Net Total</Typography>
      </Grid>
      <Grid item xs={6} sx={{ paddingRight: '32px' }}>
        <Typography align="right" variant="subtitle1">
          {fCurrency(
            (
              parseInt(calculateOverallTotal(paid), 10) -
              parseInt(calculateOverallTotal(expenses), 10)
            ).toString()
          )}
        </Typography>
      </Grid>
    </Grid>
  );

  const handleOpenTimePopover = (event) => {
    setTimePopover(event.currentTarget);
  };

  const handleCloseTimePopover = (event) => {
    setTimePopover(null);
  };

  const handleEditTimeToMonthly = async (event) => {
    setPaid([]);
    setExpenses([]);
    setTimePeriod('monthly');
    setTimePopover(null);
  };

  const handleEditTimeToQuarterly = async (event) => {
    setPaid([]);
    setExpenses([]);
    setTimePeriod('quarterly');
    setTimePopover(null);
  };

  const handleEditTimeToYearly = async (event) => {
    setPaid([]);
    setExpenses([]);
    setTimePeriod('yearly');
    setTimePopover(null);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Report</Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={3}
          sx={{ p: 0, pr: 0 }}
        >
          <Label color="primary">{timePeriod}</Label>
          <IconButton onClick={handleOpenTimePopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
          <Popover
            open={!!timePopover}
            anchorEl={timePopover}
            onClose={handleCloseTimePopover}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <MenuItem onClick={handleEditTimeToMonthly} sx={{ pt: 1 }}>
              <Label color="primary">Monthly</Label>
            </MenuItem>
            <MenuItem onClick={handleEditTimeToQuarterly}>
              <Label color="primary">Quarterly</Label>
            </MenuItem>
            <MenuItem onClick={handleEditTimeToYearly} sx={{ pb: 1 }}>
              <Label color="primary">Yearly</Label>
            </MenuItem>
          </Popover>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={8}>
          <Card sx={{ padding: '16px' }}>
            {renderData(expenses, 'Expenses')}
          </Card>
          <Card sx={{ padding: '16px', marginTop: '25px' }}>
            {renderData(paid, 'Income')}
          </Card>
          <Card sx={{ padding: '16px', marginTop: '25px' }}>
            {renderData(credits, 'Credits')}
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{ padding: '16px' }}>
            <Typography gutterBottom variant="h5" sx={{ margin: '8px' }}>
              Totals
            </Typography>
            {renderOverallTotals(expenses, 'Expenses')}
            {renderOverallTotals(paid, 'Income')}
            <Divider sx={{ borderStyle: 'dashed', marginTop: '12px', marginBottom: '8px' }} />
            {renderNet}
          </Card>
        </Grid>
      </Grid>

      <h1>{loading}</h1>
      <h1>{errorMsg}</h1>
    </Container>
  );
}