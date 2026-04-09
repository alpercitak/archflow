import NodeItem from './components/node-item';
import { NODE_GROUPS } from './constants';
import styles from './index.module.css';

export default function NodeLibrary() {
  return (
    <div className={styles['node-library']}>
      {NODE_GROUPS.map((group) => (
        <div className={styles['node-library__section']} key={group.title}>
          <div className={styles['node-library__title']}>{group.title}</div>
          {group.items.map((item) => (
            <NodeItem key={`${group.title}-${item.label}`} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}
