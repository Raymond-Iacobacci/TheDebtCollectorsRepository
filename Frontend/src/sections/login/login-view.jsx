import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import LoadingButton from '@mui/lab/LoadingButton';
// import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import Button from '@mui/material/Button';

import { useGoogleLogin } from '@react-oauth/google';

// ----------------------------------------------------------------------

export default function LoginView() {
  // const theme = useTheme();

  const router = useRouter();

  const [newToken, setToken] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [profile, setProfile] = useState([]);
  const [loginType, setLoginType] = useState(null);

  useEffect(() => {
    if (credentials.length !== 0) {
      const validateCredentials = async () => {
        try {
          await fetch(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentials.access_token}`
          )
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              setProfile(data);
              setToken(credentials.access_token);
              setCredentials([]);
            });
        } catch (error) {
          console.log(`validateProfile API: ${error}`);
        }
      };
      validateCredentials();
    }
    if (profile.length !== 0) {
      const validateProfile = async () => {
        try {
          await fetch(
            `${import.meta.env.VITE_MIDDLEWARE_URL}/users/login-${loginType.toLowerCase()}?email=${
              profile.email
            }`, {
              method: 'PUT',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                token: newToken
              })
            })
            .then((res) => res.json())
            .then((data) => {
              const { uuid } = data;
              if (uuid) {
                console.log(uuid);
                router.push(`/dashboard/${loginType.toLowerCase()}/${uuid}/main?session=${newToken}`);
              } else {
                router.replace('/404')
              }
              setProfile([]);
            });
        } catch (error) {
          console.log(`validateProfile API: ${error}`);
        }
      };
      validateProfile();
    }
  }, [credentials, profile, router, loginType, newToken]);

  const handleManagerLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setCredentials(codeResponse);
      setLoginType('Manager');
    },
    onError: (error) => console.log('Manager Login Failed:', error),
  });

  const handleTenantLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setCredentials(codeResponse);
      setLoginType('Tenant');
    },
    onError: (error) => console.log('Tenant Login Failed:', error),
  });

  return (
    <Box
      sx={{
        ...bgGradient({
          // color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ height: 1 }}
      >
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Stack
            direction="row"
            spacing={5}
            alignItems="center"
            justifyContent="center"
            sx={{ height: 1 }}
          >
            <Button variant="contained" color="inherit" onClick={handleManagerLogin}>
              Manager login
            </Button>
            <Button variant="contained" color="inherit" onClick={handleTenantLogin}>
              Tenant login
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
