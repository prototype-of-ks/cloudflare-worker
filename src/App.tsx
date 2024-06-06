import zoomSdk, {
  ConfigResponse,
  RunningContext,
  GetUserContextResponse,
} from '@zoom/appssdk';
import { useEffect, useState, useCallback } from 'react';
import { useDev } from './hooks/useDev';
import { useTimezone } from './hooks/useTimezone';
import ImmersiveMode from './components/ImmersiveMode';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import './App.css';

const App: React.FC = () => {
  const { localTime, timeZone } = useTimezone();
  const { isDev } = useDev();
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

  const renderCameraModeWebview = useCallback(async () => {
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

  const renderImmersiveModeWebview = useCallback(async () => {
    try {
      await closeRenderingContext();
    } catch (e) {
      console.error(e);
    } finally {
      const response = await zoomSdk.runRenderingContext({
        view: 'immersive',
      });
      console.log('renderImmersiveApp::Immersive => ', response);
    }
  }, [closeRenderingContext]);

  const showNotification = useCallback(async () => {
    await zoomSdk.showNotification({
      // @ts-expect-error error in type-matching
      title: 'Zoom SDK Notification',
      type: 'info',
      message: 'Would you like to join AI Companion?',
    });
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
  }, [isDev, config, init]);

  useEffect(() => {
    if (config) console.log('config => ', config);
    if (runningContext) console.log('runningContext => ', runningContext);
    if (userContext) console.log('userContext => ', userContext);
  }, [config, runningContext, userContext]);

  return (
    <>
      {(runningContext === 'inMeeting' || isDev) && (
        <>
          <h3 className="text-[24px] font-bold my-4">Zoom App</h3>
          <div className="flex flex-col gap-4">
            <Card className="w-[350px] text-left">
              <CardHeader>
                <CardTitle>Camera Mode</CardTitle>
                <CardDescription>Draw Webview in Camera Mode</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={closeRenderingContext}>
                  Clear
                </Button>
                <Button onClick={renderCameraModeWebview}>Render</Button>
              </CardFooter>
            </Card>
            <Card className="w-[350px] text-left">
              <CardHeader>
                <CardTitle>Immersive Mode</CardTitle>
                <CardDescription>
                  Draw Webview in Inmmersive Mode
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={closeRenderingContext}>
                  Clear
                </Button>
                <Button onClick={renderImmersiveModeWebview}>Render</Button>
              </CardFooter>
            </Card>
            <Card className="w-[350px] text-left">
              <CardHeader>
                <CardTitle>Notification</CardTitle>
                <CardDescription>
                  Show Notification in several ways
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col items-start gap-2">
                <Button onClick={showNotification}>
                  Show Notification in Zoom Client
                </Button>
                <Button>Show Notification in Zoom App</Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
      <ImmersiveMode
        runningContext={runningContext}
        userContext={userContext}
      />
      {(runningContext === 'inCamera' || isDev) && (
        <div className="card">
          <div className="gradient-background font-style user-context-wrapper">
            <div className="user-name">{userContext?.screenName}</div>
            <div className="user-role">
              <span>{userContext?.role || 'host'}</span>
              <span className="separator">|</span>
              {/* <span>{userContext?.role}</span> */}
              <span>Manager, Release Engineer 2 </span>
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
              {/* <FontAwesomeIcon icon="record-vinyl" fontSize={16} /> */}
              {/* <span className="context-section">
                <span>🎥</span>
                <span>Recording</span>
              </span> */}
              <span className="context-section">
                {/* <FontAwesomeIcon icon="location-arrow" fontSize={16} /> */}
                <span>📍</span>
                <span>{timeZone}</span>
              </span>
              <span className="context-section">
                {/* <FontAwesomeIcon icon="location-arrow" fontSize={16} /> */}
                <span>|</span>
                <span>Joined at {localTime}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
