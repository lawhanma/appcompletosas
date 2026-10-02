import React from "react";
import { NavTab } from "../types";
import { ShopNextLogo } from "./ShopNextLogo";
import { useFinancial } from "../context/FinancialContext";
import { 
  LayoutGrid, 
  DollarSign, 
  Package, 
  Sparkles, 
  Video, 
  Link2, 
  User, 
  LogOut
} from "lucide-react";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onLogout,
}) => {
  const { state } = useFinancial();
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "financeiro", label: "Financeiro", icon: <DollarSign className="w-4 h-4" /> },
    { id: "catalogo", label: "Catálogo", icon: <Package className="w-4 h-4" /> },
    { id: "divulgacao", label: "Divulgação com IA", icon: <Sparkles className="w-4 h-4" /> },
    { id: "gerar-videos", label: "Gerar Vídeos com IA", icon: <Video className="w-4 h-4" /> },
    { id: "conexoes", label: "Conexões e integrações", icon: <Link2 className="w-4 h-4" /> },
    { id: "perfil", label: "Perfil", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <aside 
      className={`bg-white border-r border-slate-200/70 flex flex-col justify-between transition-all duration-200 shrink-0 z-30 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Top Brand Section */}
      <div>
        <div className="h-14 flex items-center px-4.5 border-b border-slate-200/60">
          {collapsed ? (
            <div className="mx-auto cursor-pointer" onClick={() => onSelectTab("catalogo")} title="Shop GO">
              <ShopNextLogo size="sm" className="scale-95" />
            </div>
          ) : (
            <div className="cursor-pointer" onClick={() => onSelectTab("catalogo")}>
              <ShopNextLogo size="sm" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-0.5 mt-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`shrink-0 transition-colors ${isActive ? "text-[#EE4D2D]" : "text-slate-400 group-hover:text-slate-600"}`}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="truncate tracking-tight text-left flex-1">
                    {item.label}
                  </span>
                )}
                {!collapsed && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EE4D2D] shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / User Info */}
      <div className="p-3 border-t border-slate-200/60 space-y-2">
        <div className="flex items-center gap-2.5 px-1 py-1">
          {/* User Avatar */}
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[10px] tracking-tight uppercase">
            {(state.userEmail || "AF").slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate" title={state.userEmail || "Afiliado Conectado"}>
                {state.userEmail || "Afiliado Conectado"}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Conectado</span>
                <span className="ml-auto text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                  Ativo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sair / Logout */}
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              alert("Sessão finalizada.");
            }
          }}
          className={`w-full flex items-center gap-2 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
          title="Sair da Plataforma"
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && <span>Sair da conta</span>}
        </button>
      </div>
    </aside>
  );
};
