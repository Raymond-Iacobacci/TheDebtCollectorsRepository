import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

// ----------------------------------------------------------------------

export default function LoginView() {
  const theme = useTheme();

  const router = useRouter();

  const handleClick = (choice) => {
    router.push(`/login?loginType=${choice}`);
    // router.push('/login')
  };

  const renderForm = (
    <Stack direction="row" spacing={2}>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={(e) => handleClick('manager', e)}
        // onClick={handleClick}
      >
        Manager Login
      </LoadingButton>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={(e) => handleClick('tenant', e)}
        // onClick={handleClick}
      >
        Tenant Login
      </LoadingButton>
    </Stack>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}

/*

import React from 'react';
import { useHistory } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { bgGradient } from 'src/theme/css';

export default function LandingView() {
  const theme = useTheme();
  const history = useHistory();

  const handleClick = (choice) => {
    history.push('/dashboard', { choice });
  };

  const renderForm = (
    <Stack direction="row" spacing={2}>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={() => handleClick('manager')}
      >
        Manager Login
      </LoadingButton>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={() => handleClick('tenant')}
      >
        Tenant Login
      </LoadingButton>
    </Stack>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
*/
