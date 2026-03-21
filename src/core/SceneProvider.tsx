import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from 'u-space';
import { SceneLoader } from 'u-space/plugins/u-manager';
import { ViewerContext } from './ViewerContext';
import { setViewer } from './facade';

// @ts-ignore
import config from '../../ustudio.config.json';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_USTUDIO_API_BASE || config.baseUrl);
const FULL_BASE_URL = import.meta.env.VITE_USTUDIO_API_BASE || config.baseUrl;
const SCENE_ID = import.meta.env.VITE_USTUDIO_SCENE_ID || config.sceneId;

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewerState] = useState<Viewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    let viewerInstance: Viewer | null = null;

    async function init() {
      try {
        // 1. Fetch scene detail from API
        const res = await fetch(`${API_BASE}/api/twins/scene/v1/detail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scene_id: SCENE_ID }),
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.errmsg || '获取场景详情失败');
        }

        const sceneDetail = data.result;
        const modelPath = import.meta.env.DEV
          ? sceneDetail.scene_background_model_url
          : (new URL(FULL_BASE_URL).origin + sceneDetail.scene_background_model_url);

        if (disposed) return;

        // 2. Initialize Viewer
        const v = new Viewer({ el: containerRef.current! });
        await v.init();
        viewerInstance = v;

        if (disposed) return;

        // 3. Load scene model
        const loader = new SceneLoader(v);
        loader.setPath(modelPath);
        if (sceneDetail.decrypt_key) {
          loader.setKey(sceneDetail.decrypt_key);
        }
        const group = await loader.loadAsync();

        if (disposed) return;

        // 4. Add to scene and fly to model
        v.scene.add(group);
        v.controls.flyToObject(group);

        // 5. Inject viewer into facade
        setViewer(v);
        setViewerState(v);
        setLoading(false);
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      disposed = true;
      if (viewerInstance) {
        viewerInstance.dispose();
      }
    };
  }, []);

  return (
    <ViewerContext.Provider value={{ viewer, loading, error }}>
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </ViewerContext.Provider>
  );
};
