import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';
import { bgGradient } from 'src/theme/css';

import { useGoogleLogin } from '@react-oauth/google';

import { verifyToken, verifyProfile } from './login-specifics';

// ----------------------------------------------------------------------

export default function LoginView() {
  const router = useRouter();

  const [newToken, setToken] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [profile, setProfile] = useState([]);
  const [loginType, setLoginType] = useState(null);

  useEffect(() => {
    const validateCredentials = async () => {
      try {
        await verifyToken(credentials).then((data) => {
          setProfile(data);
          setToken(credentials.access_token);
          setCredentials([]);
        });
      } catch (error) {
        console.log(`validateCredentials API: ${error}`);
      }
    };
    const validateProfile = async () => {
      try {
        await verifyProfile(loginType.toLowerCase(), profile.email, newToken).then((data) => {
          const { uuid } = data;
          if (data) {
            router.push(
              `/dashboard/${loginType.toLowerCase()}/${uuid}/${
                loginType === 'Manager' ? 'main' : 'announcements'
              }?session=${newToken}`
            );
          } else {
            router.replace('/404');
          }
          setProfile([]);
        });
      } catch (error) {
        console.log(`validateProfile API: ${error}`);
      }
    };

    if (credentials.length !== 0) {
      validateCredentials();
    }
    if (profile.length !== 0) {
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
            <Button data-testid="manager-login" variant="contained" color="inherit" onClick={handleManagerLogin}>
              Manager login
            </Button>
            <Button data-testid="tenant-login" variant="contained" color="inherit" onClick={handleTenantLogin}>
              Tenant login
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
