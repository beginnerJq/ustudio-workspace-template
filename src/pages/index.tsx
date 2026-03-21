import { useState, useEffect, useContext } from 'react';
import { ViewerContext } from '../core/ViewerContext';
import { getAllObjects, getObjectsByName, flyToObject, highlight, removeHighlight } from '@ustudio/facade';

export default function IndexPage() {
  const { viewer, loading, error } = useContext(ViewerContext);
  const [objects, setObjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!viewer) return;
    try {
      const all = getAllObjects();
      setObjects(all.slice(0, 20));
    } catch (e) {
      console.error('Failed to get objects:', e);
    }
  }, [viewer]);

  if (loading) return <div style={{ padding: 20, color: 'white' }}>场景加载中...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>加载失败: {error.message}</div>;

  const handleClick = (obj: any) => {
    if (selected) removeHighlight(selected);
    const id = obj.name || obj.uuid;
    highlight(id, { color: 0xff6600, opacity: 0.6 });
    flyToObject(id, { enableTransition: true });
    setSelected(id);
  };

  return (
    <div style={{
      position: 'fixed', top: 10, right: 10, width: 320,
      background: 'rgba(0,0,0,0.8)', color: 'white',
      borderRadius: 8, padding: 16, fontSize: 13,
      maxHeight: '80vh', overflow: 'auto',
    }}>
      <h3 style={{ margin: '0 0 8px' }}>uStudio Facade 测试</h3>
      <p>Viewer: {viewer ? '✅ 就绪' : '❌'}</p>
      <p>ObjectManager size: {viewer?.objectManager?.size ?? '-'}</p>
      <p>前 20 个对象（点击可飞向+高亮）:</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {objects.map((obj, i) => (
          <li
            key={i}
            onClick={() => handleClick(obj)}
            style={{
              padding: '4px 8px', cursor: 'pointer', borderRadius: 4,
              background: selected === (obj.name || obj.uuid) ? '#ff6600' : 'rgba(255,255,255,0.1)',
              marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {obj.name || obj.uuid} ({obj.type})
          </li>
        ))}
      </ul>
    </div>
  );
}
