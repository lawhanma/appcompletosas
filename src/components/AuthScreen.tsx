import React, { useState } from "react";
import { ShopNextLogo } from "./ShopNextLogo";
import { 
  Key, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Eye,
  EyeOff
} from "lucide-react";

interface AuthScreenProps {
  onLoginSuccess: (userEmail: string, code?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [purchaseCode, setPurchaseCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanCode = purchaseCode.trim();

    if (!cleanCode) {
      setErrorMessage("Por favor, digite o código de compra para liberar seu acesso.");
      return;
    }

    // Access allowed with authorized codes
    if (cleanCode !== "101190" && cleanCode !== "123456" && cleanCode !== "12456") {
      setErrorMessage(
        "Código de compra inválido. Verifique o código recebido no seu e-mail de compra."
      );
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("shopnext_auth", JSON.stringify({ email, authenticated: true, purchaseCode: cleanCode }));
      onLoginSuccess(email, cleanCode);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 selection:bg-orange-100">
      <div className="w-full max-w-[400px]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <ShopNextLogo size="md" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
            {isRegisterMode ? "Criar Conta de Acesso" : "Acesso à Plataforma"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Plataforma de inteligência e automação para afiliados e vendedores Shopee e TikTok Shop.
          </p>

          {/* Segmented Control: Entrar / Cadastrar */}
          <div className="mt-4 inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200/60 w-full max-w-xs text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage("");
              }}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                !isRegisterMode
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage("");
              }}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                isRegisterMode
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cadastrar
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-lg text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Nome Completo / Nome da Agência:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome ou da sua agência"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                E-mail de Acesso:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Senha:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* License Code Section */}
            <div className="pt-1">
              <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#EE4D2D]" />
                    <span>Código de Licença / Compra</span>
                  </label>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium">
                    Obrigatório
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  Insira o código de compra recebido na aquisição do Shop GO para liberar seu acesso à ferramenta.
                </p>

                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={purchaseCode}
                    onChange={(e) => {
                      setPurchaseCode(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="DIGITE SEU CÓDIGO DE COMPRA"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono-code font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal focus:outline-none focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 text-center tracking-widest uppercase transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-primary transition-all"
            >
              {isLoading ? (
                <span>Validando Código de Compra...</span>
              ) : (
                <>
                  <span>{isRegisterMode ? "Concluir Cadastro e Acessar" : "Acessar Plataforma Shop GO"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Acesso seguro e autenticado com licença única</span>
        </div>
      </div>
    </div>
  );
};
