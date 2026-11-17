import {AppErrorBoundary} from "./components/AppErrorBoundary";
import {PromotionRewardsProvider} from './context/PromotionRewards';
import React, { useState, useEffect, lazy, Suspense } from "react";
import { NavTab, Product } from "./types";
import { FinancialProvider, useFinancial } from "./context/FinancialContext";
import {DailyMissionsProvider} from './context/DailyMissions';
const DailyMissionsView=lazy(()=>import("./components/DailyMissionsView").then(m=>({default:m.DailyMissionsView})));
const MeusPerfisView=lazy(()=>import("./components/MeusPerfisView").then(m=>({default:m.MeusPerfisView})));
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
const CatalogoView=lazy(()=>import("./components/CatalogoView").then(m=>({default:m.CatalogoView})));
const DivulgacaoIAView=lazy(()=>import("./components/DivulgacaoIAView").then(m=>({default:m.DivulgacaoIAView})));
const GerarVideosIAView=lazy(()=>import("./components/GerarVideosIAView").then(m=>({default:m.GerarVideosIAView})));
const DashboardView=lazy(()=>import("./components/DashboardView").then(m=>({default:m.DashboardView})));
const FinanceiroView=lazy(()=>import("./components/FinanceiroView").then(m=>({default:m.FinanceiroView})));
const ConexoesView=lazy(()=>import("./components/ConexoesView").then(m=>({default:m.ConexoesView})));
const OrdersView=lazy(()=>import("./components/OrdersView").then(m=>({default:m.OrdersView})));
const PerfilView=lazy(()=>import("./components/PerfilView").then(m=>({default:m.PerfilView})));
import { AuthScreen } from "./components/AuthScreen";
import { WhatsAppFloatingButton } from "./components/WhatsAppFloatingButton";
import { internalDb } from "./utils/internalDb";
import { supabase } from "./lib/supabase";
import { CloudAccountGate, useCloudAccount } from "./context/CloudAccount";
import { DollarSign, CheckCircle2, X, House, Package, Sparkles, Wallet, Menu } from "lucide-react";

function AppContent() {
  const cloudAccount = useCloudAccount();
  // Inicialização resiliente com banco de dados interno (evita deslogar rápido / ao recarregar)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (cloudAccount) return true;
    const session = internalDb.getActiveSession();
    return !!session?.authenticated;
  });
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenu,setMobileMenu]=useState(false);
  const toggleSidebar=()=>{if(window.matchMedia('(max-width: 767px)').matches)setMobileMenu(v=>!v);else setSidebarCollapsed(v=>!v);};
  const [contextProduct, setContextProduct] = useState<Product | null>(null);
  const [divulgacaoSubTab, setDivulgacaoSubTab] = useState<"automatica" | "grupos" | "tiktok">("automatica");
  const { lastSaleNotification, clearNotification, setUserEmail, setUserCode } = useFinancial();

  // Sincroniza e restaura a sessão persistente com o IndexedDB e LocalStorage
  useEffect(() => {
    if (supabase) return;
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
    <div className="shopgo-app flex h-dvh bg-[#F8FAFC] overflow-hidden text-slate-800 relative">
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
      {mobileMenu&&<button aria-label="Fechar menu" onClick={()=>setMobileMenu(false)} className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"/>}
      <div className={`shopgo-sidebar ${mobileMenu?"mobile-open":""}`}>
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);setMobileMenu(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onLogout={async () => {
          if (cloudAccount) { await cloudAccount.signOut(); return; }
          internalDb.clearSession();
          setIsAuthenticated(false);
        }}
      />

      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleSidebar={toggleSidebar}
          collapsed={sidebarCollapsed}
          onOpenVideoCreator={() => handleOpenVideoCreator()}
        />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-16"><AppErrorBoundary key={activeTab}><Suspense fallback={<div role="status" className="space-y-4 animate-pulse"><div className="h-8 w-40 rounded-lg bg-slate-200"/><div className="h-48 rounded-2xl bg-white border border-slate-200"/><span className="sr-only">Carregando tela…</span></div>}>
            {activeTab === "pedidos" && <OrdersView/>}
            {activeTab === "perfis" && <MeusPerfisView />}
            {activeTab === 'missoes' && <DailyMissionsView onNavigate={(tab,sub)=>handleNavigateTab(tab,undefined,sub)} />}
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
          </Suspense></AppErrorBoundary></div>
        </main>
      </div>

      <nav aria-label="Navegação principal" className="mobile-bottom-nav md:hidden">{([{id:'dashboard',label:'Início',icon:<House size={21}/>},{id:'catalogo',label:'Catálogo',icon:<Package size={21}/>},{id:'divulgacao',label:'Divulgar',icon:<Sparkles size={21}/>},{id:'financeiro',label:'Saldo',icon:<Wallet size={21}/>}] as const).map(item=><button key={item.id} aria-current={activeTab===item.id?'page':undefined} onClick={()=>{setActiveTab(item.id);setMobileMenu(false);}} className={activeTab===item.id?'active':''}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}<button onClick={()=>setMobileMenu(v=>!v)} aria-expanded={mobileMenu}><span aria-hidden="true"><Menu size={21}/></span>Mais</button></nav>
      {/* Floating WhatsApp Customer Support Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}

export default function App() {
  return (
    <CloudAccountGate>
      <PromotionRewardsProvider><FinancialProvider>
        <DailyMissionsProvider>
        <AppContent />
        </DailyMissionsProvider>
      </FinancialProvider></PromotionRewardsProvider>
    </CloudAccountGate>
  );
}
