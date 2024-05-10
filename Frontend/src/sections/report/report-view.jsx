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

  const [timePeriod, setTimePeriod] = useState('monthly');
  const [timePopover, setTimePopover] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetch(
          `${
            import.meta.env.VITE_MIDDLEWARE_REPORT_URL
          }/manager/get-report?manager-id=${uuid}&schedule=${timePeriod}`
        )
          .then((res) => res.json())
          .then((data) => {
            let finalPaid = [];
            let finalExpenses = [];
            for( let i = 0; i < data.length; i += 1 ) {
              if( (lastFourTimePeriods(i) && timePeriod === 'monthly') || timePeriod !== 'monthly' ) {
                const period = data[i];
                const parsedIncome = {};
                const parsedExpenses = {};
                Object.entries(period).forEach(([key, value]) => {
                  let category;
                  if (key.includes('income')) {
                    category = 'income';
                  } else if (key.includes('expense')) {
                    category = 'expenses';
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
                    default:
                      break;
                  }
                });
                finalPaid = [...finalPaid, parsedIncome];
                finalExpenses = [...finalExpenses, parsedExpenses];
              }
            }
            setPaid(finalPaid);
            setExpenses(finalExpenses);
          });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`Report API: ${error}`);
      }
    };
    fetchData();
  }, [uuid, timePeriod]);

  const lastFourTimePeriods = (index) => {
    const cmonth = new Date().getMonth();
    if( index <= cmonth && cmonth-4 < index) {
      return true;
    }
    return false;
  };

  const renderItems = (map, label) => (
    <>
      <Typography gutterBottom variant="h5" sx={{ margin: '8px' }}>
        {label}
      </Typography>
      {renderLegend(timePeriod)}
      {map.length !== 0 ? (
        Object.entries(map[0]).map(([key, value]) => (
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Grid item xs={3} sx={{ paddingLeft: '16px' }}>
              <Typography variant="body1">{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
            </Grid>
            {timePeriod === 'monthly' ? (
              Object.entries(map).map(([k, v]) => (
                <Grid xs={2}>
                  <Typography align="right" variant="body1">
                    {fCurrency(v[key].toString())}
                  </Typography>
                </Grid>
              )
            )) : (
              <div />
            )}
            {timePeriod === 'quarterly' ? (
              Object.entries(map).map(([k, v]) => (
                <Grid xs={2}>
                  <Typography align="right" variant="body1">
                    {fCurrency(v[key].toString())}
                  </Typography>
                </Grid>
              ))
            ) : (
              <div />
            )}
            {timePeriod === 'yearly' ? (
              <Grid item xs={6}>
                <Typography align="right" variant="body1">
                  {fCurrency(value)}
                </Typography>
              </Grid>
            ) : (
              <div />
            )}
          </Stack>
        ))
      ) : (
        <div />
      )}
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

  // const renderColumnTotals = (map) => (
  //   <>
  //     <Divider
  //       sx={{ borderStyle: 'dashed', marginTop: '12px', marginRight: '20px', marginLeft: '20px' }}
  //     />
  //     <Grid container sx={{ marginTop: '8px' }}>
  //       <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
  //         <Typography variant="subtitle1">Total</Typography>
  //       </Grid>
  //       <Grid item xs={6} sx={{ paddingRight: '32px' }}>
  //         <Typography align="right" variant="subtitle1">
  //           {fCurrency(calculateOverallTotal(map))}
  //         </Typography>
  //       </Grid>
  //     </Grid>
  //   </>
  // );

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

  const renderLegend = (interval) => {
    switch (interval) {
      case 'monthly':
        return (
          <Stack direction="row" alignItems="center" justifyContent="space-between" >
            <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
              <Typography variant="subtitle1">Category</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography align="right" variant="subtitle1">
                February
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography align="right" variant="subtitle1">
                March
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography align="right" variant="subtitle1">
                April
              </Typography>
            </Grid>
            <Grid item xs={3} sx={{ paddingRight: '32px' }}>
              <Typography align="right" variant="subtitle1">
                May
              </Typography>
            </Grid>
          </Stack>
        );
      case 'quarterly':
        return (
          <Stack direction="row" alignItems="center" justifyContent="space-between" >
            <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
              <Typography variant="subtitle1">Category</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography align="right" variant="subtitle1">
                Q1
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography align="right" variant="subtitle1">
                Q2
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography align="right" variant="subtitle1">
                Q3
              </Typography>
            </Grid>
            <Grid item xs={3} sx={{ paddingRight: '32px' }}>
              <Typography align="right" variant="subtitle1">
                Q4
              </Typography>
            </Grid>
          </Stack>
        );
      case 'yearly':
        return (
          <Stack direction="row" alignItems="center" justifyContent="space-between" >
            <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
              <Typography variant="subtitle1">Category</Typography>
            </Grid>
            <Grid item xs={3} sx={{ paddingRight: '16px' }}>
              <Typography align="right" variant="subtitle1">
                2024
              </Typography>
            </Grid>
          </Stack>
        );
      default:
        return (
          <Grid container sx={{ marginBottom: '6px' }}>
            <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
              <Typography variant="subtitle1">Category</Typography>
            </Grid>
            <Grid item xs={6} sx={{ paddingRight: '32px' }}>
              <Typography align="right" variant="subtitle1">
                This Month
              </Typography>
            </Grid>
          </Grid>
        );
    }
  };

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
            {renderItems(expenses, 'Expenses')}
            {/* {renderColumnTotals(expenses)} */}
          </Card>
          <Card sx={{ padding: '16px', marginTop: '25px' }}>
            {renderItems(paid, 'Income')}
            {/* {renderColumnTotals(paid)} */}
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
