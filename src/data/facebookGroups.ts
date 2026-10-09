export type GroupPlatform = "whatsapp" | "facebook" | "telegram";

export interface FacebookGroup {
  id: string;
  name: string;
  platform?: GroupPlatform;
  members: string;
  dailyPosts: string;
  description: string;
  rules: string;
  groupUrl: string;
  badge: string;
  recommendedTime: string;
  category?: string;
  conversionRate?: string;
  isVerified?: boolean;
  isPublic?: boolean;
  privacyType?: "Público" | "Privado";
}

export type OfferGroup = FacebookGroup;

export const OFFER_GROUPS: FacebookGroup[] = [
  // ==========================================
  // GRUPOS PÚBLICOS DO FACEBOOK (OFERTAS & ACHADINHOS)
  // ==========================================
  {
    id: "fb-pub-1",
    name: "Achadinhos da Shopee Brasil & Cupons Diários [PÚBLICO]",
    platform: "facebook",
    members: "492.000 membros",
    dailyPosts: "+130 posts/dia",
    description: "Grupo 100% público para compartilhamento de achadinhos virais, cupons de desconto e ofertas relâmpago da Shopee com frete grátis.",
    rules: "Grupo público com feed aberto. Permitido divulgar links de afiliados nos posts ou comentários com foto real ou criativo.",
    groupUrl: "https://www.facebook.com/groups/achadinhosshopeebrasil",
    badge: "🌐 Grupo Público #1",
    recommendedTime: "12:00 às 13:30 e 19:30 às 21:30",
    category: "Geral",
    conversionRate: "12.4% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-2",
    name: "Achados & Cupons Shopee Brasil 2026 [PÚBLICO]",
    platform: "facebook",
    members: "385.000 membros",
    dailyPosts: "+95 posts/dia",
    description: "Comunidade pública de ofertas diárias, códigos promocionais e garimpagem de produtos virais de alta conversão.",
    rules: "Feed público visível para qualquer visitante do Facebook. Liberado publicar promoções da Shopee com preço De/Por.",
    groupUrl: "https://www.facebook.com/groups/cuponseachadosshopee",
    badge: "🌐 Grupo Público",
    recommendedTime: "11:00 às 14:00",
    category: "Geral",
    conversionRate: "11.8% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-3",
    name: "Achadinhos da Shopee até R$ 50 (Baratinhos & Úteis) [PÚBLICO]",
    platform: "facebook",
    members: "268.000 membros",
    dailyPosts: "+85 posts/dia",
    description: "Grupo público com foco em compras por impulso: produtos de até 50 reais, utilidades domésticas, fones e maquiagens.",
    rules: "Público e aberto. Foque em produtos com preço acessível para gerar alto volume de comissões.",
    groupUrl: "https://www.facebook.com/groups/shopeeat50reais",
    badge: "💸 Baratinhos R$ 50",
    recommendedTime: "18:00 às 22:30",
    category: "Até R$ 50",
    conversionRate: "14.2% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-4",
    name: "Comprinhas da Shopee & Resenhas de Achados [PÚBLICO]",
    platform: "facebook",
    members: "215.000 membros",
    dailyPosts: "+75 posts/dia",
    description: "Grupo público com grande público comprador feminino interessado em resenhas sinceras, perfumes, roupas e cuidados com a pele.",
    rules: "Grupo público. Posts no estilo 'Dica de Amiga / Testei e Amei' convertem muito acima da média.",
    groupUrl: "https://www.facebook.com/groups/comprinhasshopeetestei",
    badge: "💄 Beleza & Dicas",
    recommendedTime: "14:00 às 17:30 e 20:30 às 22:30",
    category: "Cosméticos & Beleza",
    conversionRate: "13.6% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-5",
    name: "Achadinhos Shopee: Casa, Cozinha e Organização [PÚBLICO]",
    platform: "facebook",
    members: "192.000 membros",
    dailyPosts: "+60 posts/dia",
    description: "Comunidade pública de organizadores, panelas, mini processadores, decoração e utensílios práticos para o lar.",
    rules: "Feed público. Divulgue utilidades práticas com foto ou vídeo demonstrativo do produto.",
    groupUrl: "https://www.facebook.com/groups/achadinhoscasashopee",
    badge: "🏠 Casa & Cozinha",
    recommendedTime: "10:00 às 12:30 e 17:00 às 19:30",
    category: "Casa & Cozinha",
    conversionRate: "12.7% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-6",
    name: "Achadinhos Virais do TikTok & Shopee Brasil [PÚBLICO]",
    platform: "facebook",
    members: "184.000 membros",
    dailyPosts: "+70 posts/dia",
    description: "Grupo público dedicado aos produtos virais que estão bombando nas redes sociais e esgotando nos estoques da Shopee.",
    rules: "Aberto a postagens de afiliados. Utilize chamadas que despertem curiosidade ('Todo mundo está comprando').",
    groupUrl: "https://www.facebook.com/groups/achadinhosviraisdoshoptiktok",
    badge: "📱 Viral TikTok",
    recommendedTime: "13:00 às 15:00 e 21:00 às 23:00",
    category: "Geral",
    conversionRate: "11.5% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-7",
    name: "Achadinhos Eletrônicos, Fones & Gadgets Shopee [PÚBLICO]",
    platform: "facebook",
    members: "165.000 membros",
    dailyPosts: "+55 posts/dia",
    description: "Grupo público focado em tecnologia barata: fones bluetooth TWS, smartwatches, suportes veiculares e cabos rápidos.",
    rules: "Visibilidade pública. Destaque o frete grátis e envio direto do Brasil para acelerar as compras.",
    groupUrl: "https://www.facebook.com/groups/achadinhoseletronicosshopee",
    badge: "⚡ Tech & Fones",
    recommendedTime: "12:30 às 15:00 e 20:00 às 23:30",
    category: "Eletrônicos",
    conversionRate: "12.9% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-8",
    name: "Promoções Relâmpago e Garimpagem Shopee [PÚBLICO]",
    platform: "facebook",
    members: "148.000 membros",
    dailyPosts: "+50 posts/dia",
    description: "Comunidade pública de caçadores de ofertas relâmpago, descontos de última hora e produtos com avaliação 4.8+ na Shopee.",
    rules: "Grupo público aberto. Permitido publicar ofertas com link de afiliado rastreado.",
    groupUrl: "https://www.facebook.com/groups/garimpagemshopee",
    badge: "🔥 Ofertas Relâmpago",
    recommendedTime: "09:30 às 12:00 e 19:00 às 21:00",
    category: "Geral",
    conversionRate: "12.1% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-9",
    name: "Afiliados Shopee & Troca de Divulgações [PÚBLICO]",
    platform: "facebook",
    members: "320.000 membros",
    dailyPosts: "+160 posts/dia",
    description: "O maior grupo público de afiliados, divulgadores de achadinhos e criadores de conteúdo de ofertas no Facebook.",
    rules: "Grupo público. Excelente para interações, divulgações cruzadas e acompanhar quais produtos estão vendendo mais hoje.",
    groupUrl: "https://www.facebook.com/groups/afiliadosshopeebrasil",
    badge: "🚀 Foco Afiliados",
    recommendedTime: "Todo o dia (Pico 20:00)",
    category: "Afiliados & Dicas",
    conversionRate: "10.5% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-10",
    name: "Achadinhos & Cupons de Desconto Shopee BR [PÚBLICO]",
    platform: "facebook",
    members: "135.000 membros",
    dailyPosts: "+45 posts/dia",
    description: "Grupo público voltado para cupons de 20%, 30% e 50% OFF, frete grátis sem valor mínimo e moedas Shopee.",
    rules: "Publicações abertas. Coloque o código do cupom ou informe que o desconto é aplicado diretamente no link.",
    groupUrl: "https://www.facebook.com/groups/achadinhosshopeebrasilcupons",
    badge: "🎟️ Cupons 50%",
    recommendedTime: "11:00 às 13:00 e 18:30 às 20:30",
    category: "Geral",
    conversionRate: "12.3% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-11",
    name: "Ofertas e Achadinhos Shopee & Mercado Livre [PÚBLICO]",
    platform: "facebook",
    members: "275.000 membros",
    dailyPosts: "+90 posts/dia",
    description: "Grupo público de comparação de preços e garimpo das melhores ofertas da Shopee frente ao Mercado Livre.",
    rules: "Aberto a postagens de ofertas. Destaque a economia da Shopee frente aos concorrentes.",
    groupUrl: "https://www.facebook.com/groups/achadinhosshopeeml",
    badge: "⭐ Shopee vs ML",
    recommendedTime: "13:00 às 15:00 e 19:00 às 21:00",
    category: "Geral",
    conversionRate: "11.2% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "fb-pub-12",
    name: "Achadinhos de Moda, Roupas e Bolsas Shopee [PÚBLICO]",
    platform: "facebook",
    members: "155.000 membros",
    dailyPosts: "+50 posts/dia",
    description: "Grupo público focado em looks da Shopee, vestidos, bolsas, calçados e acessórios com ótimo acabamento e preço justo.",
    rules: "Público. Dê preferência a fotos no corpo ou com fundo limpo. Excelente retenção e engajamento.",
    groupUrl: "https://www.facebook.com/groups/achadinhosmodashopee",
    badge: "👗 Moda & Estilo",
    recommendedTime: "15:00 às 19:00 e 21:00 às 23:00",
    category: "Geral",
    conversionRate: "11.9% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },

  // ==========================================
  // GRUPOS DO WHATSAPP (VIP & ACHADINHOS)
  // ==========================================
  {
    id: "wa-1",
    name: "Achadinhos Shopee VIP #01 (Promoções 24h)",
    platform: "whatsapp",
    members: "1.018 membros",
    dailyPosts: "+65 ofertas/dia",
    description: "Grupo de garimpagem de achadinhos relâmpago, cupons secretos e produtos virais da Shopee com frete grátis.",
    rules: "Permitido postar ofertas com formato De/Por e link de afiliado rastreado.",
    groupUrl: "https://chat.whatsapp.com/achadinhosshopeevip01",
    badge: "🔥 Super Ativo",
    recommendedTime: "12:00 às 13:30 e 19:30 às 21:30",
    category: "Geral",
    conversionRate: "14.8% conversão",
    isVerified: true,
    isPublic: false,
    privacyType: "Privado"
  },
  {
    id: "wa-2",
    name: "Cupons Secretos & Frete Grátis Shopee",
    platform: "whatsapp",
    members: "980 membros",
    dailyPosts: "+50 ofertas/dia",
    description: "Comunidade focada em cupons de até 50% OFF, frete grátis sem valor mínimo e promoções relâmpago diárias.",
    rules: "Publicação livre para afiliados com link direto na mensagem.",
    groupUrl: "https://chat.whatsapp.com/cuponssecretosshopee",
    badge: "🎟️ Cupons Diários",
    recommendedTime: "11:00 às 14:00",
    category: "Geral",
    conversionRate: "13.2% conversão",
    isVerified: true,
    isPublic: false,
    privacyType: "Privado"
  },
  {
    id: "wa-3",
    name: "Achadinhos Casa, Cozinha & Utilidades VIP",
    platform: "whatsapp",
    members: "895 membros",
    dailyPosts: "+40 ofertas/dia",
    description: "Grupo dedicado a itens práticos para o lar, organizadores, panelas e novidades de cozinha.",
    rules: "Produtos para o dia a dia e decoração. Destaque para benefícios práticos.",
    groupUrl: "https://chat.whatsapp.com/achadinhoscasacozinha",
    badge: "🏠 Casa & Cozinha",
    recommendedTime: "10:00 às 12:00 e 18:00 às 20:00",
    category: "Casa & Cozinha",
    conversionRate: "12.5% conversão",
    isVerified: true,
    isPublic: false,
    privacyType: "Privado"
  },
  {
    id: "wa-4",
    name: "Makes, Skincare & Perfumes Árabes Shopee",
    platform: "whatsapp",
    members: "1.022 membros",
    dailyPosts: "+55 ofertas/dia",
    description: "Público altamente engajado em maquiagens virais, perfumes árabes importados e dicas de beleza.",
    rules: "Postagens com tom de resenha pessoal têm a maior taxa de conversão.",
    groupUrl: "https://chat.whatsapp.com/makesskincareshopee",
    badge: "💄 Alto Ticket",
    recommendedTime: "14:00 às 18:00 e 20:30 às 22:30",
    category: "Cosméticos & Beleza",
    conversionRate: "16.4% conversão",
    isVerified: true,
    isPublic: false,
    privacyType: "Privado"
  },
  {
    id: "wa-5",
    name: "Eletrônicos, Fones & Smart Gadgets Shopee",
    platform: "whatsapp",
    members: "940 membros",
    dailyPosts: "+45 ofertas/dia",
    description: "Tecnologia acessível com envio rápido do Brasil: fones bluetooth TWS, smartwatches e caixas de som.",
    rules: "Destaque a compatibilidade e a garantia de entrega rápida do fornecedor nacional.",
    groupUrl: "https://chat.whatsapp.com/gadgetseletronicosshopee",
    badge: "⚡ Tech & Fones",
    recommendedTime: "12:30 às 15:00 e 20:00 às 23:00",
    category: "Eletrônicos",
    conversionRate: "13.9% conversão",
    isVerified: true,
    isPublic: false,
    privacyType: "Privado"
  },
  {
    id: "wa-6",
    name: "Achados da Shopee até R$ 50 (Promoções Rápidas)",
    platform: "whatsapp",
    members: "1.010 membros",
    dailyPosts: "+75 ofertas/dia",
    description: "Comunidade focada em compras por impulso com ticket baixo e alta comissão por volume.",
    rules: "Itens com preço final até R$ 50. Foque no apelo 'baratinho que vale muito a pena'.",
    groupUrl: "https://chat.whatsapp.com/shopeeate50reais",
    badge: "💸 Ticket Rápido",
    recommendedTime: "Todo o dia (Pico 21:00)",
    category: "Até R$ 50",
    conversionRate: "17.1% conversão",
    isVerified: true,
    isPublic: false,
    privacyType: "Privado"
  },

  // ==========================================
  // CANAIS DO TELEGRAM
  // ==========================================
  {
    id: "tg-1",
    name: "Shopee Ofertas Relâmpago VIP (Canal Oficial)",
    platform: "telegram",
    members: "42.500 inscritos",
    dailyPosts: "+35 disparos/dia",
    description: "Canal aberto de envio rápido de ofertas com notificação push direto no celular de milhares de compradores.",
    rules: "Disparo de mensagens estruturadas com imagem, preço De/Por e link de afiliado oficial.",
    groupUrl: "https://t.me/shopee_achadinhos_brasil",
    badge: "⚡ Notificação Push",
    recommendedTime: "09:00, 13:00, 18:00 e 21:30",
    category: "Geral",
    conversionRate: "15.2% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "tg-2",
    name: "Cupons Shopee & Achadinhos Brasil VIP",
    platform: "telegram",
    members: "28.300 inscritos",
    dailyPosts: "+30 disparos/dia",
    description: "Comunidade focada em códigos de cupom de desconto de até 50% OFF e links promocionais rápidos.",
    rules: "Compartilhe cupom + link de afiliado. Mensagens curtas e objetivas geram mais cliques.",
    groupUrl: "https://t.me/cuponsshopeevip",
    badge: "🎟️ Cupons 50%",
    recommendedTime: "11:30 e 19:00",
    category: "Geral",
    conversionRate: "14.5% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  },
  {
    id: "tg-3",
    name: "Garimpagem Shopee & Achados Virais",
    platform: "telegram",
    members: "19.800 inscritos",
    dailyPosts: "+25 disparos/dia",
    description: "Canal de produtos que estão estourando nas redes sociais com compradores prontos para comprar.",
    rules: "Itens virais com foto de alta resolução e chamada clara para compra.",
    groupUrl: "https://t.me/achadinhos_virais_shopee",
    badge: "📱 Tech & Virais",
    recommendedTime: "12:00 às 22:00",
    category: "Eletrônicos",
    conversionRate: "13.0% conversão",
    isVerified: true,
    isPublic: true,
    privacyType: "Público"
  }
];

// Backwards-compatible alias for previous imports
export const FACEBOOK_SHOPEE_GROUPS = OFFER_GROUPS;

export interface FacebookSearchQuery {
  title: string;
  query: string;
  url: string;
  description: string;
}

export const FACEBOOK_PUBLIC_SEARCHES: FacebookSearchQuery[] = [
  {
    title: "Achadinhos Shopee (Grupos Públicos)",
    query: "achadinhos shopee ofertas",
    url: "https://www.facebook.com/groups/search/groups/?q=achadinhos%20shopee%20ofertas",
    description: "Pesquisa grupos públicos no Facebook com postagens abertas de achadinhos"
  },
  {
    title: "Ofertas e Cupons Shopee Brasil",
    query: "ofertas cupons shopee brasil",
    url: "https://www.facebook.com/groups/search/groups/?q=ofertas%20cupons%20shopee%20brasil",
    description: "Encontre comunidades públicas com foco em cupons de desconto e frete grátis"
  },
  {
    title: "Achados até 50 Reais Shopee",
    query: "achadinhos shopee ate 50 reais",
    url: "https://www.facebook.com/groups/search/groups/?q=achadinhos%20shopee%20ate%2050%20reais",
    description: "Grupos de compras por impulso com produtos baratos de altíssima conversão"
  },
  {
    title: "Achadinhos Casa e Cozinha Shopee",
    query: "achadinhos casa cozinha shopee",
    url: "https://www.facebook.com/groups/search/groups/?q=achadinhos%20casa%20cozinha%20shopee",
    description: "Grupos de donas de casa e decoração com alta procura por utensílios e organizadores"
  }
];


