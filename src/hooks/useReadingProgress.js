import { useStore } from '../context/StoreContext.jsx';

export function useReadingProgress() {
  const { progress, readMap, saveProgress, markRead, resetProgress } = useStore();
  return { progress, readMap, saveProgress, markRead, resetProgress };
}
