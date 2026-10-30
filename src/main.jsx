import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './styles/base.css';
import './styles/layout.css';
import './styles/manga.css';
import './styles/pages.css';
import './styles/reader.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <StoreProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </StoreProvider>
    </HashRouter>
  </StrictMode>,
);
