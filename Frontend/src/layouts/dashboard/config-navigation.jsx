import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = (access) => {
  if (access === 'tenant') {
    return [
      {
        title: 'dashboard',
        path: '/main',
        icon: icon('ic_user'),
        access: 'all',
      },
      {
        title: 'requests',
        path: '/requests',
        icon: icon('ic_blog'),
        access: 'all',
      },
      // {
      //   title: 'Make Payments',
      //   path: '/payments',
      //   icon: icon('ic_cart'),
      //   access: 'tenant',
      // },
      {
        title: 'Payments',
        path: '/payments-history',
        icon: icon('ic_cart'),
        access: 'tenant',
      },
    ];
  }
  if (access === 'manager') {
    return [
      {
        title: 'dashboard',
        path: '/main',
        icon: icon('ic_user'),
        access: 'all',
      },
      {
        title: 'requests',
        path: '/requests',
        icon: icon('ic_blog'),
        access: 'all',
      },
      {
        title: 'Tenants',
        path: '/list-tenants',
        icon: icon('ic_lock'),
        access: 'manager',
      },
      {
        title: 'Expenses',
        path: '/expenses',
        icon: icon('ic_cart'),
        access: 'manager',
      },
      // {
      //   title: 'Pending Payments',
      //   path: '/all-payments-view',
      //   icon: icon('ic_cart'),
      //   access: 'manager',
      // },
      {
        title: 'Reports',
        path: '/report',
        icon: icon('ic_analytics'),
        access: 'manager',
      },
    ];
  }
  return [];
};

export default navConfig;
