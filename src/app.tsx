import 'src/global.css';

// ----------------------------------------------------------------------

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

import { CartProvider } from './states/carts';
import { ProductProvider } from './states/products';
import { NotifyProvider } from './states/socket/seller';
import { LocalizationProvider } from './utils/localization';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();
  const queryClient = new QueryClient();

  return (
    <LocalizationProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotifyProvider>
            <ProductProvider>
              <CartProvider>
                <SettingsProvider settings={defaultSettings}>
                  <ThemeProvider>
                    <MotionLazy>
                      <ProgressBar />
                      <SettingsDrawer />
                      <Router />
                    </MotionLazy>
                  </ThemeProvider>
                </SettingsProvider>
              </CartProvider>
            </ProductProvider>
          </NotifyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </LocalizationProvider>
  );
}
