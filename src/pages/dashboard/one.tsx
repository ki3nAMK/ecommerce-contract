import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import EcommerceHomeView from '../products/ProductHome';

// ----------------------------------------------------------------------

const metadata = { title: `Ecommerce | home page - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EcommerceHomeView />
    </>
  );
}
