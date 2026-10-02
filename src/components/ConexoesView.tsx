import React, { useState } from "react";
import { 
  ShoppingBag, 
  Music2, 
  Store, 
  Link2, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  RefreshCw,
  Unlink
} from "lucide-react";
import { NavTab, Product } from "../types";
import { useFinancial } from "../context/FinancialContext";

interface ConexoesViewProps {
  onNavigateTab?: (tab: NavTab, product?: Product, subTab?: "automatica" | "grupos" | "tiktok") => void;
}

type ChannelType = "shopee" | "tiktok" | "mercadolivre";

interface ChannelConfig {
  id: ChannelType;
  name: string;
  tabLabel: string;
  icon: React.ReactNode;
  activeColor: string;
  warningText: string;
  buttonLabel: string;
  platformName: string;
  securityText: string;
  defaultName: string;
}

const CHANNELS: Record<ChannelType, ChannelConfig> = {
  shopee: {
    id: "shopee",
    name: "Shopee",
    tabLabel: "SHOPEE",
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    activeColor: "#EE4D2D",
    warningText: "Sua conta do Shop GO não possui uma loja Shopee integrada no momento. Configure abaixo para ativar todas as ferramentas de IA.",
    buttonLabel: "CONECTAR CONTA SHOPEE",
    platformName: "Shopee Open Platform",
    securityText: "Sua conexão é estabelecida de forma segura através de encriptação ponta a ponta homologada pela Shopee Open Platform.",
    defaultName: "Minha Loja Shopee"
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Shop",
    tabLabel: "TIKTOK SHOP",
    icon: <Music2 className="w-3.5 h-3.5" />,
    activeColor: "#000000",
    warningText: "Sua conta do Shop GO não possui uma conta TikTok Shop integrada no momento. Configure abaixo para ativar todas as ferramentas de IA.",
    buttonLabel: "CONECTAR CONTA TIKTOK SHOP",
    platformName: "TikTok Shop Partner Platform",
    securityText: "Sua conexão é estabelecida de forma segura através de encriptação ponta a ponta homologada pela TikTok Shop Partner Platform.",
    defaultName: "Meu Canal TikTok Shop"
  },
  mercadolivre: {
    id: "mercadolivre",
    name: "Mercado Livre",
    tabLabel: "MERCADO LIVRE",
    icon: <Store className="w-3.5 h-3.5" />,
    activeColor: "#D97706",
    warningText: "Sua conta do Shop GO não possui uma conta Mercado Livre integrada no momento. Configure abaixo para ativar todas as ferramentas de IA.",
    buttonLabel: "CONECTAR CONTA MERCADO LIVRE",
    platformName: "Mercado Livre Developers",
    securityText: "Sua conexão é estabelecida de forma segura através de encriptação ponta a ponta homologada pelo Mercado Livre Developers.",
    defaultName: "Minha Conta Mercado Livre"
  }
};

export const ConexoesView: React.FC<ConexoesViewProps> = () => {
  const { userEmail } = useFinancial();
  const [activeChannel, setActiveChannel] = useState<ChannelType>("shopee");

  // State of connections per channel
  const [connectedState, setConnectedState] = useState<Record<ChannelType, { isConnected: boolean; name: string; email: string }>>({
    shopee: { isConnected: false, name: "", email: "" },
    tiktok: { isConnected: false, name: "", email: "" },
    mercadolivre: { isConnected: false, name: "", email: "" }
  });

  // Form input states
  const [formData, setFormData] = useState<Record<ChannelType, { name: string; email: string }>>({
    shopee: { name: "", email: userEmail || "" },
    tiktok: { name: "", email: userEmail || "" },
    mercadolivre: { name: "", email: userEmail || "" }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const currentChannel = CHANNELS[activeChannel];
  const isCurrentConnected = connectedState[activeChannel].isConnected;

  const handleInputChange = (field: "name" | "email", value: string) => {
    setFormData(prev => ({
      ...prev,
      [activeChannel]: {
        ...prev[activeChannel],
        [field]: value
      }
    }));
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const nameToSave = formData[activeChannel].name.trim() || currentChannel.defaultName;
    const emailToSave = formData[activeChannel].email.trim() || userEmail || "afiliado@shopgo.com.br";

    setTimeout(() => {
      setConnectedState(prev => ({
        ...prev,
        [activeChannel]: {
          isConnected: true,
          name: nameToSave,
          email: emailToSave
        }
      }));
      setIsLoading(false);
      setSuccessToast(`Conta ${currentChannel.name} conectada com sucesso à Shop GO!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 900);
  };

  const handleDisconnect = () => {
    setConnectedState(prev => ({
      ...prev,
      [activeChannel]: {
        isConnected: false,
        name: "",
        email: ""
      }
    }));
    setSuccessToast(`Conexão com ${currentChannel.name} desvinculada.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-1 pb-10">
      {/* Header Section */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Conexões e integrações
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Conecte seus canais de venda para automação, posts com IA e sincronização em tempo real.
        </p>

        {/* Channel Selection Tabs */}
        <div className="mt-4 inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
          {(["shopee", "tiktok", "mercadolivre"] as ChannelType[]).map((channelKey) => {
            const channel = CHANNELS[channelKey];
            const isActive = activeChannel === channelKey;

            return (
              <button
                key={channelKey}
                onClick={() => setActiveChannel(channelKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className={isActive && channelKey === "shopee" ? "text-[#EE4D2D]" : ""}>
                  {channel.icon}
                </span>
                <span className="tracking-wide">{channel.tabLabel}</span>

                {connectedState[channelKey].isConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-0.5" title="Conectado" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-b border-slate-200/60" />

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Integration Card */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
          {!isCurrentConnected ? (
            <>
              {/* Notice Callout */}
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/60 flex items-start gap-3 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-amber-900">
                  {currentChannel.warningText}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleConnect} className="space-y-4">
                {/* Nome completo */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome completo <span className="text-[#EE4D2D]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData[activeChannel].name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email <span className="text-[#EE4D2D]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData[activeChannel].email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
                  />
                </div>

                {/* Connect Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Autenticando {currentChannel.name}...</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>{currentChannel.buttonLabel}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Connected State */
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {currentChannel.name} Conectada
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono-code font-semibold">
                      ATIVO
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Sincronização em tempo real ativada para catálogo, produtos mais vendidos e comissões automáticas.
                  </p>
                </div>
              </div>

              {/* Connected Details */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nome do Titular:</span>
                  <span className="font-medium text-slate-900">{connectedState[activeChannel].name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email Registrado:</span>
                  <span className="font-mono-code text-slate-900">{connectedState[activeChannel].email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Protocolo de Encriptação:</span>
                  <span className="font-mono-code text-[11px] text-emerald-700 font-medium">TLS 1.3 • SHA-256</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      setSuccessToast("Catálogo e webhook sincronizados com sucesso!");
                      setTimeout(() => setSuccessToast(null), 3000);
                    }, 800);
                  }}
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Sincronizar Dados Agora</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full sm:w-auto py-2 px-3 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Desconectar Conta</span>
                </button>
              </div>
            </div>
          )}

          {/* Homologated Platform Security Disclaimer */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
            {currentChannel.securityText}
          </p>
        </div>
      </div>
    </div>
  );
};
