import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Toast from '@/components/ui/toast';
import ContextMenu from '@/features/context-menu';
import StatusBar from '@/features/status-bar';
import TopBar from '@/features/top-bar';
import Workspace from '@/features/workspace';
import './styles/global.css';

// biome-ignore lint/style/noNonNullAssertion: #root is defined in index.html
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
