import React, { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { DivulgacaoAutomaticaModal } from "./DivulgacaoAutomaticaModal";
import { ShopeeAffiliateAction } from "./ShopeeAffiliateAction";

interface ProductMetricsModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateTab: (tab: NavTab, product?: Product) => void;
}

export const ProductMetricsModal: React.FC<ProductMetricsModalProps> = ({
  product,
  onClose,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<"metricas" | "afiliar" | "anuncio" | "divulgacao-ia">("metricas");
  const [isAutoPostingOpen, setIsAutoPostingOpen] = useState(false);

  if (!product) return null;

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
                onClick={() => setIsAutoPostingOpen(true)}
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
                <span>MÉTRICAS</span>
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
            {activeTab === "metricas" && (
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
                  <button
                    onClick={() => onNavigateTab("gerar-videos", product)}
                    className="px-4 py-2 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Criativos</span>
                  </button>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Option 1: Vídeo Viral */}
                  <div 
                    onClick={() => onNavigateTab("gerar-videos", product)}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EE4D2D] flex items-center justify-center mb-2.5">
                        <Video className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Vídeo Viral com IA</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        Gera vídeo no formato vertical (TikTok, Reels, Shorts) com locução brasileira, legendas dinâmicas e roteiro completo.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-[#EE4D2D] gap-1">
                      Abrir Criador de Vídeos →
                    </div>
                  </div>

                  {/* Option 2: Divulgação Automática 6 Redes */}
                  <div 
                    onClick={() => setIsAutoPostingOpen(true)}
                    className="p-4 rounded-xl border border-emerald-200/80 hover:border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60 cursor-pointer transition-colors flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                          <Zap className="w-4 h-4 fill-white" />
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">6 Redes</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Divulgação Automática</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">
                        Postagem instantânea no Kwai, TikTok, Facebook, WhatsApp, Instagram e Twitter com cálculo de vendas em tempo real.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-emerald-800 gap-1">
                      Postar Automaticamente Agora ⚡
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
                        Copies prontas com gatilhos mentais para WhatsApp, canais de Telegram, +1.7M de membros em grupos do Facebook.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-slate-700 gap-1">
                      Abrir Grupos & Copies →
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DIVULGAÇÃO COM IA */}
            {activeTab === "divulgacao-ia" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Feature Banner */}
                <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded bg-orange-100 text-[#EE4D2D] text-[10px] font-semibold uppercase tracking-wider">
                      <Zap className="w-3 h-3 fill-current" />
                      Automação Multicanal Shopee
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      Divulgue esse Produto Automaticamente nas 6 Maiores Redes Sociais
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      A inteligência artificial localiza o público comprador, captura o vídeo 9:16 gerado para o produto, formata a copy persuasiva e publica no Kwai, TikTok, Facebook, WhatsApp, Instagram e Twitter.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAutoPostingOpen(true)}
                    className="px-4 py-2 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>POSTAR AGORA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 6 Target Social Platforms Grid */}
                <div>
                  <h4 className="text-xs font-medium uppercase text-slate-500 tracking-wider mb-2">
                    Canais Ativos na Divulgação Automática:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        KW
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-xs">Kwai Brasil</div>
                        <div className="text-[10px] text-slate-400">Vídeo 9:16 + Loja</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        TK
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-xs">TikTok Shop</div>
                        <div className="text-[10px] text-slate-400">Feed ForYou + Link</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        FB
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-xs">Facebook</div>
                        <div className="text-[10px] text-slate-400">+1.7M Membros</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        WA
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-xs">WhatsApp VIP</div>
                        <div className="text-[10px] text-slate-400">Listas & Grupos</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-pink-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        IG
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-xs">Instagram</div>
                        <div className="text-[10px] text-slate-400">Reels & Stories</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        TT
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-xs">Twitter / X</div>
                        <div className="text-[10px] text-slate-400">Threads de Oferta</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flow Steps explanation */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-lg space-y-2.5">
                  <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Etapas Automatizadas do Disparo:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2 bg-white p-2 rounded-md border border-slate-200/60">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                      <span><strong>Achando Público:</strong> Segmenta compradores da categoria {product.category}.</span>
                    </div>
                    <div className="flex items-start gap-2 bg-white p-2 rounded-md border border-slate-200/60">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                      <span><strong>Vídeo & Copy:</strong> Conecta criativo 9:16 com gancho de escassez e link de afiliado.</span>
                    </div>
                    <div className="flex items-start gap-2 bg-white p-2 rounded-md border border-slate-200/60">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                      <span><strong>Relatório:</strong> Exibe a quantidade de vendas e comissões no Pix geradas.</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAutoPostingOpen(true)}
                      className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>INICIAR DIVULGAÇÃO AUTOMÁTICA (SIMULAR POSTAGEM & VENDAS)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Platform Auto Posting & Sales Results Simulation Modal */}
      <DivulgacaoAutomaticaModal
        product={product}
        isOpen={isAutoPostingOpen}
        onClose={() => setIsAutoPostingOpen(false)}
        onNavigateToFinancial={() => {
          setIsAutoPostingOpen(false);
          onClose();
          onNavigateTab("financeiro");
        }}
      />
    </>
  );
};
