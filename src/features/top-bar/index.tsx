import AddNote from './components/add-note';
import ClearAll from './components/clear-all';
import Divider from './components/divider';
import ResetView from './components/reset-view';
import ToolModePan from './components/tool-mode-pan';
import ToolModeSelect from './components/tool-mode-select';
import ZoomDisplay from './components/zoom-display';
import styles from './index.module.css';

export default function TopBar() {
  return (
    <div className={styles['topbar']}>
      <div className={styles['topbar__logo']}>
        arch<span>flow</span>
      </div>
      <Divider />
      <ToolModeSelect />
      <ToolModePan />
      <Divider />
      <AddNote />
      <ClearAll />
      <div className={styles['topbar__right']}>
        <ZoomDisplay />
        <ResetView />
      </div>
    </div>
  );
}
