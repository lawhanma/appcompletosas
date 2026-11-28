import React, { useState, useEffect } from "react";
import {useDailyMissions} from '../context/DailyMissions';
import { Product, NavTab } from "../types";
import { 
  X, 
  TrendingUp, 
  Target, 
  Search, 
  Percent, 
  DollarSign, 
  Award, 
  Package, 
  Sparkles, 
  Video, 
  Share2,
  Zap,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { DivulgacaoAutomaticaModal } from "./DivulgacaoAutomaticaModal";
import { ShopeeAffiliateAction } from "./ShopeeAffiliateAction";

interface ProductMetricsModalProps {
  product: Product | null;
  canCreateVideos?: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab, product?: Product) => void;
}

export const ProductMetricsModal: React.FC<ProductMetricsModalProps> = ({
  product,
  canCreateVideos = false,
  onClose,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<"metricas" | "afiliar" | "anuncio" | "divulgacao-ia">("metricas");
  const [isAutoPostingOpen, setIsAutoPostingOpen] = useState(false);

  const {record} = useDailyMissions();
  useEffect(() => {if (product) record('product',product.id);},[product?.id,record]);

  if (!product) return null;

  const handleOpenAutoPosting = () => {
    setIsAutoPostingOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
        <div 
          className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between p-5 pb-3.5 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EE4D2D] flex items-center justify-center shrink-0 mt-0.5">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-display">
                  {product.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualize métricas consolidadas, gerencie sua afiliação e gere criativos automatizados com IA.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAutoPosting}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Divulgar com I.A</span>
              </button>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Tabs Bar */}
          <div className="px-5 pt-3 bg-slate-50/50 border-b border-slate-100">
            <div className="inline-flex flex-wrap bg-slate-100 p-0.5 rounded-lg gap-1 text-xs font-medium border border-slate-200/60">
              <button
                onClick={() => setActiveTab("metricas")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === "metricas"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{product.listingSourceUrl ? "ANÚNCIO" : "MÉTRICAS"}</span>
              </button>
              <button
                onClick={() => setActiveTab("afiliar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === "afiliar"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>AFILIAR</span>
              </button>
              <button
                onClick={() => setActiveTab("anuncio")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === "anuncio"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>GERAR ANÚNCIO</span>
              </button>
              <button
                onClick={() => setActiveTab("divulgacao-ia")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === "divulgacao-ia"
                    ? "bg-slate-900 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>DIVULGAÇÃO COM I.A</span>
                <span className="text-[9px] px-1 py-0.2 bg-white/20 rounded font-semibold text-white">6 REDES</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {/* TAB 1: MÉTRICAS */}
            {activeTab === "metricas" && product.listingSourceUrl && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">{product.description} Consulte o Portal de Afiliados para verificar a comissão elegível.</p>
                <div className="flex flex-wrap items-center gap-2">
                  <a href={product.shopeeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white">Abrir anúncio na Shopee</a>
                  <a href={product.listingSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-slate-700 underline">Fonte do anúncio</a>
                </div>
              </div>
            )}
            {activeTab === "metricas" && !product.listingSourceUrl && (
              <div className="space-y-4">
                {/* Two Top Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Performance de Vendas */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase mb-3">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>PERFORMANCE DE VENDAS</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Unidades Vendidas:</span>
                        <span className="font-mono-code font-bold text-slate-900 text-sm">{product.unitsSold}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Receita Gerada:</span>
                        <span className="font-mono-code font-bold text-emerald-700 text-sm">{product.revenueGenerated}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Preço de Venda:</span>
                        <span className="font-mono-code font-bold text-slate-900 text-sm">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Análise de Mercado */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EE4D2D] uppercase mb-3">
                        <Target className="w-3.5 h-3.5" />
                        <span>ANÁLISE DE MERCADO</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-slate-500">Facilidade de Venda:</span>
                        <span className="font-semibold text-slate-900">{product.marketDifficulty}</span>
                      </div>
                      <div className="text-center py-1 px-2.5 rounded bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100 mb-2">
                        {product.marketTag}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-500">Conversão Estimada:</span>
                        <span className="font-mono-code font-bold text-slate-900">{product.estimatedConversion.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#EE4D2D] h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(product.estimatedConversion * 15, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Four Bottom Stat Tiles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 uppercase">
                      <Search className="w-3 h-3 text-slate-400" />
                      <span>VOLUME DE BUSCA</span>
                    </div>
                    <div className="text-slate-900 font-mono-code font-bold text-sm mt-1">
                      {product.searchVolumeMonthly}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 uppercase">
                      <Percent className="w-3 h-3 text-slate-400" />
                      <span>MARGEM MÉDIA</span>
                    </div>
                    <div className="text-slate-900 font-mono-code font-bold text-sm mt-1">
                      {product.averageMargin}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 uppercase">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      <span>LUCRO P/ UNIDADE</span>
                    </div>
                    <div className="text-emerald-700 font-mono-code font-bold text-sm mt-1">
                      R$ {product.unitProfit.toFixed(2).replace(".", ",")}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 uppercase">
                      <Award className="w-3 h-3 text-slate-400" />
                      <span>SCORE DE SUCESSO</span>
                    </div>
                    <div className="text-slate-900 font-mono-code font-bold text-sm mt-1">
                      {product.successScore}/100
                    </div>
                  </div>
                </div>

                {/* Bottom CTAs */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveTab("afiliar")}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Ir para Afiliação
                  </button>
                  {canCreateVideos && <button
                    onClick={() => onNavigateTab("gerar-videos", product)}
                    className="px-4 py-2 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar no Flow</span>
                  </button>}
                </div>
              </div>
            )}

            {/* TAB 2: AFILIAR */}
            {activeTab === "afiliar" && (
              <ShopeeAffiliateAction
                product={product}
                variant="full"
                onOpenFullModal={() => onNavigateTab("divulgacao", product)}
              />
            )}

            {/* TAB 3: GERAR ANÚNCIO */}
            {activeTab === "anuncio" && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-500">
                  Selecione o canal para o qual deseja criar conteúdo viral ou automação com IA:
                </p>

                <div className={`grid grid-cols-1 ${canCreateVideos ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3.5`}>
                  {/* Option 1: Vídeo Viral */}
                  {canCreateVideos && <div
                    onClick={() => onNavigateTab("gerar-videos", product)}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EE4D2D] flex items-center justify-center mb-2.5">
                        <Video className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Roteiro para Flow</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        Prepare o roteiro e o prompt para gerar o vídeo no Google Flow.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-[#EE4D2D] gap-1">
                      Abrir criação no Flow →
                    </div>
                  </div>}

                  {/* Option 2: Divulgação Automática 6 Redes */}
                  <div 
                    onClick={handleOpenAutoPosting}
                    className="p-4 rounded-xl border border-emerald-200/80 hover:border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60 cursor-pointer transition-colors flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                          <Zap className="w-4 h-4 fill-white" />
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">Oferta</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Divulgação Automática</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">
                        Prepare o texto do produto com seu link de afiliado.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-emerald-800 gap-1">
                      Preparar divulgação →
                    </div>
                  </div>

                  {/* Option 3: Grupos & Copies */}
                  <div 
                    onClick={() => onNavigateTab("divulgacao", product)}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Grupos do Facebook & Copies</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        Textos para compartilhar em grupos de ofertas.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-slate-700 gap-1">
                      Abrir Grupos & Copies →
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "divulgacao-ia" && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="font-semibold text-slate-900">Prepare esta oferta</h3>
                <p className="text-sm text-slate-600">Gere o texto com seu link de afiliado para compartilhar nas suas redes.</p>
                <button type="button" onClick={handleOpenAutoPosting} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700">
                  <Zap className="size-4" aria-hidden="true" /> Preparar divulgação
                </button>
              </section>
            )}
          </div>
        </div>
      </div>

      <DivulgacaoAutomaticaModal
        product={product}
        isOpen={isAutoPostingOpen}
        onClose={() => setIsAutoPostingOpen(false)}
      />
    </>
  );
};
