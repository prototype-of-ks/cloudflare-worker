import { useInit } from './hooks/zoom/useInit';
import './App.css';
import { useEffect } from 'react';

const App: React.FC = () => {
  const { config, runningContext, userContext, zoomSdk } = useInit();

  const closeRenderingContext = async () => {
    await zoomSdk.closeRenderingContext();
  };

  const drawWebview = async () => {

    await zoomSdk.setVideoMirrorEffect({
      mirrorMyVideo: false,
    });

    const response = await zoomSdk.drawWebView({
      webviewId: 'webview-1',
      x: 0,
      y: 0,
      width: config?.media?.renderTarget?.width,
      height: config?.media?.renderTarget?.height,
      zIndex: 9,
    });

    console.log('drawWebview::camera => ', response);
  };

  const runRenderingContext = async () => {
    try {
      const response1 = await zoomSdk.runRenderingContext({
        view: 'camera',
      });
      console.log('runRenderingContext::camera => ', response1);

      await drawWebview();

      const response2 = await zoomSdk.runRenderingContext({
        view: 'camera',
      });
      console.log('runRenderingContext::camera => ', response2);

    } catch (e) {
      console.error(e);
    }
  };

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
    if (config) {
      zoomSdk.onRunningContextChange((context) => {
        console.log('onRunningContextChange => ', context);
      });

      zoomSdk.onRenderedAppOpened((event) => {
        console.log('onRenderedAppOpened => ', event);
      });
    }
  }, [config, zoomSdk]);

  return (
    <>
      <p>This is text content</p>
      {runningContext === 'inMeeting' && (
        <>
          <p className="read-the-docs">Zoom AI Companion Notification</p>
          <button onClick={showNotification}>Show Notification</button>
          <button onClick={runRenderingContext}>Render</button>
          <button onClick={closeRenderingContext}>Close</button>
        </>
      )}
      {runningContext === 'inCamera' && (
        <div className="glass">
          <span className="name-tag">{userContext?.screenName}</span>
        </div>
      )}
    </>
  );
};

export default App;
