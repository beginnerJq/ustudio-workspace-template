import React from 'react';
import ReactDOM from 'react-dom/client';
import { SceneProviderOffline as SceneProvider } from './core/SceneProviderOffline';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneProvider>
      <App />
    </SceneProvider>
  </React.StrictMode>
);
