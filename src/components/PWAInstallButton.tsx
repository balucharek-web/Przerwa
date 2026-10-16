import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'nav' | 'hero' | 'settings';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already installed, show status badge in settings, otherwise hide in nav
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Aplikacja jest zainstalowana na Twoim urządzeniu (Tryb PWA)</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowAndroidGuide(true);
    }
  };

  const buttonStyle = variant === 'nav'
    ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95'
    : variant === 'hero'
    ? 'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-95'
    : 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95';

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={buttonStyle}
        title="Zainstaluj Czas Przerwy na ekranie głównym telefonu lub komputera"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{variant === 'hero' ? 'Zainstaluj aplikację PWA na telefonie' : 'Zainstaluj PWA'}</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Instalacja na iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Dodaj do ekranu początkowego iOS</p>
              </div>
            </div>

            <ol className="space-y-3.5 text-xs text-slate-300 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-emerald-400 text-[11px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  Kliknij ikonę <strong className="text-white">Udostępnij</strong> (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />) na dolnym pasku przeglądarki Safari.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-emerald-400 text-[11px] font-bold shrink-0 mt-0.5">2</span>
                <div>
                  Przewiń w dół i wybierz opcję <strong className="text-white">Do ekranu początkowego</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-emerald-400 text-[11px] font-bold shrink-0 mt-0.5">3</span>
                <div>
                  Kliknij <strong className="text-emerald-400">Dodaj</strong> w prawym górnym rogu. Gotowe!
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}

      {/* Android / Desktop Guide Modal (if prompt was dismissed earlier) */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Zainstaluj aplikację</h3>
                <p className="text-xs text-slate-400">Android / Chrome / Edge</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              W przeglądarce kliknij menu (trzy kropki w prawym górnym rogu) i wybierz <strong className="text-emerald-400">„Zainstaluj aplikację”</strong> lub <strong className="text-emerald-400">„Dodaj do ekranu głównego”</strong>.
            </p>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </>
  );
};
