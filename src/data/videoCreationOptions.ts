import { InfluencerConfig, RecordingFormatOption } from "../types";

export const INFLUENCER_PRESETS: InfluencerConfig[] = [
  {
    id: "mariana",
    name: "Mariana (Criadora Brasileira)",
    gender: "feminino",
    skinTone: "Morena clara / Parda (Natural brasileira)",
    hairColor: "Castanho iluminado",
    hairStyle: "Ondulado longo natural",
    ageRange: "24 anos",
    vibe: "Autêntica, carismática e alto astral (TikTok / Reels)",
    outfit: "Camiseta casual aesthetic neutra",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "julia",
    name: "Júlia (Glow & Skincare)",
    gender: "feminino",
    skinTone: "Pele clara com subtom quente",
    hairColor: "Loiro dourado / Mel",
    hairStyle: "Liso com movimento",
    ageRange: "22 anos",
    vibe: "Clean girl aesthetic, elegante e moderna",
    outfit: "Blusa cropped casual e acessórios delicados",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "taina",
    name: "Tainá (Expressiva & Carismática)",
    gender: "feminino",
    skinTone: "Pele negra luminosa",
    hairColor: "Castanho escuro / Preto brilhante",
    hairStyle: "Cacheado volumoso definido",
    ageRange: "26 anos",
    vibe: "Expressiva, sorriso cativante e alta energia",
    outfit: "Moletom oversized moderno e descolado",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "camila",
    name: "Camila (Achadinhos & Promoções Rápidas)",
    gender: "feminino",
    skinTone: "Pele morena bronzeada",
    hairColor: "Castanho chocolate",
    hairStyle: "Médio com ondas suaves",
    ageRange: "27 anos",
    vibe: "Direta ao ponto, dinâmica e confiante",
    outfit: "Jaqueta jeans casual de criadora de conteúdo",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "lucas",
    name: "Lucas (Reviewer Autêntico Tech/Lifestyle)",
    gender: "masculino",
    skinTone: "Pele morena / parda",
    hairColor: "Castanho escuro",
    hairStyle: "Curto moderno fade com barba alinhada",
    ageRange: "28 anos",
    vibe: "Sincero, técnico e confiável",
    outfit: "Camiseta básica preta minimalista",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "sem_rosto",
    name: "Sem Apresentador (Foco Total no Produto)",
    gender: "sem_apresentador",
    skinTone: "Mãos bem cuidadas com iluminação suave",
    hairColor: "Não se aplica (Apenas mãos)",
    hairStyle: "Apenas mãos e produto",
    ageRange: "Foco no produto",
    vibe: "Comercial cinematográfico focado 100% no produto",
    outfit: "Apenas mãos e produto em destaque",
    avatarUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80"
  }
];

export const HAIR_COLOR_OPTIONS = [
  { label: "Castanho Iluminado", colorHex: "#6F4E37" },
  { label: "Loiro Mel / Dourado", colorHex: "#E6BE8A" },
  { label: "Preto Natural Brilhante", colorHex: "#1C1C1C" },
  { label: "Ruivo Acobreado", colorHex: "#B85D38" },
  { label: "Castanho Escuro", colorHex: "#3D2B1F" },
  { label: "Loiro Platinado", colorHex: "#F0E6D2" }
];

export const HAIR_STYLE_OPTIONS = [
  "Ondulado Longo Natural",
  "Liso com Movimento",
  "Cacheado Volumoso Definido",
  "Crespo Afro Estilizado",
  "Chanel / Bob Médio Moderno",
  "Curto Fade Moderno"
];

export const SKIN_TONE_OPTIONS = [
  { label: "Morena / Parda (Brasileira Média)", colorHex: "#C68662" },
  { label: "Pele Negra Luminosa", colorHex: "#8D5524" },
  { label: "Pele Clara Subtom Quente", colorHex: "#F1C27D" },
  { label: "Pele Bronzeada Dourada", colorHex: "#B87A4F" },
  { label: "Pele Negra Retinta", colorHex: "#60371E" },
  { label: "Pele Clara Neutra", colorHex: "#FFDBAC" }
];

