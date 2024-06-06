import zoomSdk, {
  ConfigResponse,
  RunningContext,
  GetUserContextResponse,
  OnMyMediaChangeEvent,
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
import { useZoomEvent } from './hooks/useZoomEvent';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

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
  const { onWaitingRoomParticipantJoinEvent } = useZoomEvent(config);
  const [onMediaChangEvent] = useState<OnMyMediaChangeEvent>();
  const [hasRunningContext, setHasRunningContext] = useState(false);

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
    if (hasRunningContext) {
      await zoomSdk.closeRenderingContext();
      setHasRunningContext(false);
    }
  }, [hasRunningContext]);

  const renderCameraModeWebview = useCallback(async () => {
    if (userContext) {
      const runRenderingContextResponse = await zoomSdk.runRenderingContext({
        view: 'camera',
      });
      setHasRunningContext(true);
      console.log(
        'runRenderingContext::camera => ',
        runRenderingContextResponse
      );

      if (config?.media) {
        console.log('renderTarget => ', config.media.renderTarget);
        zoomSdk
          .drawWebView({
            webviewId: 'MyCameraWebview',
            x: 0,
            y: 0,
            width: config?.media?.renderTarget?.width,
            height: config?.media?.renderTarget?.height,
            zIndex: 9,
          })
          .then((_) => console.log(_))
          .catch((e) => console.error('drawWebView::error => ', e));
      }

      console.log('drawWebview::userContext => ', userContext);
    } else {
      console.log('No userContext found. Will not render WebView.');
    }
  }, [
    config?.media?.renderTarget?.width,
    config?.media?.renderTarget?.height,
    userContext,
  ]);

  const renderImmersiveModeWebview = useCallback(async () => {
    try {
      const response = await zoomSdk.runRenderingContext({
        view: 'immersive',
      });
      setHasRunningContext(true);

      console.log('renderImmersiveApp::Immersive => ', response);
    } catch (e) {
      console.log(e);
    }
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
        ],
      });
      setConfig(config);

      const context = await zoomSdk.getAppContext();
      await init();

      console.log('context => ', context);
    })();
  }, [isDev, config, init]);

  // useEffect(() => {
  //   if (!config) {
  //     console.warn('No config provided.');
  //     return;
  //   }

  //   zoomSdk.onMyMediaChange(async (event) => {
  //     setOnMediaChangeEvent(event);
  //     const media = event.media as Media;
  //     if (media.video?.state) {
  //       // await renderCameraModeWebview();
  //     } else {
  //       // await closeRenderingContext();
  //     }
  //   });
  // }, [config, renderCameraModeWebview, closeRenderingContext]);

  useEffect(() => {
    if (config) console.log('config => ', config);
    if (runningContext) console.log('runningContext => ', runningContext);
    if (userContext) console.log('userContext => ', userContext);
    if (onWaitingRoomParticipantJoinEvent)
      console.log(
        'onWaitingRoomParticipantJoinEvent => ',
        onWaitingRoomParticipantJoinEvent
      );
    if (onMediaChangEvent)
      console.log('onMediaChangEvent => ', onMediaChangEvent);
  }, [
    config,
    runningContext,
    userContext,
    onWaitingRoomParticipantJoinEvent,
    onMediaChangEvent,
  ]);

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
                    zoomSdk
                      .clearWebView()
                      .then(console.log)
                      .catch(console.error);
                    closeRenderingContext()
                      .then(console.log)
                      .catch(console.error);
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
        </>
      )}
      <ImmersiveMode
        runningContext={runningContext}
        userContext={userContext}
      />
      {(runningContext === 'inCamera' || isDev) && (
        <>
          <div className="absolute bototm-0 right-0"></div>
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
      <p>Text for webview testing</p>
      <Toaster />
    </>
  );
};

export default App;
