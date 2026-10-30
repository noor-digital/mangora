import { useStore } from '../context/StoreContext.jsx';

export function useSettings() {
  const { settings, updateSettings, resetAll } = useStore();
  return { settings, updateSettings, resetAll };
}
