// import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';


// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
    access: 'all'
  },
  {
    title: 'requests',
    path: '/requests',
    icon: icon('ic_user'),
    access: 'all'
  },
  {
    title: 'Tenants',
    path: '/list-tenants',
    icon: icon('ic_lock'),
    access: 'manager',
  },
  {
    title: 'Payment',
    path: '/payments',
    icon: icon('ic_lock'),
    access: 'tenant',
  },
  // {
  //   title: 'notifications',
  //   path: '/notifications',
  //   icon: <Iconify width={24} icon="solar:bell-bing-bold-duotone" />,
  // },
  // {
  //   title: 'product',
  //   path: '/products',
  //   icon: icon('ic_cart'),
  // },
  // {
  //   title: 'blog',
  //   path: '/blog',
  //   icon: icon('ic_blog'),
  // },
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: icon('ic_lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
