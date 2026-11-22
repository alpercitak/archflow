import AddNote from './components/add-note';
import ClearAll from './components/clear-all';
import Divider from './components/divider';
import Export from './components/export';
import Import from './components/import';
import LoadExample from './components/load-example';
import ResetView from './components/reset-view';
import Simulate from './components/simulate';
import ZoomDisplay from './components/zoom-display';
import styles from './index.module.css';

export default function TopBar() {
  return (
    <div className={styles['topbar']}>
      <div className={styles['topbar__logo']}>
        arch<span>flow</span>
      </div>
      <Divider />
      <AddNote />
      <ClearAll />
      <LoadExample />
      <Divider />
      <ZoomDisplay />
      <ResetView />
      <Simulate />
      <div className={styles['topbar__right']}>
        <Import />
        <Export />
      </div>
    </div>
  );
}
