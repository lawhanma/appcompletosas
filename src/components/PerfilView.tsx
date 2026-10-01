import React, { useState } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Check 
} from "lucide-react";

export const PerfilView: React.FC = () => {
  const [name, setName] = useState("Agência Nave 7 Marketing");
  const [email] = useState("agencianave7mkt@gmail.com");
  const [phone, setPhone] = useState("+55 (11) 98765-4321");
  const [pixKey, setPixKey] = useState("agencianave7mkt@gmail.com");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="pb-4 border-b border-slate-200/70">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Perfil & Configurações da Conta
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gerencie suas informações de acesso, plano ativo e dados bancários para recebimento de comissões.
        </p>
      </div>

      {/* Plan Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-semibold uppercase tracking-wider mb-2 border border-white/15">
            <Sparkles className="w-3 h-3 text-orange-400" />
            PLANO ATIVO: SHOP GO PRO VIP
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-white">Acesso Ilimitado à IA e Fornecedores</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
            Geração ilimitada de vídeos verticais para TikTok, disparos automáticos e comissão bonificada de até 20%.
          </p>
        </div>

        <div className="shrink-0">
          <span className="px-3.5 py-1.5 bg-white text-slate-900 rounded-lg font-semibold text-xs shadow-xs">
            Assinatura Ativa (Renovação Automática)
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm font-display">
          Dados da Empresa e Afiliado
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Nome da Agência / Afiliado:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              E-mail de Login & Contato:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={email}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Telefone / WhatsApp:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Chave Pix Cadastrada (Repasses Automáticos):
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dados protegidos com criptografia SSL 256 bits</span>
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
