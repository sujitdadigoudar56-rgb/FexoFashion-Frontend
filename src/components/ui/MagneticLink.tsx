'use client';

// Ports `.fx-magnetic` from fexo.js — used on the homepage hero CTA.

import Link from 'next/link';
import { useRef } from 'react';

export default function MagneticLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px,${y * 0.35}px)`;
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  };

  return (
    <Link href={href} ref={ref} className={className} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </Link>
  );
}
