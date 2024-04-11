import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import Button from '@mui/material/Button';

import Logo from 'src/components/logo';
import { useGoogleLogin } from '@react-oauth/google';

// ----------------------------------------------------------------------

export default function LoginView() {
  const theme = useTheme();

  const router = useRouter();

  const [credentials, setCredentials] = useState([]);
  const [profile, setProfile] = useState([]);
  const [loginType, setLoginType] = useState(null);

  useEffect(() => {
    if (credentials.length !== 0 && profile.length !== 0) {
      const validateCredentials = async () => {
        try {
          console.log('validate creds here');
          const userInfoResponse = await fetch(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentials.access_token}`
          );
          const userData = await userInfoResponse.json();
          console.log(userData);
          setProfile(userData);
          setCredentials([]);
        } catch (error) {
          console.log(`validateProfile API: ${error}`);
        }
      };

      const validateProfile = async () => {
        try {
          let verificationUrl;
          if (loginType === 'Manager') {
            verificationUrl = `${import.meta.env.VITE_MIDDLEWARE_URL}/auth/verify-manager?email=${profile.email}`;
          } else if (loginType === 'Tenant') {
            verificationUrl = `${import.meta.env.VITE_MIDDLEWARE_URL}/auth/verify-tenant?email=${profile.email}`;
          }
          const response = await fetch(verificationUrl);
          const data = await response.json();
          console.log(data);
          if (data.uuid) {
            router.replace(`/${loginType.toLowerCase()}/${data.uuid}/`);
          } else {
            console.log(`Invalid ${loginType} User!`);
          }
          setProfile([]);
        } catch (error) {
          console.log(`validateProfile API: ${error}`);
        }
      };

      validateCredentials();
      if (profile.length !== 0) {
        validateProfile();
      }
    }
  }, [credentials, profile, router, loginType]);

  const handleManagerLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Manager Login:', codeResponse);
      setCredentials(codeResponse);
      setLoginType('Manager');
    },
    onError: (error) => console.log('Manager Login Failed:', error),
  });

  const handleTenantLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Tenant Login:', codeResponse);
      setCredentials(codeResponse);
      setLoginType('Tenant');
    },
    onError: (error) => console.log('Tenant Login Failed:', error),
  });

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
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Button variant="contained" color="inherit" onClick={handleManagerLogin}>
            Manager login
          </Button>
          <Button variant="contained" color="inherit" onClick={handleTenantLogin}>
            Tenant login
          </Button>
        </Card>
      </Stack>
    </Box>
  );
}
