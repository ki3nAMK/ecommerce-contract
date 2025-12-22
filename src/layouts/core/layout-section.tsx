import type { Theme, SxProps, CSSObject } from '@mui/material/styles';

import { useTheme } from '@mui/material/styles';
// ----------------------------------------------------------------------
import Grid2 from '@mui/material/Unstable_Grid2';
import GlobalStyles from '@mui/material/GlobalStyles';
import {
  Twitter,
  YouTube,
  Facebook,
  Instagram,
} from '@mui/icons-material';
import {
  Box,
  Link,
  Stack,
  Button,
  Divider,
  Container,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { layoutClasses } from '../classes';

export type LayoutSectionProps = {
  sx?: SxProps<Theme>;
  cssVars?: CSSObject;
  children?: React.ReactNode;
  footerSection?: React.ReactNode;
  headerSection?: React.ReactNode;
  sidebarSection?: React.ReactNode;
};

export function LayoutSection({
  sx,
  cssVars,
  children,
  footerSection,
  headerSection,
  sidebarSection,
}: LayoutSectionProps) {
  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        body: {
          '--layout-nav-zIndex': 1101,
          '--layout-nav-mobile-width': '320px',
          '--layout-header-blur': '8px',
          '--layout-header-zIndex': 1100,
          '--layout-header-mobile-height': '64px',
          '--layout-header-desktop-height': '72px',
          ...cssVars,
        },
      }}
    />
  );

  return (
    <>
      {inputGlobalStyles}

      <Box id="root__layout" className={layoutClasses.root} sx={sx}>
        {sidebarSection ? (
          <>
            {sidebarSection}
            <Box
              display="flex"
              flex="1 1 auto"
              flexDirection="column"
              className={layoutClasses.hasSidebar}
            >
              {headerSection}
              {children}
              {footerSection}
            </Box>
          </>
        ) : (
          <>
            <AnnouncementBar />
            {headerSection}
            {children}
            {footerSection}
            <Footer />
          </>
        )}
      </Box>
    </>
  );
}

const AnnouncementBar = () => {
  const theme = useTheme();

  const message = (
    <Typography
      variant="body2"
      component="span"
      sx={{
        fontWeight: 600,
        mx: 4, // khoảng cách giữa các thông báo
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      <Link href="#" underline="none" color="inherit" sx={{ '&:hover': { color: theme.palette.primary.main } }}>
        Free Shipping on orders over $50
      </Link>{' '}
      •{' '}
      <Link href="#" underline="none" color="inherit" sx={{ '&:hover': { color: theme.palette.primary.main } }}>
        Summer Sale 2025: Up to 70% OFF
      </Link>{' '}
      •{' '}
      <Link href="#" underline="none" color="inherit" sx={{ '&:hover': { color: theme.palette.primary.main } }}>
        New Arrivals Every Week
      </Link>
    </Typography>
  );

  return (
    <Box
      sx={{
        bgcolor: '#e0e0e0',
        color: '#212121',
        py: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <Box
        sx={{
          display: 'inline-block',
          animation: 'marquee 12s linear infinite',
          '@keyframes marquee': {
            '0%': { transform: 'translateX(0%)' },
            '100%': { transform: 'translateX(-50%)' },
          },
        }}
      >
        {message}
        {message}
        {message}
        {message}
        {message}
        {message}
        {message}
        {message}
      </Box>
    </Box>
  );
};

const Footer = () => (
    <Box
      sx={{
        bgcolor: '#111',
        color: '#aaa',
        pt: 8,
        pb: 4,
        mt: 12,
      }}
    >
      <Container maxWidth="lg">
        <Grid2 container spacing={4}>
          {/* Cột 1: Logo & Description */}
          <Grid2 xs={12} md={3}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: 2,
                letterSpacing: '0.5px',
              }}
            >
              SHOEZ
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              Your ultimate destination for premium sneakers and streetwear.
              Quality, style, and comfort in every step.
            </Typography>
          </Grid2>

          {/* Cột 2: Quick Links */}
          <Grid2 xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {['Home', 'Shop', 'New Arrivals', 'Sale', 'About Us'].map((item) => (
                <Link key={item} href="#" underline="hover" color="inherit" sx={{ fontSize: '0.9rem' }}>
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid2>

          {/* Cột 3: Customer Care */}
          <Grid2 xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
              Customer Care
            </Typography>
            <Stack spacing={1}>
              {['Contact Us', 'Shipping Info', 'Returns', 'Size Guide', 'FAQs'].map((item) => (
                <Link key={item} href="#" underline="hover" color="inherit" sx={{ fontSize: '0.9rem' }}>
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid2>

          {/* Cột 4: Follow Us */}
          <Grid2 xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
              Follow Us
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" sx={{ color: '#aaa', '&:hover': { color: 'white' } }}>
                <Facebook />
              </IconButton>
              <IconButton size="small" sx={{ color: '#aaa', '&:hover': { color: 'white' } }}>
                <Instagram />
              </IconButton>
              <IconButton size="small" sx={{ color: '#aaa', '&:hover': { color: 'white' } }}>
                <Twitter />
              </IconButton>
              <IconButton size="small" sx={{ color: '#aaa', '&:hover': { color: 'white' } }}>
                <YouTube />
              </IconButton>
            </Stack>
          </Grid2>

          {/* Cột 5: Newsletter */}
          <Grid2 xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
              Stay Updated
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Subscribe to get exclusive offers and new drops!
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                placeholder="Your email"
                variant="outlined"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#222',
                    color: '#ccc',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'success.main',
                  textTransform: 'none',
                  px: 2,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'success.dark' },
                }}
              >
                Subscribe
              </Button>
            </Stack>
          </Grid2>
        </Grid2>

        <Divider sx={{ bgcolor: '#333', my: 4 }} />

        {/* Bottom Bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="#666">
            © 2025 SHOEZ. All rights reserved.
          </Typography>

        </Stack>
      </Container>
    </Box>
  );

export default Footer;