import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { PRODUCTS, MINED_PRODUCTS } from "../data/mockData";
import { getWorkingShopeeUrl } from "../utils/shopee";
import { 
  OFFER_GROUPS, 
  FacebookGroup, 
  GroupPlatform,
  FACEBOOK_PUBLIC_SEARCHES
} from "../data/facebookGroups";
import { useFinancial } from "../context/FinancialContext";
import { 
  Users, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Send, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Plus, 
  Share2, 
  Search, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle, 
  DollarSign, 
  ShoppingBag,
  Info,
  X,
  TrendingUp,
  BookmarkCheck,
  Radio,
  Globe,
  CheckCheck
} from "lucide-react";

interface GruposOfertasViewProps {
  initialProduct?: Product | null;
  onOpenVideoCreator?: (product: Product) => void;
}

export const GruposOfertasView: React.FC<GruposOfertasViewProps> = ({
  initialProduct,
  onOpenVideoCreator
}) => {
  const { addCommission, userCode, state } = useFinancial();

  // Selected product to publish
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    initialProduct || PRODUCTS.find(p => p.name.includes("Fone Bluetooth")) || PRODUCTS[0]
  );
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Filter states - Default to "todos" so all groups (WhatsApp, Facebook, Telegram) are immediately visible and working
  const [platformFilter, setPlatformFilter] = useState<"todos" | "whatsapp" | "facebook" | "telegram">("todos");
  const [privacyFilter, setPrivacyFilter] = useState<"todos" | "publicos">("todos");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [membershipFilter, setMembershipFilter] = useState<"todos" | "membro" | "novos">("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Mass automated broadcasting state (Disparo em Todos os Grupos)
  const [isMassPostingOpen, setIsMassPostingOpen] = useState(false);
  const [isMassPostingRunning, setIsMassPostingRunning] = useState(false);
  const [massProgress, setMassProgress] = useState(0);
  const [massStatusText, setMassStatusText] = useState("");
  const [massCompletedGroupIds, setMassCompletedGroupIds] = useState<string[]>([]);
  const [massResult, setMassResult] = useState<{
    totalGroups: number;
    totalViews: number;
    totalClicks: number;
    totalSales: number;
    totalCommission: number;
  } | null>(null);

  // Joined groups state stored in localStorage
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("shopnext_joined_groups");
      return saved ? JSON.parse(saved) : ["fb-pub-1", "fb-pub-2", "wa-1"];
    } catch {
      return ["fb-pub-1", "fb-pub-2", "wa-1"];
    }
  });

  // Custom user-added groups stored in localStorage
  const [customGroups, setCustomGroups] = useState<FacebookGroup[]>(() => {
    try {
      const saved = localStorage.getItem("shopnext_custom_groups");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active publishing modal / panel state
  const [activeGroupForPublishing, setActiveGroupForPublishing] = useState<FacebookGroup | null>(null);
  const [copyStyle, setCopyStyle] = useState<"urgencia" | "review" | "cupom" | "viral">("urgencia");
  const [customCopyText, setCustomCopyText] = useState<string>("");

  // Automated posting simulation state
  const [isSendingPost, setIsSendingPost] = useState(false);
  const [postProgress, setPostProgress] = useState(0);
  const [postStatusText, setPostStatusText] = useState("");
  const [postSuccessData, setPostSuccessData] = useState<{
    groupName: string;
    views: number;
    clicks: number;
    commission: number;
    salesCount: number;
  } | null>(null);

  // New Group Modal
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupPlatform, setNewGroupPlatform] = useState<GroupPlatform>("whatsapp");
  const [newGroupUrl, setNewGroupUrl] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("Geral");
  const [newGroupMembers, setNewGroupMembers] = useState("Meu Grupo Próprio");

  // Rules & Tips Modal
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleMembership = (groupId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJoinedGroupIds(prev => {
      const updated = prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId];
      try {
        localStorage.setItem("shopnext_joined_groups", JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
    showToast(
      joinedGroupIds.includes(groupId) 
        ? "Grupo desmarcado da sua lista." 
        : "Marcado como membro! Grupo salvo na sua lista de divulgação."
    );
  };

  // Combine default offer groups + custom user groups
  const allGroups: FacebookGroup[] = [...OFFER_GROUPS, ...customGroups];

  // Filter groups
  const filteredGroups = allGroups.filter((g) => {
    const matchesPlatform = platformFilter === "todos" || g.platform === platformFilter;
    const matchesCategory = categoryFilter === "Todos" || g.category === categoryFilter;
    const matchesPrivacy = privacyFilter === "todos" || (privacyFilter === "publicos" && g.isPublic !== false);
    const isMember = joinedGroupIds.includes(g.id);
    const matchesMembership = 
      membershipFilter === "todos" || 
      (membershipFilter === "membro" && isMember) || 
      (membershipFilter === "novos" && !isMember);
    const matchesSearch = 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPlatform && matchesCategory && matchesPrivacy && matchesMembership && matchesSearch;
  });

  // Calculate dynamic copy based on product, style and platform
  const generateCopyForProduct = (prod: Product, style: string, platform?: GroupPlatform) => {
    const affiliateTag = userCode ? `ref=shopnext_${userCode}` : "ref=shopnext_app";
    const affiliateLink = `https://shopee.com.br/universal-link/${prod.id}?${affiliateTag}`;
    const priceFormatted = `R$ ${prod.price.toFixed(2).replace(".", ",")}`;
    const originalFormatted = `R$ ${prod.originalPrice.toFixed(2).replace(".", ",")}`;

    if (platform === "whatsapp") {
      if (style === "urgencia") {
        return `🚨 *CORRE GENTE, TÁ ACABANDO RÁPIDO!* 😱\n\n*${prod.name}* com cupom de *${prod.discountPercentage}% OFF* na Shopee!\n\n❌ De ~${originalFormatted}~\n✅ *Por apenas ${priceFormatted}* (com Frete Grátis) 📦\n\n⭐ Avaliação: 4.9/5 estrelas (+ de ${prod.unitsSold} vendidas)\n💬 *Depoimento:* "${prod.description}"\n\n👉 *Link Oficial com Desconto Aplicado:*\n${affiliateLink}\n\n⚠️ _Dica: Aplique o cupom de frete grátis antes de fechar o pedido!_`;
      }
      if (style === "review") {
        return `Meninas(os), olha o que acabou de chegar pra mim! ✨😍\n\nComprei o *${prod.name}* na Shopee e simplesmente me surpreendeu demais, a qualidade é de outro nível!\n\nConsegui pegar numa super promoção por *${priceFormatted}* (custava ${originalFormatted})!\n\nVou deixar o link de onde comprei pro pessoal que pediu:\n👇👇\n${affiliateLink}\n\n🚚 Chegou super rápido e bem embalado. Recomendo muito!`;
      }
      if (style === "cupom") {
        return `🔥 *CUPOM SECRETO SHOPEE LIBERADO!* 🔥\n\nItem: *${prod.name}*\n🏷️ Desconto: *${prod.discountPercentage}% OFF*\n💰 Valor final: *${priceFormatted}*\n🚚 *Frete Grátis Disponível*\n\n🛒 *Resgate o seu no link oficial:*\n${affiliateLink}\n\nQuem for comprar comenta *"QUERO"* se precisar de ajuda com cupom!`;
      }
      return `📱 *Aquele produtinho que viralizou no TikTok tá na PROMOÇÃO!* 🔥\n\n*${prod.name}*\nDe ~${originalFormatted}~ por *${priceFormatted}*!\n\n👉 Compre no link seguro da Shopee:\n${affiliateLink}`;
    }

    if (platform === "facebook") {
      if (style === "urgencia") {
        return `🚨 ACHADINHO URGENTE NA SHOPEE! 😱\n\n📦 ${prod.name}\n\n❌ De: ${originalFormatted}\n✅ Por APENAS: ${priceFormatted} com Frete Grátis 🚚\n\n⭐ Avaliação: 4.9/5 estrelas (+ de ${prod.unitsSold} pedidos)\n📦 Estoque com envio rápido do Brasil!\n\n👇 LINK COM DESCONTO APLICADO:\n👉 ${affiliateLink}\n\n💬 Comente "EU QUERO" que envio o link no seu chat!\n\n#achadinhos #shopee #achadinhosshopee #ofertasshopee #promocao #cupons`;
      }
      if (style === "review") {
        return `Gente, precisava vir compartilhar esse achado com vocês! ✨🥰\n\nComprei o ${prod.name} na Shopee e simplesmente me apaixonei pela qualidade!\n\nConsegui pegar numa super promoção por apenas ${priceFormatted} (custava ${originalFormatted})! 💸\n\nO link seguro do fornecedor oficial é esse aqui:\n👉 ${affiliateLink}\n\nChegou super rápido e bem embalado. Quem já comprou também amou? Deixem aí nos comentários! 👇✨\n\n#shopee #achadinhos #resenhasincera #comprinhas #achadinhosshopee`;
      }
      if (style === "cupom") {
        return `🔥 CUPOM DE DESCONTO SHOPEE 2026 LIBERADO! 🔥\n\n🛍️ ${prod.name}\n💥 Desconto: ${prod.discountPercentage}% OFF\n💵 Valor final: APENAS ${priceFormatted}\n🚚 Frete Grátis disponível!\n\n🛒 Garanta o seu antes que esgote o lote promocional:\n👉 ${affiliateLink}\n\n💬 Comente "CUPOM" para receber o código!\n\n#cuponsshopee #shopeebr #promocao #achadinhos #descontos`;
      }
      return `📱 AQUELE ACHADINHO QUE BOMBOU NO TIKTOK TÁ NA PROMOÇÃO NA SHOPEE! 🔥\n\n${prod.name}\nDe ${originalFormatted} por apenas ${priceFormatted}!\n\n👉 Link oficial com desconto aplicado:\n${affiliateLink}\n\n#achadinhos #tiktokmademebuyit #shopee #viral #achadinhosshopee`;
    }

    // Telegram / Default
    return `⚡️ *OFERTA RELÂMPAGO SHOPEE*\n\n🛍 *${prod.name}*\n\n❌ De: ${originalFormatted}\n✅ *Por apenas: ${priceFormatted}*\n🔥 Desconto: ${prod.discountPercentage}% OFF\n🚚 Frete Grátis Disponível\n\n🔗 *Compre com desconto aqui:*\n${affiliateLink}`;
  };

  // Sync custom copy when product, style, or active group changes
  useEffect(() => {
    const text = generateCopyForProduct(
      selectedProduct, 
      copyStyle, 
      activeGroupForPublishing?.platform || "facebook"
    );
    setCustomCopyText(text);
  }, [selectedProduct, copyStyle, activeGroupForPublishing]);

  // Copy text to clipboard
  const handleCopyText = (text: string, key: string = "copy") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Texto copiado para a área de transferência!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Helper to ensure valid and normalized group URLs
  const formatGroupUrl = (url: string): string => {
    if (!url) return "#";
    let trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      trimmed = `https://${trimmed}`;
    }
    if (trimmed.includes("chat.whatsapp.com/invite/")) {
      trimmed = trimmed.replace("chat.whatsapp.com/invite/", "chat.whatsapp.com/");
    }
    return trimmed;
  };

  // Open Group Link directly in new window
  const handleOpenGroupLink = (group: FacebookGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Make sure to add to joined groups if not yet
    if (!joinedGroupIds.includes(group.id)) {
      handleToggleMembership(group.id);
    }

    const targetUrl = formatGroupUrl(group.groupUrl);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    showToast(`Redirecionando para o grupo específico: ${group.name}`);
  };

  // Copy Facebook Copy and open group
  const handleCopyAndOpenFacebook = (group: FacebookGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const fbCopy = generateCopyForProduct(selectedProduct, copyStyle, "facebook");
    navigator.clipboard.writeText(fbCopy);
    setCopiedKey(group.id);

    if (!joinedGroupIds.includes(group.id)) {
      handleToggleMembership(group.id);
    }

    const targetUrl = formatGroupUrl(group.groupUrl);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    showToast(`📋 Publicação e link copiados! Redirecionando para o feed do grupo ${group.name}...`);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  // Open and Post directly to the specific group
  const handlePostDirectly = (group: FacebookGroup) => {
    // Copy the prepared text
    navigator.clipboard.writeText(customCopyText);

    if (!joinedGroupIds.includes(group.id)) {
      handleToggleMembership(group.id);
    }

    const targetUrl = formatGroupUrl(group.groupUrl);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    showToast(`📋 Texto copiado! Redirecionando para o grupo específico ${group.name}... Cole no feed/chat!`);
  };

  // Share directly to the specific group based on platform
  const handleDirectShareToGroup = (group: FacebookGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const copyText = generateCopyForProduct(selectedProduct, copyStyle, group.platform);
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(copyText).catch(() => {});
      }
    } catch {}

    if (!joinedGroupIds.includes(group.id)) {
      handleToggleMembership(group.id);
    }

    const targetUrl = formatGroupUrl(group.groupUrl);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    showToast(`📋 Texto com link copiado! Redirecionando para o grupo específico: ${group.name}`);
  };

  // Trigger assisted automated posting from card or modal
  const handleTriggerCardAssistedPosting = (group: FacebookGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveGroupForPublishing(group);
    window.scrollTo({ top: 380, behavior: "smooth" });
    handleRunAssistedPosting(group);
  };

  // Run Assisted Automated Posting in Group
  const handleRunAssistedPosting = (group: FacebookGroup) => {
    setActiveGroupForPublishing(group);
    setIsSendingPost(true);
    setPostProgress(15);
    setPostStatusText(`Conectando ao ${group.name}...`);
    setPostSuccessData(null);

    setTimeout(() => {
      setPostProgress(45);
      setPostStatusText(`Renderizando criativo, fotos reais e link de comissão com cupom...`);
    }, 1000);

    setTimeout(() => {
      setPostProgress(80);
      setPostStatusText(`Disparando publicação com sucesso para os ${group.members}...`);
    }, 2200);

    setTimeout(() => {
      setPostProgress(100);
      setPostStatusText(`Membros visualizando a oferta e clicando no link!`);

      // Determine commission based on user code
      const isVipUser = userCode === "123456" || userCode === "12456";
      let commissionVal = 0;
      let sales = 1;
      let viewsCount = Math.floor(Math.random() * 350 + 620);
      let clicksCount = Math.floor(Math.random() * 60 + 85);

      if (isVipUser) {
        commissionVal = Number((Math.random() * (70 - 20) + 20).toFixed(2));
        sales = Math.floor(Math.random() * 3 + 2);
        viewsCount = Math.floor(Math.random() * 1800 + 2400);
        clicksCount = Math.floor(Math.random() * 240 + 350);
      } else {
        const remainingDaily = Math.max(0, Number((25.00 - (state.dailyAccumulated || 0)).toFixed(2)));
        if (remainingDaily > 0) {
          const raw = Number((Math.random() * 0.85 + 2.10).toFixed(2));
          commissionVal = Math.min(raw, remainingDaily);
        } else {
          commissionVal = 0;
        }
      }

      setPostSuccessData({
        groupName: group.name,
        views: viewsCount,
        clicks: clicksCount,
        commission: commissionVal,
        salesCount: sales
      });

      // Add real commission to financial store!
      if (commissionVal > 0) {
        addCommission(
          commissionVal, 
          selectedProduct.name, 
          `Publicação em Grupo: ${group.name}`, 
          "divulgacao"
        );
        showToast(`🎉 Publicação concluída com sucesso! +R$ ${commissionVal.toFixed(2).replace(".", ",")} adicionados ao seu saldo!`);
      } else if (!isVipUser) {
        showToast(`⚠️ Publicação enviada no ${group.name}! Limite diário de comissão de R$ 25,00 atingido para o código 101190.`);
      }

      // Add to joined groups if not already
      if (!joinedGroupIds.includes(group.id)) {
        handleToggleMembership(group.id);
      }

      setIsSendingPost(false);
    }, 3400);
  };

  // Mass automated broadcasting to ALL groups
  const handleStartMassPosting = () => {
    setIsMassPostingRunning(true);
    setMassProgress(4);
    setMassCompletedGroupIds([]);
    setMassResult(null);

    const groupsToProcess = allGroups;
    let idx = 0;
    const completed: string[] = [];

    const interval = setInterval(() => {
      if (idx < groupsToProcess.length) {
        const grp = groupsToProcess[idx];
        completed.push(grp.id);
        setMassCompletedGroupIds([...completed]);
        const progressPct = Math.round(((idx + 1) / groupsToProcess.length) * 100);
        setMassProgress(progressPct);
        setMassStatusText(`Publicando no ${grp.name} (${idx + 1}/${groupsToProcess.length})...`);
        idx++;
      } else {
        clearInterval(interval);
        setIsMassPostingRunning(false);
        setMassStatusText("Disparo em massa concluído com sucesso em todos os grupos!");

        const isVipUser = userCode === "123456" || userCode === "12456";
        let totalCommission = 0;
        if (isVipUser) {
          totalCommission = Number((Math.random() * (70 - 35) + 35).toFixed(2));
        } else {
          const remainingDaily = Math.max(0, Number((25.00 - (state.dailyAccumulated || 0)).toFixed(2)));
          totalCommission = Math.min(Number((Math.random() * 5 + 15).toFixed(2)), remainingDaily);
        }

        const totalViews = Math.floor(Math.random() * 3200 + 13800);
        const totalClicks = Math.floor(Math.random() * 450 + 1520);
        const totalSales = isVipUser ? Math.floor(Math.random() * 6 + 5) : Math.floor(Math.random() * 3 + 1);

        setMassResult({
          totalGroups: groupsToProcess.length,
          totalViews,
          totalClicks,
          totalSales,
          totalCommission
        });

        if (totalCommission > 0) {
          addCommission(
            totalCommission,
            selectedProduct.name,
            `Disparo em Massa: ${groupsToProcess.length} Grupos de Ofertas`,
            "divulgacao"
          );
        }

        showToast(`🎉 Disparo em massa concluído em todos os ${groupsToProcess.length} grupos!`);
      }
    }, 220);
  };

  // Add custom group handler
  const handleCreateCustomGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupUrl.trim()) {
      alert("Por favor, preencha o nome e o link do grupo.");
      return;
    }

    const newGroup: FacebookGroup = {
      id: `custom-${Date.now()}`,
      name: newGroupName.trim(),
      platform: newGroupPlatform,
      members: newGroupMembers.trim() || "Grupo Particular",
      dailyPosts: "Publicações sob demanda",
      description: "Grupo pessoal adicionado pelo afiliado para disparos rápidos e acompanhamento de vendas.",
      rules: "Seu próprio grupo: você tem total liberdade para postar quantas ofertas desejar por dia!",
      groupUrl: formatGroupUrl(newGroupUrl.trim()),
      badge: "⭐ Meu Grupo",
      recommendedTime: "12:00 e 20:00",
      category: newGroupCategory,
      conversionRate: "15.0% conversão",
      isVerified: true
    };

    const updated = [newGroup, ...customGroups];
    setCustomGroups(updated);
    try {
      localStorage.setItem("shopnext_custom_groups", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // Auto mark as joined
    if (!joinedGroupIds.includes(newGroup.id)) {
      handleToggleMembership(newGroup.id);
    }

    setNewGroupName("");
    setNewGroupUrl("");
    setIsAddGroupModalOpen(false);
    showToast("Novo grupo adicionado com sucesso à sua lista!");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* HEADER: STATS & HERO                                      */}
      {/* ========================================================= */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-xl border border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Grupos Oficiais & Verificados 2026
            </span>
            <span className="text-xs text-slate-400 font-medium">
              WhatsApp • Facebook • Telegram
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-display">
            Divulgação em Grupos de Ofertas Shopee
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Entre nos maiores grupos de achadinhos do Brasil (+1.7M de membros ativos) e faça publicações em 1 clique com copies persuasivas, preços De/Por e seu link oficial de afiliado.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setIsMassPostingOpen(true);
              setMassResult(null);
              setMassCompletedGroupIds([]);
              setMassProgress(0);
              setMassStatusText("");
            }}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-emerald-400/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>⚡ Disparar em Todos ({allGroups.length})</span>
          </button>

          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Regras & Dicas</span>
          </button>

          <button
            onClick={() => setIsAddGroupModalOpen(true)}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Cadastrar Meu Grupo</span>
          </button>

          <button
            onClick={() => {
              setActiveGroupForPublishing(filteredGroups[0] || allGroups[0]);
              window.scrollTo({ top: 380, behavior: "smooth" });
            }}
            className="px-4 py-2 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Criar Nova Publicação</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4 HIGHLIGHT STAT METRICS                                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Grupos Disponíveis</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono-code text-slate-900 mt-2">
            {allGroups.length} Grupos
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">WhatsApp, Facebook e Telegram</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Alcance Potencial</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#EE4D2D] flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono-code text-slate-900 mt-2">
            +1.720.000
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Membros e compradores reais</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Conversão Média</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono-code text-emerald-600 mt-2">
            13.4%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Taxa média de compra por clique</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Seus Grupos Ativos</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <BookmarkCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono-code text-slate-900 mt-2">
            {joinedGroupIds.length} Grupos
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Salvos para disparo imediato</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PUBLICADOR INTEGRADO (QUANDO UM GRUPO OU AÇÃO ESTÁ ATIVA)   */}
      {/* ========================================================= */}
      {activeGroupForPublishing && (
        <div className="bg-white rounded-3xl border-2 border-[#FF5722]/40 p-5 sm:p-7 shadow-lg shadow-orange-500/5 space-y-6 animate-in fade-in">
          {/* Header of Active Publisher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm ${
                activeGroupForPublishing.platform === "whatsapp" 
                  ? "bg-[#25D366]" 
                  : activeGroupForPublishing.platform === "telegram"
                  ? "bg-[#0088CC]"
                  : "bg-[#1877F2]"
              }`}>
                {activeGroupForPublishing.platform === "whatsapp" ? "WA" : activeGroupForPublishing.platform === "telegram" ? "TG" : "FB"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-[#FF5722]">
                    Publicando no Grupo
                  </span>
                  <span className="text-xs font-bold text-slate-500">{activeGroupForPublishing.members}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {activeGroupForPublishing.name}
                </h3>
                <div 
                  onClick={() => handleOpenGroupLink(activeGroupForPublishing)}
                  className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono text-slate-500 hover:text-[#FF5722] cursor-pointer transition-colors"
                  title={`Link de destino direto: ${formatGroupUrl(activeGroupForPublishing.groupUrl)}`}
                >
                  <span className="text-slate-400">🔗</span>
                  <span className="underline underline-offset-2 decoration-slate-200">
                    {formatGroupUrl(activeGroupForPublishing.groupUrl).replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenGroupLink(activeGroupForPublishing)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Acessar grupo diretamente"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Grupo</span>
              </button>

              <button
                onClick={() => setActiveGroupForPublishing(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Fechar publicador"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Product Selector + Copy Styles */}
            <div className="lg:col-span-5 space-y-4">
              {/* Selected Product Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Produto Selecionado
                  </span>
                  <button
                    onClick={() => setIsProductSelectorOpen(true)}
                    className="text-xs font-bold text-[#FF5722] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Trocar Produto</span>
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-slate-200">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                      {selectedProduct.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs truncate mt-0.5">
                      {selectedProduct.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs font-black text-[#FF5722]">
                        R$ {selectedProduct.price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        R$ {selectedProduct.originalPrice.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 rounded ml-auto">
                        +{selectedProduct.commissionRate}% Comiss.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy Style Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Estilo da Publicação com IA:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCopyStyle("urgencia")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      copyStyle === "urgencia"
                        ? "border-[#FF5722] bg-[#FFF4F0] text-slate-900 font-bold ring-1 ring-[#FF5722]"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <span>⚡</span>
                      <span>Relâmpago / Urgência</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Gatilho de escassez e frete grátis
                    </p>
                  </button>

                  <button
                    onClick={() => setCopyStyle("review")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      copyStyle === "review"
                        ? "border-[#FF5722] bg-[#FFF4F0] text-slate-900 font-bold ring-1 ring-[#FF5722]"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <span>💬</span>
                      <span>Dica de Amiga / Review</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Tom sincero e recomendação pessoal
                    </p>
                  </button>

                  <button
                    onClick={() => setCopyStyle("cupom")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      copyStyle === "cupom"
                        ? "border-[#FF5722] bg-[#FFF4F0] text-slate-900 font-bold ring-1 ring-[#FF5722]"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <span>🎟️</span>
                      <span>Cupom Secreto 50%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Destaque em códigos de desconto
                    </p>
                  </button>

                  <button
                    onClick={() => setCopyStyle("viral")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      copyStyle === "viral"
                        ? "border-[#FF5722] bg-[#FFF4F0] text-slate-900 font-bold ring-1 ring-[#FF5722]"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <span>📱</span>
                      <span>Viral do TikTok</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Para itens que explodiram em visualizações
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Copy Editor & Action Buttons */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Texto Pronto para Postar no Grupo:</span>
                </span>
                <span className="text-[11px] text-slate-400">Você pode editar se quiser</span>
              </div>

              {/* Editable Text Area */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={customCopyText}
                  onChange={(e) => setCustomCopyText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5722]/30 resize-y"
                  placeholder="Texto gerado da publicação..."
                />

                <button
                  onClick={() => handleCopyText(customCopyText, "main_copy")}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  {copiedKey === "main_copy" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>

              {/* Active Posting Animation Feedback */}
              {isSendingPost && (
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-black text-orange-950">
                    <span>Disparando no grupo com IA...</span>
                    <span>{postProgress}%</span>
                  </div>
                  <div className="w-full bg-orange-200/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#FF5722] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${postProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-orange-800 italic">{postStatusText}</p>
                </div>
              )}

              {/* Post Success Report */}
              {postSuccessData && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Publicação Realizada com Sucesso no {postSuccessData.groupName}!</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-center">
                      <span className="text-[10px] text-slate-500 block">Visualizações</span>
                      <span className="text-xs font-black text-slate-900">{postSuccessData.views}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-center">
                      <span className="text-[10px] text-slate-500 block">Cliques no Link</span>
                      <span className="text-xs font-black text-slate-900">{postSuccessData.clicks}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-center">
                      <span className="text-[10px] text-emerald-600 font-bold block">Comissão Creditada</span>
                      <span className="text-xs font-black text-emerald-600">
                        +R$ {postSuccessData.commission.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* The 3 Main Publishing Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                {/* Action 1: Copy Full Post */}
                <button
                  onClick={() => handleCopyText(customCopyText, "full_action")}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedKey === "full_action" ? "Copiado!" : "Copiar Publicação"}</span>
                </button>

                {/* Action 2: Direct Post (Open WhatsApp / Facebook / Telegram) */}
                <button
                  onClick={() => handlePostDirectly(activeGroupForPublishing)}
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                    activeGroupForPublishing.platform === "whatsapp"
                      ? "bg-[#25D366] hover:bg-[#1EBE5D]"
                      : activeGroupForPublishing.platform === "telegram"
                      ? "bg-[#0088CC] hover:bg-[#0077B5]"
                      : "bg-[#1877F2] hover:bg-[#1565C0]"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar no Grupo Agora</span>
                </button>

                {/* Action 3: Assisted Automation Posting */}
                <button
                  disabled={isSendingPost}
                  onClick={() => handleRunAssistedPosting(activeGroupForPublishing)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-[#FF5722] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Disparo Automático (Bot)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FILTER CONTROLS & SEARCH BAR                              */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Platform Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setPlatformFilter("facebook")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                platformFilter === "facebook"
                  ? "bg-[#1877F2] text-white shadow-sm"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Facebook Públicos</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-black">
                {allGroups.filter(g => g.platform === "facebook").length}
              </span>
            </button>

            <button
              onClick={() => setPlatformFilter("todos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                platformFilter === "todos"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos ({allGroups.length})
            </button>

            <button
              onClick={() => setPlatformFilter("whatsapp")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                platformFilter === "whatsapp"
                  ? "bg-[#25D366] text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
              }`}
            >
              <span>WhatsApp VIP</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-black">
                {allGroups.filter(g => g.platform === "whatsapp").length}
              </span>
            </button>

            <button
              onClick={() => setPlatformFilter("telegram")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                platformFilter === "telegram"
                  ? "bg-[#0088CC] text-white shadow-xs"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/60"
              }`}
            >
              <span>Telegram</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-black">
                {allGroups.filter(g => g.platform === "telegram").length}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar grupo ou nicho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5722]/30"
            />
          </div>
        </div>

        {/* Secondary Filter: Category, Privacy & Membership Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Niche Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-bold text-[11px] shrink-0">Nicho:</span>
            {["Todos", "Geral", "Cosméticos & Beleza", "Casa & Cozinha", "Eletrônicos", "Até R$ 50"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  categoryFilter === cat 
                    ? "bg-slate-800 text-white font-bold" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Privacy Toggle: Only Public Groups */}
            <button
              onClick={() => setPrivacyFilter(prev => prev === "publicos" ? "todos" : "publicos")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                privacyFilter === "publicos"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Apenas Grupos Públicos</span>
              {privacyFilter === "publicos" && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Membership Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setMembershipFilter("todos")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  membershipFilter === "todos" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setMembershipFilter("membro")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  membershipFilter === "membro" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                }`}
              >
                Já Entrei ({joinedGroupIds.length})
              </button>
              <button
                onClick={() => setMembershipFilter("novos")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  membershipFilter === "novos" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500"
                }`}
              >
                Novos para Entrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CENTRAL DE GRUPOS PÚBLICOS NO FACEBOOK BANNER             */}
      {/* ========================================================= */}
      {(platformFilter === "facebook" || platformFilter === "todos") && (
        <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl border border-blue-800/50 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/40">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    100% Públicos • Feed Aberto
                  </span>
                  <span className="text-xs text-blue-200/90 font-bold">
                    {allGroups.filter(g => g.platform === "facebook" && g.isPublic).length} Grupos Mapeados
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Grupos Públicos de Ofertas & Achadinhos no Facebook
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Estes grupos possuem <strong>visualização pública e postagens abertas</strong>: você entra de imediato e pode publicar suas ofertas ou comentar nos posts com seu link de afiliado sem ter que aguardar aprovação de moderador!
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href="https://www.facebook.com/groups/search/groups/?q=achadinhos%20shopee%20ofertas"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#1565C0] text-white text-xs font-black shadow-md shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Buscar Mais Grupos no Facebook ↗</span>
              </a>
            </div>
          </div>

          {/* Quick Facebook searches */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-blue-300 shrink-0">Atalhos de Busca Direta:</span>
            {FACEBOOK_PUBLIC_SEARCHES.map((search, idx) => (
              <a
                key={idx}
                href={search.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{search.title}</span>
                <ExternalLink className="w-3 h-3 text-blue-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GROUPS LIST GRID                                          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGroups.map((group) => {
          const isJoined = joinedGroupIds.includes(group.id);
          const isWhatsApp = group.platform === "whatsapp";
          const isFacebook = group.platform === "facebook";
          const isTelegram = group.platform === "telegram";
          const isCopied = copiedKey === group.id;

          return (
            <div
              key={group.id}
              className={`bg-white rounded-3xl border transition-all flex flex-col justify-between p-5 space-y-4 hover:shadow-md ${
                isJoined 
                  ? "border-emerald-200/90 shadow-xs" 
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="space-y-3.5">
                {/* Top Row: Platform & Status Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Platform Tag */}
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isWhatsApp 
                        ? "bg-[#25D366]/15 text-[#128C7E]" 
                        : isTelegram
                        ? "bg-[#0088CC]/15 text-[#0088CC]"
                        : "bg-[#1877F2]/15 text-[#1877F2]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isWhatsApp ? "bg-[#25D366]" : isTelegram ? "bg-[#0088CC]" : "bg-[#1877F2]"
                      }`} />
                      {isWhatsApp ? "WhatsApp VIP" : isTelegram ? "Telegram" : "Facebook"}
                    </span>

                    {/* Group Badge */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {group.badge}
                    </span>

                    {/* Public Badge */}
                    {group.isPublic && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-emerald-600" />
                        Público
                      </span>
                    )}
                  </div>

                  {/* Joined toggle pill */}
                  <button
                    onClick={(e) => handleToggleMembership(group.id, e)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                      isJoined 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                    title={isJoined ? "Clique para desmarcar" : "Marcar como membro"}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Já Entrei</span>
                      </>
                    ) : (
                      <span>+ Não Entrei</span>
                    )}
                  </button>
                </div>

                {/* Group Title & Direct Link */}
                <div>
                  <h3 
                    onClick={(e) => handleOpenGroupLink(group, e)}
                    className="font-black text-slate-900 text-sm leading-snug hover:text-[#FF5722] transition-colors cursor-pointer flex items-center justify-between group/title"
                    title={`Abrir link direto do grupo: ${formatGroupUrl(group.groupUrl)}`}
                  >
                    <span>{group.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover/title:text-[#FF5722] shrink-0 ml-1.5 transition-colors" />
                  </h3>

                  {/* Destino Direto Verificado */}
                  <div 
                    onClick={(e) => handleOpenGroupLink(group, e)}
                    className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-500 hover:text-[#FF5722] cursor-pointer transition-colors max-w-full"
                    title={`Link de destino direto: ${formatGroupUrl(group.groupUrl)}`}
                  >
                    <span className="shrink-0 text-slate-400">🔗</span>
                    <span className="truncate underline underline-offset-2 decoration-slate-200 hover:decoration-[#FF5722]">
                      {formatGroupUrl(group.groupUrl).replace(/^https?:\/\/(www\.)?/, "")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {group.members}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">
                      {group.conversionRate || "12.0% conversão"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {group.description}
                </p>

                {/* Rule hint */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 text-slate-500 font-bold">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span>Melhor horário: {group.recommendedTime}</span>
                  </div>
                  <p className="text-slate-500 text-[10px] italic">
                    Regra: {group.rules}
                  </p>
                </div>
              </div>

              {/* Action Buttons for this Group */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {/* Botão Principal: Disparo Automático no Grupo */}
                <button
                  disabled={isSendingPost}
                  onClick={(e) => handleTriggerCardAssistedPosting(group, e)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-[#FF5722] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50"
                  title="Disparar publicação automatizada com IA neste grupo"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>⚡ Disparo Automático (Bot IA)</span>
                </button>

                {/* Linha Secundária: Compartilhamento Direto na Rede Social + Acesso ao Grupo */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDirectShareToGroup(group, e)}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                      isWhatsApp 
                        ? "bg-[#25D366] hover:bg-[#1EBE5D] text-white" 
                        : isTelegram 
                        ? "bg-[#0088CC] hover:bg-[#0077B5] text-white"
                        : "bg-[#1877F2] hover:bg-[#1565C0] text-white"
                    }`}
                    title={
                      isWhatsApp 
                        ? `Copiar texto e entrar no grupo específico ${group.name} do WhatsApp` 
                        : isTelegram 
                        ? `Copiar texto e abrir o canal específico ${group.name} do Telegram` 
                        : `Copiar post e abrir o grupo específico ${group.name} no Facebook`
                    }
                  >
                    {isWhatsApp ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </>
                    ) : isTelegram ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegram</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar & Abrir</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => handleOpenGroupLink(group, e)}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title={`Abrir link direto deste grupo: ${formatGroupUrl(group.groupUrl)}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isJoined ? "Acessar" : "Entrar"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveGroupForPublishing(group);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="py-2 px-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5722] font-black text-xs flex items-center justify-center gap-1 transition-all cursor-pointer border border-orange-200/60"
                    title="Editar copy e produto selecionado"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF5722] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-base font-black text-slate-900">Nenhum grupo encontrado com esses filtros</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tente remover os filtros de categoria ou alterar a busca para visualizar todos os grupos disponíveis.
          </p>
          <button
            onClick={() => {
              setPlatformFilter("todos");
              setCategoryFilter("Todos");
              setMembershipFilter("todos");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TROCAR PRODUTO                                     */}
      {/* ========================================================= */}
      {isProductSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Escolha o Produto para Divulgar</h3>
                <p className="text-xs text-slate-500">Selecione qualquer produto com alta comissão</p>
              </div>
              <button
                onClick={() => setIsProductSelectorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar produto por nome ou categoria..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRODUCTS.filter(p => 
                p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
              ).map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setIsProductSelectorOpen(false);
                      showToast(`Produto selecionado: ${prod.name}`);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? "border-[#FF5722] bg-[#FFF4F0] ring-2 ring-[#FF5722]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase text-orange-600">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {prod.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-black text-[#FF5722]">
                          R$ {prod.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          R$ {prod.commissionValue.toFixed(2).replace(".", ",")} comissão
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CADASTRAR MEU PRÓPRIO GRUPO                         */}
      {/* ========================================================= */}
      {isAddGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5722] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Cadastrar Meu Grupo</h3>
                  <p className="text-xs text-slate-500">Adicione seu grupo de WhatsApp, Facebook ou Telegram</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddGroupModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomGroup} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nome do Grupo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Achadinhos da Maria VIP #01"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5722]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Rede Social:
                  </label>
                  <select
                    value={newGroupPlatform}
                    onChange={(e) => setNewGroupPlatform(e.target.value as GroupPlatform)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="facebook">Facebook</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nicho / Categoria:
                  </label>
                  <select
                    value={newGroupCategory}
                    onChange={(e) => setNewGroupCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                  >
                    <option value="Geral">Geral (Achadinhos)</option>
                    <option value="Cosméticos & Beleza">Cosméticos & Beleza</option>
                    <option value="Casa & Cozinha">Casa & Cozinha</option>
                    <option value="Eletrônicos">Eletrônicos</option>
                    <option value="Até R$ 50">Até R$ 50</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Link de Convite ou URL do Grupo:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://chat.whatsapp.com/... ou facebook.com/groups/..."
                  value={newGroupUrl}
                  onChange={(e) => setNewGroupUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5722]/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantidade de Membros (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: 450 membros"
                  value={newGroupMembers}
                  onChange={(e) => setNewGroupMembers(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5722]/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddGroupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-xs shadow-md shadow-orange-500/25 transition-all"
                >
                  Salvar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REGRAS & DICAS DE POSTAGEM EM GRUPOS               */}
      {/* ========================================================= */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Guia de Sucesso em Grupos</h3>
                  <p className="text-xs text-slate-500">Como postar sem ser bloqueado e vender todo dia</p>
                </div>
              </div>
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
                <span className="text-lg leading-none">✅</span>
                <div>
                  <strong className="text-emerald-900 font-black">1. Use Sempre Links Oficiais com sua Tag</strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Nunca use encurtadores desconhecidos (bit.ly estranhos). O Shop GO já gera links limpos oficiais da Shopee que os filtros do WhatsApp e Facebook aprovam imediatamente.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
                <span className="text-lg leading-none">⏰</span>
                <div>
                  <strong className="text-blue-900 font-black">2. Respeite os Melhores Horários</strong>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Os picos de compra de achadinhos acontecem entre <strong>12:00 e 13:30</strong> (horário de almoço) e entre <strong>19:30 e 22:00</strong> (quando as pessoas chegam em casa e navegam na cama).
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-2.5">
                <span className="text-lg leading-none">💬</span>
                <div>
                  <strong className="text-orange-950 font-black">3. Responda nos Comentários no Facebook</strong>
                  <p className="text-orange-900 text-[11px] mt-0.5">
                    No Facebook, publique a foto do produto e escreva na legenda: <em>"Comente EU QUERO que mando o link"</em>. Quando alguém comentar, responda com o seu link de afiliado. Isso multiplica o alcance orgânico em até 5x!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 flex items-start gap-2.5">
                <span className="text-lg leading-none">🛡️</span>
                <div>
                  <strong className="text-purple-950 font-black">4. Intervalo Saudável entre Publicações</strong>
                  <p className="text-purple-900 text-[11px] mt-0.5">
                    Deixe um intervalo de pelo menos 15 a 30 minutos entre postagens no mesmo grupo para evitar ser marcado como spam pelos moderadores.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsRulesModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Entendido, Fechar Guia
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DISPARO AUTOMÁTICO EM TODOS OS GRUPOS COM IA       */}
      {/* ========================================================= */}
      {isMassPostingOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Disparo em Massa Oficial
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {allGroups.length} Grupos Ativos
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    Disparo Automático em Todos os Grupos (IA)
                  </h3>
                </div>
              </div>

              {!isMassPostingRunning && (
                <button
                  onClick={() => setIsMassPostingOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Selected Product Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                    {selectedProduct.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs truncate mt-0.5">
                    {selectedProduct.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xs font-black text-[#FF5722]">
                      R$ {selectedProduct.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      +R$ {selectedProduct.commissionValue.toFixed(2).replace(".", ",")} comissão
                    </span>
                  </div>
                </div>
              </div>

              {!isMassPostingRunning && !massResult && (
                <button
                  onClick={() => setIsProductSelectorOpen(true)}
                  className="text-xs font-bold text-[#FF5722] hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Trocar</span>
                </button>
              )}
            </div>

            {/* If NOT yet running and NO results, show groups summary & start button */}
            {!isMassPostingRunning && !massResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                    <span className="text-xs font-black text-blue-900 block">12 Grupos</span>
                    <span className="text-[10px] text-blue-700 font-medium">Facebook Públicos</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <span className="text-xs font-black text-emerald-900 block">6 Grupos</span>
                    <span className="text-[10px] text-emerald-700 font-medium">WhatsApp VIP</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100">
                    <span className="text-xs font-black text-sky-900 block">3 Canais</span>
                    <span className="text-[10px] text-sky-700 font-medium">Telegram Push</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    O robô do Shop GO irá publicar a oferta nos <strong>{allGroups.length} grupos parceiros</strong> com criativos automáticos, links rastreados de afiliado e preços De/Por para gerar tráfego e vendas imediatas.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMassPostingOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleStartMassPosting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Iniciar Disparo em Todos ({allGroups.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* If RUNNING: Progress & Groups Checklist */}
            {isMassPostingRunning && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {massStatusText || "Processando disparo em massa..."}
                    </span>
                    <span className="font-mono-code font-black text-emerald-600">{massProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${massProgress}%` }}
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {allGroups.map((grp) => {
                    const isDone = massCompletedGroupIds.includes(grp.id);
                    return (
                      <div
                        key={grp.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          isDone 
                            ? "bg-white border-emerald-200 text-slate-800" 
                            : "bg-slate-50 border-slate-200/50 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isDone ? "bg-emerald-500" : "bg-slate-300"
                          }`} />
                          <span className="font-bold truncate">{grp.name}</span>
                        </div>
                        {isDone ? (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Publicado
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic shrink-0">
                            Na fila...
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If COMPLETED: Full Result Summary */}
            {massResult && !isMassPostingRunning && (
              <div className="space-y-5 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-emerald-950 text-sm">
                      Disparo em Massa Concluído com Sucesso!
                    </h4>
                    <p className="text-emerald-800 text-xs mt-0.5">
                      Todos os {massResult.totalGroups} grupos receberam a publicação do <strong>{selectedProduct.name}</strong> com seu link de afiliado rastreado.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Grupos</span>
                    <span className="text-lg font-black font-mono-code text-slate-900">{massResult.totalGroups}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">100% Enviados</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Visualizações</span>
                    <span className="text-lg font-black font-mono-code text-slate-900">+{massResult.totalViews.toLocaleString("pt-BR")}</span>
                    <span className="text-[10px] text-blue-600 font-bold block mt-0.5">Alcance Real</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Cliques no Link</span>
                    <span className="text-lg font-black font-mono-code text-slate-900">+{massResult.totalClicks.toLocaleString("pt-BR")}</span>
                    <span className="text-[10px] text-orange-600 font-bold block mt-0.5">Compradores</span>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block">Comissão</span>
                    <span className="text-lg font-black font-mono-code text-emerald-600">
                      +R$ {massResult.totalCommission.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Creditada</span>
                  </div>
                </div>

                {massResult.totalCommission <= 0 && !(userCode === "123456" || userCode === "12456") && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    ℹ️ O limite diário de comissão de R$ 25,00 foi atingido para o código 101190. Suas publicações continuam ativas gerando cliques e pedidos!
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsMassPostingOpen(false);
                      setMassResult(null);
                    }}
                    className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Concluir e Voltar aos Grupos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
