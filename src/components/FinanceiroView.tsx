import React, { useState } from "react";
import { useFinancial } from "../context/FinancialContext";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  MousePointerClick, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Truck, 
  PackageCheck, 
  Info 
} from "lucide-react";

export const FinanceiroView: React.FC = () => {
  const { state, requestWithdrawal: _requestWithdrawal, releaseDeliveredSale } = useFinancial();
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [keyType, setKeyType] = useState<string>("CPF");
  const [pixKey, setPixKey] = useState<string>("000.000.000-00");
  const [showAntecipationModal, setShowAntecipationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"todos" | "pendente" | "liberado">("todos");

  const handleAntecipate = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowAntecipationModal(false);
      setSuccessMessage("Solicitação de antecipação enviada com sucesso para aprovação bancária!");
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 1200);
  };

  const handleWithdrawClick = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
    
    if (amountNum <= 0) {
      setShowAntecipationModal(true);
      return;
    }
    
    if (amountNum > state.saldoDisponivel) {
      if (amountNum <= (state.saldoDisponivel + state.saldoPendente)) {
        alert(
          `Atenção: Parte desse valor está no seu Saldo Pendente a Receber (R$ ${state.saldoPendente.toFixed(2).replace(".", ",")}).\n\nAssim que o produto for recebido pelo cliente, o valor será liberado automaticamente para saque!`
        );
        return;
      }
      alert("Valor solicitado é maior que o saldo disponível em conta.");
      return;
    }
    
    setShowAntecipationModal(true);
  };

  const filteredTransactions = state.transactions.filter(tx => {
    if (filterStatus === "pendente") return tx.status === "pendente";
    if (filterStatus === "liberado") return tx.status === "concluido";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Financeiro & Saques
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Acompanhe suas vendas, comissões liberadas, saldo pendente a receber e solicite saques via PIX.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Saldo Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: SALDO DISPONÍVEL */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Saldo Disponível</span>
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Liberado
              </span>
            </div>
            <div className="text-2xl font-mono-code font-bold text-emerald-600 mt-2 tracking-tight">
              R$ {state.saldoDisponivel.toFixed(2).replace(".", ",")}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-snug">
            Pronto para saque via PIX. Comissões de pedidos já entregues.
          </p>
        </div>

        {/* Card 2: SALDO PENDENTE A RECEBER */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Saldo Pendente</span>
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                A Receber
              </span>
            </div>
            <div className="text-2xl font-mono-code font-bold text-slate-900 mt-2 tracking-tight">
              R$ {state.saldoPendente.toFixed(2).replace(".", ",")}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-snug">
            Liberado para saque assim que o produto for recebido pelo cliente.
          </p>
        </div>

        {/* Card 3: VENDAS REALIZADAS */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <ShoppingCart className="w-4 h-4 text-slate-400" />
              <span>Vendas Realizadas</span>
            </div>
            <div className="text-2xl font-mono-code font-bold text-slate-900 mt-2 tracking-tight">
              {state.vendasRealizadas} pedidos
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-snug">
            Unidades vendidas: <span className="font-semibold text-slate-700">{state.unidadesVendidas}</span>
          </p>
        </div>

        {/* Card 4: COMISSÃO MÉDIA */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span>Comissão Média</span>
            </div>
            <div className="text-2xl font-mono-code font-bold text-slate-900 mt-2 tracking-tight">
              R$ {state.comissaoMedia.toFixed(2).replace(".", ",")}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-snug">
            Média de comissão recebida por pedido.
          </p>
        </div>

        {/* Card 5: CLIQUES / VISITAS */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <MousePointerClick className="w-4 h-4 text-slate-400" />
              <span>Cliques / Visitas</span>
            </div>
            <div className="text-2xl font-mono-code font-bold text-slate-900 mt-2 tracking-tight">
              {state.cliquesVisualizacoes.toLocaleString("pt-BR")}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-snug">
            Conversão média estimada de cliques em vendas.
          </p>
        </div>
      </div>

      {/* Regra de Liberação de Saldo Pendente (Banner em Destaque) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Regra de Liberação para Saque Shop GO & Shopee
                </h3>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  Política de Afiliados
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                Quando você realiza uma venda, a sua comissão fica retida temporariamente no <strong className="text-slate-800">Saldo Pendente a Receber</strong>. 
                Assim que o produto for recebido pelo cliente no endereço de entrega, o valor é liberado automaticamente para o seu Saldo Disponível para saque imediato via PIX.
              </p>
            </div>
          </div>

          {/* Simulation Button for testing */}
          {state.saldoPendente > 0 && (
            <button
              onClick={() => releaseDeliveredSale()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start md:self-auto"
              title="Simular cliente confirmando o recebimento da entrega"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Simular Entrega do Produto</span>
            </button>
          )}
        </div>

        {/* 3 Step Timeline of Delivery Release */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              1
            </div>
            <div className="text-xs leading-snug text-slate-600">
              <strong className="text-slate-800">Venda Realizada:</strong> Comissão entra no Saldo Pendente
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              2
            </div>
            <div className="text-xs leading-snug text-slate-600">
              <strong className="text-slate-800">Em Trânsito:</strong> Shopee Express transportando o pedido
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              3
            </div>
            <div className="text-xs leading-snug text-emerald-900">
              <strong className="text-emerald-950">Recebido pelo Cliente:</strong> Liberado para Saque PIX!
            </div>
          </div>
        </div>
      </div>

      {/* Solicitar Saque via PIX Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#EE4D2D]" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 font-display">
              Solicitar Saque via PIX
            </h2>
          </div>
          <div className="text-left sm:text-right text-xs">
            <span className="text-slate-500">Saldo Liberado: </span>
            <span className="font-mono-code font-bold text-emerald-600">
              R$ {state.saldoDisponivel.toFixed(2).replace(".", ",")}
            </span>
            {state.saldoPendente > 0 && (
              <span className="text-slate-500 ml-2">
                (R$ {state.saldoPendente.toFixed(2).replace(".", ",")} pendente a receber)
              </span>
            )}
          </div>
        </div>

        {/* Alert Banner: 30 days lock */}
        <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-semibold text-amber-950">Saque Indisponível:</span>{" "}
            <span>Você poderá solicitar o saque após 30 dias utilizando a plataforma. Faltam <strong>30 dias</strong> para liberar seus saques.</span>
            <div className="text-[11px] text-amber-800 mt-0.5">
              Para sacar antes, basta solicitar a antecipação porém terá uma taxa fixa de R$50,00
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleWithdrawClick} className="space-y-4 pt-1">
          {/* Valor a Sacar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                Valor a Sacar
              </label>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-emerald-700 font-medium">
                  Disponível: R$ {state.saldoDisponivel.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-slate-500">
                  Pendente: R$ {state.saldoPendente.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
            <div>
              <input
                type="text"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="R$ 0,00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 transition-colors"
              />
            </div>
            {state.saldoPendente > 0 && (
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 shrink-0 text-slate-400" />
                <span>
                  O saldo pendente a receber de <strong>R$ {state.saldoPendente.toFixed(2).replace(".", ",")}</strong> será liberado para saque assim que os pedidos forem recebidos pelos clientes.
                </span>
              </p>
            )}
          </div>

          {/* Tipo de Chave & Chave PIX Destinatária */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Tipo de Chave
              </label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20 cursor-pointer"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="Telefone">Telefone (Celular)</option>
                <option value="E-mail">E-mail</option>
                <option value="Aleatória">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Chave PIX destinatária
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#EE4D2D] focus:ring-1 focus:ring-[#EE4D2D]/20"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Solicitar Saque via PIX</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAntecipationModal(true)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Solicitar Antecipação (Taxa R$ 50,00)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Real-time Transactions Statement */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900 text-sm font-display">
              Extrato de Vendas e Comissões em Tempo Real
            </h3>
          </div>

          {/* Filters: Todos / Pendente a Receber / Liberado */}
          <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/60">
            <button
              onClick={() => setFilterStatus("todos")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterStatus === "todos"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Todos ({state.transactions.length})
            </button>
            <button
              onClick={() => setFilterStatus("pendente")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterStatus === "pendente"
                  ? "bg-white text-amber-800 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-amber-800"
              }`}
            >
              Pendentes ({state.transactions.filter(t => t.status === "pendente").length})
            </button>
            <button
              onClick={() => setFilterStatus("liberado")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterStatus === "liberado"
                  ? "bg-white text-emerald-800 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-emerald-800"
              }`}
            >
              Liberados ({state.transactions.filter(t => t.status === "concluido").length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 font-medium text-[11px]">
                <th className="py-2.5 px-3 font-normal">Data / Hora</th>
                <th className="py-2.5 px-3 font-normal">Produto / Origem</th>
                <th className="py-2.5 px-3 font-normal">Canal</th>
                <th className="py-2.5 px-3 text-right font-normal">Comissão Pix</th>
                <th className="py-2.5 px-3 text-right font-normal">Status do Saque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 text-slate-500 font-mono-code whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-3 text-slate-900 font-medium">
                    <div>{tx.product}</div>
                    {tx.deliveryNote && (
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        {tx.deliveryNote}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {tx.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono-code font-semibold text-emerald-600 whitespace-nowrap">
                    +{tx.amount >= 0 ? `R$ ${tx.amount.toFixed(2).replace(".", ",")}` : `-R$ ${Math.abs(tx.amount).toFixed(2).replace(".", ",")}`}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {tx.status === "pendente" ? (
                      <div className="inline-flex flex-col items-end gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendente a Receber
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Liberado assim que o cliente receber
                        </span>
                      </div>
                    ) : tx.type === "saque" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Saque Realizado
                      </span>
                    ) : (
                      <div className="inline-flex flex-col items-end gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Liberado p/ Saque
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Produto recebido pelo cliente
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Antecipation Modal */}
      {showAntecipationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg border border-slate-200/90 space-y-4">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 font-display">
                Antecipação de Saque Shop GO
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Conforme a política de segurança, novos usuários têm o período de 30 dias para liberação do primeiro saque sem taxas.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Saldo Disponível:</span>
                <span className="text-emerald-700 font-semibold font-mono-code">R$ {state.saldoDisponivel.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Saldo Pendente a Receber:</span>
                <span className="text-slate-800 font-semibold font-mono-code">R$ {state.saldoPendente.toFixed(2).replace(".", ",")}</span>
              </div>
              <p className="text-[10px] text-slate-500 italic pt-0.5">
                *O saldo pendente é liberado assim que o produto for recebido pelo cliente.
              </p>
              <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                <span>Taxa Fixa de Antecipação:</span>
                <span className="font-semibold text-rose-600 font-mono-code">- R$ 50,00</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-semibold text-slate-900">
                <span>Chave Pix:</span>
                <span className="font-mono-code">{pixKey}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAntecipationModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAntecipate}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-[#EE4D2D] hover:bg-[#E03A17] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isProcessing ? "Solicitando..." : "Confirmar Antecipação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
