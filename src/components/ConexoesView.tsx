import {useCloudAccount} from '../context/CloudAccount';
import {useChannelConnections,ChannelType,ConnectionsStore} from '../hooks/useChannelConnections';
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
    warningText: "Salve os dados da sua conta Shopee para encontrá-los sempre que voltar.",
    buttonLabel: "SALVAR CONTA SHOPEE",
    platformName: "Shopee Open Platform",
    securityText: "Nome e e-mail ficam salvos na sua conta ShopGO. Esse cadastro não autoriza acesso à plataforma nem sincroniza vendas automaticamente.",
    defaultName: "Minha Loja Shopee"
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Shop",
    tabLabel: "TIKTOK SHOP",
    icon: <Music2 className="w-3.5 h-3.5" />,
    activeColor: "#000000",
    warningText: "Salve os dados da sua conta TikTok Shop para encontrá-los sempre que voltar.",
    buttonLabel: "SALVAR CONTA TIKTOK SHOP",
    platformName: "TikTok Shop Partner Platform",
    securityText: "Nome e e-mail ficam salvos na sua conta ShopGO. Esse cadastro não autoriza acesso à plataforma nem sincroniza vendas automaticamente.",
    defaultName: "Meu Canal TikTok Shop"
  },
  mercadolivre: {
    id: "mercadolivre",
    name: "Mercado Livre",
    tabLabel: "MERCADO LIVRE",
    icon: <Store className="w-3.5 h-3.5" />,
    activeColor: "#D97706",
    warningText: "Salve os dados da sua conta Mercado Livre para encontrá-los sempre que voltar.",
    buttonLabel: "SALVAR CONTA MERCADO LIVRE",
    platformName: "Mercado Livre Developers",
    securityText: "Nome e e-mail ficam salvos na sua conta ShopGO. Esse cadastro não autoriza acesso à plataforma nem sincroniza vendas automaticamente.",
    defaultName: "Minha Conta Mercado Livre"
  }
};

export const ConexoesView: React.FC<ConexoesViewProps> = () => {
  const {userEmail}=useFinancial();
  const store=useChannelConnections();
  const owner=useCloudAccount()?.profile.id||'';
  return <ConnectionsWorkspace key={owner} store={store} userEmail={userEmail||''}/>;
};
export const ConnectionsWorkspace:React.FC<{store:ConnectionsStore;userEmail:string}>=({store,userEmail})=>{
  const [activeChannel, setActiveChannel] = useState<ChannelType>("shopee");

  const connectedState=store.connections;
  const [actionError,setActionError]=useState('');
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

  const handleConnect = async (e:React.FormEvent) => {
    e.preventDefault();if(isLoading||store.loading||store.error)return;
    const channel=activeChannel,config=CHANNELS[channel];
    setIsLoading(true);setActionError('');setSuccessToast(null);
    try{await store.save(channel,formData[channel].name,formData[channel].email);setSuccessToast(`Dados da conta ${config.name} salvos com sucesso!`);}
    catch(e){setActionError(e instanceof Error?e.message:'Não foi possível salvar.');}
    finally{setIsLoading(false);}
  };
  const handleDisconnect=async()=>{
    if(isLoading||store.loading||store.error)return;
    const channel=activeChannel;setIsLoading(true);setActionError('');setSuccessToast(null);
    try{await store.disconnect(channel);setSuccessToast(`Configuração de ${CHANNELS[channel].name} desvinculada.`);}
    catch(e){setActionError(e instanceof Error?e.message:'Não foi possível desconectar.');}
    finally{setIsLoading(false);}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-1 pb-10">
      {/* Header Section */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Conexões e integrações
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Salve os dados dos seus canais e encontre suas configurações ao entrar novamente.
        </p>

        {/* Channel Selection Tabs */}
        <div className="mt-4 inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
          {(["shopee", "tiktok", "mercadolivre"] as ChannelType[]).map((channelKey) => {
            const channel = CHANNELS[channelKey];
            const isActive = activeChannel === channelKey;

            return (
              <button
                key={channelKey}
                disabled={isLoading||store.loading}
                onClick={() => {setActiveChannel(channelKey);setSuccessToast(null);setActionError('');}}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-0.5" title="Configuração salva" />
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

      {actionError&&<p role="alert" className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-700">{actionError}</p>}
      {/* Main Integration Card */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
          {activeChannel === 'shopee' && (
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-3.5 text-xs leading-relaxed">
              <p className="text-slate-700">Ainda não criou sua conta como afiliado da Shopee?</p>
              <a href="https://affiliate.shopee.com.br" target="_blank" rel="noopener noreferrer"
                className="mt-1 inline-flex font-semibold text-[#EE4D2D] underline underline-offset-2 hover:text-orange-700">
                Clique para criar agora!
              </a>
            </div>
          )}
          {store.loading?<p role="status" className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin"/>Carregando configurações salvas…</p>:store.error?<div role="alert" className="space-y-3 text-sm text-rose-700"><p>{store.error}</p><button type="button" onClick={()=>{void store.reload();}} className="font-semibold underline">Tentar novamente</button></div>:!isCurrentConnected ? (
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
                    aria-label="Nome completo"
                    disabled={isLoading}
                    required
                    maxLength={100}
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
                    aria-label="Email"
                    disabled={isLoading}
                    required
                    maxLength={254}
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
                        <span>Salvando {currentChannel.name}...</span>
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
                      {currentChannel.name} — Dados salvos
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono-code font-semibold">
                      ATIVO
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Configuração salva na sua conta. Ela será recuperada quando você entrar novamente, inclusive em outro dispositivo.
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
                  <span className="text-slate-500">Armazenamento:</span>
                  <span className="font-mono-code text-[11px] text-emerald-700 font-medium">Salvo na sua conta</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={async()=>{setIsLoading(true);setActionError('');setSuccessToast(null);try{await store.reload();}finally{setIsLoading(false);}}}
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Atualizar Dados Salvos</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  disabled={isLoading}
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
