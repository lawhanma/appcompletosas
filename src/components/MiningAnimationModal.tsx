import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Search, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  X, 
  Radar, 
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import { MINED_PRODUCTS } from "../data/mockData";

interface MiningAnimationModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const PHASES = [
  { at: 12, label: "Conectando ao banco de dados Shopee Brasil & TikTok Shop..." },
  { at: 28, label: "Rastreando mais de 14.800 produtos com pico de tráfego e pedidos..." },
  { at: 48, label: "Calculando margem líquida, comissão direta e taxa de conversão > 3.8%..." },
  { at: 72, label: "Filtrando itens com entrega rápida no Brasil e estoque garantido..." },
  { at: 90, label: "Aplicando algoritmo preditivo de viralização e tração imediata..." },
  { at: 100, label: "Mineração finalizada! TOP 10 Produtos Prontos para Vender." }
];

export const MiningAnimationModal: React.FC<MiningAnimationModalProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const [progress, setProgress] = useState(0);
  const [discoveredProducts, setDiscoveredProducts] = useState<typeof MINED_PRODUCTS>([]);
  const [currentPhaseText, setCurrentPhaseText] = useState(PHASES[0].label);
  const [radarAngle, setRadarAngle] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setDiscoveredProducts([]);
      setCurrentPhaseText(PHASES[0].label);
      return;
    }

    // Rotate radar beam
    const radarInterval = setInterval(() => {
      setRadarAngle((prev) => (prev + 5) % 360);
    }, 20);

    // Progress counter
    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds total

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      // Update phase text
      const current = PHASES.find(p => pct <= p.at) || PHASES[PHASES.length - 1];
      setCurrentPhaseText(current.label);

      // Incrementally discover products
      const countToDiscover = Math.min(
        MINED_PRODUCTS.length,
        Math.floor((pct / 100) * MINED_PRODUCTS.length)
      );

      setDiscoveredProducts(MINED_PRODUCTS.slice(0, countToDiscover));

      if (pct >= 100) {
        clearInterval(progressInterval);
        clearInterval(radarInterval);
        
        // Short pause at 100% then finish
        setTimeout(() => {
          onComplete();
        }, 600);
      }
    }, 40);

    return () => {
      clearInterval(radarInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-orange-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-orange-950/50 text-white overflow-hidden flex flex-col justify-between">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-orange-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-orange-400">
              RADAR SHOP GO • ESCANEANDO MERCADO
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Pular animação"
          >
            <span className="text-[11px] font-semibold">Pular</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Radar Graphic & Progress */}
        <div className="my-6 relative z-10 flex flex-col items-center">
          
          {/* Circular Radar Scope */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-orange-500/25 bg-slate-950/80 flex items-center justify-center overflow-hidden shadow-inner shadow-orange-900/40">
            {/* Concentric rings */}
            <div className="absolute inset-4 rounded-full border border-orange-500/15" />
            <div className="absolute inset-10 rounded-full border border-orange-500/15" />
            <div className="absolute inset-16 rounded-full border border-orange-500/20" />
            
            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-orange-500/15" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-orange-500/15" />

            {/* Rotating Radar Beam Sweep */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `conic-gradient(from ${radarAngle}deg at 50% 50%, rgba(255, 87, 34, 0.4) 0deg, rgba(255, 87, 34, 0.0) 65deg, transparent 65deg)`
              }}
            />

            {/* Blips appearing at positions based on discovered products count */}
            {discoveredProducts.map((p, idx) => {
              // Deterministic coordinates for radar blips
              const positions = [
                { top: "28%", left: "35%" },
                { top: "65%", left: "70%" },
                { top: "32%", left: "68%" },
                { top: "72%", left: "28%" },
                { top: "45%", left: "22%" },
                { top: "20%", left: "55%" },
                { top: "58%", left: "42%" },
                { top: "78%", left: "55%" },
                { top: "40%", left: "80%" },
                { top: "52%", left: "62%" }
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={p.id}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-in zoom-in duration-300"
                >
                  <span className="absolute w-4 h-4 rounded-full bg-orange-400/40 animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-300" />
                </div>
              );
            })}

            {/* Radar Center Hub */}
            <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF5722] to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>

          {/* Percentage Counter */}
          <div className="mt-4 text-center space-y-1">
            <div className="font-mono-code text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1">
              <span>{progress}</span>
              <span className="text-orange-400 text-2xl">%</span>
            </div>
            
            <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-md mx-auto h-10 flex items-center justify-center text-center px-2 transition-all">
              {currentPhaseText}
            </p>
          </div>

          {/* Glowing Progress Bar */}
          <div className="w-full bg-slate-800/90 h-2.5 rounded-full overflow-hidden border border-slate-700 mt-2 relative">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF5722] rounded-full transition-all duration-100 ease-out shadow-sm shadow-orange-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Live Detected Stream Footer */}
        <div className="relative z-10 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Itens com Pico de Vendas Detectados:</span>
            </span>
            <span className="font-mono-code text-orange-400 font-bold">
              {discoveredProducts.length}/10 produtos
            </span>
          </div>

          {/* Horizontal mini badges ticker */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {discoveredProducts.length === 0 ? (
              <div className="text-xs text-slate-500 py-1 italic">
                Aguardando localização dos primeiros itens...
              </div>
            ) : (
              discoveredProducts.slice(-4).reverse().map((prod) => (
                <div 
                  key={prod.id} 
                  className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-orange-500/30 text-xs animate-in slide-in-from-right-4 duration-200"
                >
                  <img 
                    src={prod.imageUrl} 
                    alt={prod.name} 
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-md object-cover border border-slate-700 shrink-0" 
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-[11px] text-white truncate max-w-[130px]">
                      {prod.name}
                    </span>
                    <span className="text-[9px] font-mono-code text-emerald-400 font-bold">
                      R$ {prod.commissionValue.toFixed(2).replace(".", ",")} comissão
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Button if 100% */}
        {progress === 100 && (
          <div className="mt-4 pt-1">
            <button
              onClick={onComplete}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 animate-in zoom-in-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ver Top 10 Produtos Minerados</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
