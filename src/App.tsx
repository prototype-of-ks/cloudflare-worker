import { useEffect, useCallback } from 'react';
import { useInit } from './hooks/zoom/useInit';
import zoomSdk from '@zoom/appssdk';
import './App.css';

const App: React.FC = () => {
  const { config, runningContext } = useInit();

  const closeRenderingContext = useCallback(async () => {
    await zoomSdk.closeRenderingContext();
  }, []);

  const runRenderingContext = useCallback(async () => {
    try {
      const response = await zoomSdk.runRenderingContext({
        view: 'camera',
      });

      console.log('runRenderingContext::camera => ', response);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const drawWebview = useCallback(async () => {
    await runRenderingContext();

    console.log('Width => ', config?.media?.renderTarget?.width);
    console.log('Height => ', config?.media?.renderTarget?.height);

    const response = await zoomSdk.drawWebView({
      webviewId: 'camera',
      x: 0,
      y: 0,
      width: config?.media?.renderTarget?.width,
      height: config?.media?.renderTarget?.height,
      zIndex: 999,
    });

    console.log('drawWebview::camera => ', response);
  }, [
    runRenderingContext,
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

  useEffect(() => {
    if (!config) return; 
    zoomSdk.onRunningContextChange((context) => {
      console.log('onRunningContextChange  => ', context.runningContext);
    });
  }, [config]);

  // const applyListener = useCallback(() => {
  //   zoomSdk.onParticipantChange((participants) => {
  //     console.log('participants => ', participants);
  //   });

  //   zoomSdk.onMyMediaChange(async (event: OnMyMediaChangeEvent) => {
  //     const media = event.media as {
  //       audio: { state: boolean };
  //       video: { state: boolean };
  //     };
  //     if (media) {
  //       if (media.video.state) {
  //         console.log('My Media Changed to Video: open');
  //         await runRenderingContext();
  //         await drawWebview();
  //       }
  //     }
  //   });
  // }, [drawWebview, runRenderingContext]);

  useEffect(() => {
    // console.log('userContext => ', userContext);
    console.log('runningContext => ', runningContext);
  }, [runningContext]);

  return (
    <>
      {runningContext === 'inMeeting' && (
        <>
          <p className="read-the-docs">Zoom AI Companion Notification</p>
          <button onClick={showNotification}>Show Notification</button>
          <button onClick={drawWebview}>Show Nametag</button>
          <button onClick={closeRenderingContext}>Close</button>
        </>
      )}
      {runningContext === 'inCamera' && (
        <div className="glass">
          <span className="name-tag">Here is your Screen Name</span>
        </div>
      )}
    </>
  );
};

export default App;
