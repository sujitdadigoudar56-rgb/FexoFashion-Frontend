import type { Metadata } from 'next';
import Footer from '@/components/chrome/Footer';
import Loader from '@/components/chrome/Loader';
import Messages from '@/components/chrome/Messages';
import Nav from '@/components/chrome/Nav';
import ScrollFx from '@/components/chrome/ScrollFx';
import { getSiteSettings } from '@/lib/data';
import Providers from './providers';
import './globals.css';
import './storefront.css';

// Every page reads live data from the Django API (site settings at least), so render on request
// instead of at build time; otherwise `next build` hangs whenever the API is asleep or down.
// API responses are still cached via fetch's `revalidate` in lib/data.ts.
export const dynamic = 'force-dynamic';

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
    // Browser extensions (password managers, Grammarly…) add attributes to
    // <html>/<body> before React loads; ignore those, not real mismatches.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
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
