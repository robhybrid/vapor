import { useAppStore } from '../store/useAppStore';

export function fadeOut(layer) {
  const store = useAppStore.getState();
  store.updateLayer(layer, { exit: true });
  layer.timeout = setTimeout(() => {
    useAppStore.getState().removeLayer(layer);
  }, store.transition.outMs);
}
