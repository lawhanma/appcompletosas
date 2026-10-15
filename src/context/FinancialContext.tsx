import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PRODUCTS } from "../data/mockData";
import { internalDb } from "../utils/internalDb";

export interface Transaction {
  id: string;
  date: string;
  timestamp: number;
  product: string;
  channel: string;
  saleAmount: number; // Valor bruto da venda (faturamento)
  amount: number;     // Valor líquido da comissão
  type: "comissao" | "saque" | "divulgacao";
  status: "concluido" | "processando" | "pendente";
  deliveryStatus?: "aguardando_entrega" | "entregue_ao_cliente" | "saque_realizado";
  deliveryNote?: string;
  imageUrl?: string;
}

export interface FinancialState {
  userEmail: string;
  userCode: "101190" | "887422" | "123456" | "12456" | string;
  faturamentoDiario: number;       // Faturamento bruto do dia (adiciona até R$ 3.000 para 123456)
  metaFaturamentoDiario: number;   // Meta diária (3000.00 para 123456, 0.00 para 101190 e 887422)
  faturamentoMes: number;          // Faturamento acumulado no mês
  saldoDisponivel: number;         // Saldo liberado para saque imediato (entregue ao cliente)
  saldoPendente: number;           // Saldo pendente a receber (em trânsito)
  vendasRealizadas: number;
  pedidosHoje: number;
  unidadesVendidas: number;
  cliquesVisualizacoes: number;
  comissaoMedia: number;
  totalWithdrawn: number;
  transactions: Transaction[];
  lastDripTimestamp: number;
  dailyAccumulated: number;
  currentDayString: string;
  aiCredits: number;
  hasDoneDivulgacao?: boolean;     // Indica se já realizou divulgação no dia
  firstAccessAt: number;           // Timestamp do primeiro acesso do lead
}

export const FIVE_HOURS_MS = 5 * 60 * 60 * 1000; // 5 horas em milissegundos
export const MAX_DAILY_COMMISSION_101190 = 0.00; // Nos códigos padrão (101190 e 887422) não entra nenhuma venda (R$ 0,00)

interface FinancialContextType {
  state: FinancialState;
  userCode: string;
  userEmail: string;
  isVip: boolean;
  isWarmupPhase: boolean;
  warmupHoursRemaining: number;
  fastForwardWarmup: () => void;
  setUserCode: (code: string, isNewLogin?: boolean, email?: string) => void;
  setUserEmail: (email: string) => void;
  addCommission: (amount: number, product: string, channel: string, type?: "comissao" | "divulgacao", saleAmount?: number) => void;
  simulateLiveSale: () => void;
  consumeAiCredit: () => boolean;
  requestWithdrawal: (amount: number, pixKey: string, keyType: string) => Promise<boolean>;
  resetToInitial: () => void;
  releaseDeliveredSale: (transactionId?: string) => void;
  lastSaleNotification: { 
    product: string; 
    saleAmount?: number;
    amount: number; 
    time: string; 
    status?: "pendente" | "liberado";
    message?: string;
  } | null;
  clearNotification: () => void;
}

const STORAGE_KEY = "shopnext_financial_v8";

export const getSavedAuthEmail = (): string => {
  try {
    const session = internalDb.getActiveSession();
    if (session?.userEmail) return session.userEmail;
    const auth = localStorage.getItem("shopnext_auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      if (parsed.email) return parsed.email;
    }
  } catch (e) {
    // ignore
  }
  return "";
};

const getTodayString = () => new Date().toISOString().split("T")[0];

