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
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// type Media = {
//   audio?: {
//     state?: boolean;
//   };
//   video?: {
//     state?: boolean;
//   };
// };

const App: React.FC = () => {
  const { localTime, timeZone } = useTimezone();
  const { isDev } = useDev();
  const [config, setConfig] = useState<ConfigResponse>();
  const [runningContext, setRunningContext] = useState<RunningContext>();
  const [userContext, setUserContext] = useState<GetUserContextResponse>();

  const init = useCallback(async () => {
    const { context } = await zoomSdk.getRunningContext();
    const userContext = await zoomSdk.getUserContext();

    setUserContext(userContext);
    setRunningContext(context);
  }, []);

  const closeRenderingContext = useCallback(async () => {
    zoomSdk.closeRenderingContext().catch(console.error);
  }, []);

  const renderCameraModeWebview = useCallback(async () => {
    // if (userContext) {
    const drawCameraContext = await zoomSdk.runRenderingContext({
      view: 'camera',
    });
    console.log('drawCameraContext => ', drawCameraContext);

    const drawWebviewResponse = await zoomSdk.drawWebView({
      webviewId: Math.random().toString(36).substring(7),
      x: 0,
      y: 0,
      width: config?.media?.renderTarget?.width,
      height: config?.media?.renderTarget?.height,
      zIndex: 5,
    });

    console.log('drawWebviewResponse => ', drawWebviewResponse);
  }, [config]);

  const renderImmersiveModeWebview = useCallback(async () => {
    zoomSdk
      .runRenderingContext({
        view: 'immersive',
      })
      .catch((e) =>
        console.error('runRenderingContext::immersive::error => ', e)
      );
  }, []);

  const showZoomClientNotification = useCallback(async () => {
    await zoomSdk.showNotification({
      // @ts-expect-error error in type-matching
      title: 'Zoom SDK Notification',
      type: 'info',
      message: 'Would you like to join AI Companion?',
    });
  }, []);

  const showZoomAppNotification = useCallback(async () => {
    console.log('Zoom App Notification');
    toast('Zoom App Notification', {
      description: 'Would you like to join AI Companion?',
      action: {
        label: 'Got it!',
        onClick() {
          console.log('Undo Zoom App Notification');
        },
      },
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
          // events
          'onConnect',
          'onMeeting',
          'onMessage',
          'onMyMediaChange',
          'onParticipantChange',
          'onWaitingRoomParticipantJoin',
          'getChatContext',
          'getEmojiConfiguration',
          'admitParticipantFromWaitingRoom',
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
                <Button
                  variant="outline"
                  onClick={async () => {
                    await closeRenderingContext();
                  }}
                >
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
                <Button onClick={showZoomClientNotification}>
                  Show Notification in Zoom Client
                </Button>
                <Button onClick={showZoomAppNotification}>
                  Show Notification in Zoom App
                </Button>
              </CardFooter>
            </Card>
          </div>
          <Toaster />
        </>
      )}
      <ImmersiveMode
        runningContext={runningContext}
        userContext={userContext}
      />
      {(runningContext === 'inCamera' || isDev) && (
        <>
          <div className="card">
            <div className="gradient-background font-style user-context-wrapper">
              <div className="user-name">{userContext?.screenName}</div>
              <div className="user-role">
                <span>{userContext?.role || 'N/A'}</span>
                <span className="separator">|</span>
                <span>Manager, Release Engineer 2 </span>
              </div>
              <div className="additional-context-wrapper">
                <span className="context-section">
                  <span>📢</span>
                  <span>Speaking</span>
                </span>
                <span className="context-section">
                  <span>🤖</span>
                  <span>AI Companion</span>
                </span>
                <span className="context-section">
                  <span>📍</span>
                  <span>{timeZone}</span>
                </span>
                <span className="context-section">
                  <span>|</span>
                  <span>Joined at {localTime}</span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default App;
