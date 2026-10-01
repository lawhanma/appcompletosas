import React from "react";
import { ShopNextLogo } from "./ShopNextLogo";
import { PanelLeft, Bell, Sparkles } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  collapsed: boolean;
  onOpenVideoCreator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  collapsed: _collapsed,
  onOpenVideoCreator 
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200/70 flex items-center justify-between px-5 lg:px-7 shrink-0 relative z-20">
      {/* Left Action: Toggle Sidebar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Alternar barra lateral"
          aria-label="Alternar barra lateral"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Centered Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none sm:pointer-events-auto">
        <ShopNextLogo size="sm" />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs text-slate-600 bg-slate-50 border border-slate-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-500">Shopee Open API</span>
          <span className="text-emerald-700 font-semibold text-[11px]">Online</span>
        </div>

        <button
          onClick={onOpenVideoCreator}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Criar Vídeo IA</span>
        </button>

        <button 
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
          title="Notificações"
          onClick={() => alert("Todas as notificações de comissão sincronizadas!")}
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EE4D2D] rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};
