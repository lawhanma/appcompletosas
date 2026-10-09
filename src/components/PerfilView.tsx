import React, { useState, useEffect } from "react";
import { useFinancial } from "../context/FinancialContext";
import { 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Lock,
  Trash2
} from "lucide-react";

// Helper to remove any old mock agency or placeholder data from localStorage
const sanitizeClean = (val?: string) => {
  if (!val) return "";
  const lower = val.toLowerCase();
  if (
    lower.includes("nave") || 
    lower.includes("agencia") || 
    lower.includes("agência") || 
    lower.includes("98765") || 
    lower.includes("4321") ||
    lower.includes("000.000") ||
    lower.includes("nave 7")
  ) {
    return "";
  }
  return val.trim();
};

export const PerfilView: React.FC = () => {
  const { state, userEmail, userCode, isVip } = useFinancial();

  // Exigência do usuário:
  // "no perfil sempre fica salvo com essas informcaões agencia nave 7 numeor essas coisa tem que ficar vazio sem nada, eo email la em baixo fica o que a pessoa colocou no campo de email na hora de login enteu?"
  // Todos os dados cadastrais iniciam completamente vazios, sem nenhum dado mockado de agência, telefone ou chave pix
  const [name, setName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("shopnext_profile_custom");
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeClean(parsed.name);
      }
    } catch (e) {
      // ignore
    }
    return "";
  });

  const [phone, setPhone] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("shopnext_profile_custom");
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeClean(parsed.phone);
      }
    } catch (e) {
      // ignore
    }
    return "";
  });

  const [pixKey, setPixKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("shopnext_profile_custom");
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeClean(parsed.pixKey);
      }
    } catch (e) {
      // ignore
    }
    return "";
  });

  // Limpa automaticamente qualquer resquício de mock do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopnext_profile_custom");
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleanName = sanitizeClean(parsed.name);
        const cleanPhone = sanitizeClean(parsed.phone);
        const cleanPix = sanitizeClean(parsed.pixKey);
        if (cleanName !== parsed.name || cleanPhone !== parsed.phone || cleanPix !== parsed.pixKey) {
          localStorage.setItem("shopnext_profile_custom", JSON.stringify({
            name: cleanName,
            phone: cleanPhone,
            pixKey: cleanPix
          }));
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // O e-mail exibido é exatamente o e-mail que o usuário informou no campo de e-mail na hora do login
  const loginEmail = userEmail || state.userEmail || (() => {
    try {
      const auth = localStorage.getItem("shopnext_auth");
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.email) return parsed.email;
      }
    } catch (e) {
      // ignore
    }
    return "";
  })();

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("shopnext_profile_custom", JSON.stringify({ 
        name: sanitizeClean(name), 
        phone: sanitizeClean(phone), 
        pixKey: sanitizeClean(pixKey) 
      }));
    } catch (e) {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearAll = () => {
    setName("");
    setPhone("");
    setPixKey("");
    try {
      localStorage.removeItem("shopnext_profile_custom");
    } catch (e) {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="pb-4 border-b border-slate-200/70">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Perfil & Configurações da Conta
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gerencie suas informações de acesso, plano ativo e dados para recebimento de comissões.
        </p>
      </div>

      {/* Plan Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-semibold uppercase tracking-wider mb-2 border border-white/15">
            <Sparkles className="w-3 h-3 text-orange-400" />
            {isVip ? `PLANO ATIVO: SHOP GO PRO VIP (${userCode || "123456"})` : `PLANO ATIVO: SHOP GO STANDARD (${userCode || "101190"})`}
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-white">
            {isVip ? "Acesso Ilimitado à IA, Robôs de Divulgação e Fornecedores" : "Plano Afiliado Iniciante Shopee & TikTok Shop"}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
            {isVip 
              ? "Geração de vídeos, disparos automáticos com comissão de R$ 20 a R$ 70 por divulgação e meta diária de até R$ 3.000,00."
              : "Automação de divulgação em redes sociais parceiras com limite diário de até R$ 25,00 por dia de comissão."
            }
          </p>
        </div>

        <div className="shrink-0">
          <span className="px-3.5 py-1.5 bg-white text-slate-900 rounded-lg font-semibold text-xs shadow-xs">
            Assinatura Ativa (Renovação Automática)
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm font-display">
            Dados do Afiliado & Conta Bancária
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Preencha seus dados cadastrais e chave Pix para repasse dos saques. Os campos iniciam vazios para seu preenchimento.
          </p>
        </div>

        {/* Informações Pessoais & Pix (Iniciam vazias sem agência mock) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Nome Completo / Razão Social:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
              />
            </div>
          </div>

          {/* Telefone / WhatsApp */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Telefone / WhatsApp:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 99999-9999..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
              />
            </div>
          </div>

          {/* Chave Pix (Inicia vazia) */}
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Chave Pix Cadastrada (Repasses Automáticos):
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Ex: CPF, Celular, E-mail ou Chave Aleatória..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Sua chave Pix para onde serão enviadas as comissões solicitadas na aba Financeiro.
            </p>
          </div>
        </div>

        {/* "eo email la em baixo fica o que a pessoa colocou no campo de email na hora de login enteu?" */}
        <div className="pt-4 border-t border-slate-200/80">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">
                  E-mail de Login & Acesso à Plataforma
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Autenticado
              </span>
            </div>

            <div className="relative">
              <input
                type="email"
                disabled
                value={loginEmail || "Não informado"}
                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold cursor-not-allowed select-all shadow-2xs"
                title="Este é o e-mail que você digitou no campo de e-mail ao fazer o login"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <p className="text-[11px] text-slate-500">
              📌 Este é exatamente o e-mail que você digitou na hora de fazer o login na sua conta. Ele permanece fixo e seguro para identificação do seu acesso.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dados protegidos com criptografia SSL 256 bits</span>
            </div>

            {(name || phone || pixKey) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium hover:underline cursor-pointer"
                title="Limpar todos os campos"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar campos</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <span>Salvar Alterações</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
