import { Supplier, Product } from "../types";
import { PRODUCTS_ELETRONICOS } from "./productsEletronicos";
import { PRODUCTS_COSMETICOS } from "./productsCosmeticos";
import { PRODUCTS_SAZONAIS } from "./productsSazonais";
import { PRODUCTS_UTILIDADES } from "./productsUtilidades";
import { PRODUCTS_COZINHA } from "./productsCozinha";
import { PRODUCTS_CASA_JARDIM } from "./productsCasaJardim";
import { PRODUCTS_BRINQUEDOS } from "./productsBrinquedos";
import { getWorkingShopeeUrl } from "../utils/shopee";

export const SUPPLIERS: Supplier[] = [
  {
    id: "innova-partners",
    name: "Innova Partners - SP",
    location: "São Paulo, SP",
    category: "Eletrônicos",
    subtitle: "Eletrônicos e eletrodomésticos de ponta",
    productsCountText: "+5000 produtos disponíveis",
    isRegistered: true,
    rating: 4.9,
    ordersCount: 38400,
    imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "glow-cosmeticos",
    name: "Glow Cosméticos - PR",
    location: "Curitiba, PR",
    category: "Cosméticos",
    subtitle: "Perfumes, maquiagens e produtos de beleza",
    productsCountText: "+1200 produtos disponíveis",
    isRegistered: true,
    rating: 4.9,
    ordersCount: 29500,
    imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "vantaggio-supply",
    name: "Vantaggio Supply - MG",
    location: "Belo Horizonte, MG",
    category: "Sazonais",
    subtitle: "Ofertas sazonais para todas as datas",
    productsCountText: "+3000 produtos disponíveis",
    isRegistered: true,
    rating: 4.8,
    ordersCount: 18200,
    imageUrl: "https://images.unsplash.com/photo-1543258103-a62bdc069871?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "selecta-importadora",
    name: "Selecta Importadora - SP",
    location: "Guarulhos, SP",
    category: "Utilidades",
    subtitle: "Utilidades e achadinhos para o dia a dia",
    productsCountText: "+2500 produtos disponíveis",
    isRegistered: true,
    rating: 4.8,
    ordersCount: 42000,
    imageUrl: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "cozdrop",
    name: "CozDrop - RJ",
    location: "Rio de Janeiro, RJ",
    category: "Cozinha",
    subtitle: "Eletroportáteis e utilidades para cozinha",
    productsCountText: "+1800 produtos disponíveis",
    isRegistered: true,
    rating: 4.9,
    ordersCount: 51200,
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "habitat-jardim",
    name: "Habitat Jardim - SC",
    location: "Joinville, SC",
    category: "Casa & Jardim",
    subtitle: "Decoração, jardinagem e organização do lar",
    productsCountText: "+1400 produtos disponíveis",
    isRegistered: true,
    rating: 4.8,
    ordersCount: 16500,
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "kids-world",
    name: "Kids World - RS",
    location: "Porto Alegre, RS",
    category: "Brinquedos",
    subtitle: "Brinquedos educativos e infantis virais",
    productsCountText: "+900 produtos disponíveis",
    isRegistered: true,
    rating: 4.9,
    ordersCount: 34100,
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80"
  }
];

const RAW_ALL_PRODUCTS: Product[] = [
  ...PRODUCTS_COSMETICOS,
  ...PRODUCTS_ELETRONICOS,
  ...PRODUCTS_UTILIDADES,
  ...PRODUCTS_COZINHA,
  ...PRODUCTS_SAZONAIS,
  ...PRODUCTS_CASA_JARDIM,
  ...PRODUCTS_BRINQUEDOS
];

export const PRODUCTS: Product[] = RAW_ALL_PRODUCTS.map((p) => ({
  ...p,
  shopeeUrl: getWorkingShopeeUrl(p)
}));

export const MINED_PRODUCTS: Product[] = [
  // 1. Kit bodySplash infinit e obssesed (Top 1 Viral)
  {
    ...PRODUCTS_COSMETICOS[0],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_COSMETICOS[0]),
    rankBadge: "🔥 #1 EM ALTA",
    tag: "SUPER LANÇAMENTO"
  },
  // 2. Perfume Árabe Asad (R$ 7.3M gerados)
  {
    ...PRODUCTS_COSMETICOS[1],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_COSMETICOS[1]),
    rankBadge: "🔥 #2 MAIS VENDIDO",
    tag: "ALTA DEMANDA"
  },
  // 3. Perfume Árabe Yara (Viral TikTok)
  {
    ...PRODUCTS_COSMETICOS[2],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_COSMETICOS[2]),
    rankBadge: "🔥 #3 VIRAL TIKTOK",
    tag: "TENDÊNCIA ABSOLUTA"
  },
  // 4. Mini Processador Manual (95.000 un vendidas)
  {
    ...PRODUCTS_COZINHA[0],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_COZINHA[0]),
    rankBadge: "🔥 #4 RECORDE SHOPEE",
    tag: "95.000 VENDIDOS"
  },
  // 5. Esponja Gota Soft Velvet (88.000 un vendidas)
  {
    ...PRODUCTS_COSMETICOS[12],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_COSMETICOS[12]),
    rankBadge: "🔥 #5 CAMPEÃO ADIÇÃO",
    tag: "88.000 VENDIDOS"
  },
  // 6. Fita Mágica Dupla Face (88.000 un vendidas)
  {
    ...PRODUCTS_UTILIDADES[16],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_UTILIDADES[16]),
    rankBadge: "🔥 #6 ACHADINHO VIRAL",
    tag: "SEM FURAR PAREDE"
  },
  // 7. Lança Bolhas Bazuca 69 Furos (78.000 un vendidas)
  {
    ...PRODUCTS_BRINQUEDOS[20],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_BRINQUEDOS[20]),
    rankBadge: "🔥 #7 FEBRE TIKTOK",
    tag: "78.000 VENDIDOS"
  },
  // 8. Lip Tint Efeito Natural (72.000 un vendidas)
  {
    ...PRODUCTS_COSMETICOS[8],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_COSMETICOS[8]),
    rankBadge: "🔥 #8 ALTA PROCURA",
    tag: "72.000 VENDIDOS"
  },
  // 9. Sérum Facial Vitamina C (65.000 un vendidas)
  {
    ...PRODUCTS_COSMETICOS[3],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_COSMETICOS[3]),
    rankBadge: "🔥 #9 SKINCARE TOP",
    tag: "65.000 VENDIDOS"
  },
  // 10. Fone Bluetooth TWS Pro (48.000 un vendidas)
  {
    ...PRODUCTS_ELETRONICOS[0],
    shopeeUrl: getWorkingShopeeUrl(PRODUCTS_ELETRONICOS[0]),
    rankBadge: "🔥 #10 MAIS DESEJADO",
    tag: "LUCRO RÁPIDO"
  }
];

export const NICHES = [
  "Todos",
  "Eletrônicos",
  "Cosméticos",
  "Sazonais",
  "Utilidades",
  "Cozinha",
  "Casa & Jardim",
  "Brinquedos"
];
