import type { Metadata } from 'next';
import Footer from '@/components/chrome/Footer';
import Loader from '@/components/chrome/Loader';
import Messages from '@/components/chrome/Messages';
import Nav from '@/components/chrome/Nav';
import ScrollFx from '@/components/chrome/ScrollFx';
import { getSiteSettings } from '@/lib/data';
import Providers from './providers';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  return {
    title: {
      default: `${siteSettings.site_name} — ${siteSettings.tagline}`,
      template: `%s — ${siteSettings.site_name}`,
    },
    description: `${siteSettings.site_name} — an accessible luxury fashion house. ${siteSettings.tagline}.`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await getSiteSettings();

  return (
    <html lang="en">
      <body>
        <Providers>
          <ScrollFx />
          <Loader />
          <Messages />
          <Nav />
          <main>{children}</main>
          <Footer siteSettings={siteSettings} />
        </Providers>
      </body>
    </html>
  );
}
