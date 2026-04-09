import Toast from '@/components/ui/toast';
import Workspace from './features/workspace';
import ContextMenu from './features/context-menu';
import StatusBar from './features/status-bar';
import TopBar from './features/top-bar';
import './index.css';

export function App() {
  return (
    <div>
      <TopBar />
      <Workspace />
      <StatusBar />
      <Toast />
      <ContextMenu />
    </div>
  );
}

export default App;
