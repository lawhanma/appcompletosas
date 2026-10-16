import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../lib/apiFetch";
import { Product, GeneratedVideoData, VideoScene, InfluencerConfig, RecordingFormatOption, RecordingFormatId } from "../types";
import { PRODUCTS } from "../data/mockData";
import { getWorkingShopeeUrl } from "../utils/shopee";
import { 
  INFLUENCER_PRESETS, 
  HAIR_COLOR_OPTIONS, 
  HAIR_STYLE_OPTIONS, 
  SKIN_TONE_OPTIONS, 
  AGE_RANGE_OPTIONS, 
  RECORDING_FORMAT_OPTIONS 
} from "../data/videoCreationOptions";
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Disc, 
  Check, 
  ShoppingCart,
  Music,
  Mic,
  Sliders,
  Flame,
  Clock,
  Zap,
  Info,
  ExternalLink,
  Copy,
  Loader2,
  Wand2,
  Eye,
  X,
  Maximize2,
  Tv,
  Hand,
  User,
  UserCheck,
  PackageOpen,
  Palette,
  CheckCheck,
  Camera,
  Layers,
  Smile,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface GerarVideosIAViewProps {
  initialProduct?: Product | null;
}

export const GerarVideosIAView: React.FC<GerarVideosIAViewProps> = ({ 
  initialProduct = null 
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    initialProduct || PRODUCTS[0] // Kit Body Splash Obsession or Fone Bluetooth
  );
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [selectedVoice, setSelectedVoice] = useState("Júlia (Voz Enérgica / TikTok)");
  const [selectedMusic, setSelectedMusic] = useState("TikTok Upbeat (Viral)");
  const [selectedHook, setSelectedHook] = useState("Viral Curiosidade");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Influencer and Recording Format State
  const [selectedInfluencerPreset, setSelectedInfluencerPreset] = useState<InfluencerConfig>(INFLUENCER_PRESETS[0]);
  const [selectedFormatId, setSelectedFormatId] = useState<RecordingFormatId>("pov_maos");
  const [customHair, setCustomHair] = useState(INFLUENCER_PRESETS[0].hairColor);
  const [customHairStyle, setCustomHairStyle] = useState(INFLUENCER_PRESETS[0].hairStyle);
  const [customSkinTone, setCustomSkinTone] = useState(INFLUENCER_PRESETS[0].skinTone);
  const [customAgeRange, setCustomAgeRange] = useState(INFLUENCER_PRESETS[0].ageRange);
  const [isCustomizingInfluencer, setIsCustomizingInfluencer] = useState(false);

  const activeRecordingFormat = RECORDING_FORMAT_OPTIONS.find(f => f.id === selectedFormatId) || RECORDING_FORMAT_OPTIONS[0];

  const activeInfluencerConfig: InfluencerConfig = {
    ...selectedInfluencerPreset,
    hairColor: customHair,
    hairStyle: customHairStyle,
    skinTone: customSkinTone,
    ageRange: customAgeRange,
  };

  const handleSelectInfluencer = (preset: InfluencerConfig) => {
    setSelectedInfluencerPreset(preset);
    setCustomHair(preset.hairColor);
    setCustomHairStyle(preset.hairStyle);
    setCustomSkinTone(preset.skinTone);
    setCustomAgeRange(preset.ageRange);
  };

  // Flow Video Prompt Generation state
  const [isGeneratingFlowPrompt, setIsGeneratingFlowPrompt] = useState(false);
  const [flowGenerationStep, setFlowGenerationStep] = useState(0);
  const [flowPromptResult, setFlowPromptResult] = useState<{
    flowPrompt: string;
    flowPromptPortuguese: string;
    cameraMotion?: string;
    aspectRatio?: string;
    lighting?: string;
    tips?: string;
    flowUrl?: string;
  } | null>(null);
  const [copiedFlowPrompt, setCopiedFlowPrompt] = useState(false);
  const [flowLanguage, setFlowLanguage] = useState<"pt" | "en">("pt");

  // Video playback simulation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [likeCount, setLikeCount] = useState(48200);
  const [hasLiked, setHasLiked] = useState(false);

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const categories = ["Todos", "Cosméticos", "Eletrônicos", "Sazonais", "Utilidades", "Cozinha", "Casa"];

  // Default initial video data
  const [videoData, setVideoData] = useState<GeneratedVideoData>({
    title: `Achadinho Viral: ${selectedProduct.name}`,
    hook: "NUNCA MAIS COMPRE CARO! 😱",
    scenes: [
      {
        time: "0s - 3s",
        visual: "Close-up dinâmico com zoom suave no produto e efeito de impacto.",
        narration: `Eu garanto que você nunca viu nada parecido com esse ${selectedProduct.name} na Shopee!`,
        textOverlay: "NUNCA MAIS COMPRE CARO! 😱",
        audioEffect: "Whoosh + Impacto"
      },
      {
        time: "4s - 8s",
        visual: "Demonstração prática do uso real com alta saturação e iluminação impecável.",
        narration: `Olha a qualidade desse produto. Ele tem mais de 35 mil avaliações positivas e nota máxima!`,
        textOverlay: "QUALIDADE SURPREENDENTE ⭐⭐⭐⭐⭐",
        audioEffect: "Pop sound"
      },
      {
        time: "9s - 13s",
        visual: "Etiqueta animada com corte de preço de R$ 199,90 para R$ 139,90.",
        narration: `Nas lojas convencionais custa o dobro, mas no fornecedor secreto da Shopee tá com 30% de desconto!`,
        textOverlay: `DE R$ ${selectedProduct.originalPrice.toFixed(2)} POR R$ ${selectedProduct.price.toFixed(2)} 🔥`,
        audioEffect: "Caixa registradora"
      },
      {
        time: "14s - 18s",
        visual: "Seta animada apontando para o botão laranja de compra no carrinho.",
        narration: `O link com cupom de frete grátis tá liberado no meu perfil e no carrinho da Shopee. Corre antes que acabe!`,
        textOverlay: "CLIQUE NO LINK ABAIXO! ⬇️🛒",
        audioEffect: "Chime"
      }
    ],
    caption: `O segredo que os lojistas não querem que você saiba! 🤫 O link com desconto direto na bio e nos comentários! #shopee #achadinhos #comprinhas #viral #ofertas`,
    conversionScore: 98
  });

  // Keep video synchronized if product changes
  useEffect(() => {
    setVideoData({
      title: `Achadinho Viral: ${selectedProduct.name}`,
      hook: "NUNCA MAIS COMPRE CARO! 😱",
      scenes: [
        {
          time: "0s - 3s",
          visual: "Close-up dinâmico no produto com efeito visual de choque e curiosidade.",
          narration: `Pare tudo se você gosta de fazer comprinhas inteligentes na Shopee!`,
          textOverlay: "ACHADINHO SECRETO SHOPEE! 😱",
          audioEffect: "Whoosh Impact"
        },
        {
          time: "4s - 8s",
          visual: "Destaque para a qualidade do produto e praticidade no dia a dia.",
          narration: `Esse é o ${selectedProduct.name}. Mais de ${selectedProduct.salesCount.toLocaleString("pt-BR")} pessoas já garantiram!`,
          textOverlay: "NOTA 4.9 NA SHOPEE ⭐⭐⭐⭐⭐",
          audioEffect: "Pop Sound"
        },
        {
          time: "9s - 13s",
          visual: "Efeito de preço riscado com economia imediata para o comprador.",
          narration: `Ele tá saindo de R$ ${selectedProduct.originalPrice.toFixed(2).replace(".", ",")} por apenas R$ ${selectedProduct.price.toFixed(2).replace(".", ",")} hoje!`,
          textOverlay: `DE R$ ${selectedProduct.originalPrice.toFixed(2).replace(".", ",")} POR R$ ${selectedProduct.price.toFixed(2).replace(".", ",")} 🔥`,
          audioEffect: "Cash Register"
        },
        {
          time: "14s - 18s",
          visual: "Chamada para ação urgente apontando para o link de afiliado.",
          narration: `Link com cupom de frete grátis liberado na bio! Clica no botão e aproveite antes de esgotar.`,
          textOverlay: "LINK NO PERFIL / CARRINHO! ⬇️🛒",
          audioEffect: "Success Bell"
        }
      ],
      caption: `Gente, corre antes que acabe o estoque do ${selectedProduct.name}! Link direto nos comentários! #achadinhos #shopee #promocao #review`,
      conversionScore: 97
    });
  }, [selectedProduct]);

  // Scene timer loop when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && videoGenerated) {
      interval = setInterval(() => {
        setCurrentSceneIndex((prev) => {
          if (prev >= videoData.scenes.length - 1) {
            return 0; // loop back
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, videoGenerated, videoData.scenes.length]);

  // Voice speech synthesis trigger when scene changes during playback
  useEffect(() => {
    if (isPlaying && !isMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const currentNarration = videoData.scenes[currentSceneIndex]?.narration;
      if (currentNarration) {
        const utterance = new SpeechSynthesisUtterance(currentNarration);
        utterance.lang = "pt-BR";
        utterance.rate = 1.15; // upbeat energetic speech
        utterance.pitch = selectedVoice.includes("Júlia") ? 1.15 : selectedVoice.includes("Camila") ? 1.25 : 0.95;
        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentSceneIndex, isPlaying, isMuted, selectedVoice, videoData]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setGenerationStep(1);

    try {
      setTimeout(() => setGenerationStep(2), 700);
      setTimeout(() => setGenerationStep(3), 1400);

      const res = await apiFetch("/api/ai/generate-video-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: selectedProduct.name,
          price: `R$ ${selectedProduct.price.toFixed(2).replace(".", ",")}`,
          originalPrice: `R$ ${selectedProduct.originalPrice.toFixed(2).replace(".", ",")}`,
          voice: selectedVoice,
          music: selectedMusic,
          hookStyle: selectedHook,
          customPrompt: customPrompt.trim(),
          influencerConfig: activeInfluencerConfig,
          recordingFormat: activeRecordingFormat
        })
      });

      const data = await res.json();
      if (data.scenes && data.scenes.length > 0) {
        setVideoData({
          ...data,
          influencer: activeInfluencerConfig,
          recordingFormat: activeRecordingFormat
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setVideoGenerated(true);
        setCurrentSceneIndex(0);
        setIsPlaying(true);
      }, 2000);
    }
  };

  const handleGenerateFlowPrompt = async () => {
    setIsGeneratingFlowPrompt(true);
    setFlowGenerationStep(1);
    setCopiedFlowPrompt(false);

    const step1 = setTimeout(() => setFlowGenerationStep(2), 500);
    const step2 = setTimeout(() => setFlowGenerationStep(3), 1100);

    try {
      const res = await apiFetch("/api/ai/generate-flow-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: selectedProduct.name,
          category: selectedProduct.category,
          price: `R$ ${selectedProduct.price.toFixed(2).replace(".", ",")}`,
          originalPrice: `R$ ${selectedProduct.originalPrice.toFixed(2).replace(".", ",")}`,
          customPrompt: customPrompt.trim(),
          voice: selectedVoice,
          music: selectedMusic,
          hookStyle: selectedHook,
          scenes: videoData.scenes,
          caption: videoData.caption,
          hook: videoData.hook,
          influencerConfig: activeInfluencerConfig,
          recordingFormat: activeRecordingFormat
        })
      });

      const data = await res.json();
      if (data.flowPrompt) {
        setFlowPromptResult(data);
      } else {
        throw new Error("No prompt in response");
      }
    } catch (error) {
      console.error("Error generating Flow prompt:", error);
      
      const scenesPt = videoData.scenes.map((s, idx) => 
        `• CENA ${idx + 1} (${s.time}):\n  - Enquadramento Visual: ${s.visual}\n  - Locução (${selectedVoice}): "${s.narration}"\n  - Texto Destacado na Tela: "${s.textOverlay}"\n  - Efeito Sonoro: ${s.audioEffect}`
      ).join("\n\n");

      const userGuidancePt = customPrompt.trim() ? `\n[INSTRUÇÕES PERSONALIZADAS DO USUÁRIO]\n${customPrompt.trim()}\n` : "";

      const priceFormatted = `R$ ${selectedProduct.price.toFixed(2).replace(".", ",")}`;
      const originalFormatted = `R$ ${selectedProduct.originalPrice.toFixed(2).replace(".", ",")}`;

      const isNoFace = activeInfluencerConfig.id === "sem_rosto" || activeInfluencerConfig.name.toLowerCase().includes("sem rosto");

      const influencerBlock = isNoFace
        ? `[APRESENTAÇÃO / INFLUENCER]\nModo Sem Rosto / Foco Total no Produto: A câmera foca exclusivamente nas mãos demonstrando o produto em primeiro plano com cortes dinâmicos, sem mostrar rostos.`
        : `[APRESENTADORA / INFLUENCER VIRTUAL]
Nome/Perfil: ${activeInfluencerConfig.name} (${activeInfluencerConfig.gender})
Tom de Pele: ${activeInfluencerConfig.skinTone}
Cor do Cabelo: ${customHair}
Estilo do Penteado: ${customHairStyle}
Faixa Etária & Vibe: ${customAgeRange} - ${activeInfluencerConfig.vibe}
Vestimenta: ${activeInfluencerConfig.outfit}`;

      const ptPromptFull = `[PROMPT COMPLETO GERADO CONFORME SUAS CONFIGURAÇÕES PARA O GOOGLE FLOW]
Formato: Vídeo Comercial Cinematográfico 4K em 9:16 Vertical (TikTok, Reels e Shorts).
Produto: ${selectedProduct.name} (${selectedProduct.category}).

${influencerBlock}

[FORMATO DE GRAVAÇÃO & CÂMERA]
Formato Selecionado: ${activeRecordingFormat.title} - "${activeRecordingFormat.simplifiedLabel}"
Instrução de Câmera: ${activeRecordingFormat.cameraPrompt}
Iluminação: Luz suave de estúdio difusa com luz de recorte âmbar (3200K) e profundidade de campo suave (bokeh natural).

[ÁUDIO, LOCUÇÃO & TRILHA SONORA]
Perfil de Voz: ${selectedVoice}
Trilha de Fundo: ${selectedMusic}
Estilo do Gancho: ${selectedHook}
${userGuidancePt}
[ROTEIRO CENA A CENA 100% SINCRONIZADO]
${scenesPt}

[PREÇO & CHAMADA PARA AÇÃO]
Preço: De ${originalFormatted} por apenas ${priceFormatted}!
Legenda Sugerida: ${videoData.caption || "Link direto com desconto nos comentários e na bio!"}

[PARÂMETROS TÉCNICOS FLOW]
9:16 Vertical | 4K UHD 60fps | Lens 35mm f/1.8 | High-conversion advertising look`;

      setFlowPromptResult({
        flowPrompt: ptPromptFull,
        flowPromptPortuguese: ptPromptFull,
        cameraMotion: activeRecordingFormat.simplifiedLabel,
        influencerSummary: `${activeInfluencerConfig.name} • ${customHair} • ${customSkinTone}`,
        aspectRatio: "9:16 (Vertical TikTok / Reels / Shorts)",
        lighting: "Luz de estúdio suave + recorte âmbar",
        tips: "Prompt gerado exatamente com a sua influencer, cabelo, tom de pele e formato de gravação escolhidos!",
        flowUrl: "https://labs.google/flow"
      });
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      setTimeout(() => {
        setIsGeneratingFlowPrompt(false);
        setFlowGenerationStep(0);
      }, 1600);
    }
  };

  const handleToggleLike = () => {
    setHasLiked(!hasLiked);
    setLikeCount(prev => (hasLiked ? prev - 1 : prev + 1));
  };

  const activeScene = videoData.scenes[currentSceneIndex] || videoData.scenes[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Credits Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="font-display text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Gerar Vídeos com IA</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF5722] font-mono-code font-bold tracking-tight">
              TikTok & Reels
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Crie vídeos virais de alta conversão para TikTok, Reels e Shorts em segundos.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Créditos de IA
            </span>
            <span className="text-sm font-mono-code font-extrabold text-[#7C3AED]">
              ∞ Ilimitados
            </span>
          </div>

          <button
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 btn-primary-tactile transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>{isGenerating ? "Processando Vídeo..." : "Gerar Vídeo de Vendas"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (7 cols) + Right Mobile Phone Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Steps & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Escolha o Produto */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-mono-code flex items-center justify-center font-bold shadow-2xs">
                  1
                </span>
                <span>Escolha o Produto</span>
              </h2>
              <span className="text-xs font-mono-code text-slate-400">
                {PRODUCTS.length} produtos disponíveis
              </span>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Selectable Product Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {PRODUCTS.filter(p => categoryFilter === "Todos" || p.category.toLowerCase().includes(categoryFilter.toLowerCase().slice(0, 4))).map((p) => {
                const isSelected = selectedProduct.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? "border-[#FF5722] bg-[#FFF4F0] ring-1 ring-[#FF5722]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.category} • {p.rankBadge || "Top Oferta"}
                      </div>
                      <div className="text-xs font-black text-[#FF5722] mt-0.5">
                        R$ {p.price.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Formato de Gravação (Estilo da Câmera) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-mono-code flex items-center justify-center font-bold shadow-2xs">
                  2
                </span>
                <span>Formato de Gravação (Estilo da Câmera)</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
                ✨ Amigável & Viral
              </span>
            </div>

            {/* Top of Funnel friendly explanation banner */}
            <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/70 text-xs text-orange-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Como você quer que o vídeo seja filmado?</strong>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Para quem está começando a divulgar produtos na internet, o formato <span className="font-bold text-[#FF5722]">"Mostrando com as Mãos (Estilo POV)"</span> é o mais recomendado porque dá a sensação imediata de que o produto já está na mão de quem assiste!
                </p>
              </div>
            </div>

            {/* Formats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RECORDING_FORMAT_OPTIONS.map((fmt) => {
                const isSelected = selectedFormatId === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => setSelectedFormatId(fmt.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? "border-[#FF5722] bg-[#FFF4F0] ring-2 ring-[#FF5722]/30 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isSelected 
                          ? "bg-white text-[#FF5722] border-orange-300 shadow-xs" 
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {fmt.badge}
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-[#FF5722] bg-[#FF5722] text-white" : "border-slate-300 bg-white"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      {fmt.id === "pov_maos" && <Hand className="w-3.5 h-3.5 text-[#FF5722]" />}
                      {fmt.id === "influencer_rosto" && <UserCheck className="w-3.5 h-3.5 text-[#FF5722]" />}
                      {fmt.id === "unboxing_mesa" && <PackageOpen className="w-3.5 h-3.5 text-[#FF5722]" />}
                      {fmt.id === "uso_real" && <Zap className="w-3.5 h-3.5 text-[#FF5722]" />}
                      {fmt.id === "comercial_360" && <Eye className="w-3.5 h-3.5 text-[#FF5722]" />}
                      <span>{fmt.simplifiedLabel}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {fmt.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-500">Ideal para:</span>
                      <span className="truncate max-w-[170px] text-slate-700">{fmt.bestFor}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Apresentadora / Influencer IA (Aparência do Criador) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-mono-code flex items-center justify-center font-bold shadow-2xs">
                  3
                </span>
                <span>Apresentadora / Influencer IA</span>
              </h2>
              <span className="text-xs text-slate-400">
                Personalize cor do cabelo, pele e estilo
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Escolha o perfil da influenciadora virtual que mais combina com o público do seu produto, ou clique em <strong className="text-slate-700">"Personalizar Cabelo & Pele"</strong> para ajustar a cor do cabelo, tom de pele e idade com 1 clique.
            </p>

            {/* Presets Cards with Photos */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <User className="w-3.5 h-3.5 text-[#FF5722]" />
                Influencers Populares (Estilo Brasil)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INFLUENCER_PRESETS.map((preset) => {
                  const isSelected = selectedInfluencerPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectInfluencer(preset)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 relative ${
                        isSelected
                          ? "border-[#FF5722] bg-[#FFF4F0] ring-2 ring-[#FF5722]/30 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={preset.avatarUrl}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {preset.name.split(" ")[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                          {preset.hairColor}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {preset.skinTone.split("/")[0]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Influencer Summary Badge & Customization Toggle */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={activeInfluencerConfig.avatarUrl}
                  alt={activeInfluencerConfig.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                    <span>{activeInfluencerConfig.name}</span>
                    <span className="text-[10px] font-normal text-slate-500">• {activeInfluencerConfig.ageRange.split(" ")[0]}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block" 
                        style={{ backgroundColor: HAIR_COLOR_OPTIONS.find(h => h.label === customHair)?.colorHex || "#6F4E37" }} 
                      />
                      <span className="font-medium text-slate-700">{customHair}</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block" 
                        style={{ backgroundColor: SKIN_TONE_OPTIONS.find(s => s.label === customSkinTone)?.colorHex || "#C68662" }} 
                      />
                      <span className="font-medium text-slate-700">{customSkinTone.split("/")[0]}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizingInfluencer(!isCustomizingInfluencer)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Palette className="w-3.5 h-3.5 text-[#FF5722]" />
                <span>{isCustomizingInfluencer ? "Ocultar Ajustes" : "Personalizar Cabelo & Pele"}</span>
                {isCustomizingInfluencer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Customization Panel (Hair Color, Hair Style, Skin Tone, Age/Vibe) */}
            {isCustomizingInfluencer && (
              <div className="p-4 rounded-xl border border-orange-200 bg-[#FFF9F6] space-y-4">
                <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                  <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#FF5722]" />
                    Ajustes Finos de Aparência da Influencer
                  </span>
                  <span className="text-[10px] text-orange-600 font-semibold">
                    Personalização Ativa
                  </span>
                </div>

                {/* Cor do Cabelo */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Cor do Cabelo:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {HAIR_COLOR_OPTIONS.map((opt) => {
                      const isSelected = customHair === opt.label;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setCustomHair(opt.label)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all text-left ${
                            isSelected
                              ? "border-[#FF5722] bg-white text-[#FF5722] font-bold shadow-xs ring-1 ring-[#FF5722]"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                            style={{ backgroundColor: opt.colorHex }}
                          />
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Estilo do Cabelo */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Penteado / Estilo do Cabelo:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {HAIR_STYLE_OPTIONS.map((style) => {
                      const isSelected = customHairStyle === style;
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setCustomHairStyle(style)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            isSelected
                              ? "bg-[#FF5722] text-white font-bold shadow-xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tom de Pele */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Tom de Pele:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SKIN_TONE_OPTIONS.map((tone) => {
                      const isSelected = customSkinTone === tone.label;
                      return (
                        <button
                          key={tone.label}
                          type="button"
                          onClick={() => setCustomSkinTone(tone.label)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all text-left ${
                            isSelected
                              ? "border-[#FF5722] bg-white text-[#FF5722] font-bold shadow-xs ring-1 ring-[#FF5722]"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                            style={{ backgroundColor: tone.colorHex }}
                          />
                          <span className="truncate">{tone.label.split("/")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Faixa Etária e Vibe */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Faixa Etária & Vibe:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AGE_RANGE_OPTIONS.map((age) => {
                      const isSelected = customAgeRange === age;
                      return (
                        <button
                          key={age}
                          type="button"
                          onClick={() => setCustomAgeRange(age)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            isSelected
                              ? "bg-[#FF5722] text-white font-bold shadow-xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {age}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Voz, Trilha Sonora & Roteiro Viral */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="font-display text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-mono-code flex items-center justify-center font-bold shadow-2xs">
                4
              </span>
              <span>Áudio, Trilha Sonora & Roteiro</span>
            </h2>

            {/* Voz Narradora */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Mic className="w-3.5 h-3.5 text-[#FF5722]" />
                Voz Narradora (IA Neural Português BR)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { name: "Júlia (Voz Enérgica / TikTok)", badge: "FEMININA", tag: "Viral" },
                  { name: "Lucas (Review Autêntico)", badge: "MASCULINO", tag: "Natural" },
                  { name: "Camila (Promoção Urgente)", badge: "FEMININA", tag: "Urgência" }
                ].map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVoice(v.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedVoice === v.name
                        ? "border-[#FF5722] bg-[#FFF4F0] text-slate-900 font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>{v.badge}</span>
                      <span className="text-[#FF5722] font-semibold">{v.tag}</span>
                    </div>
                    <div className="text-xs font-bold truncate leading-tight">
                      {v.name.split(" ")[0]}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {v.name.split("(")[1]?.replace(")", "") || ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trilha Sonora Viral */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Music className="w-3.5 h-3.5 text-[#FF5722]" />
                Música de Fundo (Viral TikTok 2026)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { name: "TikTok Upbeat (Viral)", tag: "Alta Energia" },
                  { name: "Lo-Fi Aesthetic", tag: "Aconchegante" },
                  { name: "Trap Phonk E-com", tag: "Impacto Rápido" }
                ].map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setSelectedMusic(m.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedMusic === m.name
                        ? "border-[#FF5722] bg-[#FFF4F0] text-slate-900 font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{m.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{m.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo do Roteiro / Gancho */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Flame className="w-3.5 h-3.5 text-[#FF5722]" />
                Formato do Gancho Inicial (0-3 segundos)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: "Viral Curiosidade", desc: "Pare tudo o que você está fazendo agora..." },
                  { id: "Dor e Solução / Problema", desc: "Você ainda sofre tentando fazer isso manual?..." },
                  { id: "Achadinho Secreto Shopee", desc: "O fornecedor dessa loja vai me odiar por revelar..." },
                  { id: "Review Sincero & Unboxing", desc: "Comprei o produto mais viral da Shopee para testar..." }
                ].map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHook(h.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedHook === h.id
                        ? "border-[#FF5722] bg-[#FFF4F0] text-slate-900 font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold">{h.id}</div>
                    <div className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                      "{h.desc}"
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Campo: Prompt Personalizado do Vídeo */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Prompt Personalizado do Vídeo</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                {customPrompt && (
                  <button
                    type="button"
                    onClick={() => setCustomPrompt("")}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Digite instruções especiais: como você quer a gravação, cenário, iluminação, tom ou detalhes específicos que o vídeo deve destacar.
              </p>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={`Ex: Mostre o ${selectedProduct.name} sendo aberto em um ambiente moderno e bem iluminado. Destaque a praticidade no dia a dia, foque na qualidade premium e mostre que restam poucas unidades com cupom de frete grátis na Shopee.`}
                rows={3}
                className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:border-[#FF5722] focus:ring-2 focus:ring-orange-500/20 outline-hidden resize-none bg-slate-50/50 hover:bg-white focus:bg-white transition-all placeholder:text-slate-400"
              />
              
              {/* Sugestões rápidas de prompt */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 mr-1">Sugestões rápidas:</span>
                {[
                  "📦 Unboxing dinâmico com iluminação de estúdio",
                  "⚡ Demonstração rápida de antes e depois",
                  "🔥 Enfatizar promoção relâmpago e frete grátis",
                  "✨ Estética clean minimalista com cores vibrantes"
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setCustomPrompt((prev) => prev ? `${prev} ${sug.slice(2)}.` : `${sug.slice(2)}.`)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-[#FF5722] text-slate-600 font-medium transition-all cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Script Scenes Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-mono-code flex items-center justify-center font-bold shadow-2xs">
                  5
                </span>
                <span>Roteiro Detalhado & Direção de Cenas (IA)</span>
                <span className="text-xs px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md font-mono-code font-bold">
                  Score {videoData.conversionScore}/100
                </span>
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    videoData.scenes.map(s => `[${s.time}] VISUAL: ${s.visual}\nNARRACAO: ${s.narration}\nTEXTO: ${s.textOverlay}\n`).join("\n")
                  );
                  alert("Roteiro completo copiado para a área de transferência!");
                }}
                className="text-xs text-[#FF5722] font-bold hover:underline cursor-pointer"
              >
                Copiar Roteiro
              </button>
            </div>

            {/* Active Format and Influencer Badges */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Camera className="w-3.5 h-3.5 text-[#FF5722]" />
                <span>Formato:</span>
                <span className="font-bold text-slate-900">{activeRecordingFormat.simplifiedLabel}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <User className="w-3.5 h-3.5 text-[#FF5722]" />
                <span>Influencer:</span>
                <span className="font-bold text-slate-900">{activeInfluencerConfig.name} ({customHair})</span>
              </div>
            </div>

            <div className="space-y-3">
              {videoData.scenes.map((scene, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentSceneIndex(idx)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    currentSceneIndex === idx 
                      ? "border-[#FF5722] bg-orange-50/50 shadow-xs" 
                      : "border-slate-200 bg-slate-50/70 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FF5722]" />
                      Cena {idx + 1} ({scene.time})
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Áudio: {scene.audioEffect}
                    </span>
                  </div>
                  <div className="text-slate-800 font-medium">
                    🗣️ <strong>Fala:</strong> "{scene.narration}"
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-1">
                    <span>🎬 Visual: {scene.visual}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mobile Smartphone Preview (5 cols) (Exact Match to Screenshot 4!) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Top Bar with 'Ver como ficou vídeo' button */}
          {videoGenerated && !isGenerating && (
            <div className="w-full max-w-[360px] mb-3 p-2.5 px-3.5 rounded-2xl bg-white border border-orange-200 shadow-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-slate-800 tracking-tight">
                  Vídeo Gerado com IA
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(true);
                  setCurrentSceneIndex(0);
                  setIsPlaying(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-[#FF5722] hover:from-orange-600 hover:to-[#E64A19] text-white text-xs font-black shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer transform hover:scale-105"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver como ficou vídeo</span>
              </button>
            </div>
          )}

          <div className="relative flex items-start gap-4">
            {/* Smartphone Shell */}
            <div className="relative w-[340px] sm:w-[360px] h-[680px] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-800 flex flex-col overflow-hidden">
              {/* Top Phone Speaker / Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                <div className="w-2 h-2 rounded-full bg-blue-900/50" />
              </div>

            {/* Inner Phone Screen Content */}
            <div className="relative w-full h-full bg-black rounded-[36px] overflow-hidden flex flex-col justify-between select-none">
              {/* STATE 1: Idle Screen (Screenshot 4) */}
              {!videoGenerated && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                    <Tv className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">Aguardando Criação</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                      Escolha um produto e clique no botão de gerar para processar seu vídeo inteligente.
                    </p>
                  </div>
                </div>
              )}

              {/* STATE 2: AI Generating Screen */}
              {isGenerating && (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-white space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 border-t-[#FF5722] animate-spin" />
                    <Sparkles className="w-8 h-8 text-[#FF5722] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-lg text-white">Criando Vídeo com IA...</h4>
                    <p className="text-xs text-slate-400">
                      {generationStep === 1 && "Criando gancho de 3 segundos irresistível..."}
                      {generationStep === 2 && "Gerando locução neural em português..."}
                      {generationStep >= 3 && "Sincronizando legendas dinâmicas TikTok..."}
                    </p>
                  </div>

                  <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#FF5722] h-full rounded-full transition-all duration-500"
                      style={{ width: `${generationStep * 33}%` }}
                    />
                  </div>
                </div>
              )}

              {/* STATE 3: Active Video Playback Simulation */}
              {videoGenerated && !isGenerating && (
                <div className="relative w-full h-full overflow-hidden flex flex-col justify-between">
                  {/* Background Product Image with Dynamic Zoom/Pan Animation */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-all duration-1000 ${
                        isPlaying ? (currentSceneIndex % 2 === 0 ? "scale-110 translate-y-2" : "scale-125 -translate-y-2") : "scale-100"
                      }`}
                    />
                    {/* Cinematic Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
                  </div>

                  {/* Top Bar on Screen with Format & Influencer Badges */}
                  <div className="relative z-20 pt-8 px-3 flex flex-col gap-1.5 text-white text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 font-bold drop-shadow">
                        <span className="text-[#FF5722]">Shop</span>
                        <span className="text-[#0284C7] font-black">GO</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 font-extrabold uppercase">
                          AO VIVO
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-1.5 rounded-full bg-black/40 text-white backdrop-blur-xs hover:bg-black/60 transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Floating Info Pills (Format & Influencer) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                      <span className="text-[10px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-white font-semibold flex items-center gap-1 shrink-0">
                        <Camera className="w-2.5 h-2.5 text-[#FF5722]" />
                        <span>{activeRecordingFormat.simplifiedLabel}</span>
                      </span>
                      <span className="text-[10px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-white font-semibold flex items-center gap-1 shrink-0">
                        <User className="w-2.5 h-2.5 text-amber-400" />
                        <span>{activeInfluencerConfig.name.split(" ")[0]}</span>
                      </span>
                    </div>
                  </div>

                  {/* Center Screen: Huge Dynamic Captions (TikTok Style) */}
                  <div className="relative z-20 px-4 text-center my-auto">
                    <div className="inline-block bg-black/60 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/20 shadow-2xl transform transition-all duration-300">
                      <span className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight leading-tight uppercase drop-shadow-md">
                        {activeScene.textOverlay}
                      </span>
                    </div>

                    {/* Subtitle Narration Word Flow */}
                    <p className="text-white text-xs font-medium drop-shadow mt-2 max-w-[260px] mx-auto bg-black/40 px-2.5 py-1 rounded-lg">
                      "{activeScene.narration}"
                    </p>
                  </div>

                  {/* Right Floating Actions (TikTok/Reels UI) */}
                  <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-3.5 text-white">
                    {/* Profile Avatar with Influencer Photo */}
                    <div className="relative mb-1 group">
                      <img 
                        src={activeInfluencerConfig.avatarUrl} 
                        alt={activeInfluencerConfig.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md bg-[#FF5722]"
                      />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                        +
                      </div>
                    </div>

                    {/* Likes */}
                    <button onClick={handleToggleLike} className="flex flex-col items-center group">
                      <div className={`p-2 rounded-full transition-colors ${hasLiked ? "text-red-500" : "text-white"}`}>
                        <Heart className={`w-7 h-7 drop-shadow ${hasLiked ? "fill-red-500" : ""}`} />
                      </div>
                      <span className="text-[10px] font-bold drop-shadow">
                        {(likeCount / 1000).toFixed(1)}k
                      </span>
                    </button>

                    {/* Comments */}
                    <div className="flex flex-col items-center">
                      <MessageCircle className="w-7 h-7 drop-shadow" />
                      <span className="text-[10px] font-bold drop-shadow">1.4k</span>
                    </div>

                    {/* Save */}
                    <div className="flex flex-col items-center">
                      <Bookmark className="w-7 h-7 drop-shadow" />
                      <span className="text-[10px] font-bold drop-shadow">8.9k</span>
                    </div>

                    {/* Share */}
                    <div className="flex flex-col items-center">
                      <Share2 className="w-7 h-7 drop-shadow" />
                      <span className="text-[10px] font-bold drop-shadow">5.2k</span>
                    </div>

                    {/* Vinyl Disc spinning */}
                    <div className={`w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center mt-1 ${isPlaying ? "animate-spin" : ""}`}>
                      <Disc className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Bottom Area: Product Shopee Buy Badge & Play/Pause Controls */}
                  <div className="relative z-20 p-4 space-y-3">
                    {/* Shopee Affiliate Cart Button (Pulsing badge) */}
                    <a
                      href={getWorkingShopeeUrl(selectedProduct)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[82%] bg-[#FF5722] hover:bg-[#E64A19] text-white p-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-600/50 group transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-orange-100 font-semibold leading-none">
                          Comprar na Shopee Oficial
                        </div>
                        <div className="text-xs font-black truncate leading-tight mt-0.5">
                          R$ {selectedProduct.price.toFixed(2).replace(".", ",")}
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-white text-[#FF5722] px-1.5 py-0.5 rounded shadow-xs">
                        COMPRAR
                      </span>
                    </a>

                    {/* User Handle & Description */}
                    <div className="text-white text-xs space-y-0.5 pr-14">
                      <div className="font-bold flex items-center gap-1">
                        @achadinhos.shopee
                        <span className="text-[10px] text-blue-400">✓</span>
                      </div>
                      <p className="text-[11px] text-slate-200 line-clamp-1">
                        {videoData.caption}
                      </p>
                    </div>

                    {/* Play / Pause / Scene Progress Scrub Bar */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={handleTogglePlay}
                        className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors shrink-0"
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Scene Step Dots */}
                      <div className="flex-1 flex items-center gap-1.5">
                        {videoData.scenes.map((_, i) => (
                          <div
                            key={i}
                            onClick={() => setCurrentSceneIndex(i)}
                            className={`h-1.5 rounded-full cursor-pointer transition-all ${
                              currentSceneIndex === i 
                                ? "bg-white flex-1" 
                                : "bg-white/30 w-3 hover:bg-white/60"
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentSceneIndex(0);
                          setIsPlaying(true);
                        }}
                        className="text-white/70 hover:text-white"
                        title="Reiniciar"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão lateral ao lado do vídeo gerado (Desktop) */}
          {videoGenerated && !isGenerating && (
            <div className="hidden xl:flex flex-col gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(true);
                  setCurrentSceneIndex(0);
                  setIsPlaying(true);
                }}
                className="group flex flex-col items-center gap-2 p-3.5 bg-white hover:bg-slate-900 text-slate-800 hover:text-white rounded-2xl border-2 border-orange-300 hover:border-slate-900 shadow-xl shadow-orange-500/10 transition-all cursor-pointer transform hover:-translate-y-1 w-28 text-center"
                title="Ver como ficou o vídeo em tela cheia com narração e legendas"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 group-hover:bg-[#FF5722] text-[#FF5722] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black leading-tight group-hover:text-white">
                  Ver como ficou vídeo
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-50 group-hover:bg-white/20 text-[#FF5722] group-hover:text-orange-200 font-black uppercase tracking-wider">
                  Assistir
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentSceneIndex(0);
                  setIsPlaying(true);
                }}
                className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer w-28 text-center"
                title="Reiniciar vídeo do início"
              >
                <RotateCcw className="w-4 h-4 text-[#FF5722]" />
                <span className="text-[10px] font-bold">Reiniciar</span>
              </button>
            </div>
          )}
        </div>

        {/* Download & Export CTAs */}
          <div className="mt-4 flex flex-col gap-3 w-[340px] sm:w-[360px]">
            <button
              onClick={() => {
                alert("Download do arquivo de roteiro e comandos de mídia gerados com sucesso!");
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Criativo (MP4 / Script)</span>
            </button>

            {/* Botão: Fazer o vídeo com Flow gratuitamente */}
            <button
              onClick={handleGenerateFlowPrompt}
              disabled={isGeneratingFlowPrompt}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF5722] via-[#FF6E40] to-[#FF3D00] hover:from-[#E64A19] hover:to-[#D84315] text-white font-black text-xs sm:text-[13px] flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-tight"
            >
              {isGeneratingFlowPrompt ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Carregando Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white animate-pulse" />
                  <span>Fazer o vídeo com flow gratuitamente</span>
                </>
              )}
            </button>

            {/* Animação de Carregando Prompt */}
            {isGeneratingFlowPrompt && (
              <div className="w-full p-4 rounded-2xl bg-white border border-orange-200 shadow-lg shadow-orange-500/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center shrink-0">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                      <span>Gerando Prompt para o Flow...</span>
                      <span className="text-[10px] text-[#FF5722] font-extrabold bg-orange-50 px-2 py-0.5 rounded">
                        {flowGenerationStep === 1 && "Passo 1/3"}
                        {flowGenerationStep === 2 && "Passo 2/3"}
                        {flowGenerationStep >= 3 && "Passo 3/3"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {flowGenerationStep === 1 && "Analisando produto e especificações técnicas..."}
                      {flowGenerationStep === 2 && "Incorporando instruções do prompt personalizado..."}
                      {flowGenerationStep >= 3 && "Otimizando comandos cinematográficos para o Flow..."}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-[#FF5722] h-full rounded-full transition-all duration-500"
                    style={{ width: `${flowGenerationStep * 33.3}%` }}
                  />
                </div>
              </div>
            )}

            {/* Prompt Gerado + Botão 'Ir para o Flow' com link direto */}
            {flowPromptResult && !isGeneratingFlowPrompt && (
              <div className="w-full p-4 rounded-2xl bg-white border border-orange-200 shadow-xl shadow-orange-500/10 space-y-3">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      Prompt Pronto em Português
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                      🇧🇷 Português Principal
                    </span>
                  </div>
                </div>

                {/* Resumo das Opções Configuradas Incorporadas no Prompt */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                      <span>Configurações Injetadas no Prompt:</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      100% Sincronizado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex items-center gap-2">
                      <img 
                        src={activeInfluencerConfig.avatarUrl} 
                        alt={activeInfluencerConfig.name} 
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-orange-300"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate text-[11px]">{activeInfluencerConfig.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{customHair} • {customSkinTone.split("/")[0]}</div>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#FF5722] shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate text-[11px]">{activeRecordingFormat.simplifiedLabel}</div>
                        <div className="text-[10px] text-slate-500 truncate">{activeRecordingFormat.title}</div>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate text-[11px]">Voz: {selectedVoice.split(" ")[0]}</div>
                        <div className="text-[10px] text-slate-500 truncate">{selectedVoice}</div>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex items-center gap-2">
                      <Music className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate text-[11px]">Trilha: {selectedMusic.split(" ")[0]}</div>
                        <div className="text-[10px] text-slate-500 truncate">{selectedMusic}</div>
                      </div>
                    </div>
                  </div>

                  {customPrompt.trim() && (
                    <div className="text-[10px] text-slate-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md flex items-center gap-1.5">
                      <span className="font-bold text-amber-900">Nota Personalizada:</span>
                      <span className="truncate text-amber-800 italic">"{customPrompt.trim()}"</span>
                    </div>
                  )}
                </div>

                {/* Caixa do Prompt para Copiar */}
                <div className="relative p-3 rounded-xl bg-slate-950 text-slate-100 text-[11px] leading-relaxed border border-slate-800">
                  <p className="font-mono text-slate-200 max-h-40 overflow-y-auto pr-1 whitespace-pre-line select-all">
                    {flowPromptResult.flowPromptPortuguese || flowPromptResult.flowPrompt}
                  </p>

                  <button
                    onClick={() => {
                      const textToCopy = flowPromptResult.flowPromptPortuguese || flowPromptResult.flowPrompt;
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedFlowPrompt(true);
                      setTimeout(() => setCopiedFlowPrompt(false), 3000);
                    }}
                    className="mt-3 w-full py-2.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-sans text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedFlowPrompt ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Prompt em Português Copiado com Sucesso! ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white" />
                        <span>Copiar Prompt em Português para Colar no Flow</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tags de Câmera e Resolução */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#FF5722] font-bold border border-orange-100">
                    📐 {flowPromptResult.aspectRatio || "9:16 Vertical"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    🎥 {flowPromptResult.cameraMotion || "Orbital 4K"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    💡 {flowPromptResult.lighting || "Studio Softbox"}
                  </span>
                </div>

                {/* Guia simples */}
                <p className="text-[11px] text-slate-600 leading-snug bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  💡 <strong>Passo a passo:</strong> Clique em <strong>"Copiar Prompt"</strong>, abra o Flow no botão abaixo e cole para gerar seu vídeo grátis.
                </p>

                {/* Botão: Ir para o Flow com Link Direto */}
                <a
                  href={flowPromptResult.flowUrl || "https://labs.google/flow"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#0070F3] hover:bg-[#0060DF] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-tight text-center"
                >
                  <span>Ir para o Flow</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Ver como ficou vídeo (Visualização Completa Cinematográfica) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-[#FF5722] text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>Prévia do Vídeo: Veja como ficou seu vídeo</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Score {videoData.conversionScore}/100
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedProduct.name} • 9:16 Vertical para TikTok, Reels e Shopee
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar prévia"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
              {/* Left Column: Phone Preview Player */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-[280px] sm:w-[310px] h-[540px] bg-black rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden">
                  {/* Dynamic Island / Speaker */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-black rounded-full z-40" />

                  {/* Player Viewport */}
                  <div className="relative w-full h-full bg-slate-900 rounded-[30px] overflow-hidden flex flex-col justify-between select-none">
                    <img
                      src={selectedProduct.imageUrl || (selectedProduct as any).image}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

                    {/* Top Player Badges */}
                    <div className="relative z-20 pt-4 px-3 flex items-center justify-between text-white text-[11px] font-bold">
                      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                        <Flame className="w-3.5 h-3.5 text-[#FF5722] fill-current" />
                        <span>Viral Shopee</span>
                      </div>
                      <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-orange-300 font-mono text-[10px]">
                        {activeScene.time}
                      </div>
                    </div>

                    {/* Subtitle & Narration Center Overlay */}
                    <div className="relative z-20 px-3 text-center my-auto">
                      <div className="inline-block px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-orange-400/40 text-white font-black text-xs sm:text-sm tracking-tight shadow-2xl animate-bounce duration-1000">
                        {activeScene.textOverlay}
                      </div>
                      <div className="mt-2 text-[11px] text-orange-200 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg italic max-w-[240px] mx-auto border border-white/5">
                        🗣️ "{activeScene.narration}"
                      </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="relative z-20 p-3 space-y-2 bg-gradient-to-t from-black via-black/90 to-transparent">
                      {/* Product Card */}
                      <div className="bg-white/15 backdrop-blur-md border border-white/20 p-2 rounded-xl flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-white truncate">{selectedProduct.name}</div>
                          <div className="text-xs font-black text-orange-400">
                            R$ {selectedProduct.price.toFixed(2).replace(".", ",")}
                          </div>
                        </div>
                        <div className="bg-[#FF5722] text-white px-2 py-1 rounded-lg text-[10px] font-black shrink-0 flex items-center gap-1 shadow-xs">
                          <ShoppingCart className="w-3 h-3" />
                          <span>Shopee</span>
                        </div>
                      </div>

                      {/* Video Timeline Bar */}
                      <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-[#FF5722] h-full rounded-full transition-all duration-300"
                          style={{ width: `${((currentSceneIndex + 1) / videoData.scenes.length) * 100}%` }}
                        />
                      </div>

                      {/* Play / Pause / Reset Bar */}
                      <div className="flex items-center justify-between text-white text-xs pt-1">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>

                        <span className="text-[10px] font-mono text-slate-300">
                          Cena {currentSceneIndex + 1} de {videoData.scenes.length}
                        </span>

                        <button
                          onClick={() => {
                            setCurrentSceneIndex(0);
                            setIsPlaying(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                          title="Reiniciar"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Scenes Breakdown & Quick Actions */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  {/* Influencer & Format Overview Banner */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={activeInfluencerConfig.avatarUrl}
                        alt={activeInfluencerConfig.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-orange-500/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                          <span>{activeInfluencerConfig.name}</span>
                          <span className="text-[10px] text-orange-400 font-semibold">• {activeInfluencerConfig.ageRange.split(" ")[0]}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Cabelo: {customHair} • Pele: {customSkinTone.split("/")[0]}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Formato:</span>
                      <span className="text-xs font-bold text-orange-400">
                        {activeRecordingFormat.simplifiedLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Roteiro Completo do Vídeo</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Clique em uma cena para testar)</span>
                    </h4>
                    <span className="text-[11px] text-orange-400 font-mono font-bold">
                      18 segundos
                    </span>
                  </div>

                  {/* Scene cards list in modal */}
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {videoData.scenes.map((scene, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCurrentSceneIndex(idx);
                          setIsPlaying(true);
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          currentSceneIndex === idx
                            ? "bg-orange-950/40 border-orange-500 text-white shadow-md shadow-orange-500/10"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold flex items-center gap-1.5 ${currentSceneIndex === idx ? "text-orange-400" : "text-slate-200"}`}>
                            <Clock className="w-3.5 h-3.5 text-[#FF5722]" />
                            Cena {idx + 1} ({scene.time})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            Áudio: {scene.audioEffect}
                          </span>
                        </div>
                        <p className="text-slate-200 font-medium">
                          🗣️ <strong>Fala:</strong> "{scene.narration}"
                        </p>
                        <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                          <span>🎬 <strong>Visual:</strong> {scene.visual}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Caption & Hashtags box */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                    <span className="font-bold text-slate-200 block mb-1">📝 Legenda de Alta Conversão Recomendada:</span>
                    <p className="text-[11px] leading-relaxed text-slate-400">{videoData.caption}</p>
                  </div>
                </div>

                {/* Modal Footer CTAs */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      alert("Download do criativo e do roteiro iniciado com sucesso!");
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Criativo (MP4 / Script)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleGenerateFlowPrompt();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-[#FF5722] hover:from-orange-600 hover:to-[#E64A19] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    <span>Fazer vídeo com Flow gratuitamente</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
