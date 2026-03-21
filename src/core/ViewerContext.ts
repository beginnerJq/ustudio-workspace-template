import { createContext, useContext } from 'react';
import type { Viewer } from 'u-space';

export interface ViewerContextValue {
  viewer: Viewer | null;
  loading: boolean;
  error: Error | null;
}

export const ViewerContext = createContext<ViewerContextValue>({
  viewer: null,
  loading: true,
  error: null,
});

export function useViewer(): ViewerContextValue {
  return useContext(ViewerContext);
}