export const AGE_RANGE_OPTIONS = [
  "Jovem 20-24 anos (Aesthetic TikTok)",
  "Jovem Adulta 25-32 anos (Lifestyle & Casa)",
  "Adulta 33-40 anos (Mãe / Família / Confiança)"
];

export const RECORDING_FORMAT_OPTIONS: RecordingFormatOption[] = [
  {
    id: "pov_maos",
    title: "Visão em 1ª Pessoa (POV)",
    simplifiedLabel: "Mostrando com as Mãos (Estilo POV)",
    badge: "🔥 Mais Viral na Shopee",
    description: "A gravação parece feita pelos seus próprios olhos! Suas mãos seguram, abrem e mostram o produto bem de pertinho. Gera curiosidade extrema e identificação imediata.",
    bestFor: "Achadinhos, unboxings rápidos, cosméticos e utilidades",
    cameraPrompt: "First-person POV (point-of-view) angle looking down at hands actively holding, opening, and demonstrating the product with realistic hand movements, macro depth-of-field, clean indoor studio lighting, vertical 9:16 format",
    iconName: "Hand",
  },
  {
    id: "influencer_rosto",
    title: "Influencer Falando pra Câmera",
    simplifiedLabel: "Influencer Segurando o Produto",
    badge: "⭐ Máxima Conexão & Confiança",
    description: "A influenciadora aparece na tela segurando o produto ao lado do rosto, conversando diretamente com o seguidor como se mandasse um story ou dica de amiga íntima.",
    bestFor: "Reviews sinceros, maquiagem, perfumes, moda e depoimentos",
    cameraPrompt: "Selfie-style front-facing eye-level shot, realistic Brazilian influencer holding product near face and chest while speaking enthusiastically to camera, smiling, eye contact, soft blurry background, vertical 9:16",
    iconName: "UserCheck",
  },
  {
    id: "unboxing_mesa",
    title: "Unboxing & Detalhes na Mesa",
    simplifiedLabel: "Abrindo na Mesa Bem de Perto",
    badge: "📦 Desejo de Compra Imediato",
    description: "Câmera de cima focando na caixa sendo aberta numa mesa aesthetic bonita, revelando cada acessório, o acabamento e a qualidade do item.",
    bestFor: "Eletrônicos, fones de ouvido, gadgets e produtos com acessórios",
    cameraPrompt: "Clean tabletop flat-lay and 45-degree angle unboxing shot, hands sliding product out of packaging onto clean wooden desk, softbox studio lighting, crisp 4K textures, vertical 9:16",
    iconName: "PackageOpen",
  },
  {
    id: "uso_real",
    title: "Em Ação no Dia a Dia",
    simplifiedLabel: "Demonstração Prática (Antes e Depois)",
    badge: "⚡ Quebra de Objeções",
    description: "Mostra o produto sendo usado na rotina prática para resolver uma dor (ex: limpando, cortando, hidratando a pele ou decorando o ambiente). Efeito 'uau' instantâneo!",
    bestFor: "Itens de cozinha, utilidades domésticas, organizadores e skincare",
    cameraPrompt: "Dynamic real-life practical usage demonstration, satisfying problem-solving action showing immediate before-and-after results, smooth tracking camera movement, warm home ambiance, vertical 9:16",
    iconName: "Sparkles",
  },
  {
    id: "comercial_360",
    title: "Comercial de TV / Vitrine 360°",
    simplifiedLabel: "Vitrine 360° com Luzes de Cinema",
    badge: "💎 Visual Super Premium",
    description: "O produto gira suavemente em câmera lenta com luzes de estúdio profissionais, reflexos e fundo desfocado, parecendo comercial de marca famosa da TV.",
    bestFor: "Perfumes importados, joias, relógios e produtos premium",
    cameraPrompt: "Cinematic commercial turntable 360-degree slow motion, rim lighting with amber and cool white accents, creamy bokeh blur, photorealistic luxury product display, vertical 9:16",
    iconName: "Eye",
  }
];
