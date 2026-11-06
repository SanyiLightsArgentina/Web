import { useLayoutEffect } from 'react';

const positions = new Map<string, number>();

// Keep positions per catalog URL, including filters and pagination.
export function useCatalogPosition(url: string, ready: boolean) {
  useLayoutEffect(() => {
    if (!ready) return;
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: positions.get(url) ?? 0, behavior: 'instant' });
    const remember = () => positions.set(url, window.scrollY);
    window.addEventListener('scroll', remember, { passive: true });
    return () => {
      remember();
      window.removeEventListener('scroll', remember);
      history.scrollRestoration = previous;
    };
  }, [url, ready]);
}
