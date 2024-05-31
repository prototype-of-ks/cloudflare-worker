import {
  RunningContext,
  ConfigResponse,
  GetUserContextResponse,
} from '@zoom/appssdk';
import zoomSdk from '@zoom/appssdk';
import { useCallback, useEffect, useState } from 'react';

export function useInit() {
  const [config, setConfig] = useState<ConfigResponse>();
  const [runningContext, setRunningContext] = useState<RunningContext>();
  const [userContext, setUserContext] = useState<GetUserContextResponse>();

  const init = useCallback(async () => {
    try {
      const { context } = await zoomSdk.getRunningContext();
      const userContext = await zoomSdk.getUserContext();

      setRunningContext(context);
      setUserContext(userContext);
    } catch (e) {
      console.error(JSON.parse(String(e)));
    }
  }, []);

  useEffect(() => {
    (async () => {
      const config = await zoomSdk.config({
        capabilities: [
          'getRunningContext',
          'getAppContext',
          'closeRenderingContext',
          'connect',
          'drawParticipant',
          'getMeetingUUID',
          'onMyMediaChange',
          'onParticipantChange',
          'postMessage',
          'runRenderingContext',
          'sendAppInvitationToAllParticipants',
          'drawWebView',
          'onRunningContextChange',
          //   @ts-expect-error Property 'onRenderedAppOpened' does not exist on type 'Capabilities'.
          'onRenderedAppOpened',
          'getUserContext',
          'setVideoMirrorEffect',
        ],
      });
      setConfig(config);

      const context = await zoomSdk.getAppContext();
      await init();

      console.log('context => ', context);
    })();
  }, [init]);

  return {
    runningContext,
    config,
    zoomSdk,
    userContext,
    setRunningContext,
  };
}
