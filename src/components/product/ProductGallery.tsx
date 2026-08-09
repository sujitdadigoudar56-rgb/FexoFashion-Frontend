'use client';

// Ports #fx-zoom-wrap / #fx-main-image / .fx-thumb + the zoom-on-hover and
// thumbnail-swap wiring from fexo.js. (The original also had a 360° drag
// viewer gated on a `data-frames` attribute that no product in this app's
// data ever sets, so it is not reproduced here.)

import { useRef, useState } from 'react';
import { primaryImage } from '@/lib/product';
import type { Product } from '@/lib/types';

export default function ProductGallery({ product }: { product: Product }) {
  const primary = primaryImage(product);
  const [active, setActive] = useState(primary?.image ?? '');
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    const rect = wrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(1.8)';
  };

  const onMouseLeave = () => {
    if (imgRef.current) imgRef.current.style.transform = 'scale(1)';
  };

  return (
    <div>
      <div
        id="fx-zoom-wrap"
        ref={wrapRef}
        style={{ overflow: 'hidden', aspectRatio: '3/4', background: 'var(--fx-surface)' }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <img
          id="fx-main-image"
          ref={imgRef}
          src={active}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s ease' }}
          alt={product.name}
        />
      </div>
      {product.images.length > 1 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {product.images.map((img) => (
            <img
              key={img.id}
              className={`fx-thumb${active === img.image ? ' fx-thumb-active' : ''}`}
              src={img.image}
              alt={product.name}
              onClick={() => setActive(img.image)}
              style={{
                width: 74,
                height: 92,
                objectFit: 'cover',
                cursor: 'pointer',
                border: '1px solid var(--fx-line-soft)',
                opacity: active === img.image ? 1 : 0.7,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
