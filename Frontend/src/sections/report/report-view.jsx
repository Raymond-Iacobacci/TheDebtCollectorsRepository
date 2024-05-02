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

  const renderTotals = (map, category) => (
    <Grid container>
      <Grid item xs={6} sx={{ paddingLeft: '16px' }}>
        <Typography variant="body1">{category}</Typography>
      </Grid>
      <Grid item xs={6} sx={{ paddingRight: '32px' }}>
        <Typography align="right" variant="body1">
          {fCurrency(calculateTotal(map))}
        </Typography>
      </Grid>
    </Grid>
  );

  const calculateTotal = (category) => {
    let total = 0;
    Object.values(category).forEach((amount) => {
      total += parseInt(amount, 10);
    });
    console.log(`total: ${total}`)
    return total.toString();
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Report</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={8}>
          <Card sx={{ padding: '16px' }}>
            {renderItems(expenses, "Expenses")}
            <Divider sx={{ borderStyle: 'dashed', marginTop: '12px' }} />
            {renderItems(paid, "Income")}
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ padding: '16px' }}>
            <Typography gutterBottom variant="h5">
              Totals
            </Typography>
            {renderTotals(expenses, 'Expenses')}
            {renderTotals(paid, 'Income')}
          </Card>
        </Grid>
      </Grid>

      <h1>{loading}</h1>
      <h1>{errorMsg}</h1>
    </Container>
  );
}
