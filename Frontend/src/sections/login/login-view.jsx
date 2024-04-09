import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import LoadingButton from '@mui/lab/LoadingButton';
// import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import { GoogleLogin } from '@react-oauth/google';

// ----------------------------------------------------------------------

export default function LoginView() {
  // const theme = useTheme();

  const router = useRouter();

  const [credentials, setCredentials] = useState([]);
  const [profile, setProfile] = useState([]);

  useEffect(() => {
    if (credentials.length !== 0) {
      const validateCredentials = async () => {
        try {
          console.log("validate creds here")
          await fetch(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credentials.credential}`
          )
          .then(res => res.json())
          .then((data) => {
            console.log(data)
            setProfile(data);
            setCredentials([]);
          });
        } catch (error) {
          console.log(`validateProfile API: ${error}`);
        }
      };
      validateCredentials();
    }
    if( profile.length !== 0 ) {
      const validateProfile = async () => {
        try {
          await fetch(
            `${import.meta.env.VITE_MIDDLEWARE_URL}/users/verify-tenant?email=${profile.email}`
          )
          .then(res => res.json())
          .then((data) => {
            console.log(data);
            if( data.uuid ) {
              console.log(`/tenant/${data.uuid}/`)
              router.replace(`/tenant/${data.uuid}/`)
            } else {
              console.log("USER NOT VALID!");
            }
            setProfile([]);
          });
        } catch (error) {
          console.log(`validateProfile API: ${error}`);
        }
      };
      validateProfile();
    }
  }, [credentials, profile, router]);

  const responseMessage = (response) => {
    console.log(response);
    setCredentials(response);
  };
  const errorMessage = (error) => {
    console.log(`error: ${error}`);
  };

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

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
        </Card>
      </Stack>
    </Box>
  );
}
