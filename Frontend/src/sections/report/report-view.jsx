import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { usePathname } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function ReportView() {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];

  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState('');

  const [paid, setPaid] = useState({});
  const [expenses, setExpenses] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/get-report?manager-id=${uuid}`)
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            console.log(data.overdueRent);
            Object.entries(data).forEach(([key, value]) => {
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
                  setPaid((prevState) => ({
                    ...prevState,
                    [key.replace(`${category}_`, '')]: value.toString(),
                  }));
                  break;
                case 'expenses':
                  setExpenses((prevState) => ({
                    ...prevState,
                    [key.replace(`${category}_`, '')]: value.toString(),
                  }));
                  break;
                default:
                  break;
              }
            });
          });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.log(`Report API: ${error}`);
      }
    };
    fetchData();
  }, [uuid]);

  const renderItems = (map, label) => (
    <>
      <Typography gutterBottom variant="h5" sx={{ margin: '8px' }}>
        {label}
      </Typography>
      {renderLegend('Weekly')}
      {Object.entries(map).map(([key, value]) => (
        <Grid container key={key}>
          <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
            <Typography variant="body1">{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
          </Grid>
          <Grid item xs={6} sx={{ paddingRight: '32px' }}>
            <Typography align="right" variant="body1">
              {fCurrency(value)}
            </Typography>
          </Grid>
        </Grid>
      ))}
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

  const renderColumnTotals = (map) => (
    <>
      <Divider sx={{ borderStyle: 'dashed', marginTop: '12px', marginRight: '20px', marginLeft: '20px' }} />
      <Grid container sx={{ marginTop: '8px' }}>
        <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
          <Typography variant="subtitle1">Total</Typography>
        </Grid>
        <Grid item xs={6} sx={{ paddingRight: '32px' }}>
          <Typography align="right" variant="subtitle1">
            {fCurrency(calculateOverallTotal(map))}
          </Typography>
        </Grid>
      </Grid>
    </>
  );

  const calculateOverallTotal = (category) => {
    let total = 0;
    Object.values(category).forEach((amount) => {
      total += parseInt(amount, 10);
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
      case 'Daily':
        return (
          <Grid container sx={{ marginBottom: '6px' }}>
            <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
              <Typography variant="subtitle1">Category</Typography>
            </Grid>
            <Grid item xs={6} sx={{ paddingRight: '32px' }}>
              <Typography align="right" variant="subtitle1">
                Today
              </Typography>
            </Grid>
          </Grid>
        );
      case 'Weekly':
        return (
          <Grid container sx={{ marginBottom: '6px' }}>
            <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
              <Typography variant="subtitle1">Category</Typography>
            </Grid>
            <Grid item xs={6} sx={{ paddingRight: '32px' }}>
              <Typography align="right" variant="subtitle1">
                This Week
              </Typography>
            </Grid>
          </Grid>
        );
      case 'Monthly':
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
      case 'Yearly':
        return (
          <Grid container sx={{ marginBottom: '6px' }}>
            <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
              <Typography variant="subtitle1">Category</Typography>
            </Grid>
            <Grid item xs={6} sx={{ paddingRight: '32px' }}>
              <Typography align="right" variant="subtitle1">
                This Year
              </Typography>
            </Grid>
          </Grid>
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

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Report</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={8}>
          <Card sx={{ padding: '16px' }}>
            {renderItems(expenses, 'Expenses')}
            {renderColumnTotals(expenses)}
          </Card>
          <Card sx={{ padding: '16px', marginTop: '25px' }}>
            {renderItems(paid, 'Income')}
            {renderColumnTotals(paid)}
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
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
