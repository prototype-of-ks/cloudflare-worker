import { useEffect, useCallback } from 'react';
import './App.css';
import { useInit } from './hooks/zoom/useInit';

const App: React.FC = () => {
  const { config, runningContext, participants, zoomSdk } = useInit();

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
      console.error(JSON.stringify(String(e)));
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
        title: 'Zoom SDK Notification',
        type: 'info',
        message: 'Would you like to join AI Companion?',
      });

      console.log('showNoficaition => ', response);
    } catch (e) {
      console.error(JSON.stringify(String(e)));
    }
  };

  useEffect(() => {
    if (config) console.log('config => ', config);
    if (participants.length !== 0)
      console.log('participants => ', participants);
    if (runningContext) console.log('runningContext => ', runningContext);
  }, [config, runningContext, participants]);

  return (
    <>
      {runningContext === 'inMeeting' && (
        <>
          <p className="read-the-docs">Zoom AI Notification</p>
          <button onClick={drawWebview}>Draw Webview</button>
          <button onClick={closeRenderingContext}>Close Webview</button>
          <button onClick={showNotification}>Show Notification</button>
        </>
      )}
      {runningContext === 'inCamera' && (
        <div className="glass">
          <span className="name-tag">Here is your screen Name</span>
        </div>
      )}
    </>
  );
};

export default App;
