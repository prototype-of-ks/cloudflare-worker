import { useState, useEffect } from 'react';

export function useDev() {
  const [isDev, setIsDev] = useState(true);

  useEffect(() => {
    const href = window.location.href;
    // const protocol = window.location.protocol;
    // const hostname = window.location.hostname;
    // const port = window.location.port;
    setIsDev(href === 'http://localhost:5173/');
  }, []);

  return {
    isDev,
    setIsDev,
  };
}
