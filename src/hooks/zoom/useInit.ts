import { Participant, RunningContext, ConfigResponse, GetUserContextResponse } from '@zoom/appssdk';
import zoomSdk from '@zoom/appssdk';
import { useCallback, useEffect, useState } from 'react';

export function useInit() {
  const [config, setConfig] = useState<ConfigResponse>();
  const [runningContext, setRunningContext] = useState<RunningContext>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userContext, setUserContext] = useState<GetUserContextResponse>();

  const init = useCallback(async () => {
    try {
      const { context } = await zoomSdk.getRunningContext();
      setRunningContext(context);
      const { participants } = await zoomSdk.getMeetingParticipants();
      setParticipants(participants);
      const userContext = await zoomSdk.getUserContext();
      setUserContext(userContext);
    } catch (e) {
      console.error(JSON.parse(String(e)));
    }
  }, []);

  useEffect(() => {
    if (config) return;
    (async () => {
      const config = await zoomSdk.config({
        capabilities: [
          'getRunningContext',
          'getAppContext',
          'clearImage',
          'clearParticipant',
          'closeRenderingContext',
          'connect',
          'drawImage',
          'drawParticipant',
          'getMeetingUUID',
          'getRunningContext',
          'getUserContext',
          'onConnect',
          'onMeeting',
          'onMessage',
          'onMyMediaChange',
          'onParticipantChange',
          'postMessage',
          'runRenderingContext',
          'sendAppInvitationToAllParticipants',
        ],
      });
      setConfig(config);

      const context = await zoomSdk.getAppContext();
      await init();

      console.log('context => ', context);
    })();
  }, [config, init]);

  return {
    runningContext,
    config,
    participants,
    zoomSdk,
    userContext,
  };
}
