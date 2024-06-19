import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from 'react';

export interface DevToolContextProps {
  isDev: boolean;
}

export const DevToolContext = createContext({} as DevToolContextProps);

export const DevToolContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isDev, setIsDev] = useState<boolean>(true);

  useEffect(() => {
    if (window.location.host === 'localhost') {
      setIsDev(true);
    }
  }, []);

  return (
    <DevToolContext.Provider value={{ isDev }}>
      {children}
    </DevToolContext.Provider>
  );
};
