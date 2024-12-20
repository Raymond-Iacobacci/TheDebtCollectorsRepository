import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { useSearchParams } from "react-router-dom";
import { useRouter, usePathname } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import Scrollbar from 'src/components/scrollbar';

import { NAV } from '../config-layout';
import navConfig from './config-navigation';

// ----------------------------------------------------------------------

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const uuid = pathname.split('/')[3];

  const [name, setName] = useState("");

  const upLg = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const getUserAttributes = async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_MIDDLEWARE_URL}/user/profile-info/get-attributes?user-id=${uuid}`
        )
        .then(res => res.json())
        .then((data) => {
          setName(`${data.firstName} ${data.lastName}`)
        });
      } catch (error) {
        console.log(`get-attributes API: ${error}`);
      }
    };
    getUserAttributes();
  })

  const accessMenus = (item) => {
    if( item.access === 'all') {
      return <NavItem key={item.title} item={item} />
    }
     if(pathname.split('/')[2] === 'manager' && item.access === 'manager') {
      return <NavItem key={item.title} item={item} />
    }
     if(pathname.split('/')[2] === 'tenant' && item.access === 'tenant') {
      return <NavItem key={item.title} item={item} />
    }  
    return <br/>
  };

  const renderAccount = (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <Avatar src='/assets/images/avatars/avatar_23.jpg' alt="photoURL" />

      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2">{name}</Typography>
      </Box>
    </Box>
  );

  const renderMenu = (access) => (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
      {navConfig(access).map((item) => (
        accessMenus(item)
      ))}
    </Stack>
  ); 

  const renderLogo = (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >

      <Box sx={{ ml: 2 }}>
        <Typography align="justify" variant="h6">Property Management Suite</Typography>
      </Box>
    </Box>
  );

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      
      {renderLogo}

      {renderAccount}

      {pathname.includes('/manager') ? renderMenu('manager') : renderMenu('tenant')}
    </Scrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.WIDTH },
      }}
    >
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.WIDTH,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item }) {
  const pathname = usePathname();
  const router = useRouter();
  const uuid = pathname.split('/')[3];

  const [searchParams ] = useSearchParams();
  const token = searchParams.get("session");

  const active = (`/dashboard/manager/${uuid}/${item.path}/` === pathname) || (`/dashboard/tenant/${uuid}/${item.path}/` === pathname) || (item.path.split('/')[1] === pathname.split('/')[4]);

  const handleItemClick = () =>{
    const isManager = pathname.search("/manager");
    if( isManager !== -1 ) {
      router.replace(`/dashboard/manager/${uuid}${item.path}?session=${token}`)
    } else {
      router.replace(`/dashboard/tenant/${uuid}${item.path}?session=${token}`)
    }
  }

  return (
    <ListItemButton
      onClick={handleItemClick}
      sx={{
        minHeight: 44,
        borderRadius: 0.75,
        typography: 'body2',
        color: 'text.secondary',
        textTransform: 'capitalize',
        fontWeight: 'fontWeightMedium',
        ...(active && {
          color: 'primary.main',
          fontWeight: 'fontWeightSemiBold',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
          },
        }),
      }}
    >
      <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
        {item.icon}
      </Box>

      <Box component="span">{item.title} </Box>
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
};
