import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const encoded = encodeURIComponent(`Olá equipe Shop GO! ${message}`);
    window.open(`https://wa.me/5511999999999?text=${encoded}`, "_blank");
    setMessage("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-76 bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="bg-[#25D366] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-xs leading-tight">Suporte Shop GO VIP</h4>
                <p className="text-[10px] text-emerald-100">Respondemos em até 5 minutos</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 space-y-2.5 bg-slate-50 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs text-slate-700 leading-snug">
              👋 Olá! Precisa de ajuda para conectar seus links de afiliado da Shopee ou liberar mais fornecedores no catálogo?
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite sua dúvida ou pedido..."
                className="w-full bg-white border border-slate-200 text-xs text-slate-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#25D366]/40 focus:border-[#25D366]"
              />
              <button
                onClick={handleSendMessage}
                className="w-full py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Send className="w-3 h-3" />
                Iniciar conversa no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md shadow-emerald-600/20 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
        title="Falar no WhatsApp"
        aria-label="Falar no WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="fill-white stroke-none"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </button>
    </div>
  );
};
