import { useStore } from '../context/StoreContext.jsx';

export function useHistory() {
  const { history, recordView, clearHistory } = useStore();
  return { history, recordView, clearHistory };
}
