import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  X,
  Lock
} from "lucide-react";
import { getWorkingShopeeUrl } from "../utils/shopee";

interface AffiliationLoadingModalProps {
  product: Product | null;
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

const STEPS = [
  { at: 15, label: "Autenticando identificador de parceiro Shopee Brasil..." },
  { at: 40, label: "Vinculando comissão de afiliado com cookie de rastreamento..." },
  { at: 70, label: "Gerando link exclusivo com proteção de comissões..." },
  { at: 90, label: "Afiliação aprovada e validada com sucesso no sistema!" },
  { at: 100, label: "Redirecionando para a página oficial do produto..." }
];

export const AffiliationLoadingModal: React.FC<AffiliationLoadingModalProps> = ({
  product,
  isOpen,
  onComplete,
  onClose
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) {
      setProgress(0);
      setCurrentStepIndex(0);
      setIsDone(false);
      return;
    }

    setProgress(4);
    setCurrentStepIndex(0);
    setIsDone(false);

    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds total for smooth realistic feel

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 30) setCurrentStepIndex(0);
      else if (pct < 60) setCurrentStepIndex(1);
      else if (pct < 85) setCurrentStepIndex(2);
      else if (pct < 98) setCurrentStepIndex(3);
      else setCurrentStepIndex(4);

      if (pct >= 100) {
        clearInterval(timer);
        setIsDone(true);
        // Pequena pausa para o usuário ler "Redirecionando"
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [isOpen, product, onComplete]);

  if (!isOpen || !product) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Shopee Branding Badge */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-2xl bg-orange-500/20 animate-ping opacity-75" />
            <div className="relative w-14 h-14 rounded-2xl bg-[#EE4D2D] text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Sparkles className="w-7 h-7 text-white animate-spin-slow" />
            </div>
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-100 text-[#EE4D2D] text-[10px] font-bold tracking-wider uppercase mb-1">
              PROCESSO DE AFILIAÇÃO SHOPEE
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Afiliando ao Produto...
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 max-w-xs mx-auto mt-0.5">
              {product.name}
            </p>
          </div>
        </div>

        {/* Product Highlight Box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {product.name}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              <span>Comissão: <strong className="text-emerald-700">{product.commissionRate}%</strong></span>
              <span>•</span>
              <span>Ganho estimado: <strong className="text-emerald-700">R$ {product.commissionValue.toFixed(2).replace(".", ",")}</strong></span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-[#EE4D2D] animate-spin" />
              <span>Conectando com a Shopee...</span>
            </span>
            <span className="font-mono-code font-bold text-[#EE4D2D] text-sm">
              {progress}%
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 via-[#EE4D2D] to-emerald-500 rounded-full transition-all duration-100 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step Status */}
        <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/70 flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center shrink-0 mt-0.5">
            {isDone ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <Zap className="w-3 h-3 text-white fill-white" />
            )}
          </div>
          <div className="text-xs text-slate-800 leading-relaxed font-medium">
            {STEPS[currentStepIndex].label}
          </div>
        </div>

        {/* Security & Assurance Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Vínculo oficial criptografado Shopee Afiliados</span>
        </div>
      </div>
    </div>
  );
};
