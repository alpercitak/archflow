import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Toast from '@/components/ui/toast';
import Workspace from '@/features/workspace';
import ContextMenu from '@/features/context-menu';
import StatusBar from '@/features/status-bar';
import TopBar from '@/features/top-bar';
import './styles/global.css';

const elem = document.getElementById('root')!;

const app = (
  <StrictMode>
    <div>
      <TopBar />
      <Workspace />
      <StatusBar />
      <Toast />
      <ContextMenu />
    </div>
  </StrictMode>
);

createRoot(elem).render(app);
