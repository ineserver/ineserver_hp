import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'いねさば CMS',
  description: 'Content Management System for IneServer',
};

export default function AdminPage() {
  return (
    <>
      <Script 
        src="https://identity.netlify.com/v1/netlify-identity-widget.js" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js" 
        strategy="afterInteractive"
      />
      <div id="nc-root"></div>
    </>
  );
}
