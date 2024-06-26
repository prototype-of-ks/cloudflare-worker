import zoomSdk from '@zoom/appssdk';
import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { useTimezone } from './hooks/useTimezone';
import { useZoomContext } from './hooks/useMeetingContext';
import ImmersiveMode from './components/ImmersiveApp';
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
import MeetingMode from './components/MeetingApp';
import { Input } from '@/components/ui/input';
import VotingTable from './components/VotingTable';
import './App.css';
import { ZoomAppContext } from './context/ZoomAppContext';
import { DevToolContext } from './context/DevToolContext';

// Function to draw a rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
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
  const {
    config,
    runningContext,
    userContext
  } = useContext(ZoomAppContext);
  const { isDev } = useContext(DevToolContext);
  const { localTime, timeZone } = useTimezone();
  const { languages, meetingUUID } = useZoomContext(config);
  const [voteMessage, setVoteMessage] = useState<string>();

  const votingTableImageId = useRef({ imageId: '' });
  const textImageId = useRef({ imageId: '' });
  const voteImageId = useRef({ imageId: '' });

  const closeRenderingContext = useCallback(async () => {
    zoomSdk.closeRenderingContext().catch(console.error);
  }, []);

  const renderCameraModeWebview = useCallback(async () => {
    const drawCameraContext = await zoomSdk.runRenderingContext({
      view: 'camera',
    });
    console.log('drawCameraContext => ', drawCameraContext);

    // const drawWebviewResponse = await zoomSdk.drawWebView({
    //   webviewId: 'camera',
    //   x: 0,
    //   y: 0,
    //   width: config?.media?.renderTarget?.width,
    //   height: config?.media?.renderTarget?.height,
    //   zIndex: 999,
    // });

    // console.log('drawWebviewResponse => ', drawWebviewResponse);
  }, []);

  const renderImmersiveModeWebview = useCallback(async () => {
    zoomSdk
      .runRenderingContext({
        view: 'immersive',
      })
      .catch((e) =>
        console.error('runRenderingContext::immersive::error => ', e),
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
    if (!text && textImageId.current.imageId) {
      zoomSdk
        .clearImage({ imageId: textImageId.current.imageId })
        .catch(console.error);
      return;
    }

    if (config?.media?.renderTarget) {
      const renderWidth = 400;
      const renderHeight = 100;

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
        ctx.font = '24px sans-serif';
        ctx.fillText(title || 'Title Here', 10, 30);

        ctx.font = '28px sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText(text || 'Hello World', 10, 80);

        canvas.addEventListener('click', () => {
          console.log('click image work!');
        });

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (textImageId.current.imageId) {
          zoomSdk
            .clearImage({ imageId: textImageId.current.imageId })
            .catch(console.error);
        }

        const response = await zoomSdk.drawImage({
          imageData,
          x: config?.media?.renderTarget.width - 500,
          y: Math.floor(config.media.renderTarget.height / 2) - 100,
          zIndex: 20,
        });

        textImageId.current = { imageId: response.imageId };
        console.log('response draw image => ', response.imageId);
      }
    }
  };

  const drawInCameraNotification = useCallback(async () => {
    if (config?.media?.renderTarget) {
      const renderWidth = 260;
      const renderHeight = 64;

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
        drawRoundedRect(ctx, 0, 0, renderWidth, renderHeight, 30);

        // Reset the filter before drawing text
        // ctx.filter = 'none';

        // Draw centered text
        const drawCenteredText = (
          text: string,
          fontSize: number,
          yOffset: number,
          fillStyle?: string,
        ) => {
          ctx.font = `${fontSize}px sans-serif`;
          const textMetrics = ctx.measureText(text);
          const textWidth = textMetrics.width;
          const x = (renderWidth - textWidth) / 2; // Calculate horizontal center
          const y = (renderHeight + fontSize) / 2 + yOffset; // Calculate vertical center with offset
          ctx.fillStyle = fillStyle || 'black';
          ctx.fillText(text, x, y);
        };

        // Draw texts
        drawCenteredText('Zoom App Notification', 16, -16, 'white');
        drawCenteredText(
          'Would you like to start AI Companion?',
          12,
          10,
          'black',
        );

        canvas.addEventListener('click', () => {
          console.log('click image work!');
        });

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const response = await zoomSdk.drawImage({
          imageData,
          x: Math.floor(config.media.renderTarget.width / 2) - 300,
          y: 20,
          zIndex: 30,
        });

        setTimeout(() => {
          zoomSdk
            .clearImage({
              imageId: response.imageId,
            })
            .catch(console.error);
        }, 1000 * 5);

        console.log('response draw image => ', response);
      }
    }
  }, [config?.media?.renderTarget]);

  const drawNameTag = useCallback(async () => {
    if (config?.media?.renderTarget) {
      const renderWidth = config.media.renderTarget.width;
      const renderHeight = 100; // Adjusted to fit the content

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const ratio = window.devicePixelRatio;
      canvas.width = renderWidth * ratio;
      canvas.height = renderHeight * ratio;

      canvas.style.width = renderWidth + 'px';
      canvas.style.height = renderHeight + 'px';

      if (ctx) {
        ctx.scale(ratio, ratio);

        // Draw gradient background
        const gradient = ctx.createLinearGradient(
          0,
          0,
          renderWidth,
          renderHeight,
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0.2)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.filter = 'blur(20px)';

        drawRoundedRect(ctx, 0, 0, renderWidth, renderHeight, 10);

        // Draw user name
        const drawText = (
          text: string,
          x: number,
          y: number,
          fontSize: number,
          color: string,
        ) => {
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = color;
          ctx.fillText(text, x, y);
        };

        drawText(userContext?.screenName || '', 10, 25, 16, 'white');

        // Draw user role and job title
        const roleText = `${userRole || 'N/A'} | Your Job Title Here`;
        drawText(roleText, 10, 45, 12, 'white');

        // Draw additional context
        const drawIconText = (
          icon: string,
          text: string,
          x: number,
          y: number,
        ) => {
          ctx.font = '12px sans-serif';
          ctx.fillText(icon, x, y);
          ctx.font = '14px sans-serif';
          ctx.fillText(text, x + 12, y);
        };

        drawIconText('📍', timeZone || '', 10, 65);
        drawIconText('|', `Joined at ${localTime}`, 130, 65);
        drawIconText('💬', languages.join(', '), 270, 65);

        canvas.addEventListener('click', () => {
          console.log('Canvas clicked!');
        });

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (votingTableImageId.current.imageId) {
          zoomSdk
            .clearImage({ imageId: votingTableImageId.current.imageId })
            .catch(console.error);
        }

        const response = await zoomSdk.drawImage({
          imageData,
          x: 0,
          y: config.media.renderTarget.height - renderHeight - 100,
          zIndex: 30,
        });

        votingTableImageId.current = { imageId: response.imageId };
        console.log('response draw image => ', response.imageId);
      }
    }
  }, [
    config?.media?.renderTarget,
    userContext,
    userRole,
    timeZone,
    localTime,
    languages,
  ]);

  const drawVote = async ({
    title,
    text,
    type = 'cancel',
  }: {
    title?: string;
    text?: string;
    type?: 'vote' | 'downvote' | 'cancel';
  }) => {
    if (config?.media?.renderTarget) {
      const renderWidth = 200;
      const renderHeight = 50;

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

        if (type === 'cancel') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.filter = 'blur(10px)'; // Apply blur filter
        } else if (type === 'vote') {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        } else {
          ctx.fillStyle = 'rgb(239, 68, 68, 0.4)';
        }

        // Create a transparent rectangle with a blur effect
        // ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);

        ctx.filter = 'blur(10px)'; // Apply blur filter
        drawRoundedRect(ctx, 0, 0, renderWidth, renderHeight, 24);

        // Draw "vote 1 for " text
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'rgb(209, 213, 219)';
        ctx.fillText(text || 'Vote', 10, 20);

        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText(title || 'Hello World', 10, 40);

        canvas.addEventListener('click', () => {
          console.log('click image work!');
        });

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (voteImageId.current.imageId) {
          zoomSdk
            .clearImage({ imageId: voteImageId.current.imageId })
            .catch(console.error);
        }

        const response = await zoomSdk.drawImage({
          imageData,
          x: config?.media?.renderTarget.width - 420,
          y: 60,
          zIndex: 20,
        });

        setTimeout(() => {
          zoomSdk
            .clearImage({
              imageId: response.imageId,
            })
            .catch(console.error);
        }, 1000 * 6);

        console.log('response draw image => ', response);
      }
    }
  };

  return (
    <>
      {(runningContext === 'inMeeting' || isDev) && (
        <>
          <header className="zoom-notification-header">
            <div>
              <div className="flex items-center gap-2 mb-2">
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
          <MeetingMode />
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
                <Button
                  onClick={async () => {
                    await renderCameraModeWebview();
                    await drawNameTag();
                  }}
                >
                  Render
                </Button>
              </CardFooter>
            </Card>
            <Card className="text-left">
              <CardHeader>
                <CardTitle>Collaborate Mode</CardTitle>
                <CardDescription>
                  Draw Webview in Collaborate Mode
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
                <CardTitle>Message box</CardTitle>
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
                      maxLength={14}
                    />
                    <Button
                      type="submit"
                      onClick={() => {
                        console.log('vote message => ', voteMessage);
                        drawInCameraVotingMessage({
                          title: 'Title Here',
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
      <VotingTable drawImage={drawVote} />
    </>
  );
};

export default App;
