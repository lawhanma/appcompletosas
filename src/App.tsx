import React, { useState, useEffect } from "react";
import { NavTab, Product } from "./types";
import { FinancialProvider, useFinancial } from "./context/FinancialContext";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { CatalogoView } from "./components/CatalogoView";
import { DivulgacaoIAView } from "./components/DivulgacaoIAView";
import { GerarVideosIAView } from "./components/GerarVideosIAView";
import { DashboardView } from "./components/DashboardView";
import { FinanceiroView } from "./components/FinanceiroView";
import { ConexoesView } from "./components/ConexoesView";
import { PerfilView } from "./components/PerfilView";
import { AuthScreen } from "./components/AuthScreen";
import { WhatsAppFloatingButton } from "./components/WhatsAppFloatingButton";
import { internalDb } from "./utils/internalDb";
import { DollarSign, CheckCircle2, X } from "lucide-react";

function AppContent() {
  // Inicialização resiliente com banco de dados interno (evita deslogar rápido / ao recarregar)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = internalDb.getActiveSession();
    return !!session?.authenticated;
  });
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextProduct, setContextProduct] = useState<Product | null>(null);
  const [divulgacaoSubTab, setDivulgacaoSubTab] = useState<"automatica" | "grupos" | "tiktok">("automatica");
  const { lastSaleNotification, clearNotification, setUserEmail, setUserCode } = useFinancial();

  // Sincroniza e restaura a sessão persistente com o IndexedDB e LocalStorage
  useEffect(() => {
    internalDb.initAsyncSession().then((session) => {
      if (session?.authenticated) {
        setIsAuthenticated(true);
        if (session.userEmail) setUserEmail(session.userEmail);
        if (session.purchaseCode) setUserCode(session.purchaseCode, false, session.userEmail);
      }
    });
  }, [setUserCode, setUserEmail]);

  // Prolonga a sessão enquanto o usuário utiliza a aplicação (touch a cada 5 min e ao interagir)
  useEffect(() => {
    if (isAuthenticated) {
      internalDb.touchSession();
      const interval = setInterval(() => {
        internalDb.touchSession();
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleNavigateTab = (
    tab: NavTab, 
    product?: Product, 
    subTab?: "automatica" | "grupos" | "tiktok"
  ) => {
    if (product) {
      setContextProduct(product);
    }
    if (subTab) {
      setDivulgacaoSubTab(subTab);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenVideoCreator = (product?: Product) => {
    if (product) {
      setContextProduct(product);
    }
    setActiveTab("gerar-videos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Se não estiver autenticado, exibe a tela de login
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLoginSuccess={(email, code, name, phone) => {
          const finalCode = code || "101190";
          internalDb.saveSession({
            userEmail: email,
            purchaseCode: finalCode,
            name: name || "Afiliado Shop GO",
            phone: phone || "",
            authenticated: true
          });
          if (email) setUserEmail(email);
          if (finalCode) setUserCode(finalCode, true, email);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800 relative">
      {/* Real-time sale toast alert */}
      {lastSaleNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-white text-slate-800 p-3.5 rounded-xl shadow-lg border border-slate-200/80 animate-in slide-in-from-top-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                Venda Realizada • Shopee
              </span>
              <button 
                onClick={clearNotification}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
              {lastSaleNotification.product}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-600">
                +R$ {lastSaleNotification.amount.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Creditado no Saldo
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={() => {
          internalDb.clearSession();
          setIsAuthenticated(false);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          collapsed={sidebarCollapsed}
          onOpenVideoCreator={() => handleOpenVideoCreator()}
        />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-16">
            {activeTab === "catalogo" && (
              <CatalogoView onNavigateTab={handleNavigateTab} />
            )}

            {activeTab === "divulgacao" && (
              <DivulgacaoIAView
                initialProduct={contextProduct}
                defaultSubTab={divulgacaoSubTab}
                onOpenVideoCreator={(prod) => handleOpenVideoCreator(prod)}
              />
            )}

            {activeTab === "gerar-videos" && (
              <GerarVideosIAView initialProduct={contextProduct} />
            )}

            {activeTab === "dashboard" && (
              <DashboardView onNavigateTab={handleNavigateTab} />
            )}

            {activeTab === "financeiro" && <FinanceiroView />}

            {activeTab === "conexoes" && (
              <ConexoesView onNavigateTab={handleNavigateTab} />
            )}

            {activeTab === "perfil" && <PerfilView />}
          </div>
        </main>
      </div>

      {/* Floating WhatsApp Customer Support Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}

export default function App() {
  return (
    <FinancialProvider>
      <AppContent />
    </FinancialProvider>
  );
}
