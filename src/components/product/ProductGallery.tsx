'use client';

// Main image with hover zoom, thumbnails underneath.

import { useRef, useState } from 'react';
import { primaryImage } from '@/lib/product';
import type { Product } from '@/lib/types';
import { fallbackImage } from './ProductCard';

export default function ProductGallery({ product }: { product: Product }) {
  const images = [...product.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order);
  const [active, setActive] = useState(primaryImage(product)?.image ?? fallbackImage(product.name));
  const imgRef = useRef<HTMLImageElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    img.style.transformOrigin = `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`;
    img.style.transform = 'scale(1.8)';
  };

  return (
    <div>
      <div className="fx-pdp-main" onMouseMove={onMove} onMouseLeave={() => imgRef.current && (imgRef.current.style.transform = 'scale(1)')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={active} alt={product.name} />
      </div>
      {images.length > 1 && (
        <div className="fx-pdp-thumbs">
          {images.slice(0, 5).map((img) => (
            <button key={img.id} type="button" className={active === img.image ? 'fx-on' : undefined} onClick={() => setActive(img.image)} aria-label="Show image" aria-pressed={active === img.image}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
