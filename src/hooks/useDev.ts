import { useState, useEffect } from 'react';

export function useDev() {
  const [isDev, setIsDev] = useState(true);

  useEffect(() => {
    const href = window.location.href;
    setIsDev(href === 'http://localhost:5173/test');
  }, []);

  return {
    isDev,
    setIsDev,
  };
}
