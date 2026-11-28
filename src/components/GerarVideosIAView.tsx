import { createBlackFridayVideo } from "../utils/blackFridayVideo";
import {AdDescriptionGenerator} from './AdDescriptionGenerator';
import React, { useState, useEffect, useRef, useMemo } from "react";
import { apiFetch } from "../lib/apiFetch";
import { useCloudAccount } from "../context/CloudAccount";
import { OwnerVideoPreview } from "./OwnerVideoPreview";
import { GOOGLE_FLOW_TUTORIAL_URL, GOOGLE_FLOW_URL } from "../utils/videoAccess";
import { Product, GeneratedVideoData, InfluencerConfig, RecordingFormatId } from "../types";
import { PRODUCTS } from "../data/mockData";
import { 
  INFLUENCER_PRESETS, 
  HAIR_COLOR_OPTIONS, 
  HAIR_STYLE_OPTIONS, 
  SKIN_TONE_OPTIONS, 
  AGE_RANGE_OPTIONS, 
  RECORDING_FORMAT_OPTIONS 
} from "../data/videoCreationOptions";
import { Sparkles, Volume2, Check, Music, Mic, Flame, Zap, ExternalLink, Copy, Loader2, Wand2, Eye, Hand, User, UserCheck, PackageOpen, Palette, Camera, ChevronDown, ChevronUp, CirclePlay } from "lucide-react";

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
  const isShopGoOwner = useCloudAccount()?.isShopGoOwner === true;
  const [selectedVoice, setSelectedVoice] = useState("Júlia (Voz Enérgica / TikTok)");
  const [selectedMusic, setSelectedMusic] = useState("TikTok Upbeat (Viral)");
  const [selectedHook, setSelectedHook] = useState("Viral Curiosidade");
  const [customPrompt, setCustomPrompt] = useState("");

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
  const [flowError, setFlowError] = useState("");
  const [copyError, setCopyError] = useState("");
  const flowRequest = useRef<AbortController | null>(null);
  const flowResultRef = useRef<HTMLDivElement>(null);
  const ownerPreviewRef = useRef<HTMLDivElement>(null);
  const categories = ["Todos", "Cosméticos", "Eletrônicos", "Sazonais", "Utilidades", "Cozinha", "Casa & Jardim", "Brinquedos"];

  const videoData = useMemo<GeneratedVideoData>(() => selectedFormatId === "black_friday"
    ? createBlackFridayVideo(selectedProduct.name)
    : {
      title: selectedProduct.name,
      hook: "Veja como funciona",
      caption: "Confira as condições e o preço no link.",
      conversionScore: 0,
      scenes: [
        { time: "0s - 3s", visual: "Close no produto", narration: "Veja como funciona este achado.", textOverlay: "Veja de perto", audioEffect: "Transição suave" },
        { time: "4s - 8s", visual: "Demonstração em uso", narration: "Este é o " + selectedProduct.name + ".", textOverlay: "Demonstração", audioEffect: "Som ambiente" },
        { time: "9s - 13s", visual: "Destaque para os detalhes do produto", narration: "Confira os detalhes e veja se é o que você procura.", textOverlay: "Confira os detalhes", audioEffect: "Trilha leve" },
        { time: "14s - 18s", visual: "Produto em destaque", narration: "Veja o preço atualizado e as condições no link.", textOverlay: "Confira no link", audioEffect: "Encerramento" },
      ],
    }, [selectedProduct, selectedFormatId]);

  useEffect(() => {
    setFlowPromptResult(null);
    setFlowError("");
    setCopyError("");
    setIsGeneratingFlowPrompt(false);
    setFlowGenerationStep(0);
    return () => {
      flowRequest.current?.abort();
      flowRequest.current = null;
    };
  }, [selectedProduct, selectedFormatId, selectedVoice, selectedMusic, selectedHook, customPrompt, selectedInfluencerPreset, customHair, customHairStyle, customSkinTone, customAgeRange]);

  useEffect(() => {
    if (isGeneratingFlowPrompt || flowPromptResult || flowError) {
      flowResultRef.current?.scrollIntoView({ block: "start" });
    }
  }, [isGeneratingFlowPrompt, flowPromptResult, flowError]);

  const handleGenerateFlowPrompt = async () => {
    if (flowRequest.current) return;
    const controller = new AbortController();
    flowRequest.current = controller;
    const deadline = window.setTimeout(() => controller.abort(), 20000);
    setFlowPromptResult(null);
    setFlowError("");
    setCopyError("");
    setIsGeneratingFlowPrompt(true);
    setFlowGenerationStep(1);
    setCopiedFlowPrompt(false);

    const { signal } = controller;
    const cancelled = new Promise<never>((_, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    });
    const step1 = setTimeout(() => { if (flowRequest.current === controller) setFlowGenerationStep(2); }, 500);
    const step2 = setTimeout(() => { if (flowRequest.current === controller) setFlowGenerationStep(3); }, 1100);

    try {
      const res = await Promise.race([cancelled, apiFetch("/api/ai/generate-flow-prompt", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: selectedProduct.name,
          category: selectedProduct.category,
          price: selectedProduct.listingSourceUrl ? "Consulte no anúncio" : `R$ ${selectedProduct.price.toFixed(2).replace(".", ",")}`,
          originalPrice: selectedProduct.listingSourceUrl ? "Não informado" : `R$ ${selectedProduct.originalPrice.toFixed(2).replace(".", ",")}`,
          customPrompt: customPrompt.trim(),
          voice: selectedVoice,
          music: selectedMusic,
          hookStyle: selectedHook,
          scenes: videoData.scenes,
          caption: videoData.caption,
          hook: videoData.hook,
          formatId: selectedFormatId,
          influencerConfig: activeInfluencerConfig,
          recordingFormat: activeRecordingFormat
        })
      })]);

      if (flowRequest.current !== controller) return;
      if (res.status === 401 || res.status === 403) {
        setFlowError(res.status === 401 ? "Sua sessão expirou. Entre novamente para continuar." : "Esta conta não tem acesso ao criador de vídeos.");
        return;
      }
      if (!res.ok) throw new Error("Flow prompt request failed");
      const data = await Promise.race([cancelled, res.json()]);
      if (flowRequest.current !== controller) return;
      if (typeof data.flowPrompt === "string" && data.flowPrompt.trim()) {
        setFlowPromptResult(data);
      } else {
        throw new Error("No prompt in response");
      }
    } catch (error) {
      if (flowRequest.current !== controller) return;
      if (error instanceof Error && error.message === "Entre novamente para continuar.") {
        setFlowError("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }
      
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

      const ptPromptFull = `[PROMPT DE VÍDEO PERSONALIZADO]
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
Preço: ${selectedProduct.listingSourceUrl || selectedFormatId === "black_friday" ? "Confira o preço atualizado e as condições no link. Não invente descontos ou urgência." : `De ${originalFormatted} por apenas ${priceFormatted}!`}
Legenda Sugerida: ${videoData.caption || "Link direto com desconto nos comentários e na bio!"}

[PARÂMETROS TÉCNICOS DO VÍDEO]
9:16 Vertical | 4K UHD 60fps | Lens 35mm f/1.8 | High-conversion advertising look`;

      setFlowPromptResult({
        flowPrompt: ptPromptFull,
        flowPromptPortuguese: ptPromptFull,
        cameraMotion: activeRecordingFormat.simplifiedLabel,
        influencerSummary: `${activeInfluencerConfig.name} • ${customHair} • ${customSkinTone}`,
        aspectRatio: "9:16 (Vertical TikTok / Reels / Shorts)",
        lighting: "Luz de estúdio suave + recorte âmbar",
        tips: "Prompt gerado exatamente com a sua influencer, cabelo, tom de pele e formato de gravação escolhidos!",
        flowUrl: GOOGLE_FLOW_URL
      });
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(deadline);
      if (flowRequest.current === controller) {
        flowRequest.current = null;
        setIsGeneratingFlowPrompt(false);
        setFlowGenerationStep(0);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Credits Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="font-display text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Vídeo com IA</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF5722] font-mono-code font-bold tracking-tight">
              TikTok & Reels
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Prepare o roteiro e o prompt para criar seu vídeo no editor externo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isShopGoOwner && (
            <button type="button" onClick={() => { ownerPreviewRef.current?.scrollIntoView({ block: "start" }); ownerPreviewRef.current?.focus({ preventScroll: true }); }} className="inline-flex min-h-11 items-center rounded-xl border border-orange-200 bg-orange-50 px-4 text-xs font-semibold text-orange-800 hover:bg-orange-100">
              Abrir prévia animada
            </button>
          )}
          <button
            onClick={handleGenerateFlowPrompt}
            disabled={isGeneratingFlowPrompt}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 btn-primary-tactile transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>{isGeneratingFlowPrompt ? "Preparando prompt…" : "Preparar vídeo com IA"}</span>
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
              {PRODUCTS.filter(p => categoryFilter === "Todos" || p.category === categoryFilter).map((p) => {
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
                      loading="lazy"
                      decoding="async"
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
                        {p.listingSourceUrl ? "Preço no anúncio" : `R$ ${p.price.toFixed(2).replace(".", ",")}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <AdDescriptionGenerator key={selectedProduct.id} product={selectedProduct}/>

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
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedFormatId(fmt.id); } }}
                    onClick={() => setSelectedFormatId(fmt.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? "border-[#FF5722] bg-[#FFF4F0] ring-2 ring-[#FF5722]/30 shadow-xs"
                        : fmt.id === "black_friday" ? "border-orange-300 bg-orange-50/60 hover:border-orange-500" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
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
                      {fmt.id === "black_friday" && <Flame className="w-3.5 h-3.5 text-[#FF5722]" />}
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
                maxLength={4000}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={`Ex: Mostre o ${selectedProduct.name} sendo aberto em um ambiente iluminado. Destaque como ele é usado no dia a dia.`}
                rows={3}
                className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:border-[#FF5722] focus:ring-2 focus:ring-orange-500/20 outline-hidden resize-none bg-slate-50/50 hover:bg-white focus:bg-white transition-all placeholder:text-slate-400"
              />
              
              {/* Sugestões rápidas de prompt */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 mr-1">Sugestões rápidas:</span>
                {[
                  "📦 Unboxing dinâmico com iluminação de estúdio",
                  "⚡ Demonstração rápida de antes e depois",
                  "Destacar o produto e orientar a conferir as condições no link",
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

        </div>

        {/* RIGHT COLUMN: Mobile Smartphone Preview (5 cols) (Exact Match to Screenshot 4!) */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          {isShopGoOwner && (
            <div key={`${selectedProduct.id}:${selectedFormatId}`} ref={ownerPreviewRef} tabIndex={-1} className="w-full max-w-md scroll-mt-4">
              <OwnerVideoPreview product={selectedProduct} scenes={videoData.scenes} />
            </div>
          )}
          <div className="w-full max-w-md rounded-2xl border border-orange-200 bg-white p-6 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Roteiro e prompt</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Depois de gerar o prompt, copie o texto e cole no editor externo para criar o vídeo final.</p>
            </div>
          </div>
        {/* Download & Export CTAs */}
          <div ref={flowResultRef} className="mt-4 flex w-full max-w-xl scroll-mt-4 flex-col gap-3">
            {flowError && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{flowError}</p>}
            {/* Preparar prompt para gerar o vídeo exclusivamente no Flow */}
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
                  <span>Gerar prompt do vídeo</span>
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
                      <span>Gerando prompt do vídeo…</span>
                      <span className="text-[10px] text-[#FF5722] font-extrabold bg-orange-50 px-2 py-0.5 rounded">
                        {flowGenerationStep === 1 && "Passo 1/3"}
                        {flowGenerationStep === 2 && "Passo 2/3"}
                        {flowGenerationStep >= 3 && "Passo 3/3"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {flowGenerationStep === 1 && "Analisando produto e especificações técnicas..."}
                      {flowGenerationStep === 2 && "Incorporando instruções do prompt personalizado..."}
                      {flowGenerationStep >= 3 && "Organizando as instruções de câmera e edição…"}
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
                    onClick={async () => {
                      const textToCopy = flowPromptResult.flowPromptPortuguese || flowPromptResult.flowPrompt;
                      try {
                        await navigator.clipboard.writeText(textToCopy);
                        setCopyError("");
                        setCopiedFlowPrompt(true);
                      } catch {
                        setCopyError("Selecione o prompt acima para copiar manualmente.");
                      }
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
                        <span>Copiar prompt em português</span>
                      </>
                    )}
                  </button>
                </div>

                {copyError && <p role="status" className="text-sm text-slate-700">{copyError}</p>}

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
                  Copie o prompt antes de abrir o editor externo.
                </p>

                <details className="group rounded-xl border border-slate-200">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
                    Continuar a criação
                    <ChevronDown className="size-4 shrink-0 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="grid gap-2 bg-slate-50 p-3">
                    <a href={GOOGLE_FLOW_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                      Abrir editor de vídeo com IA
                      <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                    </a>
                    <a href={GOOGLE_FLOW_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                      Não sei fazer a criação do vídeo
                      <CirclePlay className="size-4 shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
