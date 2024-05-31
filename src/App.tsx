import { useInit } from './hooks/zoom/useInit';
import './App.css';

const App: React.FC = () => {
  const { config, runningContext, userContext, zoomSdk } = useInit();

  const closeRenderingContext = async () => {
    await zoomSdk.closeRenderingContext();
  };

  const drawWebview = async () => {
    const response = await zoomSdk.drawWebView({
      webviewId: 'camera',
      x: 0,
      y: 0,
      width: config?.media?.renderTarget?.width,
      height: config?.media?.renderTarget?.height,
      zIndex: 2,
    });

    console.log('drawWebview::camera => ', response);
  };

  const runRenderingContext = async () => {
    try {
      const response = await zoomSdk.runRenderingContext({
        view: 'camera',
      });

      console.log('runRenderingContext::camera => ', response);
      await drawWebview();
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
