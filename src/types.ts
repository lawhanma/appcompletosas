export type NavTab = 
  | "dashboard" 
  | "missoes"
  | "financeiro" 
  | "catalogo" 
  | "divulgacao" 
  | "gerar-videos" 
  | "conexoes" 
  | "perfil"
  | "perfis";

export interface Supplier {
  id: string;
  name: string;
  location: string;
  category: string;
  status?: "cadastrado" | "cadastrar";
  isRegistered?: boolean;
  description?: string;
  subtitle?: string;
  availableProducts?: number;
  productsCountText?: string;
  rating?: number;
  ordersCount?: number;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  supplierId: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  salesCount: number;
  unitsSold: string;
  revenueGenerated: string;
  rankBadge?: string;
  discountPercentage: number;
  tag: string; // e.g. "LANÇAMENTO", "RECOMENDADO", "VIRAL NO TIKTOK"
  description: string;
  imageUrl: string;
  commissionRate: number; // e.g. 20% (15% Shopee + 5% bonus)
  commissionValue: number; // e.g. R$ 27,98
  searchVolumeMonthly: string;
  averageMargin: string;
  unitProfit: number;
  successScore: number;
  marketDifficulty: string;
  marketTag: string;
  estimatedConversion: number; // e.g. 4.0%
  shopeeUrl: string;
}

export interface VideoScene {
  time: string;
  visual: string;
  narration: string;
  textOverlay: string;
  audioEffect: string;
}

export interface InfluencerConfig {
  id: string;
  name: string;
  gender: "feminino" | "masculino" | "sem_apresentador";
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  ageRange: string;
  vibe: string;
  avatarUrl: string;
  outfit: string;
}

export type RecordingFormatId = 
  | "pov_maos" 
  | "influencer_rosto" 
  | "unboxing_mesa" 
  | "uso_real" 
  | "comercial_360";

export interface RecordingFormatOption {
  id: RecordingFormatId;
  title: string;
  simplifiedLabel: string;
  badge: string;
  description: string;
  cameraPrompt: string;
  iconName: string;
  bestFor: string;
}

export interface GeneratedVideoData {
  title: string;
  hook: string;
  scenes: VideoScene[];
  caption: string;
  conversionScore: number;
  influencer?: InfluencerConfig;
  recordingFormat?: RecordingFormatOption;
}