// Clean initial state for new logins:
// "no codigo de compra 101190 e só para ter 30 reais por dia de vendas, mas só entrar um saldo na dashboard depois de umas 5 horas do primeiro acesso da pessoa quando ela entrou pela primeira vez, porque, tipo quando a pessoa entrar já entrar venda não dá entende"
export const createCleanState = (code: string, email?: string, initialFirstAccess?: number): FinancialState => {
  const cleanCode = code.trim();
  const isVip = cleanCode === "123456" || cleanCode === "12456";
  const userEmail = email || getSavedAuthEmail() || "";

  // Recupera timestamp do primeiro acesso do lead
  const persistedFirstAccess = internalDb.getFirstAccessAt(userEmail, cleanCode);
  const firstAccessAt = initialFirstAccess || persistedFirstAccess || Date.now();
  if (!persistedFirstAccess) {
    internalDb.setFirstAccessAt(userEmail, cleanCode, firstAccessAt);
  }

  return {
    userEmail,
    userCode: cleanCode,
    faturamentoDiario: 0.00,
    metaFaturamentoDiario: isVip ? 3000.00 : 0.00,
    faturamentoMes: 0.00,
    saldoDisponivel: 0.00, // Saldo inicial zerado
    saldoPendente: 0.00,   // Saldo pendente inicial zerado
    vendasRealizadas: 0,
    pedidosHoje: 0,
    unidadesVendidas: 0,
    cliquesVisualizacoes: 0,
    comissaoMedia: 0.00,
    totalWithdrawn: 0.00,
    dailyAccumulated: 0.00, // Comissões do dia zeradas
    currentDayString: getTodayString(),
    lastDripTimestamp: Date.now(),
    aiCredits: isVip ? 5 : 4,
    hasDoneDivulgacao: false,
    firstAccessAt,
    transactions: []
  };
};

const INITIAL_101190: FinancialState = createCleanState("101190");
const INITIAL_123456: FinancialState = createCleanState("123456");

