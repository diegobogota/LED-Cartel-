import { useState, useEffect, useRef } from 'react';
import { Play, Palette, Type, Zap, X, Maximize, Clock, CaseUpper } from 'lucide-react';

const PRESET_COLORS = [
  { id: 'rojo', value: '#ff1100' },
  { id: 'verde', value: '#00ff22' },
  { id: 'azul', value: '#0077ff' },
  { id: 'amarillo', value: '#ffee00' },
  { id: 'rosa', value: '#ff00aa' },
  { id: 'cian', value: '#00ffff' },
  { id: 'blanco', value: '#ffffff' },
];

const FONTS = [
  { id: 'font-led-square', name: 'Grilla', class: 'font-led-square font-bold' },
  { id: 'font-led-circle', name: 'Puntos', class: 'font-led-circle font-bold' },
  { id: 'font-sans', name: 'Mundo', class: 'font-sans font-black' },
  { id: 'font-serif', name: 'Clásica', class: 'font-serif italic font-bold' },
  { id: 'font-cursive', name: 'Cursiva', class: 'font-cursive' },
];

export default function App() {
  const [text, setText] = useState("¡HOLA! 🚀");
  const [color, setColor] = useState("#00ff22");
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [speed, setSpeed] = useState(50);
  const [time, setTime] = useState(0);
  const [size, setSize] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const wakeLockRef = useRef<any>(null);

  const handlePlay = () => {
    if (!text.trim()) return;
    setIsPlaying(true);
    
    // Attempt fullscreen immersion on user click
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen feature not entirely permitted:", err);
      });
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Return to setup if user manually exits fullscreen (e.g., using Esc or gesture)
      if (!document.fullscreenElement && isPlaying) {
        setIsPlaying(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isPlaying]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isPlaying && time > 0) {
      timeoutId = setTimeout(() => {
        handleStop();
      }, time * 1000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPlaying, time]);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake lock request failed:', err);
      }
    };

    const releaseWakeLock = () => {
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  if (isPlaying) {
    const animationDuration = 2 + ((100 - speed) / 100) * 28;
    return (
      <div 
        className="fixed inset-0 bg-black flex flex-col justify-center overflow-hidden touch-none cursor-pointer"
        style={{ color }}
        onClick={handleStop}
        title="Toca para salir"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); handleStop(); }}
          className="absolute top-6 right-6 z-50 text-white/30 hover:text-white p-3 bg-black/20 rounded-full transition-all"
        >
          <X className="w-8 h-8" />
        </button>
        <div 
          className={`animate-marquee w-max whitespace-nowrap led-glow leading-none select-none ${selectedFont.class}`}
          style={{ 
            fontSize: `${size}vh`, 
            animationDuration: `${animationDuration}s`
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-10 flex flex-col items-center justify-center font-sans tracking-wide">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white bg-clip-text">Cartel LED</h1>
          <p className="text-neutral-400 text-sm">Personaliza tu letrero. Soporta emojis.</p>
        </div>

        <div className="space-y-6 bg-neutral-900/50 p-6 sm:p-8 rounded-3xl border border-neutral-800 shadow-2xl">
          
          {/* Mensaje Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Type size={18} className="text-blue-400" />
              Tu Mensaje
            </label>
            <input 
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe aquí..."
              className={`w-full bg-black/60 border border-neutral-700 rounded-2xl px-5 py-4 text-xl sm:text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white shadow-inner placeholder:text-neutral-600 ${selectedFont.class}`}
            />
          </div>

          {/* Typography Select */}
          <div className="space-y-3 pt-2">
             <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <CaseUpper size={18} className="text-purple-400" />
              Tipografía
            </label>
            <div className="grid grid-cols-5 gap-2 pb-2">
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFont(f)}
                  className={`flex items-center justify-center py-2 px-1 rounded-xl transition-all ${
                    selectedFont.id === f.id
                      ? 'bg-neutral-800 text-white ring-2 ring-purple-500 shadow-md'
                      : 'bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-800/50 border'
                  }`}
                  title={f.name}
                >
                  <span className={`text-xl leading-none ${f.class}`}>Aa</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Select */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Palette size={18} className="text-pink-400" />
              Color del Neón
            </label>
            <div className="flex gap-4 flex-wrap pb-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 shadow-sm ${
                    color === c.value 
                      ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900 border-2 border-transparent' 
                      : 'hover:scale-110 border border-neutral-700/50 opacity-80 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: c.value, 
                    boxShadow: color === c.value ? `0 0 15px ${c.value}` : 'none' 
                  }}
                  title={c.id}
                />
              ))}
            </div>
          </div>

          {/* Velocidad Slider */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Velocidad
              </span>
              <span className="text-neutral-500 font-mono text-xs">{speed}%</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
          </div>

          {/* Tiempo Slider */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock size={18} className="text-blue-400" />
                Tiempo
              </span>
              <span className="text-neutral-500 font-mono text-xs">{time === 0 ? 'Infinito' : `${time}s`}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="120" 
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full accent-blue-400"
            />
          </div>

          {/* Size Slider */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Maximize size={18} className="text-green-400" />
                Tamaño del Texto
              </span>
              <span className="text-neutral-500 font-mono text-xs">{size}%</span>
            </label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-green-400"
            />
          </div>
        </div>

        {/* Play Action */}
        <button
          onClick={handlePlay}
          disabled={!text.trim()}
          className="w-full bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-3xl py-5 px-6 font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:shadow-none mt-4"
        >
          <Play fill="currentColor" size={24} />
          COMENZAR CARTEL
        </button>
      </div>

      <footer className="mt-12 text-sm text-neutral-600">
        Proyecto por <a href="https://2026.diegobogota.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors underline decoration-neutral-700 hover:decoration-neutral-400 underline-offset-4">Diego Bogotá</a>
      </footer>
    </div>
  );
}
