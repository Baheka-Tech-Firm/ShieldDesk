import { useState, useRef, useEffect } from 'react';
import { createIntersectionObserver, createImageLoader } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect fill='%23f0f0f0' width='300' height='200'/%3E%3C/svg%3E",
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = createIntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (observer) {
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!isInView) return;

    createImageLoader(src)
      .then(() => {
        setIsLoaded(true);
        onLoad?.();
      })
      .catch(() => {
        setError(true);
        onError?.();
      });
  }, [isInView, src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={isLoaded && !error ? src : placeholder}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-75',
        className
      )}
      loading="lazy"
    />
  );
}