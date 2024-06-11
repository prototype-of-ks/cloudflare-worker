import zoomSdk, {
  ConfigResponse,
  RunningContext,
  GetUserContextResponse,
} from '@zoom/appssdk';
import { useEffect, useState, useCallback } from 'react';
import { useDev } from './hooks/useDev';
import { useTimezone } from './hooks/useTimezone';
import { useZoomContext } from './hooks/useMeetingContext';
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
import MeetingMode from './components/MeetingMode';
import { Input } from '@/components/ui/input';

// Function to draw a rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

const App: React.FC = () => {
  const { localTime, timeZone } = useTimezone();
  const { isDev } = useDev();
  const [config, setConfig] = useState<ConfigResponse>();
  const { languages, meetingUUID } = useZoomContext(config);
  const [runningContext, setRunningContext] = useState<RunningContext>();
  const [userContext, setUserContext] = useState<GetUserContextResponse>({
    role: 'host',
    status: 'authorized',
    screenName: '',
    participantUUID: '',
    participantId: '',
  });
  const [voteMessage, setVoteMessage] = useState<string>();

  const init = useCallback(async () => {
    const { context } = await zoomSdk.getRunningContext();
    const userContext = await zoomSdk.getUserContext();

    // zoomSdk
    //   .setVideoState({
    //     video: true,
    //   })
    //   .then(() => {
    //     zoomSdk
    //       .setVideoMirrorEffect({
    //         mirrorMyVideo: false,
    //       })
    //       .then(async () => {
    //         await zoomSdk.runRenderingContext({
    //           view: 'camera',
    //         });
    //         await zoomSdk.drawWebView({
    //           x: 0,
    //           y: 0,
    //           width: 1280,
    //           height: 720,
    //           zIndex: 99,
    //           webviewId: 'webviewId',
    //         });
    //       })
    //       .catch((e) => console.error('setVideoMirrorEffect::error => ', e));
    //   })
    //   .catch(console.error);

    setUserContext(userContext);
    setRunningContext(context);
  }, []);

  const closeRenderingContext = useCallback(async () => {
    zoomSdk.closeRenderingContext().catch(console.error);
  }, []);

  const renderCameraModeWebview = useCallback(async () => {
    const drawCameraContext = await zoomSdk.runRenderingContext({
      view: 'camera',
    });
    console.log('drawCameraContext => ', drawCameraContext);

    const drawWebviewResponse = await zoomSdk.drawWebView({
      webviewId: 'camera',
      x: 0,
      y: 0,
      width: config?.media?.renderTarget?.width,
      height: config?.media?.renderTarget?.height,
      zIndex: 9,
    });

    console.log('drawWebviewResponse => ', drawWebviewResponse);
  }, [config?.media?.renderTarget?.height, config?.media?.renderTarget?.width]);

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

  const userRole = `${userContext?.role
    .substring(0, 1)
    .toUpperCase()}${userContext?.role.substring(1)}`;

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
          // 'clearParticipant',
          'closeRenderingContext',
          'connect',
          // 'drawParticipant',
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

  const drawInCameraVotingMessage = async ({
    title,
    text,
  }: {
    title?: string;
    text?: string;
  }) => {
    if (config?.media?.renderTarget) {
      const renderWidth = 400;
      const renderHeight = 150;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const ratio = window.devicePixelRatio;
      canvas.width = renderWidth;
      canvas.height = renderHeight;

      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
      canvas.style.background = 'black';

      canvas.width *= ratio;
      canvas.height *= ratio;

      if (ctx) {
        ctx.scale(ratio, ratio);

        // Create a transparent rectangle with a blur effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        // ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);

        ctx.filter = 'blur(10px)'; // Apply blur filter
        drawRoundedRect(ctx, 0, 0, renderWidth, renderHeight, 20);

        // Draw "vote 1 for " text
        ctx.font = '28px sans-serif';
        ctx.fillText(title || 'Vote 1', 10, 50);

        ctx.font = '40px sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText(text || 'Hello World', 10, 100);

        canvas.addEventListener('click', () => {
          console.log('click image work!');
        });

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const response = await zoomSdk.drawImage({
          imageData,
          x: config?.media?.renderTarget.width - 500,
          y: Math.floor(config.media.renderTarget.height / 2) - 100,
          zIndex: 20,
        });

        console.log('response draw image => ', response);
      }
    }
  };

  const drawInCameraNotification = useCallback(async () => {
    if (config?.media?.renderTarget) {
      const renderWidth = 400;
      const renderHeight = 150;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const ratio = window.devicePixelRatio;
      canvas.width = renderWidth;
      canvas.height = renderHeight;

      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
      canvas.style.background = 'black';

      canvas.width *= ratio;
      canvas.height *= ratio;

      if (ctx) {
        ctx.scale(ratio, ratio);

        // Create a transparent rectangle with a blur effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        // ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);

        ctx.filter = 'blur(10px)'; // Apply blur filter
        drawRoundedRect(ctx, 0, 0, renderWidth, renderHeight, 20);

        // Draw "vote 1 for " text
        ctx.font = '28px sans-serif';
        ctx.fillText('Zoom App Notification', 10, 50);

        ctx.font = '40px sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText('Would you like to start AI Companion?', 10, 100);

        canvas.addEventListener('click', () => {
          console.log('click image work!');
        });

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const response = await zoomSdk.drawImage({
          imageData,
          x: config?.media?.renderTarget.width - 200,
          y: 100,
          zIndex: 20,
        });

        console.log('response draw image => ', response);
      }
    }
  }, [config?.media?.renderTarget]);

  return (
    <>
      {(runningContext === 'inMeeting' || isDev) && (
        <>
          <header className="zoom-notification-header">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* <SunOutlined className="night-mode-shift-icon w-4 h-4 text-white" /> */}
                <span className="text-white text-left">
                  Meeting ID: {meetingUUID ?? 'Z3R6UVJERjyZPMrgxFGJBw=='}
                </span>
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-row items-center gap-2 bg-[#5a56d0] p-2 rounded-md cursor-pointer">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#9c9ae3] text-center">
                    <span className="w-3 h-3 bg-green-600 inline-block rounded-full"></span>
                  </div>
                  <span className="text-white">Cloud Recording</span>
                </div>
              </div>
            </div>
            <div className="bg-[#827fdb] rounded-md h-10 flex items-center px-2">
              MK
            </div>
          </header>
          {/* <CloseOutlined className="absolute right-5 top-4 cursor-pointer" /> */}
          <MeetingMode />
          {/* <h3 className="text-[24px] font-bold my-4">Zoom App</h3> */}
          <div className="flex flex-col gap-4 w-full">
            <Card className="text-left">
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
            <Card className="text-left">
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
            <Card className="text-left">
              <CardHeader>
                <CardTitle>Notification</CardTitle>
                <CardDescription>Show Notifications</CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col items-start gap-2">
                <Button onClick={showZoomClientNotification}>
                  Show Notification in Zoom Client
                </Button>
                <Button onClick={showZoomAppNotification}>
                  Show Notification in Zoom App
                </Button>
                <Button onClick={drawInCameraNotification}>
                  Show Notification in Video Stream
                </Button>
              </CardFooter>
            </Card>
            <Card className="text-left mb-20">
              <CardHeader>
                <CardTitle>Voting Table</CardTitle>
                <CardDescription>
                  {/* Draw Webview in Inmmersive Mode */}
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      type="search"
                      placeholder="Enter your message"
                      value={voteMessage}
                      onChange={(event) => {
                        setVoteMessage(event.target.value);
                      }}
                    />
                    <Button
                      type="submit"
                      onClick={() => {
                        console.log('vote message => ', voteMessage);
                        drawInCameraVotingMessage({
                          title: 'vote',
                          text: voteMessage,
                        });
                      }}
                    >
                      Send
                    </Button>
                  </div>
                </CardDescription>
              </CardHeader>
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
                <span>{userRole || 'N/A'}</span>
                <span className="separator">|</span>
                <span>Your Job Title Here</span>
              </div>
              <div className="additional-context-wrapper">
                <span className="context-section">
                  <span>📍</span>
                  <span>{timeZone}</span>
                </span>
                <span className="context-section">
                  <span>|</span>
                  <span>Joined at {localTime}</span>
                </span>
                <span className="context-section">
                  <span>💬</span>
                  <span>{languages.join(' ,')}</span>
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
