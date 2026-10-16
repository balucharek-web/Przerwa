import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nowa wersja aplikacji PWA jest dostępna. Aktualizuję...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('Aplikacja Czas Przerwy jest gotowa do pracy w trybie offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