const FinancialContext = createContext<FinancialContextType | null>(null);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinancialState>(() => {
    try {
      const activeSession = internalDb.getActiveSession();
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (activeSession && activeSession.purchaseCode) {
          parsed.userCode = activeSession.purchaseCode;
          if (activeSession.userEmail) parsed.userEmail = activeSession.userEmail;
        }
        const isVip = parsed.userCode === "123456" || parsed.userCode === "12456";
        const today = getTodayString();
        if (parsed.currentDayString !== today) {
          parsed.currentDayString = today;
          parsed.dailyAccumulated = 0;
          parsed.pedidosHoje = 0;
          parsed.faturamentoDiario = 0;
          parsed.aiCredits = isVip ? 5 : 4;
          parsed.hasDoneDivulgacao = false;
        }
        if (typeof parsed.saldoDisponivel !== "number") parsed.saldoDisponivel = 0;
        if (typeof parsed.saldoPendente !== "number") parsed.saldoPendente = 0;
        if (typeof parsed.dailyAccumulated !== "number") parsed.dailyAccumulated = 0;
        
        parsed.metaFaturamentoDiario = isVip ? 3000.00 : 0.00;

        // Recupera primeiro acesso persistido do lead
        const firstAccess = parsed.firstAccessAt || internalDb.getFirstAccessAt(parsed.userEmail || "", parsed.userCode || "");
        parsed.firstAccessAt = firstAccess || Date.now();

        // Regra estrita: Nos códigos 101190 e 887422 não entra NENHUMA venda, saldo ou faturamento!
        if (!isVip || parsed.userCode === "101190" || parsed.userCode === "887422") {
          parsed.saldoDisponivel = 0.00;
          parsed.saldoPendente = 0.00;
          parsed.faturamentoDiario = 0.00;
          parsed.faturamentoMes = 0.00;
          parsed.dailyAccumulated = 0.00;
          parsed.pedidosHoje = 0;
          parsed.vendasRealizadas = 0;
          parsed.unidadesVendidas = 0;
          parsed.metaFaturamentoDiario = 0.00;
          parsed.transactions = [];
        }

        return parsed;
      } else if (activeSession && activeSession.purchaseCode) {
        return createCleanState(activeSession.purchaseCode, activeSession.userEmail);
      }
    } catch (e) {
      console.error("Error reading financial state from localStorage:", e);
    }
    return INITIAL_101190;
  });

  const [lastSaleNotification, setLastSaleNotification] = useState<{
    product: string;
    saleAmount?: number;
    amount: number; 
    time: string; 
    status?: "pendente" | "liberado";
    message?: string;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error saving financial state:", e);
    }
  }, [state]);

  const clearNotification = useCallback(() => {
    setLastSaleNotification(null);
  }, []);

  const isVip = state.userCode === "123456" || state.userCode === "12456";

  const isWarmupPhase = false;
  const warmupHoursRemaining = 0;

  const fastForwardWarmup = useCallback(() => {}, []);

  // Add commission function:
  // "No codigo de compra 101190 na verdade não e para entrar nenhuma venda ok?"
  const addCommission = useCallback((
    amount: number, 
    product: string, 
    channel: string, 
    type: "comissao" | "divulgacao" = "comissao",
    saleAmount?: number
  ) => {
    setState((prev) => {
      const isVipUser = prev.userCode === "123456" || prev.userCode === "12456";
      const isDivulgacao = type === "divulgacao";
      
      // Regra estrita: Nos códigos 101190 e 887422 NÃO entra nenhuma venda ou faturamento financeiro
      if (!isVipUser || prev.userCode === "101190" || prev.userCode === "887422") {
        return {
          ...prev,
          hasDoneDivulgacao: true,
          cliquesVisualizacoes: prev.cliquesVisualizacoes + Math.floor(Math.random() * 25 + 12)
        };
      }

      let finalAmount = amount;
      const actualSaleAmount = saleAmount || (finalAmount * 6.5);
      const cap = 3000.00;
      const newFaturamento = Math.min(cap, Number((prev.faturamentoDiario + actualSaleAmount).toFixed(2)));
      
      const newSaldoDisponivel = isDivulgacao 
        ? Number((prev.saldoDisponivel + finalAmount).toFixed(2)) 
        : prev.saldoDisponivel;
      const newSaldoPendente = isDivulgacao 
        ? prev.saldoPendente 
        : Number((prev.saldoPendente + finalAmount).toFixed(2));

      const newVendas = prev.vendasRealizadas + 1;
      const newPedidos = prev.pedidosHoje + 1;
      const newUnidades = prev.unidadesVendidas + 1;
      const newCliques = prev.cliquesVisualizacoes + Math.floor(Math.random() * 25 + 12);
      const totalGeral = newSaldoDisponivel + newSaldoPendente;
      const newMedia = Number((totalGeral / (newVendas || 1)).toFixed(2));
      const newDaily = Number((prev.dailyAccumulated + finalAmount).toFixed(2));

      const now = new Date();
      const timeStr = `Hoje às ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      const newTx: Transaction = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        date: timeStr,
        timestamp: Date.now(),
        product,
        channel,
        saleAmount: actualSaleAmount,
        amount: finalAmount,
        type,
        status: isDivulgacao ? "concluido" : "pendente",
        deliveryStatus: isDivulgacao ? "entregue_ao_cliente" : "aguardando_entrega",
        deliveryNote: isDivulgacao 
          ? "Comissão de divulgação automática creditada no Saldo Disponível para saque imediato" 
          : "Aguardando recebimento do produto pelo cliente para liberar para saque"
      };

      setLastSaleNotification({
        product,
        saleAmount: actualSaleAmount,
        amount: finalAmount,
        time: timeStr,
        status: isDivulgacao ? "concluido" : "pendente",
        message: isDivulgacao 
          ? `Comissão de R$ ${finalAmount.toFixed(2).replace(".", ",")} creditada no seu Saldo Disponível!` 
          : `Nova comissão (+R$ ${finalAmount.toFixed(2).replace(".", ",")}) adicionada ao Saldo Pendente a Receber.`
      });

      return {
        ...prev,
        faturamentoDiario: newFaturamento,
        saldoDisponivel: newSaldoDisponivel,
        saldoPendente: newSaldoPendente,
        vendasRealizadas: newVendas,
        pedidosHoje: newPedidos,
        unidadesVendidas: newUnidades,
        cliquesVisualizacoes: newCliques,
        comissaoMedia: newMedia,
        dailyAccumulated: newDaily,
        hasDoneDivulgacao: true,
        lastDripTimestamp: Date.now(),
        transactions: [newTx, ...prev.transactions.slice(0, 39)]
      };
    });
  }, []);

  // Simulate a live sale (adds to faturamentoDiario up to 3000 for VIP only)
  const simulateLiveSale = useCallback(() => {
    setState((prev) => {
      const isVipUser = prev.userCode === "123456" || prev.userCode === "12456";
      if (!isVipUser || prev.userCode === "101190" || prev.userCode === "887422") {
        return prev;
      }

      const cap = 3000.00;
      if (prev.faturamentoDiario >= cap) {
        setLastSaleNotification({
          product: "Meta Diária Atingida!",
          amount: 0,
          time: "Hoje",
          status: "liberado",
          message: `Parabéns! Sua meta diária de R$ ${cap.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de faturamento foi atingida!`
        });
        return prev;
      }

      const randomProd = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const rawSale = Number((Math.random() * 85 + 49).toFixed(2));
      const saleVal = Math.min(rawSale, Number((cap - prev.faturamentoDiario).toFixed(2)));
      if (saleVal <= 0) return prev;

      const commVal = Number((saleVal * (randomProd.commissionRate ? randomProd.commissionRate / 100 : 0.15)).toFixed(2));

      const channels = ["Shopee Afiliados", "TikTok Shop", "Grupos WhatsApp VIP", "Instagram Reels", "Kwai"];
      const channel = channels[Math.floor(Math.random() * channels.length)];

      const now = new Date();
      const timeStr = `Hoje às ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      const newTx: Transaction = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        date: timeStr,
        timestamp: Date.now(),
        product: randomProd.name,
        channel,
        saleAmount: saleVal,
        amount: commVal,
        type: "comissao",
        status: "pendente",
        deliveryStatus: "aguardando_entrega",
        deliveryNote: "Aguardando recebimento do produto pelo cliente para liberar para saque",
        imageUrl: randomProd.imageUrl
      };

      setLastSaleNotification({
        product: randomProd.name,
        saleAmount: saleVal,
        amount: commVal,
        time: timeStr,
        status: "pendente",
        message: `Venda de R$ ${saleVal.toFixed(2).replace(".", ",")}! Comissão de R$ ${commVal.toFixed(2).replace(".", ",")} adicionada ao Saldo Pendente.`
      });

      return {
        ...prev,
        faturamentoDiario: Number((prev.faturamentoDiario + saleVal).toFixed(2)),
        saldoPendente: Number((prev.saldoPendente + commVal).toFixed(2)),
        pedidosHoje: prev.pedidosHoje + 1,
        vendasRealizadas: prev.vendasRealizadas + 1,
        unidadesVendidas: prev.unidadesVendidas + 1,
        cliquesVisualizacoes: prev.cliquesVisualizacoes + Math.floor(Math.random() * 18 + 8),
        dailyAccumulated: Number((prev.dailyAccumulated + commVal).toFixed(2)),
        lastDripTimestamp: Date.now(),
        transactions: [newTx, ...prev.transactions.slice(0, 39)]
      };
    });
  }, []);

  // Release a pending sale when product is received by client:
  // Moves value from saldoPendente to saldoDisponivel!
  const releaseDeliveredSale = useCallback((transactionId?: string) => {
    setState(prev => {
      // Find pending transaction to deliver
      const pendingIndex = transactionId 
        ? prev.transactions.findIndex(t => t.id === transactionId && t.status === "pendente")
        : prev.transactions.findIndex(t => t.status === "pendente");

      if (pendingIndex === -1) return prev;

      const targetTx = prev.transactions[pendingIndex];
      const releaseAmount = targetTx.amount;

      const updatedTx: Transaction = {
        ...targetTx,
        status: "concluido",
        deliveryStatus: "entregue_ao_cliente",
        deliveryNote: "Produto entregue ao cliente - Saldo liberado para saque via PIX"
      };

      const updatedTransactions = [...prev.transactions];
      updatedTransactions[pendingIndex] = updatedTx;

      const newPendente = Math.max(0, Number((prev.saldoPendente - releaseAmount).toFixed(2)));
      const newDisponivel = Number((prev.saldoDisponivel + releaseAmount).toFixed(2));

      setLastSaleNotification({
        product: targetTx.product,
        amount: releaseAmount,
        time: "Agora",
        status: "liberado",
        message: `📦 Produto entregue ao cliente! +R$ ${releaseAmount.toFixed(2).replace(".", ",")} liberados para saque imediato via PIX!`
      });

      return {
        ...prev,
        saldoPendente: newPendente,
        saldoDisponivel: newDisponivel,
        transactions: updatedTransactions
      };
    });
  }, []);

  // Switch User Code & New Login handler
  // "quando você identificar um login novo o saldo tem que estar zerado ok? Ai vai colocando aos poucos entendeu"
  const setUserCode = useCallback((code: string, isNewLogin: boolean = true, email?: string) => {
    const clean = code.trim();
    const finalEmail = email || state.userEmail || getSavedAuthEmail() || "";
    if (isNewLogin) {
      const cleanState = createCleanState(clean, finalEmail);
      setState(cleanState);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
      } catch (e) {
        // ignore
      }
      return;
    }
    setState(prev => ({ ...prev, userCode: clean, userEmail: finalEmail || prev.userEmail }));
  }, [state.userEmail]);

  const setUserEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, userEmail: email }));
  }, []);

  const consumeAiCredit = useCallback(() => {
    if (state.aiCredits <= 0) return false;
    setState(prev => ({ ...prev, aiCredits: Math.max(0, prev.aiCredits - 1) }));
    return true;
  }, [state.aiCredits]);

  const requestWithdrawal = useCallback(async (amount: number, pixKey: string, keyType: string) => {
    if (amount <= 0 || amount > state.saldoDisponivel) return false;
    
    setState(prev => {
      const newSaldo = Number((prev.saldoDisponivel - amount).toFixed(2));
      const newTx: Transaction = {
        id: `SQ-${Date.now().toString().slice(-6)}`,
        date: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        timestamp: Date.now(),
        product: `Saque Pix (${keyType}: ${pixKey})`,
        channel: "Transferência Pix",
        saleAmount: 0,
        amount: -amount,
        type: "saque",
        status: "concluido",
        deliveryStatus: "saque_realizado",
        deliveryNote: "Transferência Pix enviada para a conta bancária"
      };
      return {
        ...prev,
        saldoDisponivel: newSaldo,
        totalWithdrawn: Number((prev.totalWithdrawn + amount).toFixed(2)),
        transactions: [newTx, ...prev.transactions]
      };
    });
    return true;
  }, [state.saldoDisponivel]);

  const resetToInitial = useCallback(() => {
    const cleanState = createCleanState(state.userCode || "123456", state.userEmail);
    setState(cleanState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
    } catch (e) {
      // ignore
    }
  }, [state.userCode, state.userEmail]);

  // Real-time sale drip throughout the day:
  // VIP 123456: adiciona até R$ 3.000,00 de faturamento
  // Standard 101190: Só entra vendas DEPOIS de 5 horas do primeiro acesso, limitado a R$ 30,00 de comissão por dia!
  useEffect(() => {
    const isVipUser = state.userCode === "123456" || state.userCode === "12456";

    const timer = setInterval(() => {
      setState(current => {
        const today = getTodayString();
        const isCurrentVip = current.userCode === "123456" || current.userCode === "12456";

        if (!isCurrentVip || current.userCode === "101190" || current.userCode === "887422") {
          // Regra estrita: Nos códigos de compra 101190 e 887422 não entra nenhuma venda ou faturamento
          return current;
        }

        // Caso VIP: até 3.000,00 de faturamento
        const cap = 3000.00;
        if (current.faturamentoDiario >= cap) {
          return current;
        }

        const randomProd = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const rawSale = Number((Math.random() * 85 + 49).toFixed(2));
        const cappedSale = Math.min(rawSale, Number((cap - current.faturamentoDiario).toFixed(2)));
        if (cappedSale <= 0) return current;

        const commRate = randomProd.commissionRate ? randomProd.commissionRate / 100 : 0.15;
        const commAmount = Number((cappedSale * commRate).toFixed(2));

        // New sale enters into Saldo Pendente (awaiting delivery)
        const newSaldoPendente = Number((current.saldoPendente + commAmount).toFixed(2));
        const newFaturamento = Number((current.faturamentoDiario + cappedSale).toFixed(2));
        const newVendas = current.vendasRealizadas + 1;
        const newPedidos = current.pedidosHoje + 1;
        const newUnidades = current.unidadesVendidas + 1;
        const newCliques = current.cliquesVisualizacoes + Math.floor(Math.random() * 25 + 10);
        const totalGeral = current.saldoDisponivel + newSaldoPendente;
        const newMedia = Number((totalGeral / (newVendas || 1)).toFixed(2));
        const channels = ["TikTok Shop", "Shopee Afiliados", "Instagram", "WhatsApp VIP", "Kwai"];
        const channel = channels[Math.floor(Math.random() * channels.length)];

        const now = new Date();
        const timeStr = `Hoje às ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const newTx: Transaction = {
          id: `TX-${Date.now().toString().slice(-6)}`,
          date: timeStr,
          timestamp: Date.now(),
          product: randomProd.name,
          channel,
          saleAmount: cappedSale,
          amount: commAmount,
          type: "comissao",
          status: "pendente",
          deliveryStatus: "aguardando_entrega",
          deliveryNote: "Aguardando recebimento do produto pelo cliente para liberar para saque",
          imageUrl: randomProd.imageUrl
        };

        setLastSaleNotification({
          product: randomProd.name,
          saleAmount: cappedSale,
          amount: commAmount,
          time: timeStr,
          status: "pendente",
          message: `Nova venda registrada! +R$ ${cappedSale.toFixed(2).replace(".", ",")} de faturamento. Comissão (+R$ ${commAmount.toFixed(2).replace(".", ",")}) em Saldo Pendente.`
        });

        return {
          ...current,
          currentDayString: today,
          faturamentoDiario: newFaturamento,
          saldoPendente: newSaldoPendente,
          pedidosHoje: newPedidos,
          vendasRealizadas: newVendas,
          unidadesVendidas: newUnidades,
          cliquesVisualizacoes: newCliques,
          comissaoMedia: newMedia,
          dailyAccumulated: Number((current.dailyAccumulated + commAmount).toFixed(2)),
          lastDripTimestamp: Date.now(),
          transactions: [newTx, ...current.transactions.slice(0, 39)]
        };
      });
    }, isVipUser ? 11000 : 18000);

    return () => clearInterval(timer);
  }, [state.userCode]);

  // Automated delivery release timer:
  // "assim que o produto for recebido pelo cliente vai ser liberado para saque"
  // "vai colocando aos poucos entendeu"
  // Automatically delivers pending orders periodically and converts them into available balance
  useEffect(() => {
    const deliveryTimer = setInterval(() => {
      setState(current => {
        const isCurrentVip = current.userCode === "123456" || current.userCode === "12456";
        if (!isCurrentVip || current.userCode === "101190" || current.userCode === "887422") {
          return current;
        }

        // Find oldest pending transaction
        const pendingIndices = current.transactions
          .map((t, idx) => ({ t, idx }))
          .filter(item => item.t.status === "pendente");

        if (pendingIndices.length === 0) return current;

        // Deliver the oldest pending transaction
        const target = pendingIndices[pendingIndices.length - 1];
        const targetTx = target.t;
        const releaseAmount = targetTx.amount;

        const updatedTx: Transaction = {
          ...targetTx,
          status: "concluido",
          deliveryStatus: "entregue_ao_cliente",
          deliveryNote: "Produto entregue ao cliente - Saldo liberado para saque via PIX"
        };

        const updatedTransactions = [...current.transactions];
        updatedTransactions[target.idx] = updatedTx;

        const newPendente = Math.max(0, Number((current.saldoPendente - releaseAmount).toFixed(2)));
        const newDisponivel = Number((current.saldoDisponivel + releaseAmount).toFixed(2));

        setLastSaleNotification({
          product: targetTx.product,
          amount: releaseAmount,
          time: "Agora",
          status: "liberado",
          message: `📦 Produto entregue ao cliente! +R$ ${releaseAmount.toFixed(2).replace(".", ",")} liberados para saque imediato via PIX!`
        });

        return {
          ...current,
          saldoPendente: newPendente,
          saldoDisponivel: newDisponivel,
          transactions: updatedTransactions
        };
      });
    }, 22000);

    return () => clearInterval(deliveryTimer);
  }, []);

  return (
    <FinancialContext.Provider
      value={{
        state,
        userCode: state.userCode,
        userEmail: state.userEmail,
        isVip,
        isWarmupPhase,
        warmupHoursRemaining,
        fastForwardWarmup,
        setUserCode,
        setUserEmail,
        addCommission,
        simulateLiveSale,
        consumeAiCredit,
        requestWithdrawal,
        resetToInitial,
        releaseDeliveredSale,
        lastSaleNotification,
        clearNotification
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancial must be used within a FinancialProvider");
  }
  return context;
};
