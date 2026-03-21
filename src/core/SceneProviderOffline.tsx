import React, { useEffect, useState } from 'react';
import { ViewerContext } from './ViewerContext';
import { setViewer } from './facade';

export const SceneProviderOffline: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewer, setViewerState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 如果 viewer 已经就绪（页面加载快的情况）
    if ((window as any).__viewer) {
      const v = (window as any).__viewer;
      setViewer(v);
      setViewerState(v);
      setLoading(false);
      return;
    }

    // 否则监听事件
    const onReady = (e: CustomEvent) => {
      const v = e.detail.viewer;
      setViewer(v);
      setViewerState(v);
      setLoading(false);
    };

    const onError = (e: CustomEvent) => {
      setError(e.detail.error);
      setLoading(false);
    };

    window.addEventListener('ustudio:viewer-ready', onReady as EventListener);
    window.addEventListener('ustudio:viewer-error', onError as EventListener);

    return () => {
      window.removeEventListener('ustudio:viewer-ready', onReady as EventListener);
      window.removeEventListener('ustudio:viewer-error', onError as EventListener);
    };
  }, []);

  return (
    <ViewerContext.Provider value={{ viewer, loading, error }}>
      {children}
    </ViewerContext.Provider>
  );
};
