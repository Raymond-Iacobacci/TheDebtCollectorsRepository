import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { usePathname } from 'src/routes/hooks';

import AppTasks from '../components/app-balances';
import AppRequests from '../components/app-requests';
import AppWidgetSummary from '../components/app-widget-summary';

import {
  getNumberTenants,
  getNumberRequests,
  getNumberPayments,
  getTotalOutstandingBalance,
  getListOfOutstandingTenants,
  getListofUnresolvedRequests,
} from '../hooks/summary';

// ----------------------------------------------------------------------

export default function AppView() {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];

  const [numTenants, setNumTenants] = useState({});
  const [numPayments, setNumPayments] = useState({});
  const [numRequests, setNumRequests] = useState({});
  const [totalOutstanding, setTotalOutstanding] = useState({});
  const [outstandingTenants, setOutstandingTenants] = useState([]);
  const [unresolvedReqs, setUnresolvedReqs] = useState([]);

  useEffect(() => {
    const fetchNumTenants = async () => {
      try {
        await getNumberTenants(uuid).then((data) => {
          setNumTenants(data);
        });
      } catch (error) {
        console.log(`NumTenants API: ${error}`);
      }
    };
    const fetchNumPayments = async () => {
      try {
        await getNumberPayments(uuid).then((data) => {
          setNumPayments(data);
        });
      } catch (error) {
        console.log(`NumPayments API: ${error}`);
      }
    };
    const fetchNumRequests = async () => {
      try {
        await getNumberRequests(uuid).then((data) => {
          setNumRequests(data);
        });
      } catch (error) {
        console.log(`NumRequests API: ${error}`);
      }
    };
    const fetchNumBalance = async () => {
      try {
        await getTotalOutstandingBalance(uuid).then((data) => {
          setTotalOutstanding(data);
        });
      } catch (error) {
        console.log(`NumBalance API: ${error}`);
      }
    };
    const fetchListOfOutstandingTenants = async () => {
      try {
        await getListOfOutstandingTenants(uuid).then((data) => {
          setOutstandingTenants(data);
        });
      } catch (error) {
        console.log(`ListOutstanding API: ${error}`);
      }
    };
    const fetchListOfUnresolvedRequests = async () => {
      try {
        await getListofUnresolvedRequests(uuid).then((data) => {
          console.log(data)
          setUnresolvedReqs(data.filter(request => request.status !== "Resolved").slice(0,5));
        });
      } catch (error) {
        console.log(`UnresolvedReqs API: ${error}`);
      }
    };
    fetchNumTenants();
    fetchNumPayments();
    fetchNumRequests();
    fetchNumBalance();
    fetchListOfOutstandingTenants();
    fetchListOfUnresolvedRequests();
  }, [uuid]);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Manager Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Number of Tenants"
            total={numTenants.length !== 0 ? numTenants.numberOfTenants : 0}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Rent Payments"
            total={numPayments.length !== 0 ? numPayments.count : 0}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Unresolved Requests"
            total={numRequests.length !== 0 ? numRequests.count : 0}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Balances"
            total={totalOutstanding.length !== 0 ? totalOutstanding.balance : 0}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={6}>
          <AppTasks title="Outstanding Balances" list={outstandingTenants} />
        </Grid>

        <Grid xs={12} md={6} lg={6}>
          <AppRequests
            title="Unresolved Requests"
            list={unresolvedReqs}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
