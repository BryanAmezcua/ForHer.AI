'use client';

import { useState } from 'react';

export function ProductImage({ src, alt, fallbackColor }) {
  const [status, setStatus] = useState('loading');

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden"
      style={{ backgroundColor: fallbackColor || '#252220' }}
    >
      {src && status !== 'error' && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          loading="lazy"
        />
      )}
      {status === 'loading' && src && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}
      {(!src || status === 'error') && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-5xl select-none">&#10022;</span>
        </div>
      )}
    </div>
  );
}
