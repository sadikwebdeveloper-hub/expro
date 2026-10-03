/**
 * Mounts the REAL <App /> into jsdom and walks every public route.
 *
 * Bundled with esbuild straight from App.tsx — no mocks, no stand-ins. Data comes
 * from the live Express server, so this exercises the same component tree the
 * browser runs, including the redesigned pages.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';

const container = document.getElementById('root');
if (!container) throw new Error('missing #root');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
