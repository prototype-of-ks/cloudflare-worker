import { useCallback } from 'react';

export function useRequest() {
  const getRemoteIP = useCallback(async () => {
    try {
      const response = await (await fetch('/api/v1/getRemoteIP')).json();
      console.log('Remote IP: ', response);
    } catch (e) {
      console.error('Failing in getting remote IP: ', e);
    }
  }, []);
  
  return {
    getRemoteIP,
  };
}
