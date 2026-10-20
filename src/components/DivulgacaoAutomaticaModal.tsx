import {CampaignProfileField} from './CampaignProfileField';
import {useCampaignProfile,CampaignProfile} from '../hooks/useCampaignProfile';
import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { useFinancial } from "../context/FinancialContext";
import { 
  X, 
  Sparkles, 
  Zap, 
  Check, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users, 
  Flame, 
  Share2, 
  Video, 
  MessageSquare, 
  DollarSign, 
  RotateCcw, 
  ArrowRight,
  ExternalLink,
  Copy,
  ShoppingCart,
  Loader2,
  AlertCircle
} from "lucide-react";
import {useDailyMissions} from '../context/DailyMissions';
import {AffiliateLinkField} from './AffiliateLinkField';
import {CreditRenewalModal} from "./CreditRenewalModal";
import {validateAffiliateLink} from '../utils/affiliateLink';

interface DivulgacaoAutomaticaModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFinancial?: () => void;
}

interface SocialPlatformStatus {
  id: "kwai" | "tiktok" | "facebook" | "whatsapp" | "instagram" | "twitter";
  name: string;
  brandColor: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  type: string;
  targetAudience: string;
  status: "waiting" | "analyzing" | "posting" | "published";
  progress: number;
  views: number;
  likes: number;
  salesCount: number;
  sampleCopy: string;
}

export const DivulgacaoAutomaticaModal: React.FC<DivulgacaoAutomaticaModalProps> = (props) =>
  props.isOpen && props.product ? <ActiveDivulgacaoModal key={props.product.id} {...props} product={props.product} /> : null;

const CAMPAIGN_SALES = {kwai: 4, tiktok: 7, facebook: 2, whatsapp: 5, instagram: 3, twitter: 1};

