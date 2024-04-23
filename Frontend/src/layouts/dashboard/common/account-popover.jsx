import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter, usePathname } from 'src/routes/hooks';

import { account } from 'src/_mock/account';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
  },
  {
    label: 'Profile',
    icon: 'eva:person-fill',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {

  const router = useRouter();
  const [open, setOpen] = useState(null);

  const pathname = usePathname();
  const uuid = pathname.split('/')[3];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [logout, setLogout] = useState(false);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
    setLogout(true);
  };

  useEffect( () => {
    if(logout) {
      console.log("logout called")
      const deleteCookie = async () => {
        try {
          await fetch(
            `${import.meta.env.VITE_MIDDLEWARE_URL}/users/remove-token?userID=${uuid}`, {
              method: 'PUT'
            }
          )
          .then((data) => {
            console.log(data);
            router.replace('/');
            setLogout(false);
          });
        } catch (error) {
          console.log(`deleteCookie API: ${error}`);
        }
      };
      deleteCookie();
    }
  }, [logout, uuid, router]);

  useEffect(() => {
    const getUserAttributes = async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_MIDDLEWARE_URL}/users/get-attributes?userID=${uuid}`
        )
        .then(res => res.json())
        .then((data) => {
          setName(`${data.firstName} ${data.lastName}`)
          setEmail(data.email)
          console.log(data);
        });
      } catch (error) {
        console.log(`get-attributes API: ${error}`);
      }
    };
    getUserAttributes();
  })

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={account.photoURL}
          alt={name}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1,
            ml: 0.75,
            width: 200,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {MENU_OPTIONS.map((option) => (
          <MenuItem key={option.label} onClick={handleClose}>
            {option.label}
          </MenuItem>
        ))}

        <Divider sx={{ borderStyle: 'dashed', m: 0 }} />

        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={handleClose}
          sx={{ typography: 'body2', color: 'error.main', py: 1.5 }}
        >
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}
