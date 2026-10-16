import React, { useState } from "react";
import { Product, NavTab } from "../types";
import { SUPPLIERS, PRODUCTS, MINED_PRODUCTS } from "../data/mockData";
import { ProductMetricsModal } from "./ProductMetricsModal";
import { MiningAnimationModal } from "./MiningAnimationModal";
import { ShopeeAffiliateAction } from "./ShopeeAffiliateAction";
import { 
  Box, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Zap, 
  Star, 
  Check, 
  Flame, 
  RefreshCw
} from "lucide-react";

interface CatalogoViewProps {
  onNavigateTab: (tab: NavTab, product?: Product) => void;
  selectedSupplierId?: string | null;
}

export const CatalogoView: React.FC<CatalogoViewProps> = ({ 
  onNavigateTab,
  selectedSupplierId: initialSupplierId = null
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string | null>(
    initialSupplierId 
      ? SUPPLIERS.find(s => s.id === initialSupplierId)?.category || null 
      : null
  );

  const [isMiningMode, setIsMiningMode] = useState<boolean>(false);
  const [isMiningScanning, setIsMiningScanning] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // List of registered suppliers
  const [registeredSupplierIds, setRegisteredSupplierIds] = useState<string[]>(
    SUPPLIERS.map(s => s.id)
  );

  const handleToggleRegistration = (supplierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRegisteredSupplierIds(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId) 
        : [...prev, supplierId]
    );
  };

  // Open the catalog for a specific supplier / niche
  const handleOpenNicheCatalog = (category: string) => {
    setIsMiningMode(false);
    setSelectedNiche(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Activate Mining mode with live scanner animation
  const handleOpenMiningMode = () => {
    setIsMiningScanning(true);
  };

  const handleCompleteMining = () => {
    setIsMiningScanning(false);
    setIsMiningMode(true);
    setSelectedNiche("Mineração");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter products by selected supplier/niche or mining mode and search query
  const activeProductList = isMiningMode ? MINED_PRODUCTS : PRODUCTS;

  const filteredProducts = activeProductList.filter(p => {
    const matchesNiche = 
      isMiningMode ||
      !selectedNiche || 
      selectedNiche === "Todos" || 
      p.category.toLowerCase() === selectedNiche.toLowerCase();

    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesNiche && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* MODE 1: SUPPLIER / NICHE LIST */}
      {!selectedNiche ? (
        <div className="space-y-5">
          {/* Header text with Mineração de Produtos button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Fornecedores Oficiais & Nichos Shopee
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Cada fornecedor traz uma seleção exclusiva de produtos prontos para divulgar.
              </p>
            </div>

            {/* Mineração de Produtos Button */}
            <button
              onClick={handleOpenMiningMode}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Mineração de Produtos</span>
              <span className="bg-white/20 text-white text-[10px] font-mono-code font-semibold px-1.5 py-0.2 rounded">
                TOP 10
              </span>
            </button>
          </div>

          {/* Supplier Cards List */}
          <div className="space-y-3">
            {SUPPLIERS.map((supplier) => {
              const isCadastrado = registeredSupplierIds.includes(supplier.id);

              return (
                <div
                  key={supplier.id}
                  onClick={() => handleOpenNicheCatalog(supplier.category)}
                  className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 hover:bg-slate-50/40 transition-colors cursor-pointer group"
                >
                  {/* Left Thumbnail & Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-slate-50 border border-slate-200/60 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={supplier.imageUrl}
                        alt={supplier.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      {/* Category Tag */}
                      <span className="text-[10px] font-medium tracking-wider uppercase text-[#EE4D2D] block">
                        {supplier.category.toUpperCase()}
                      </span>

                      {/* Supplier Name and Cadastrado Pill */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-sm sm:text-base font-semibold text-slate-900 group-hover:text-[#EE4D2D] transition-colors leading-tight">
                          {supplier.name}
                        </h3>

                        {isCadastrado ? (
                          <span 
                            onClick={(e) => handleToggleRegistration(supplier.id, e)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-medium text-[10px]"
                            title="Clique para alternar status"
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            CADASTRADO
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleToggleRegistration(supplier.id, e)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px] hover:bg-slate-200 transition-colors"
                          >
                            + SOLICITAR CADASTRO
                          </button>
                        )}
                      </div>

                      {/* Subtitle / Description */}
                      <p className="text-xs text-slate-500">
                        {supplier.subtitle || supplier.description}
                      </p>

                      {/* Available products count */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                        <Box className="w-3.5 h-3.5 text-slate-400" />
                        <span>{supplier.productsCountText || "+15 produtos mais vendidos disponíveis"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="shrink-0 flex sm:justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNicheCatalog(supplier.category);
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-[#EE4D2D] hover:bg-[#E03A17] shadow-xs"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Catálogo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* MODE 2: MAIN CATALOG FOR NICHE */
        <div className="space-y-6">
          {/* Top Bar with Back Button, Mineração Button and Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSelectedNiche(null);
                  setIsMiningMode(false);
                }}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar aos Fornecedores</span>
              </button>

              <div>
                <h2 className="text-base font-semibold text-slate-900 leading-tight flex items-center gap-2">
                  {isMiningMode ? (
                    <>
                      <Flame className="w-4 h-4 text-[#EE4D2D]" />
                      <span>Mineração de Produtos: Top 10 Mais Vendidos</span>
                    </>
                  ) : (
                    <span>Catálogo Shopee: {selectedNiche || "Todos os Produtos"}</span>
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredProducts.length} produtos {isMiningMode ? "em alta selecionados para mineração" : "de alta conversão disponíveis"}
                </p>
              </div>
            </div>

            {/* Right side: Mineração button & Search Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Button: Mineração de Produtos */}
              <button
                onClick={() => {
                  if (isMiningMode) {
                    setIsMiningMode(false);
                    setSelectedNiche("Todos");
                  } else {
                    handleOpenMiningMode();
                  }
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isMiningMode 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Mineração de Produtos</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isMiningMode ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  TOP 10
                </span>
              </button>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar produto ou comissão..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Special Banner when Mineração de Produtos is Active */}
          {isMiningMode && (
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      Top 10 Shopee Brasil
                    </span>
                    <span className="text-xs text-slate-400">Atualizado Hoje</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white mt-1">
                    Curadoria Estratégica: Produtos Que Mais Vendem
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                    Estes são os 10 produtos de maior tração comprovada, taxa de conversão acelerada e lucro por unidade garantido para você promover e faturar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenMiningMode}
                  className="px-3 py-1.5 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Escanear Novamente</span>
                </button>

                <button
                  onClick={() => {
                    setIsMiningMode(false);
                    setSelectedNiche("Todos");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-medium transition-colors text-center cursor-pointer"
                >
                  Ver Catálogo Completo
                </button>
              </div>
            </div>
          )}

          {/* Product Grid: 3 Products per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain bg-white p-3 group-hover:scale-102 transition-transform duration-200"
                    />

                    {/* Rank Badge */}
                    {product.rankBadge && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white font-mono-code font-semibold text-[10px]">
                        {product.rankBadge}
                      </span>
                    )}

                    {/* Tag Badge */}
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#EE4D2D] text-white font-medium text-[9px] uppercase tracking-wider shadow-xs">
                      {product.tag}
                    </span>

                    {/* Sales Count overlay */}
                    <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-medium">
                      {product.unitsSold} vendidas
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-[#EE4D2D] uppercase">{product.category}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-medium">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-display font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#EE4D2D] transition-colors">
                      {product.name}
                    </h3>

                    {/* Prices */}
                    <div className="pt-1 flex items-baseline gap-2">
                      <span className="text-base font-mono-code font-bold text-slate-900">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs font-mono-code text-slate-400 line-through">
                          R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                      <span className="text-[10px] font-mono-code font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                        -{product.discountPercentage}%
                      </span>
                    </div>

                    {/* Commission Tag */}
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                      <span className="font-medium">Sua Comissão:</span>
                      <span className="font-mono-code font-bold text-emerald-700">
                        R$ {product.commissionValue.toFixed(2).replace(".", ",")} ({product.commissionRate}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0 space-y-2">
                  <ShopeeAffiliateAction
                    product={product}
                    variant="card"
                    onOpenFullModal={() => setSelectedProduct(product)}
                  />

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver Métricas & IA</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
              <Box className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-medium text-slate-700">Nenhum produto encontrado</h4>
              <p className="text-xs text-slate-400">Tente buscar por outro termo ou mude a categoria.</p>
            </div>
          )}
        </div>
      )}

      {/* PRODUCT DETAILS / METRICS / AFFILIATION MODAL */}
      {selectedProduct && (
        <ProductMetricsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onNavigateTab={(tab, prod) => {
            setSelectedProduct(null);
            onNavigateTab(tab, prod);
          }}
        />
      )}

      {/* MINING SCANNER RADAR ANIMATION MODAL */}
      <MiningAnimationModal
        isOpen={isMiningScanning}
        onComplete={handleCompleteMining}
        onClose={handleCompleteMining}
      />
    </div>
  );
};
