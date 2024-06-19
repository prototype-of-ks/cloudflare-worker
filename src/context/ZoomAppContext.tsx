import {
  RunningContext,
  ConfigResponse,
  GetUserContextResponse,
} from '@zoom/appssdk';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import zoomSdk from '@zoom/appssdk';
import { useDev } from '@/hooks/useDev';

export interface ZoomAppContextProps {
  config?: ConfigResponse;
  runningContext?: RunningContext;
  userContext?: GetUserContextResponse;
  updateConfig: (config: ConfigResponse) => void;
  updateRunningContext: (context: RunningContext) => void;
  updateUserContext: (context: GetUserContextResponse) => void;
}

export const ZoomAppContext = createContext({} as ZoomAppContextProps);

export const ZoomAppContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { isDev } = useDev();
  const [config, setConfig] = useState<ConfigResponse>();
  const [runningContext, setRunningContext] = useState<RunningContext>();
  const [userContext, setUserContext] = useState<GetUserContextResponse>();

  const updateConfig = useCallback((config: ConfigResponse) => {
    setConfig(config);
  }, []);
  const updateRunningContext = useCallback((context: RunningContext) => {
    setRunningContext(context);
  }, []);
  const updateUserContext = useCallback((context: GetUserContextResponse) => {
    setUserContext(context);
  }, []);

  const init = useCallback(async () => {
    const { context } = await zoomSdk.getRunningContext();
    const userContext = await zoomSdk.getUserContext();

    setUserContext(userContext);
    setRunningContext(context);
  }, []);

  useEffect(() => {
    if (isDev) {
      console.warn('The Zoom Apps SDK is not supported in Dev mode');
      return;
    }
    if (config) return;
    (async () => {
      const config = await zoomSdk.config({
        capabilities: [
          'getRunningContext',
          'getAppContext',
          'clearParticipant',
          'closeRenderingContext',
          'connect',
          'drawParticipant',
          'drawWebView',
          'clearWebView',
          'getMeetingParticipants',
          'getMeetingUUID',
          'getRunningContext',
          'getUserContext',
          'postMessage',
          'runRenderingContext',
          'sendAppInvitationToAllParticipants',
          'setVideoMirrorEffect',
          'getVideoState',
          'getMeetingLanguages',
          'drawImage',
          'clearImage',
          // events
          'onConnect',
          'onMeeting',
          'onMessage',
          'getChatContext',
          'setVideoState',
        ],
      });
      setConfig(config);
      await init();
    })();
  }, [config, isDev, init]);

  return (
    <ZoomAppContext.Provider
      value={{
        updateConfig,
        config,
        runningContext,
        updateRunningContext,
        userContext,
        updateUserContext,
      }}
    >
      {children}
    </ZoomAppContext.Provider>
  );
};
