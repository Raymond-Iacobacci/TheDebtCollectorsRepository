/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';
import { GoogleOAuthProvider } from '@react-oauth/google';



import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <GoogleOAuthProvider clientId="1083214170852-ejlorj7d4ttm1v6gcfc27tknr50jdv1g.apps.googleusercontent.com">
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
