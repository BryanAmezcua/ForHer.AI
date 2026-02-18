'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function ProductImage({ src, imageUrls, alt, fallbackColor }) {
  const isGallery = imageUrls && imageUrls.length >= 2;

  if (isGallery) {
    return <Gallery images={imageUrls} alt={alt} fallbackColor={fallbackColor} />;
  }

  return <SingleImage src={src} alt={alt} fallbackColor={fallbackColor} />;
}

/* ── Single image (original behavior) ── */
function SingleImage({ src, alt, fallbackColor }) {
  const [status, setStatus] = useState('loading');

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden"
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
      {/* Hover shimmer sweep */}
      <div className="absolute inset-0 product-image-shimmer pointer-events-none" />
    </div>
  );
}

/* ── Multi-image gallery ── */
function Gallery({ images, alt, fallbackColor }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedSet, setLoadedSet] = useState(new Set());
  const [errorSet, setErrorSet] = useState(new Set());
  const [isHovered, setIsHovered] = useState(false);

  // Touch handling
  const touchStartX = useRef(null);

  const goTo = useCallback((idx) => {
    setCurrentIndex(Math.max(0, Math.min(idx, images.length - 1)));
  }, [images.length]);

  const goPrev = useCallback((e) => {
    e.stopPropagation();
    setCurrentIndex(i => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback((e) => {
    e.stopPropagation();
    setCurrentIndex(i => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) >= 50) {
      if (delta < 0) {
        setCurrentIndex(i => (i < images.length - 1 ? i + 1 : 0));
      } else {
        setCurrentIndex(i => (i > 0 ? i - 1 : images.length - 1));
      }
    }
  }, [images.length]);

  // Preload adjacent images
  useEffect(() => {
    const toPreload = [
      images[(currentIndex + 1) % images.length],
      images[(currentIndex - 1 + images.length) % images.length],
    ];
    toPreload.forEach(url => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [currentIndex, images]);

  const markLoaded = useCallback((idx) => {
    setLoadedSet(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  const markError = useCallback((idx) => {
    setErrorSet(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  const firstLoaded = loadedSet.has(0);
  const firstError = errorSet.has(0);

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden touch-pan-y"
      style={{ backgroundColor: fallbackColor || '#252220' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Image strip */}
      <div
        className="absolute inset-0 flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((url, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 relative">
            {url && !errorSet.has(idx) && (
              <img
                src={url}
                alt={`${alt} — image ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  loadedSet.has(idx) ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => markLoaded(idx)}
                onError={() => markError(idx)}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            )}
            {/* Error fallback per slide */}
            {(!url || errorSet.has(idx)) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 text-5xl select-none">&#10022;</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading shimmer (only for first image) */}
      {!firstLoaded && !firstError && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}

      {/* Error fallback (only if first image fails) */}
      {firstError && currentIndex === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-5xl select-none">&#10022;</span>
        </div>
      )}

      {/* Chevron nav — desktop hover only */}
      <button
        onClick={goPrev}
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-black/30 text-white/50 hover:text-white/80 hover:bg-black/50 transition-opacity duration-200 cursor-pointer ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } pointer-events-auto`}
        aria-label="Previous image"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-black/30 text-white/50 hover:text-white/80 hover:bg-black/50 transition-opacity duration-200 cursor-pointer ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } pointer-events-auto`}
        aria-label="Next image"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>

      {/* Hover shimmer sweep */}
      <div className="absolute inset-0 product-image-shimmer pointer-events-none" />

      {/* Dot indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0 pb-1">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); goTo(idx); }}
            className="relative w-8 h-8 flex items-center justify-center cursor-pointer"
            aria-label={`Go to image ${idx + 1}`}
          >
            <span className={`block w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              idx === currentIndex ? 'bg-white/80' : 'bg-white/30'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}
