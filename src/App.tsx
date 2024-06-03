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

  const renderWebView = useCallback(async () => {
    await runRenderingContext();

    const response = await zoomSdk.drawWebView({
      webviewId: 'MyCamera',
      x: 0,
      y: 0,
      // width: config?.media?.renderTarget?.width,
      width: 1280,
      height: 720,
      // height: config?.media?.renderTarget?.height,
      zIndex: 5,
    });

    await zoomSdk.showNotification({
      // @ts-expect-error error in type-matching
      title: 'Zoom SDK Notification',
      type: 'info',
      message: 'Would you like to join AI Companion?',
    });

    console.log('drawWebview::camera => ', response);
  }, [runRenderingContext]);

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
          'postMessage',
          'runRenderingContext',
          'sendAppInvitationToAllParticipants',
          'getVideoState',
          // events
          'onConnect',
          'onMeeting',
          'onMessage',
          'onMyMediaChange',
          'onParticipantChange',
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

  useEffect(() => {
    if (config) {
      zoomSdk.onMyMediaChange(async (media) => {
        if ('video' in media.media) {
          // VideoMedia
          if (media.media.video?.state) {
            await renderWebView();
          }
        }
      });

      zoomSdk
        .getVideoState()
        .then((state) => {
          if (state.video) {
            renderWebView();
          }
        })
        .catch();
    }
  }, [config, renderWebView]);

  return (
    <>
      {runningContext === 'inMeeting' && (
        <>
          <p className="read-the-docs">Zoom AI Notification</p>
          <button onClick={renderWebView}>Render</button>
          <button onClick={closeRenderingContext}>Clear</button>
        </>
      )}
      {runningContext === 'inCamera' && (
        <div className="glass">
          <span className="name-tag">userContext?.screenName</span>
        </div>
      )}
    </>
  );
};

export default App;
