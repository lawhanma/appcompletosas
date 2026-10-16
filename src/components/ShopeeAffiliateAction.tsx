import React, { useState } from "react";
import { Product } from "../types";
import { 
  ExternalLink, 
  Check, 
  Copy, 
  Link as LinkIcon, 
  UserCheck, 
  UserPlus, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useShopeeAffiliation } from "../utils/useShopeeAffiliation";
import { getWorkingShopeeUrl } from "../utils/shopee";
import { AffiliationLoadingModal } from "./AffiliationLoadingModal";
import {useDailyMissions} from '../context/DailyMissions';

interface ShopeeAffiliateActionProps {
  product: Product;
  variant?: "card" | "full";
  onOpenFullModal?: () => void;
  onAffiliationComplete?: () => void;
}

export const ShopeeAffiliateAction: React.FC<ShopeeAffiliateActionProps> = ({
  product,
  variant = "full",
  onOpenFullModal,
  onAffiliationComplete
}) => {
  const {record} = useDailyMissions();
  const {
    isCode101190,
    isAffiliated,
    markProductAsAffiliated,
    getProductAffiliateLink,
    handleGetAffiliateLink
  } = useShopeeAffiliation();

  const [isLoadingAnimationOpen, setIsLoadingAnimationOpen] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const productAffiliated = isAffiliated(product.id);
  const affiliateLink = getProductAffiliateLink(product);

  const handleCopyOnly = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {await navigator.clipboard.writeText(affiliateLink);} catch {return;}
    record('link',product.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePegarLinkClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const wasCopied = await handleGetAffiliateLink(product);
    if (wasCopied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Start the official affiliation flow with loading animation
  const handleStartAffiliation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowOptionsModal(false);
    setIsLoadingAnimationOpen(true);
  };

  // Callback when loading animation finishes
  const handleCompleteAffiliation = () => {
    markProductAsAffiliated(product.id);
    setIsLoadingAnimationOpen(false);
    
    // Open official product page on Shopee
    const targetUrl = getWorkingShopeeUrl(product);
    window.open(targetUrl, "_blank", "noopener,noreferrer");

    // Feedback toast
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    if (onAffiliationComplete) {
      onAffiliationComplete();
    }
  };

  // -------------------------------------------------------------
  // VARIANT: CARD (Used directly inside catalog product cards)
  // -------------------------------------------------------------
  if (variant === "card") {
    // If not affiliated yet (First time for 101190)
    if (!productAffiliated && isCode101190) {
      return (
        <>
          <button
            type="button"
            onClick={handleStartAffiliation}
            className="w-full py-2 px-3 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
            title="Aperte para se afiliar ao produto na Shopee"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Se afiliar ao produto na Shopee</span>
          </button>

          {isLoadingAnimationOpen && (
            <AffiliationLoadingModal
              product={product}
              isOpen={isLoadingAnimationOpen}
              onComplete={handleCompleteAffiliation}
              onClose={() => setIsLoadingAnimationOpen(false)}
            />
          )}
        </>
      );
    }

    // Subsequent times: "Pegar link de afiliação"
    return (
      <>
        <button
          type="button"
          onClick={handlePegarLinkClick}
          className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
          title="Copiar link e abrir anúncio na Shopee"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Link Copiado! Abrindo...</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Pegar link de afiliação</span>
            </>
          )}
        </button>
      </>
    );
  }

  // -------------------------------------------------------------
  // VARIANT: FULL (Used inside ProductMetricsModal -> AFILIAR tab)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {!productAffiliated && isCode101190 ? (
        <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 uppercase tracking-wide">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Primeiro Acesso: Afiliação Pendente</span>
            </div>
            <p className="text-xs text-amber-800">
              Para faturar comissões e divulgar nas redes, conecte este produto à sua conta Shopee apertando no botão abaixo.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartAffiliation}
            className="px-3.5 py-2 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Se afiliar ao produto na Shopee</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200/70 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Afiliação Aprovada e Ativa na Shopee
            </span>
            <p className="text-xs text-emerald-900 mt-0.5">
              Você ganha <strong>{product.commissionRate}%</strong> de comissão líquida a cada venda realizada pelo seu link.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-emerald-700">Seu ganho por venda:</span>
            <div className="text-base font-mono-code font-bold text-emerald-800">
              R$ {product.commissionValue.toFixed(2).replace(".", ",")}
            </div>
          </div>
        </div>
      )}

      {/* Main Action Box: First time vs Subsequent times */}
      {!productAffiliated && isCode101190 ? (
        <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xs space-y-3.5">
          <div>
            <span className="inline-block px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold text-[10px] tracking-wider uppercase mb-1 border border-orange-500/30">
              PASSO OBRIGATÓRIO DE AFILIAÇÃO
            </span>
            <h4 className="text-sm sm:text-base font-semibold text-white">
              Pronto para se afiliar a {product.name}?
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              Aperte no botão abaixo para se afiliar ao produto na Shopee. Uma animação rápida sincronizará sua conta de afiliado e você será redirecionado para a página do produto.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleStartAffiliation}
              className="flex-1 py-3 px-4 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>APERTAR PARA SE AFILIAR AO PRODUTO</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => setShowOptionsModal(true)}
              className="py-2.5 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Opções de Conta
            </button>
          </div>
        </div>
      ) : (
        /* Subsequent times: "Pegar link de afiliação" banner */
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-semibold uppercase">
              <Check className="w-3 h-3" />
              Link Pronto para Divulgação
            </span>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
              Pronto para compartilhar e receber comissões
            </h4>
            <p className="text-xs text-slate-500">
              Clique em pegar link para copiar o link rastreado e abrir o anúncio oficial do produto.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePegarLinkClick}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copiado! Abrindo...</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Pegar link de afiliação</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Link Box */}
      <div>
        <label className="text-xs font-medium text-slate-700 block mb-1">
          Seu Link de Afiliado com Rastreamento Shop GO:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={affiliateLink}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 py-2 px-3 rounded-lg focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleCopyOnly()}
            className="shrink-0 px-3.5 py-2 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Details & Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <a
          href={getWorkingShopeeUrl(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-white border border-slate-200/80 rounded-lg hover:border-slate-300 hover:bg-slate-50/50 transition-colors flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
            <ExternalLink className="w-3.5 h-3.5 text-[#EE4D2D]" />
            <span>Abrir anúncio oficial na Shopee</span>
          </div>
          <span className="text-[11px] text-orange-600 font-medium group-hover:underline">Ver anúncio ↗</span>
        </a>

        {onOpenFullModal && (
          <button
            type="button"
            onClick={onOpenFullModal}
            className="p-3 bg-white border border-slate-200/80 rounded-lg hover:border-slate-300 hover:bg-slate-50/50 transition-colors flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Configurar no Portal Shopee</span>
            </div>
            <span className="text-[11px] text-blue-600 font-medium">Abrir →</span>
          </button>
        )}
      </div>

      {/* Commission Details */}
      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800">Regras de Comissionamento:</div>
        <div className="flex justify-between">
          <span>• Comissão Shopee Afiliados (Oficial):</span>
          <span className="font-medium text-slate-800 font-mono-code">{product.commissionRate}%</span>
        </div>
        <div className="flex justify-between">
          <span>• Bônus Exclusivo de Fornecedor Shop GO:</span>
          <span className="font-medium text-emerald-700 font-mono-code">+5%</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
          <span>Total Repassado via Pix:</span>
          <span className="text-emerald-700 font-bold font-mono-code text-xs sm:text-sm">
            R$ {product.commissionValue.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Loading Animation Modal */}
      {isLoadingAnimationOpen && (
        <AffiliationLoadingModal
          product={product}
          isOpen={isLoadingAnimationOpen}
          onComplete={handleCompleteAffiliation}
          onClose={() => setIsLoadingAnimationOpen(false)}
        />
      )}

      {/* Options Dialog */}
      {showOptionsModal && renderOptionsDialog()}
    </div>
  );

  // -------------------------------------------------------------
  // MODAL / POPUP DIALOG WITH THE 2 OPTIONS
  // -------------------------------------------------------------
  function renderOptionsDialog() {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={(e) => {
          e.stopPropagation();
          setShowOptionsModal(false);
        }}
      >
        <div 
          className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#EE4D2D] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 font-display">
              Opções de Conta Shopee Afiliados
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {product.name}
            </p>
          </div>

          {/* 2 Options Cards */}
          <div className="space-y-2.5">
            {/* Option 1: JÁ TENHO CONTA */}
            <div 
              onClick={handleStartAffiliation}
              className="p-3.5 rounded-lg border border-emerald-200/80 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-colors flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                    <span>Sim, já tenho conta na Shopee</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-semibold">RECOMENDADO</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Iniciar animação de carregamento e abrir a Shopee para se afiliar agora.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Option 2: NÃO TENHO CONTA */}
            <a 
              href="https://affiliate.shopee.com.br"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowOptionsModal(false)}
              className="p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-colors flex items-center justify-between group shadow-2xs block"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EE4D2D] text-white flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">
                    Não tenho conta de afiliado
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Abrir portal oficial <strong className="text-slate-800">affiliate.shopee.com.br</strong> para criar cadastro gratuito.
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
            </a>
          </div>

          {/* Footer cancel button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptionsModal(false)}
              className="w-full py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }
};