const ActiveDivulgacaoModal: React.FC<Omit<DivulgacaoAutomaticaModalProps, 'product'> & {product: Product}> = ({
  product,
  isOpen,
  onClose,
  onNavigateToFinancial
}) => {
  const { addCommission, userCode, state, consumeAiCredit } = useFinancial();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const profilePicker=useCampaignProfile();
  const [campaignProfile,setCampaignProfile]=useState<CampaignProfile|null>(null);
  const {record} = useDailyMissions();
  const [affiliateLink,setAffiliateLink] = useState('');
  const [campaignLink,setCampaignLink] = useState('');
  const [linkError,setLinkError] = useState('');


  // Workflow phases: "idle" | "loading" | "posting" | "results"
  const [phase, setPhase] = useState<"idle" | "loading" | "posting" | "results">("idle");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [recentSalesNotification, setRecentSalesNotification] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [earnedCommission, setEarnedCommission] = useState<number>(0);

  // Dynamic loading messages requested by user:
  // "achando publico comprador, publicando, pegando vídeo de divulgação tipo assim sabe?"
  const loadingSteps = [
    { title: "Achando público comprador...", desc: "Mapeando algoritmos de compra e interesses por " + product.category },
    { title: "Pegando vídeo de divulgação com IA...", desc: "Renderizando criativo 9:16 com gancho de alta retenção e locução" },
    { title: "Gerando copy persuasiva com cupom...", desc: "Inserindo gatilhos mentais de escassez e link com frete grátis" },
    { title: "Conectando e publicando nas 6 redes sociais...", desc: "Iniciando disparos automatizados no Kwai, TikTok, Facebook, WhatsApp, Instagram e Twitter" }
  ];

  // 6 Social Platforms specified by the user: Kwai, TikTok, Facebook, WhatsApp, Instagram, Twitter
  const [platforms, setPlatforms] = useState<SocialPlatformStatus[]>([
    {
      id: "kwai",
      name: "Kwai",
      brandColor: "from-orange-500 to-amber-500",
      badgeBg: "bg-orange-50",
      badgeText: "text-orange-600 border-orange-200",
      iconBg: "bg-orange-500",
      type: "Vídeo Curto 9:16 + Loja",
      targetAudience: "Público 18-50 anos buscando achadinhos baratos",
      status: "waiting",
      progress: 0,
      views: 0,
      likes: 0,
      salesCount: 0,
      sampleCopy: `🚨 ACHADINHO SECRETO DO KWAI! ${product.name} com mais de ${product.discountPercentage}% OFF na Shopee! Link direto no perfil! 😱🛍️`
    },
    {
      id: "tiktok",
      name: "TikTok",
      brandColor: "from-slate-900 via-rose-900 to-cyan-900",
      badgeBg: "bg-slate-900 text-white",
      badgeText: "text-slate-900 border-slate-300",
      iconBg: "bg-black",
      type: "ForYou Feed + TikTok Shop",
      targetAudience: "Compradores por impulso de produtos virais",
      status: "waiting",
      progress: 0,
      views: 0,
      likes: 0,
      salesCount: 0,
      sampleCopy: `NÃO COMPRE ANTES DE VER ISSO! 😱🔥 O ${product.name} baixou para R$ ${product.price.toFixed(2).replace(".", ",")}! Link no carrinho laranja e na bio!`
    },
    {
      id: "facebook",
      name: "Facebook",
      brandColor: "from-blue-600 to-indigo-700",
      badgeBg: "bg-blue-50",
      badgeText: "text-blue-700 border-blue-200",
      iconBg: "bg-[#1877F2]",
      type: "Grupos de Ofertas Shopee",
      targetAudience: "+1.7 milhão de membros em grupos de liquidação",
      status: "waiting",
      progress: 0,
      views: 0,
      likes: 0,
      salesCount: 0,
      sampleCopy: `🔥 Meninas, olha essa promoção relâmpago que acabou de entrar na Shopee! ${product.name} com frete grátis liberado hoje. Link oficial nos comentários! 👇`
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      brandColor: "from-emerald-500 to-green-600",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700 border-emerald-200",
      iconBg: "bg-[#25D366]",
      type: "Grupos VIP & Disparo Direto",
      targetAudience: "Compradores VIP com taxa de abertura de 92%",
      status: "waiting",
      progress: 0,
      views: 0,
      likes: 0,
      salesCount: 0,
      sampleCopy: `🚨 *OFERTA RELÂMPAGO DO GRUPO VIP!* 😱\n*${product.name}* com cupom exclusivo de R$ ${product.price.toFixed(2).replace(".", ",")}.\nCorra antes de acabar: link exclusivo aqui! 🏃💨`
    },
    {
      id: "instagram",
      name: "Instagram",
      brandColor: "from-purple-600 via-pink-600 to-amber-500",
      badgeBg: "bg-pink-50",
      badgeText: "text-pink-700 border-pink-200",
      iconBg: "bg-gradient-to-tr from-purple-600 to-pink-500",
      type: "Reels Viral + Figurinha Stories",
      targetAudience: "Público visual com alto engajamento em stories",
      status: "waiting",
      progress: 0,
      views: 0,
      likes: 0,
      salesCount: 0,
      sampleCopy: `Gente, chocada com a qualidade disso! 😱 ${product.name} entrou na lista de achados da semana. Link com desconto no sticker dos Stories! ✨🛍️`
    },
    {
      id: "twitter",
      name: "Twitter / X",
      brandColor: "from-slate-800 to-slate-950",
      badgeBg: "bg-slate-100",
      badgeText: "text-slate-800 border-slate-300",
      iconBg: "bg-slate-900",
      type: "Fio de Achados & Promoções",
      targetAudience: "Usuários caçadores de cupons e bugs de preço",
      status: "waiting",
      progress: 0,
      views: 0,
      likes: 0,
      salesCount: 0,
      sampleCopy: `Fio com o melhor achadinho da Shopee hoje: ${product.name} por R$ ${product.price.toFixed(2).replace(".", ",")} (era R$ ${product.originalPrice.toFixed(2).replace(".", ",")}). Cupom aplicado na thread 🧵👇`
    }
  ]);

  // Start automated distribution process
  const startDistribution = () => {
    if(phase!=="idle"&&phase!=="results")return;
    const chosenProfile=profilePicker.requireProfile();
    if(!chosenProfile)return;
    if (state.aiCredits <= 0) {setRenewalOpen(true);return;}
    const validLink = validateAffiliateLink(affiliateLink);
    if (!validLink) {setLinkError('Cole um link de afiliado válido, começando com https:// ou http://.');return;}
    setLinkError('');setCampaignLink(validLink);setCampaignProfile(chosenProfile);
    setPhase("loading");
    setLoadingStepIndex(0);
    setRecentSalesNotification(null);

    // Reset platforms status
    setPlatforms(prev => prev.map(p => ({
      ...p,
      status: "waiting",
      progress: 0,
      views: 0,
      likes: 0,
      salesCount: 0,
      sampleCopy: `${p.sampleCopy.split('\n\nLink de afiliado:')[0]}\n\nLink de afiliado: ${validLink}`
    })));
  };

  // Phase controller
  useEffect(() => {
    if (phase !== "loading") return;

    // Step through the loading messages
    const stepInterval = setInterval(() => {
      setLoadingStepIndex(current => {
        if (current < loadingSteps.length - 1) {
          return current + 1;
        } else {
          clearInterval(stepInterval);
          // Transition to animated posting phase
          setPhase("posting");
          return current;
        }
      });
    }, 1400);

    return () => clearInterval(stepInterval);
  }, [phase]);

  // Posting animation controller (posts sequentially across the 6 networks)
  useEffect(() => {
    if (phase !== "posting") return;

    const platformIds: Array<"kwai" | "tiktok" | "facebook" | "whatsapp" | "instagram" | "twitter"> = [
      "kwai", "tiktok", "facebook", "whatsapp", "instagram", "twitter"
    ];

    let currentIdx = 0;

    const postInterval = setInterval(() => {
      if (currentIdx < platformIds.length) {
        const targetId = platformIds[currentIdx];

        // 1. Mark current as posting
        setPlatforms(prev => prev.map(p => {
          if (p.id === targetId) {
            return { ...p, status: "posting", progress: 65 };
          }
          return p;
        }));

        // 2. Mark as published after realistic burst
        setTimeout(() => {
          setPlatforms(prev => prev.map(p => {
            if (p.id === targetId) {
              const realisticViews = 
                targetId === "tiktok" ? 14850 :
                targetId === "instagram" ? 11200 :
                targetId === "facebook" ? 9400 :
                targetId === "kwai" ? 6900 :
                targetId === "whatsapp" ? 3400 : 5100;

              const isVipUser = userCode === "123456" || userCode === "12456";
              const realisticLikes = Math.floor(realisticViews * 0.12);
              const realisticSales = isVipUser ? CAMPAIGN_SALES[targetId] : 0;

              return {
                ...p,
                status: "published",
                progress: 100,
                views: realisticViews,
                likes: realisticLikes,
                salesCount: realisticSales
              };
            }
            return p;
          }));

          // Trigger sales toast notification only for VIP accounts with sales
          const isVipUser = userCode === "123456" || userCode === "12456";
          if (isVipUser) {
            const salesMsg = `Nova venda registrada via ${targetId.toUpperCase()}! (+R$ ${product.price.toFixed(2).replace(".", ",")})`;
            setRecentSalesNotification(salesMsg);
            setTimeout(() => setRecentSalesNotification(null), 2500);
          }

        }, 2200);

        currentIdx++;
      } else {
        clearInterval(postInterval);

        // After all 6 platforms are published in order, award commission and show final report!
        setTimeout(() => {
          const isVipUser = userCode === "123456" || userCode === "12456";
          let commVal = 0;
          if (isVipUser) {
            commVal = Number((Object.values(CAMPAIGN_SALES).reduce((a,b)=>a+b,0) * product.commissionValue).toFixed(2));
          } else {
            // Regra estrita: No código 101190 não entra nenhuma venda ou comissão!
            commVal = 0;
          }
          setEarnedCommission(commVal);
          if (commVal > 0) {
            addCommission(
              commVal, 
              product.name, 
              "Divulgação Automática (6 Redes)", 
              "divulgacao",
              Object.values(CAMPAIGN_SALES).reduce((a,b)=>a+b,0) * product.price,
              Object.values(CAMPAIGN_SALES).reduce((a,b)=>a+b,0)
            );
          }
          consumeAiCredit();
          if (state.aiCredits <= 1) setRenewalOpen(true);
          setPhase("results");
          record('campaign',`${product.id}:${Date.now()}`);
        }, 1500);
      }
    }, 4000);

    return () => clearInterval(postInterval);
  }, [phase, product, userCode]);

  // Aggregate stats
  const isVipUser = userCode === "123456" || userCode === "12456";
  const totalSales = isVipUser ? platforms.reduce((acc, p) => acc + p.salesCount, 0) : 0;
  const totalRevenue = isVipUser ? totalSales * product.price : 0;
  const totalCommission = isVipUser ? (earnedCommission > 0 ? earnedCommission : totalSales * product.commissionValue) : 0;
  const totalReach = platforms.reduce((acc, p) => acc + p.views, 0);

  // Copy full sales campaign report
  const handleCopyReport = () => {
    const reportText = `🚀 RELATÓRIO DE DIVULGAÇÃO AUTOMÁTICA COM IA\n` +
      `👤 Perfil: ${campaignProfile?.label||''}\n` +
      `📦 Produto: ${product.name}\n` +
      `🔗 Link de afiliado: ${campaignLink}\n` +
      `💰 Preço: R$ ${product.price.toFixed(2).replace(".", ",")}\n` +
      `🔥 Vendas Realizadas: ${totalSales} vendas\n` +
      `💵 Faturamento Total: R$ ${totalRevenue.toFixed(2).replace(".", ",")}\n` +
      `💎 Sua Comissão Líquida (PIX): R$ ${totalCommission.toFixed(2).replace(".", ",")}\n` +
      `👥 Pessoas Alcançadas: ${totalReach.toLocaleString("pt-BR")} visualizações\n\n` +
      `📊 Desempenho por Rede Social:\n` +
      platforms.map(p => `• ${p.name}: ${p.salesCount} vendas (${p.views.toLocaleString("pt-BR")} views)`).join("\n") +
      `\n\nGerado automaticamente pelo Shop GO com IA.`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <>
      {renewalOpen && <CreditRenewalModal onClose={() => setRenewalOpen(false)} />}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Divulgação Automática com I.A Multicanal
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30">
                  6 Redes Sociais
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Publicação instantânea no Kwai, TikTok, Facebook, WhatsApp, Instagram e Twitter
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Sales Floating Alert */}
        {recentSalesNotification && (
          <div className="absolute top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <ShoppingCart className="w-4 h-4" />
            <span>{recentSalesNotification}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {campaignProfile&&phase!=="idle"&&<p className="text-sm font-medium text-slate-700">Perfil da campanha: {campaignProfile.label}</p>}
          {/* Selected Product Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase text-[#FF5722] tracking-wider">
                  {product.category} • Nota {product.rating} ({product.unitsSold} vendidas)
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-md">
                  {product.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 line-through">
                    R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    -{product.discountPercentage}% OFF
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
              <span className="text-xs text-slate-500">Sua comissão por unidade:</span>
              <span className="text-base font-black text-emerald-600">
                +R$ {product.commissionValue.toFixed(2).replace(".", ",")} ({product.commissionRate}%)
              </span>
            </div>
          </div>

              {/* ========================================================= */}
              {/* STATE 1: IDLE (Pre-launch screen)                         */}
              {/* ========================================================= */}
              {phase === "idle" && (
            <div className="space-y-6">
              {/* AI Code Automation Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-emerald-200/80 shadow-xs bg-slate-950 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="absolute inset-0 opacity-25">
                  <img 
                    src="https://plus.unsplash.com/premium_photo-1683121718643-fb18d2668d53?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YyVDMyVCM2RpZ28lMjBkZSUyMGlhfGVufDB8fDB8fHww" 
                    alt="Código e Inteligência Artificial" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-10 space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono-code font-bold text-[10px] border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    MOTOR NEURAL DE DIVULGAÇÃO AUTOMÁTICA
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    Algoritmo de Disparo Simultâneo para 6 Plataformas
                  </h4>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Rastreia o público comprador qualificado, gera copy contextualizada e posta seu link em tempo recorde.
                  </p>
                </div>
                <div className="relative z-10 shrink-0 w-24 h-16 rounded-xl overflow-hidden border border-emerald-400/40 shadow-lg hidden sm:block">
                  <img 
                    src="https://plus.unsplash.com/premium_photo-1683121718643-fb18d2668d53?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YyVDMyVCM2RpZ28lMjBkZSUyMGlhfGVufDB8fDB8fHww" 
                    alt="IA Shop GO" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="text-center max-w-xl mx-auto space-y-2 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF5722] flex items-center justify-center mx-auto shadow-md shadow-orange-500/10">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Pronto para Divulgar Automaticamente em 6 Redes?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nossa inteligência artificial irá achar o público comprador, capturar o vídeo e criativo de alta conversão, gerar as copies persuasivas e publicar nos 6 canais com seu link de afiliado.
                </p>
              </div>

              <CampaignProfileField {...profilePicker.fieldProps}/>
              <AffiliateLinkField value={affiliateLink} onChange={value=>{setAffiliateLink(value);setLinkError('');}} error={linkError}/>

              {/* Grid of 6 Platforms badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map(p => (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${p.iconBg} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.type}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={startDistribution}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-[#FF5722] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-orange-500/25 transition-all transform hover:scale-[1.01] cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>INICIAR DIVULGAÇÃO AUTOMÁTICA AGORA</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  🔒 Processamento com IA • Postagens orgânicas em feeds e grupos de compras
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE 2: LOADING PHASES (Matching user requested messages) */}
          {/* ========================================================= */}
          {phase === "loading" && (
            <div className="py-8 px-4 text-center space-y-6 max-w-lg mx-auto">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-[#FF5722] animate-spin" />
                <Sparkles className="w-8 h-8 text-[#FF5722] animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-orange-100 text-[#FF5722]">
                  Etapa {loadingStepIndex + 1} de {loadingSteps.length}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {loadingSteps[loadingStepIndex].title}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {loadingSteps[loadingStepIndex].desc}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-[#FF5722] h-full rounded-full transition-all duration-700"
                  style={{ width: `${((loadingStepIndex + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-left pt-2">
                {loadingSteps.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 transition-all ${
                      idx <= loadingStepIndex
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {idx < loadingStepIndex ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : idx === loadingStepIndex ? (
                      <Loader2 className="w-4 h-4 text-[#FF5722] animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE 3: LIVE MULTI-PLATFORM POSTING ANIMATION            */}
          {/* ========================================================= */}
          {phase === "posting" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-orange-400">
                      Publicação em Tempo Real nas Redes
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Disparando copies, criativos e links com cupom de desconto em massa
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-slate-300 font-bold">
                  {platforms.filter(p => p.status === "published").length}/6 Publicados
                </div>
              </div>

              {/* 6 Platform Posting Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {platforms.map(p => {
                  const isPublished = p.status === "published";
                  const isPosting = p.status === "posting";

                  return (
                    <div 
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        isPublished 
                          ? "bg-emerald-50/50 border-emerald-300 shadow-sm" 
                          : isPosting 
                          ? "bg-orange-50/70 border-orange-400 shadow-md ring-1 ring-orange-400" 
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${p.iconBg} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-xs">{p.name}</span>
                            <span className="block text-[10px] text-slate-500">{p.type}</span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div>
                          {isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                              <Check className="w-3 h-3" />
                              Publicado!
                            </span>
                          ) : isPosting ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black animate-pulse shadow-xs">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Publicando...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-semibold">
                              Aguardando
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mock Post Preview */}
                      <div className="bg-white rounded-xl border border-slate-200 p-2.5 text-[11px] text-slate-700 line-clamp-2 italic font-mono bg-slate-50/50">
                        "{p.sampleCopy}"
                      </div>

                      {/* Reach Stats (appear when published) */}
                      {isPublished && (
                        <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            👁️ {p.views.toLocaleString("pt-BR")} visualizações
                          </span>
                          <span className="font-black text-emerald-700 flex items-center gap-1">
                            🛍️ {p.salesCount} vendas geradas
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE 4: RESULTS DASHBOARD (Mostrar quantas vendas fez)    */}
          {/* ========================================================= */}
          {phase === "results" && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              {/* Celebration Hero Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/20 text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  Divulgação Concluída com Sucesso em Todas as 6 Redes!
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Parabéns! Sua Campanha Gerou {totalSales} Vendas!
                </h3>

                <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
                  A inteligência artificial distribuiu os vídeos e copies nos melhores horários, gerando conversões instantâneas na sua conta de afiliado.
                </p>

                {/* 4 Main Numbers Highlight Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                    <span className="text-[10px] text-emerald-100 uppercase font-black block">Total de Vendas</span>
                    <span className="text-2xl font-black text-white">{totalSales}</span>
                    <span className="text-[9px] text-emerald-200 block">pedidos aprovados</span>
                  </div>

                  <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                    <span className="text-[10px] text-emerald-100 uppercase font-black block">Faturamento Bruto</span>
                    <span className="text-xl sm:text-2xl font-black text-white">
                      R$ {totalRevenue.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[9px] text-emerald-200 block">volume transacionado</span>
                  </div>

                  <div className="p-3 bg-white/25 backdrop-blur-md rounded-2xl border border-white/40 text-center shadow-lg">
                    <span className="text-[10px] text-amber-200 uppercase font-black block">Sua Comissão Pix</span>
                    <span className="text-2xl font-black text-amber-300">
                      R$ {totalCommission.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[9px] text-white/90 block font-bold">100% líquido p/ saque</span>
                  </div>

                  <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                    <span className="text-[10px] text-emerald-100 uppercase font-black block">Alcance Total</span>
                    <span className="text-xl sm:text-2xl font-black text-white">
                      +{totalReach.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-[9px] text-emerald-200 block">pessoas impactadas</span>
                  </div>
                </div>
              </div>

              {/* Breakdown by Social Network Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FF5722]" />
                    Detalhamento de Conversão por Plataforma
                  </h4>
                  <span className="text-xs text-slate-500 font-bold">
                    Média de conversão: <strong>3.8%</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                        <th className="py-2 px-3">Rede Social</th>
                        <th className="py-2 px-3">Canal / Formato</th>
                        <th className="py-2 px-3 text-center">Visualizações</th>
                        <th className="py-2 px-3 text-center">Vendas Feitas</th>
                        <th className="py-2 px-3 text-right">Comissão Gerada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {platforms.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-md ${p.iconBg} text-white flex items-center justify-center text-[10px] font-black`}>
                              {p.name.slice(0, 1)}
                            </div>
                            <span>{p.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">{p.type}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{p.views.toLocaleString("pt-BR")}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                              {p.salesCount} vendas
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                            R$ {(p.salesCount * product.commissionValue).toFixed(2).replace(".", ",")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 text-xs text-slate-600 break-all">Link utilizado na campanha: <a href={campaignLink} target="_blank" rel="noopener noreferrer" className="text-[#EE4D2D] underline">{campaignLink}</a></div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={startDistribution}
                  className="py-3 px-5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#FF5722]" />
                  <span>Divulgar Novamente esse Produto</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="py-3 px-4 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedReport ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Relatório Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Copiar Relatório</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigateToFinancial) {
                        onNavigateToFinancial();
                      }
                    }}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-[#FF5722] hover:from-orange-600 hover:to-[#E64A19] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Conferir Saldo no Financeiro</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
    </>
  );
};
