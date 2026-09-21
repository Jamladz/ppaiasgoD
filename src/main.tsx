import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = 'https://ais-dev-twprowdfl7enduheibo6lm-224035158297.europe-west3.run.app/tonconnect-manifest.json';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </TonConnectUIProvider>
  </StrictMode>,
);
