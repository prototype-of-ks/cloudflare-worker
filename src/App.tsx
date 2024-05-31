import { useEffect, useCallback } from 'react';
import { useInit } from './hooks/zoom/useInit';
import { OnMyMediaChangeEvent } from '@zoom/appssdk';
import './App.css';

const App: React.FC = () => {
  const { config, runningContext, zoomSdk, userContext } = useInit();

  const closeRenderingContext = useCallback(async () => {
    await zoomSdk.closeRenderingContext();
  }, [zoomSdk]);

  const runRenderingContext = useCallback(async () => {
    try {
      const response = await zoomSdk.runRenderingContext({
        view: 'camera',
      });
      console.log('runRenderingContext::camera => ', response);
    } catch (e) {
      console.error(e);
      await closeRenderingContext();
      const response = await zoomSdk.runRenderingContext({
        view: 'camera',
      });
      console.log('rerunRenderingContext::camera => ', response);
    }
  }, [zoomSdk, closeRenderingContext]);

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

    await zoomSdk.setVideoMirrorEffect({
      mirrorMyVideo: false,
    });
    console.log('drawWebview::camera => ', response);
  }, [
    runRenderingContext,
    zoomSdk,
    config?.media?.renderTarget?.width,
    config?.media?.renderTarget?.height,
  ]);

  const showNotification = async () => {
    try {
      const response = await zoomSdk.showNotification({
        // @ts-expect-error Argument of type '{ title: string; type: string; message: string; }' is not assignable to parameter of type 'NotificationOptions'.
        type: 'info',
        title: 'Zoom SDK Notification',
        message: 'Would you like to join AI Companion?',
      });

      console.log('showNoficaition => ', response);
    } catch (e) {
      console.error(JSON.stringify(String(e)));
    }
  };

  const applyListener = useCallback(() => {
    zoomSdk.onParticipantChange((participants) => {
      console.log('participants => ', participants);
    });

    zoomSdk.onMyMediaChange(async (event: OnMyMediaChangeEvent) => {
      const media = event.media as {
        audio: { state: boolean };
        video: { state: boolean };
      };
      if (media) {
        if (media.video.state) {
          console.log('My Media Changed to Video: open');
          await drawWebview();
        }
      }
    });
  }, [zoomSdk, drawWebview]);

  // useEffect(() => {
  //   if (config) console.log('config => ', config);
  //   if (participants.length !== 0)
  //     console.log('participants => ', participants);
  //   if (runningContext) console.log('runningContext => ', runningContext);
  // }, [config, runningContext, participants]);

  useEffect(() => {
    (async () => {
      if (config) {
        if (config.media?.video?.state) {
          console.log('Video State: ', config.media.video.state);
          await drawWebview();
        }
        applyListener();
      }
    })();
  }, [applyListener, config, drawWebview]);

  useEffect(() => {
    (async () => {
      await zoomSdk.getMeetingContext();
      await zoomSdk.getAppContext();
      // await zoomSdk.get
    })();
  }, [zoomSdk]);

  return (
    <>
      {runningContext === 'inMeeting' && (
        <>
          <p className="read-the-docs">Zoom AI Companion Notification</p>
          {/* <button onClick={drawWebview}>Draw Webview</button>
          <button onClick={closeRenderingContext}>Close Webview</button> */}
          <button onClick={showNotification}>Show Notification</button>
        </>
      )}
      {runningContext === 'inCamera' &&
        userContext &&
        userContext.screenName && (
          <div className="glass">
            <span className="name-tag">{userContext.screenName}</span>
          </div>
        )}
    </>
  );
};

export default App;
