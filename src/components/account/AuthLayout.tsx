// Split-screen layout for sign in / create account: an editorial image on
// the left (the first homepage banner, or the FEXO mark when none is set)
// and the form on the right.

import { getBanners } from '@/lib/data';

export default async function AuthLayout({
  caption,
  subcaption,
  children,
}: {
  caption: string;
  subcaption: string;
  children: React.ReactNode;
}) {
  const banners = await getBanners().catch(() => []);
  const image = banners.find((b) => b.image)?.image ?? null;

  return (
    <div className="fx-auth">
      <div className="fx-auth-visual" aria-hidden>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" />
        ) : (
          <div className="fx-auth-logo-fallback">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fexo-logo.jpg" alt="" />
          </div>
        )}
        <div className="fx-auth-caption">
          <h2 className="fx-serif">{caption}</h2>
          <p>{subcaption}</p>
        </div>
      </div>
      <div className="fx-auth-form-side">
        <div className="fx-auth-card">
          <div className="fx-auth-brand">
            <div className="word">FEXO</div>
            <div className="sub">Live in fashion</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
