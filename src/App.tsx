import zoomSdk, {
  ConfigResponse,
  RunningContext,
  Participant,
  GetUserContextResponse,
} from '@zoom/appssdk';
import { useEffect, useState, useCallback } from 'react';
import './App.css';

const App: React.FC = () => {
  const [config, setConfig] = useState<ConfigResponse>();
  const [runningContext, setRunningContext] = useState<RunningContext>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userContext, setUserContext] = useState<GetUserContextResponse>();

  const init = useCallback(async () => {
    const { context } = await zoomSdk.getRunningContext();
    const { participants } = await zoomSdk.getMeetingParticipants();

    setParticipants(participants);
    setRunningContext(context);
  }, []);

  const closeRenderingContext = useCallback(async () => {
    await zoomSdk.closeRenderingContext();
  }, []);

  const runRenderingContext = useCallback(async () => {
    const userContext = await zoomSdk.getUserContext();
    const response = await zoomSdk.runRenderingContext({
      view: 'camera',
    });

    console.log('userContext => ', userContext);
    console.log('runRenderingContext::camera => ', response);

    setUserContext(userContext);
  }, []);

  const drawWebview = useCallback(async () => {
    await runRenderingContext();

    const response = await zoomSdk.drawWebView({
      webviewId: 'camera',
      x: 0,
      y: 0,
      width: config?.media?.renderTarget?.width,
      height: config?.media?.renderTarget?.height,
      zIndex: 9,
    });

    await zoomSdk.showNotification({
      // @ts-expect-error 111
      title: 'Zoom SDK Notification',
      type: 'info',       
      message: 'Would you like to join AI Companion?'
    });

    console.log('drawWebview::camera => ', response);
  }, [runRenderingContext, config]);

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
          'drawWebView',
          'getMeetingParticipants',
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

  useEffect(() => {
    if (config) console.log('config => ', config);
    if (participants.length !== 0)
      console.log('participants => ', participants);
    if (runningContext) console.log('runningContext => ', runningContext);
    if (userContext) console.log('userContext => ', userContext);
  }, [config, participants, runningContext, userContext]);

  return (
    <>
      {runningContext === 'inMeeting' && (
        <>
          <p className="read-the-docs">Zoom AI Notification</p>
          <button onClick={drawWebview}>Draw Webview</button>
          <button onClick={closeRenderingContext}>Close Webview</button>
        </>
      )}
      {runningContext === 'inCamera' && (
        <div className="glass">
          <span className="name-tag">{userContext?.screenName}</span>  
        </div>
      )}
    </>
  );
};

export default App;
