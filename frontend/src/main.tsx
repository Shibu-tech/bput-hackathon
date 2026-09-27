import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CampusOpsProvider } from './context/CampusOpsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CampusOpsProvider>
        <App />
      </CampusOpsProvider>
    </AuthProvider>
  </StrictMode>,
);