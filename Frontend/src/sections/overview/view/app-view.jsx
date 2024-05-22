// import { faker } from '@faker-js/faker';
import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { usePathname } from 'src/routes/hooks';
// import Iconify from 'src/components/iconify';

import AppTasks from '../components/app-tasks';
// import AppNewsUpdate from '../app-news-update';
// import AppOrderTimeline from '../app-order-timeline';
// import AppCurrentVisits from '../app-current-visits';
// import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../components/app-widget-summary';
// import AppTrafficBySite from '../app-traffic-by-site';
// import AppCurrentSubject from '../app-current-subject';
// import AppConversionRates from '../app-conversion-rates';

import { getNumberTenants, getNumberRequests, getNumberPayments, getTotalOutstandingBalance } from '../hooks/summary';

// ----------------------------------------------------------------------

export default function AppView() {

  const pathname = usePathname();
  const uuid = pathname.split('/')[3];

  const [numTenants, setNumTenants] = useState({});
  const [numPayments, setNumPayments ] = useState({});
  const [numRequests, setNumRequests ] = useState({});
  const [totalOutstanding, setTotalOutstanding ] = useState({});

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
        console.log(`NumTenants API: ${error}`);
      }
    };
    const fetchNumRequests = async () => {
      try {
        await getNumberRequests(uuid).then((data) => {
          setNumRequests(data);
        });
      } catch (error) {
        console.log(`NumTenants API: ${error}`);
      }
    };
    const fetchNumBalance = async () => {
      try {
        await getTotalOutstandingBalance(uuid).then((data) => {
          setTotalOutstanding(data);
        });
      } catch (error) {
        console.log(`NumTenants API: ${error}`);
      }
    };
    fetchNumTenants();
    fetchNumPayments();
    fetchNumRequests();
    fetchNumBalance();
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
            total={(numTenants.length !== 0)?numTenants.numberOfTenants:0}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Rent Payments"
            total={(numPayments.length !== 0)?numPayments.count:0}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Requests Pending"
            total={(numRequests.length !== 0)?numRequests.count:0}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Monthly Payments"
            total={(totalOutstanding.length !== 0)?totalOutstanding.totalBalance:0}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        {/* <Grid xs={12} md={6} lg={8}>
          <AppNewsUpdate
            title="Recent Requests"
            list={[...Array(5)].map((_, index) => ({
              id: faker.string.uuid(),
              title: faker.person.jobTitle(),
              description: faker.commerce.productDescription(),
              image: `/assets/images/covers/cover_${index + 1}.jpg`,
              postedAt: faker.date.recent(),
            }))}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Property Info"
            chart={{
              series: [
                { label: 'America', value: 4344 },
                { label: 'Asia', value: 5435 },
                { label: 'Europe', value: 1443 },
                { label: 'Africa', value: 4443 },
              ],
            }}
          />
        </Grid> */}

        <Grid xs={12} md={6} lg={8}>
          <AppTasks
            title="Outstanding Balances"
            list={[
              { id: '1', name: 'Fix sink at unit 102.' },
              { id: '2', name: 'Refund safety deposits.' },
              { id: '3', name: 'Add client A as a tenant to unit 103.' },
              { id: '4', name: 'Email tenant B regarding Request C.' },
              { id: '5', name: 'Email tenant C regarding Request D.' },
            ]}
          />
        </Grid>

        {/* <Grid xs={12} md={6} lg={4}>
          <AppOrderTimeline
            title="Payment Timeline"
            list={[...Array(5)].map((_, index) => ({
              id: faker.string.uuid(),
              title: [
                '1983, orders, $4220',
                '12 Invoices have been paid',
                'Order #37745 from September',
                'New order placed #XF-2356',
                'New order placed #XF-2346',
              ][index],
              type: `order${index + 1}`,
              time: faker.date.past(),
            }))}
          />
        </Grid> */}
        {/* <Grid xs={12} md={6} lg={8}>
          <AppConversionRates
            title="Conversion Rates"
            subheader="(+43%) than last year"
            chart={{
              series: [
                { label: 'Italy', value: 400 },
                { label: 'Japan', value: 430 },
                { label: 'China', value: 448 },
                { label: 'Canada', value: 470 },
                { label: 'France', value: 540 },
                { label: 'Germany', value: 580 },
                { label: 'South Korea', value: 690 },
                { label: 'Netherlands', value: 1100 },
                { label: 'United States', value: 1200 },
                { label: 'United Kingdom', value: 1380 },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={4}>
          <AppCurrentSubject
            title="Current Subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Website Visits"
            subheader="(+43%) than last year"
            chart={{
              labels: [
                '01/01/2003',
                '02/01/2003',
                '03/01/2003',
                '04/01/2003',
                '05/01/2003',
                '06/01/2003',
                '07/01/2003',
                '08/01/2003',
                '09/01/2003',
                '10/01/2003',
                '11/01/2003',
              ],
              series: [
                {
                  name: 'Team A',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: 'Team B',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={4}>
          <AppTrafficBySite
            title="Traffic by Site"
            list={[
              {
                name: 'FaceBook',
                value: 323234,
                icon: <Iconify icon="eva:facebook-fill" color="#1877F2" width={32} />,
              },
              {
                name: 'Google',
                value: 341212,
                icon: <Iconify icon="eva:google-fill" color="#DF3E30" width={32} />,
              },
              {
                name: 'Linkedin',
                value: 411213,
                icon: <Iconify icon="eva:linkedin-fill" color="#006097" width={32} />,
              },
              {
                name: 'Twitter',
                value: 443232,
                icon: <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={32} />,
              },
            ]}
          />
        </Grid> */}
      </Grid>
    </Container>
  );
}
