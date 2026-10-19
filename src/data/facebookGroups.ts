export type GroupPlatform = "whatsapp" | "facebook" | "telegram";

export interface FacebookGroup {
  sourceUrl?: string;
  lastCheckedAt?: string;
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

// Previews checked on the platform; this does not guarantee admission or permission to post.
export const OFFER_GROUPS: FacebookGroup[] = [
{
  "id": "fb-shopee-compras",
  "name": "Shopee Brasil compras",
  "platform": "facebook",
  "members": "Consulte no Facebook",
  "dailyPosts": "Não aferido",
  "description": "Nome e endereço confirmados na página do Facebook. Privacidade e permissão de divulgação não ficaram visíveis sem login.",
  "rules": "Abra a seção Sobre e confira se é público e permite links de afiliado. Pode haver aprovação de participação e posts.",
  "groupUrl": "https://www.facebook.com/groups/731750790665688/",
  "badge": "Regras e privacidade pendentes",
  "recommendedTime": "Conforme as regras do grupo",
  "category": "Geral",
  "isVerified": false,
  "sourceUrl": "https://t.me/s/shopeeflixofc?before=785",
  "lastCheckedAt": "2026-10-18"
},
{
  "id": "fb-cupons-app",
  "name": "Comunidade para cupons e ofertas App!",
  "platform": "facebook",
  "members": "Consulte no Facebook",
  "dailyPosts": "Não aferido",
  "description": "Nome e endereço confirmados na página do Facebook. Privacidade e permissão de divulgação não ficaram visíveis sem login.",
  "rules": "Abra a seção Sobre e confira se é público e permite links de afiliado. Pode haver aprovação de participação e posts.",
  "groupUrl": "https://www.facebook.com/groups/shopeealiexpress/",
  "badge": "Regras e privacidade pendentes",
  "recommendedTime": "Conforme as regras do grupo",
  "category": "Geral",
  "isVerified": false,
  "sourceUrl": "https://linktr.ee/gruposshopee",
  "lastCheckedAt": "2026-10-18"
},
  {
    "id": "tg-shopee-divulgacao",
    "name": "Divulgação Shopee",
    "platform": "telegram",
    "members": "232 membros na conferência",
    "dailyPosts": "Não aferido",
    "description": "Grupo voltado à divulgação de Shopee, listado pela rede MegaDivulgação.",
    "rules": "Confira no grupo as regras atuais e se links de afiliado são permitidos.",
    "groupUrl": "https://t.me/DivulgacaoShope2",
    "badge": "Link conferido em 18/10/2026",
    "recommendedTime": "Conforme as regras do grupo",
    "category": "Geral",
    "isVerified": false,
    "isPublic": true,
    "privacyType": "Público",
    "sourceUrl": "https://achargrupos.com.br/grupo/05-divulgacao-shopee",
    "lastCheckedAt": "2026-10-18"
  },
  {
    "id": "tg-shopee-achados",
    "name": "Shopee Achados Afiliados",
    "platform": "telegram",
    "members": "12 membros na conferência",
    "dailyPosts": "Não aferido",
    "description": "Comunidade anunciada como grupo de divulgação de links de afiliados Shopee.",
    "rules": "Sem conteúdo adulto, agressões ou palavrões. Confirme as regras atuais antes de publicar.",
    "groupUrl": "https://t.me/ShopeeAfiliadosAchados",
    "badge": "Link conferido em 18/10/2026",
    "recommendedTime": "Conforme as regras do grupo",
    "category": "Geral",
    "isVerified": false,
    "isPublic": true,
    "privacyType": "Público",
    "sourceUrl": "https://meusgrupos.com/grupo/13439/shopee-achados-afiliados",
    "lastCheckedAt": "2026-10-18"
  },
  {
    "id": "tg-vendas-online",
    "name": "Divulgação 24h de Vendas Online",
    "platform": "telegram",
    "members": "1.026 membros na conferência",
    "dailyPosts": "Não aferido",
    "description": "Grupo de divulgação e vendas de produtos físicos e digitais.",
    "rules": "A descrição recebe vendedores. Consulte moderação e limites antes de divulgar.",
    "groupUrl": "https://t.me/vendas_online01",
    "badge": "Link conferido em 18/10/2026",
    "recommendedTime": "Conforme as regras do grupo",
    "category": "Geral",
    "isVerified": false,
    "isPublic": true,
    "privacyType": "Público",
    "sourceUrl": "https://t.me/vendas_online01",
    "lastCheckedAt": "2026-10-18"
  },
  {
    "id": "tg-guara-vendas",
    "name": "Guará Brasília-DF — Vendas",
    "platform": "telegram",
    "members": "516 membros na conferência",
    "dailyPosts": "Não aferido",
    "description": "Grupo regional para vender produtos e serviços no Guará, Brasília-DF.",
    "rules": "Destinado à região do Guará. Respeite o tema e as regras dos administradores.",
    "groupUrl": "https://t.me/vendasembrasiliaDF",
    "badge": "Link conferido em 18/10/2026",
    "recommendedTime": "Conforme as regras do grupo",
    "category": "Geral",
    "isVerified": false,
    "isPublic": true,
    "privacyType": "Público",
    "sourceUrl": "https://t.me/vendasembrasiliaDF",
    "lastCheckedAt": "2026-10-18"
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
    description: "Busca de grupos no Facebook; verifique existência, privacidade e regras antes de entrar"
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
    description: "Busca de grupos de produtos até R$ 50; permissões dependem dos administradores"
  },
  {
    title: "Achadinhos Casa e Cozinha Shopee",
    query: "achadinhos casa cozinha shopee",
    url: "https://www.facebook.com/groups/search/groups/?q=achadinhos%20casa%20cozinha%20shopee",
    description: "Grupos de donas de casa e decoração com alta procura por utensílios e organizadores"
  }
];


