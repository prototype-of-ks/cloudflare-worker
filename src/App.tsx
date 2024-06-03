import zoomSdk, {
  ConfigResponse,
  RunningContext,
  GetUserContextResponse,
} from '@zoom/appssdk';
import { useEffect, useState, useCallback } from 'react';
import './App.css';

const App: React.FC = () => {
  const [config, setConfig] = useState<ConfigResponse>();
  const [runningContext, setRunningContext] = useState<RunningContext>();
  const [userContext, setUserContext] = useState<GetUserContextResponse>();

  const init = useCallback(async () => {
    const { context } = await zoomSdk.getRunningContext();
    const userContext = await zoomSdk.getUserContext();

    try {
      await zoomSdk.setVideoMirrorEffect({
        mirrorMyVideo: false,
      });
    } catch (e) {
      console.error('Error setting mirror effect: ', e);
    }

    setUserContext(userContext);
    setRunningContext(context);
  }, []);

  const closeRenderingContext = useCallback(async () => {
    await zoomSdk.closeRenderingContext();
  }, []);

  const runRenderingContext = useCallback(async () => {
    const response = await zoomSdk.runRenderingContext({
      view: 'camera',
    });

    console.log('runRenderingContext::camera => ', response);
  }, []);

  const renderWebView = useCallback(async () => {
    if (userContext) {
      await runRenderingContext();

      const response = await zoomSdk.drawWebView({
        webviewId: 'MyCamera',
        x: 0,
        y: 0,
        width: config?.media?.renderTarget?.width,
        height: config?.media?.renderTarget?.height,
        zIndex: 5,
      });

      console.log('drawWebview::userContext => ', userContext);
      console.log('drawWebview::camera => ', response);
    } else {
      console.log('No userContext found. Will not render WebView.');
    }
  }, [
    runRenderingContext,
    config?.media?.renderTarget?.width,
    config?.media?.renderTarget?.height,
    userContext,
  ]);

  const showNotification = useCallback(async () => {
    await zoomSdk.showNotification({
      // @ts-expect-error error in type-matching
      title: 'Zoom SDK Notification',
      type: 'info',
      message: 'Would you like to join AI Companion?',
    });
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
          'drawWebView',
          'getMeetingParticipants',
          'getMeetingUUID',
          'getRunningContext',
          'getUserContext',
          'postMessage',
          'runRenderingContext',
          'sendAppInvitationToAllParticipants',
          'setVideoMirrorEffect',
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
    if (runningContext) console.log('runningContext => ', runningContext);
    if (userContext) console.log('userContext => ', userContext);
  }, [config, runningContext, userContext]);

  return (
    <>
      {runningContext !== 'inMeeting' && (
        <>
          <a className="read-the-docs" onClick={showNotification}>
            Zoom AI Notification
          </a>
          <div className="action-group">
            <button onClick={renderWebView}>Render</button>
            <button onClick={closeRenderingContext}>Clear</button>
          </div>
        </>
      )}
      {runningContext !== 'inCamera' && (
        <div className="card">
          <div className="gradient-background font-style user-context-wrapper">
            <div className="user-name">{userContext?.screenName}</div>
            <div className="user-role">
              <span>Manager, Release Engineer 2 </span>
              <span className="separator">|</span>
              <span>{userContext?.role}</span>
            </div>
            <div className="additional-context-wrapper">
              <span className="context-section">
                {/* <FontAwesomeIcon icon="bullhorn" fontSize={16} /> */}
                <span>📢</span>
                <span>Speaking</span>
              </span>
              <span className="context-section">
                {/* <FontAwesomeIcon icon="robot" fontSize={16} /> */}
                <span>🤖</span>
                <span>AI Companion</span>
              </span>
              <span className="context-section">
                {/* <FontAwesomeIcon icon="record-vinyl" fontSize={16} /> */}
                <span>🎥</span>
                <span>Recording</span>
              </span>
              <span className="context-section">
                {/* <FontAwesomeIcon icon="location-arrow" fontSize={16} /> */}
                <span>📍</span>
                <span>Shanghai</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
