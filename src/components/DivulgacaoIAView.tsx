import React, { useState, useEffect, useRef } from "react";
import { Product } from "../types";
import { PRODUCTS } from "../data/mockData";
import { useFinancial } from "../context/FinancialContext";
import {useDailyMissions} from '../context/DailyMissions';
import {AffiliateLinkField} from './AffiliateLinkField';
import {validateAffiliateLink} from '../utils/affiliateLink';
import {CreditRenewalModal} from "./CreditRenewalModal";
import { GruposOfertasView } from "./GruposOfertasView";
import { 
  Sparkles, 
  Search, 
  Check, 
  Play, 
  CheckCircle,
  Package,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface DivulgacaoIAViewProps {
  initialProduct?: Product | null;
  onOpenVideoCreator: (product: Product) => void;
  defaultSubTab?: "automatica" | "grupos" | "tiktok";
}

export const DivulgacaoIAView: React.FC<DivulgacaoIAViewProps> = ({ 
  initialProduct = null,
  onOpenVideoCreator,
  defaultSubTab = "automatica"
}) => {
  const { state, userCode, isVip, addCommission, consumeAiCredit } = useFinancial();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const dailyCredits = isVip ? 5 : 4;
  const {record} = useDailyMissions();

  const [subTab, setSubTab] = useState<"automatica" | "grupos" | "tiktok">(defaultSubTab);

  useEffect(() => {
    if (defaultSubTab) {
      setSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);
  
  // Selected product
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    initialProduct || PRODUCTS.find(p => p.name.includes("Fone Bluetooth")) || PRODUCTS[0]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [affiliateLink,setAffiliateLink] = useState('');
  const [linkError,setLinkError] = useState('');
  useEffect(()=>{setAffiliateLink('');setLinkError('');},[selectedProduct.id]);

  // Multi-platform posting animation state
  const [isPosting, setIsPosting] = useState(false);
  const [postingProgress, setPostingProgress] = useState(0);
  const [postingStatusMessage, setPostingStatusMessage] = useState("");
  const [platformStatuses, setPlatformStatuses] = useState<{
    kwai: "pendente" | "publicando" | "publicado";
    tiktok: "pendente" | "publicando" | "publicado";
    facebook: "pendente" | "publicando" | "publicado";
    whatsapp: "pendente" | "publicando" | "publicado";
    instagram: "pendente" | "publicando" | "publicado";
    twitter: "pendente" | "publicando" | "publicado";
  }>({
    kwai: "pendente",
    tiktok: "pendente",
    facebook: "pendente",
    whatsapp: "pendente",
    instagram: "pendente",
    twitter: "pendente"
  });

  const [campaignResult, setCampaignResult] = useState<{
    salesCount: number;
    commissionAmount: number;
    grossSales: number;
    views: number;
    affiliateLink: string;
    copyText: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    "Todos", 
    "Eletrônicos", 
    "Cosméticos", 
    "Sazonais", 
    "Utilidades", 
    "Cozinha", 
    "Casa & Jardim", 
    "Brinquedos"
  ];

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      categoryFilter === "Todos" || 
      p.category.toLowerCase().includes(categoryFilter.toLowerCase().slice(0, 4));
    return matchesSearch && matchesCategory;
  });

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Run Automated Posting Simulation (~30s realistic sequential process)
  const handleStartAutoPosting = () => {
    if (state.aiCredits <= 0) {setRenewalOpen(true);return;}
    const campaignLink = validateAffiliateLink(affiliateLink);
    if (!campaignLink) {setLinkError('Cole um link de afiliado válido, começando com https:// ou http://.');return;}
    setLinkError('');

    clearAllTimers();
    setIsPosting(true);
    setCampaignResult(null);
    setPostingProgress(2);
    setPostingStatusMessage(`Iniciando inteligência artificial e analisando produto: ${selectedProduct.name}...`);
    setPlatformStatuses({
      kwai: "pendente",
      tiktok: "pendente",
      facebook: "pendente",
      whatsapp: "pendente",
      instagram: "pendente",
      twitter: "pendente"
    });

    const addTimer = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    // 0s - 2.5s: Initial AI startup
    addTimer(() => {
      setPostingProgress(6);
      setPostingStatusMessage("Mapeando público comprador com maior taxa de conversão na Shopee...");
    }, 2500);

    // 2.5s - 5.0s: Copywriting & Creative Script
    addTimer(() => {
      setPostingProgress(12);
      setPostingStatusMessage("Gerando copys de alta conversão, hashtags quentes e roteiros dinâmicos com IA...");
    }, 5000);

    // 5.0s - 7.5s: 1/6 Kwai starts
    addTimer(() => {
      setPostingProgress(18);
      setPostingStatusMessage("1/6 • Conectando à API do Kwai e renderizando criativo vertical 9:16...");
      setPlatformStatuses(prev => ({ ...prev, kwai: "publicando" }));
    }, 7500);

    addTimer(() => {
      setPostingProgress(24);
      setPostingStatusMessage("1/6 • Finalizando upload e ativando link de afiliado oficial no Kwai...");
    }, 9500);

    // 11.5s: 1/6 Kwai finished! 2/6 TikTok starts
    addTimer(() => {
      setPostingProgress(30);
      setPostingStatusMessage("2/6 • Kwai publicado com sucesso! Autenticando no TikTok Shop...");
      setPlatformStatuses(prev => ({ ...prev, kwai: "publicado", tiktok: "publicando" }));
    }, 11500);

    addTimer(() => {
      setPostingProgress(38);
      setPostingStatusMessage("2/6 • Publicando criativo no TikTok Shop e aplicando tags virais...");
    }, 13500);

    // 15.5s: 2/6 TikTok finished! 3/6 Facebook starts
    addTimer(() => {
      setPostingProgress(46);
      setPostingStatusMessage("3/6 • TikTok publicado com sucesso! Conectando aos grupos de ofertas do Facebook...");
      setPlatformStatuses(prev => ({ ...prev, tiktok: "publicado", facebook: "publicando" }));
    }, 15500);

    addTimer(() => {
      setPostingProgress(54);
      setPostingStatusMessage("3/6 • Distribuindo anúncio persuasivo em comunidades ativas do Facebook...");
    }, 17500);

    // 19.5s: 3/6 Facebook finished! 4/6 WhatsApp starts
    addTimer(() => {
      setPostingProgress(62);
      setPostingStatusMessage("4/6 • Facebook publicado com sucesso! Sincronizando canais e grupos VIP do WhatsApp...");
      setPlatformStatuses(prev => ({ ...prev, facebook: "publicado", whatsapp: "publicando" }));
    }, 19500);

    addTimer(() => {
      setPostingProgress(70);
      setPostingStatusMessage("4/6 • Disparando mensagem de oferta e cupom exclusivo nos grupos do WhatsApp...");
    }, 21500);

    // 23.5s: 4/6 WhatsApp finished! 5/6 Instagram starts
    addTimer(() => {
      setPostingProgress(78);
      setPostingStatusMessage("5/6 • WhatsApp disparado com sucesso! Conectando à API do Instagram...");
      setPlatformStatuses(prev => ({ ...prev, whatsapp: "publicado", instagram: "publicando" }));
    }, 23500);

    addTimer(() => {
      setPostingProgress(85);
      setPostingStatusMessage("5/6 • Renderizando Reels e gerando sticker com link rastreado no Instagram Stories...");
    }, 25500);

    // 27.0s: 5/6 Instagram finished! 6/6 Twitter starts
    addTimer(() => {
      setPostingProgress(91);
      setPostingStatusMessage("6/6 • Instagram publicado com sucesso! Conectando ao Twitter / X...");
      setPlatformStatuses(prev => ({ ...prev, instagram: "publicado", twitter: "publicando" }));
    }, 27000);

    addTimer(() => {
      setPostingProgress(96);
      setPostingStatusMessage("6/6 • Publicando thread de ofertas com link de afiliado no Twitter / X...");
    }, 28500);

    // 29.8s: 6/6 Twitter finished
    addTimer(() => {
      setPostingProgress(99);
      setPostingStatusMessage("Todas as 6 redes publicadas com sucesso! Consolidando vendas e comissões...");
      setPlatformStatuses(prev => ({ ...prev, twitter: "publicado" }));
    }, 29800);

    // 30.8s: Complete! Calculate commission and credit balance
    addTimer(() => {
      consumeAiCredit();

      let commission: number;
      let sales: number;
      let gross: number;
      let reachViews: number;

      const isVipUser = userCode === "123456" || userCode === "12456";

      if (isVipUser) {
        // Exigência: no código de compra 123456, ganhar mais saldo entre R$ 20,00 a R$ 70,00 por divulgação
        const randomVal = Math.random() * (70 - 20) + 20;
        commission = Number(randomVal.toFixed(2));
        sales = Math.floor(Math.random() * 3 + 2); // 2 a 4 vendas
        gross = Number((selectedProduct.price * sales).toFixed(2));
        reachViews = Math.floor(Math.random() * 5000 + 12500);
      } else {
        // Regra estrita do usuário: No código 101190 não entra nenhuma venda ou comissão!
        commission = 0;
        sales = 0;
        gross = 0;
        reachViews = Math.floor(Math.random() * 450 + 820);
      }

      setCampaignResult({
        affiliateLink: campaignLink,
        copyText: `${selectedProduct.name} por R$ ${selectedProduct.price.toFixed(2).replace(".", ",")}\nConfira a oferta: ${campaignLink}`,
        salesCount: sales,
        commissionAmount: commission,
        grossSales: gross,
        views: reachViews
      });

      if (commission > 0) {
        addCommission(
          commission, 
          selectedProduct.name, 
          "Divulgação Automática (6 Redes)", 
          "divulgacao",
          gross,
          sales
        );
      }
      setIsPosting(false);
      if (state.aiCredits <= 1) setRenewalOpen(true);
      record('campaign',`${selectedProduct.id}:${Date.now()}`);
    }, 30800);
  };

  return (
    <div className="space-y-6">
      {renewalOpen && <CreditRenewalModal onClose={() => setRenewalOpen(false)} />}
      {state.aiCredits <= 0 && !isPosting && <button type="button" onClick={() => setRenewalOpen(true)} className="w-full rounded-xl bg-orange-50 border border-orange-200 p-4 text-sm font-semibold text-orange-700">Seus créditos acabaram — renovar créditos</button>}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-3.5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Tabs */}
      <div className="flex items-center justify-center p-1 bg-slate-100 rounded-lg max-w-lg mx-auto border border-slate-200/60">
        <button
          onClick={() => setSubTab("automatica")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            subTab === "automatica"
              ? "bg-white text-slate-900 font-semibold shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Automática
        </button>

        <button
          onClick={() => setSubTab("grupos")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            subTab === "grupos"
              ? "bg-white text-slate-900 font-semibold shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Divulgação em grupo de ofertas
        </button>

        <button
          onClick={() => setSubTab("tiktok")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            subTab === "tiktok"
              ? "bg-white text-slate-900 font-semibold shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          TikTok Shop
        </button>
      </div>

      {/* TAB 1: DIVULGAÇÃO AUTOMÁTICA */}
      {subTab === "automatica" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Créditos de IA + PRODUTO SELECIONADO */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card: Créditos de IA */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EE4D2D] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">
                    Créditos de IA
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Campanhas disponíveis
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <span>Status do Limite</span>
                  <span className="text-[#EE4D2D] font-mono-code font-semibold">
                    {state.aiCredits}/{dailyCredits} ({Math.round((state.aiCredits / dailyCredits) * 100)}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#EE4D2D] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (state.aiCredits / dailyCredits) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Alert note */}
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-xs text-slate-600 leading-relaxed">
                Você tem <strong>{state.aiCredits} créditos por dia</strong> — cada divulgação consome 1 crédito. Renovam todo dia às 0h (horário de Brasília).
              </div>
            </div>

            {/* Card: PRODUTO SELECIONADO */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  <span>PRODUTO SELECIONADO</span>
                </div>
                <span className="text-xs text-slate-500">Use seu próprio link</span>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-md object-cover border border-slate-200 shrink-0 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-slate-900 text-xs leading-snug line-clamp-2">
                    {selectedProduct.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-mono-code font-bold text-[#EE4D2D]">
                      R$ {selectedProduct.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      +R$ {selectedProduct.commissionValue.toFixed(2).replace(".", ",")} comissão
                    </span>
                  </div>
                </div>
              </div>

              <AffiliateLinkField value={affiliateLink} onChange={value=>{setAffiliateLink(value);setLinkError('');}} error={linkError} disabled={isPosting}/>

              <p className="text-xs text-slate-500 italic px-0.5 leading-relaxed">
                "{selectedProduct.description || `${selectedProduct.name} de alta conversão, qualidade premium e entrega rápida garantida na Shopee.`}"
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Selection Grid OR Active Posting Animation */}
          <div className="lg:col-span-8">
            {isPosting ? (
              /* ACTIVE POSTING ANIMATION (~30s SEQUENTIAL REALISTIC DISSEMINATION) */
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedProduct.imageUrl} 
                      alt="" 
                      className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#EE4D2D] uppercase tracking-wider block">
                        DIVULGANDO EM TEMPO REAL:
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {selectedProduct.name}
                      </h4>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-medium text-orange-700 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-[#EE4D2D] animate-ping" />
                    <span>Disparo em Ordem • ~30s</span>
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EE4D2D]" />
                      <span className="uppercase tracking-wider">
                        PUBLICANDO NAS 6 REDES SOCIAIS...
                      </span>
                    </div>
                    <span className="font-mono-code font-bold text-slate-900 text-sm">{postingProgress}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
                    <div 
                      className="bg-gradient-to-r from-amber-500 via-[#EE4D2D] to-[#E03A17] h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${postingProgress}%` }}
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center gap-2 text-xs text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-pulse" />
                    <span className="font-medium italic truncate">{postingStatusMessage}</span>
                  </div>
                </div>

                {/* 6 Platform Status Cards in Order */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { id: "kwai" as const, name: "Kwai", desc: "Vídeo 9:16 + Loja", order: "1º App" },
                    { id: "tiktok" as const, name: "TikTok", desc: "TikTok Shop Viral", order: "2º App" },
                    { id: "facebook" as const, name: "Facebook", desc: "Grupos de Ofertas", order: "3º App" },
                    { id: "whatsapp" as const, name: "WhatsApp", desc: "Canais & Grupos VIP", order: "4º App" },
                    { id: "instagram" as const, name: "Instagram", desc: "Reels & Stories", order: "5º App" },
                    { id: "twitter" as const, name: "Twitter / X", desc: "Thread de Achados", order: "6º App" },
                  ].map((plat) => {
                    const st = platformStatuses[plat.id];
                    return (
                      <div
                        key={plat.id}
                        className={`p-3.5 rounded-xl border text-center transition-all duration-300 flex flex-col justify-between min-h-[96px] ${
                          st === "publicado"
                            ? "border-emerald-300 bg-emerald-50/70 shadow-2xs"
                            : st === "publicando"
                            ? "border-[#EE4D2D] bg-orange-50/70 ring-2 ring-[#EE4D2D]/20 shadow-xs animate-pulse"
                            : "border-slate-200 bg-slate-50/70 text-slate-400"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${
                              st === "publicado"
                                ? "text-slate-900"
                                : st === "publicando"
                                ? "text-[#EE4D2D]"
                                : "text-slate-600"
                            }`}>
                              {plat.name}
                            </span>
                            <span className={`text-[9px] font-mono-code font-bold px-1.5 py-0.2 rounded ${
                              st === "publicado"
                                ? "bg-emerald-100 text-emerald-800"
                                : st === "publicando"
                                ? "bg-orange-100 text-[#EE4D2D]"
                                : "bg-slate-100 text-slate-400"
                            }`}>
                              {plat.order}
                            </span>
                          </div>
                          <div className={`text-[10px] mt-1 truncate ${
                            st === "publicando" ? "text-orange-700 font-medium" : "text-slate-400"
                          }`}>
                            {plat.desc}
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-center">
                          {st === "publicado" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>PUBLICADO</span>
                            </span>
                          ) : st === "publicando" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EE4D2D] text-white text-[10px] font-bold shadow-2xs">
                              <Loader2 className="w-3 h-3 animate-spin shrink-0 text-white" />
                              <span>PUBLICANDO...</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>NA FILA</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : campaignResult ? (
              /* RESULTS DASHBOARD AFTER POSTING */
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                      CAMPANHA DISPARADA COM SUCESSO!
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Resultados da Divulgação Automática
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-orange-50/50 border border-orange-200/70 rounded-lg">
                    <span className="text-[10px] font-medium text-slate-500 uppercase">
                      Comissão Gerada
                    </span>
                    <div className="text-xl font-mono-code font-bold text-[#EE4D2D] mt-1">
                      R$ {campaignResult.commissionAmount.toFixed(2).replace(".", ",")}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Creditada no Financeiro
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-lg">
                    <span className="text-[10px] font-medium text-slate-500 uppercase">
                      Vendas Concluídas
                    </span>
                    <div className="text-xl font-mono-code font-bold text-slate-900 mt-1">
                      {campaignResult.salesCount} {campaignResult.salesCount === 1 ? "venda" : "vendas"}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Pedidos faturados
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-lg">
                    <span className="text-[10px] font-medium text-slate-500 uppercase">
                      Faturamento Bruto
                    </span>
                    <div className="text-xl font-mono-code font-bold text-slate-900 mt-1">
                      R$ {campaignResult.grossSales.toFixed(2).replace(".", ",")}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Valor total vendido
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-lg">
                    <span className="text-[10px] font-medium text-slate-500 uppercase">
                      Alcance Total
                    </span>
                    <div className="text-xl font-mono-code font-bold text-slate-900 mt-1">
                      {campaignResult.views.toLocaleString("pt-BR")}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Pessoas impactadas
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <label htmlFor="campaign-copy" className="block text-xs font-semibold text-slate-900">Texto da campanha com seu link</label>
                  <textarea id="campaign-copy" readOnly value={campaignResult.copyText} className="w-full min-h-28 rounded-lg border border-slate-200 p-3 text-xs text-slate-700"/>
                  <button type="button" onClick={async()=>{try {await navigator.clipboard.writeText(campaignResult.copyText);setToastMessage('Texto da campanha copiado!');setTimeout(()=>setToastMessage(null),3000);} catch {setToastMessage('Selecione o texto acima para copiar.');}}} className="text-xs font-semibold text-[#EE4D2D]">Copiar texto da campanha</button>
                </div>

                {campaignResult.commissionAmount <= 0 && !(userCode === "123456" || userCode === "12456") ? (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs flex items-center justify-between">
                    <span>
                      ℹ️ <strong>Divulgação Concluída:</strong> Anúncios e links de afiliado ativos nas 6 redes sociais gerando tráfego orgânico e alcance!
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-900 text-xs flex items-center justify-between">
                    <span>
                      🎉 Os ganhos de <strong>R$ {campaignResult.commissionAmount.toFixed(2).replace(".", ",")}</strong> já estão disponíveis no seu extrato do Financeiro via Pix.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    onClick={() => setCampaignResult(null)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Fazer Nova Divulgação
                  </button>
                </div>
              </div>
            ) : (
              /* PRODUCT SELECTION GRID */
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 tracking-tight font-display">
                    Passo 1: Escolha o Produto & Divulgue com IA
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecione um produto do seu catálogo abaixo para que o algoritmo gere campanhas otimizadas.
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>

                  {categories.map((cat) => {
                    const isSelected = categoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* 2-Column Selectable Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProduct.id === product.id;

                    return (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? "border-[#EE4D2D] bg-orange-50/30"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-md object-cover bg-white border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-medium text-slate-900 text-xs truncate leading-snug">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono-code font-bold text-[#EE4D2D]">
                                R$ {product.price.toFixed(2).replace(".", ",")}
                              </span>

                            </div>
                          </div>
                        </div>

                        {/* Radio Checkbox */}
                        <div className="shrink-0 pl-1">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[#EE4D2D] text-white"
                              : "border border-slate-300 bg-white"
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Text & Grand Button */}
                <div className="pt-2 space-y-3">
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    Sua inteligência artificial integrada publicará automaticamente o produto selecionado em massa nas redes sociais:{" "}
                    <strong className="text-slate-800">Kwai</strong>,{" "}
                    <strong className="text-slate-800">TikTok</strong>,{" "}
                    <strong className="text-slate-800">Facebook</strong>,{" "}
                    <strong className="text-slate-800">WhatsApp</strong>,{" "}
                    <strong className="text-slate-800">Instagram</strong> e{" "}
                    <strong className="text-slate-800">Twitter</strong>.
                  </p>

                  <div className="flex justify-center">
                    <button
                      onClick={handleStartAutoPosting}
                      disabled={isPosting}
                      className="w-full sm:w-auto min-w-[260px] py-2.5 px-6 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>DIVULGAÇÃO AUTOMÁTICA</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GRUPOS DO WHATSAPP / FACEBOOK / TELEGRAM */}
      {subTab === "grupos" && (
        <GruposOfertasView
          initialProduct={selectedProduct}
          onOpenVideoCreator={onOpenVideoCreator}
        />
      )}

      {/* TAB 3: TIKTOK SHOP */}
      {subTab === "tiktok" && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">
                TikTok Shop Creator & Roteiros
              </h3>
              <p className="text-xs text-slate-500">
                Gere copys rápidas e envie o produto diretamente para o criador de vídeos.
              </p>
            </div>
            <button
              onClick={() => onOpenVideoCreator(selectedProduct)}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Criar Vídeo Viral</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
