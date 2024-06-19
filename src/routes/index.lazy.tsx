import { createLazyFileRoute } from '@tanstack/react-router';
import {
  ZoomAppContextProvider,
  DevToolContextProvider,
} from '@/context/index';
import App from '../App';

export const Route = createLazyFileRoute('/')({
  component: () => (
    <DevToolContextProvider>
      <ZoomAppContextProvider>
        <App />
      </ZoomAppContextProvider>
    </DevToolContextProvider>
  ),
});
