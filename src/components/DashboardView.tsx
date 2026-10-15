import React, { useState, useMemo } from "react";
import { Product, NavTab } from "../types";
import { PRODUCTS } from "../data/mockData";
import { 
  TrendingUp, 
  DollarSign, 
  MousePointerClick, 
  ArrowUpRight, 
  Share2, 
  Package, 
  Video,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShoppingBag,
  Truck,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { useFinancial } from "../context/FinancialContext";

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab, product?: Product) => void;
}

type PeriodFilter = "hoje" | "ontem" | "7dias" | "mes";
type ChartMetric = "faturamento" | "comissoes" | "pedidos";

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { 
    state, 
    isVip, 
    isWarmupPhase, 
    warmupHoursRemaining, 
    fastForwardWarmup, 
    userCode: _userCode, 
    simulateLiveSale: _simulateLiveSale, 
    releaseDeliveredSale 
  } = useFinancial();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("hoje");
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>("faturamento");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: string } | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Metrics based on selected period (zeros during 5h warmup for standard code 101190)
  const displayFaturamento = useMemo(() => {
    if (isWarmupPhase) return 0.00;
    if (selectedPeriod === "hoje") return state.faturamentoDiario;
    if (selectedPeriod === "ontem") return isVip ? 2840.00 : 30.00;
    if (selectedPeriod === "7dias") return isVip ? 18650.00 : 180.00;
    return state.faturamentoMes;
  }, [selectedPeriod, state.faturamentoDiario, state.faturamentoMes, isVip, isWarmupPhase]);

  const displayComissoes = useMemo(() => {
    if (isWarmupPhase) return 0.00;
    const totalComissao = state.saldoDisponivel + state.saldoPendente;
    if (selectedPeriod === "hoje") return totalComissao;
    if (selectedPeriod === "ontem") return isVip ? 426.00 : 30.00;
    if (selectedPeriod === "7dias") return isVip ? 2790.00 : 120.00;
    return isVip ? 15370.50 : 210.00;
  }, [selectedPeriod, state.saldoDisponivel, state.saldoPendente, isVip, isWarmupPhase]);

  const displayPedidos = useMemo(() => {
    if (isWarmupPhase) return 0;
    if (selectedPeriod === "hoje") return state.pedidosHoje;
    if (selectedPeriod === "ontem") return isVip ? 36 : 3;
    if (selectedPeriod === "7dias") return isVip ? 245 : 12;
    return state.vendasRealizadas;
  }, [selectedPeriod, state.pedidosHoje, state.vendasRealizadas, isVip, isWarmupPhase]);

  // Hourly curve for chart (00h, 04h, 08h, 12h, 16h, 20h, 23h)
  const chartData = useMemo(() => {
    const faturamentoNow = isWarmupPhase ? 0 : state.faturamentoDiario;
    const pedidosNow = isWarmupPhase ? 0 : state.pedidosHoje;
    return [
      { hour: "00:00", faturamento: faturamentoNow * 0.05, comissoes: (faturamentoNow * 0.05) * 0.15, pedidos: faturamentoNow === 0 ? 0 : Math.round(pedidosNow * 0.05) },
      { hour: "04:00", faturamento: faturamentoNow * 0.08, comissoes: (faturamentoNow * 0.08) * 0.15, pedidos: faturamentoNow === 0 ? 0 : Math.round(pedidosNow * 0.08) },
      { hour: "08:00", faturamento: faturamentoNow * 0.24, comissoes: (faturamentoNow * 0.24) * 0.15, pedidos: faturamentoNow === 0 ? 0 : Math.round(pedidosNow * 0.24) },
      { hour: "12:00", faturamento: faturamentoNow * 0.49, comissoes: (faturamentoNow * 0.49) * 0.15, pedidos: faturamentoNow === 0 ? 0 : Math.round(pedidosNow * 0.49) },
      { hour: "16:00", faturamento: faturamentoNow * 0.75, comissoes: (faturamentoNow * 0.75) * 0.15, pedidos: faturamentoNow === 0 ? 0 : Math.round(pedidosNow * 0.75) },
      { hour: "20:00", faturamento: faturamentoNow * 0.91, comissoes: (faturamentoNow * 0.91) * 0.15, pedidos: faturamentoNow === 0 ? 0 : Math.round(pedidosNow * 0.91) },
      { hour: "23:59", faturamento: faturamentoNow, comissoes: faturamentoNow * 0.15, pedidos: pedidosNow }
    ];
  }, [state.faturamentoDiario, state.pedidosHoje, isWarmupPhase]);

  // SVG Chart path calculation
  const maxChartVal = useMemo(() => {
    if (selectedMetric === "faturamento") return Math.max(3000, state.faturamentoDiario * 1.15);
    if (selectedMetric === "comissoes") return Math.max(450, (state.saldoDisponivel + state.saldoPendente) * 1.15);
    return Math.max(35, state.pedidosHoje * 1.25);
  }, [selectedMetric, state.faturamentoDiario, state.saldoDisponivel, state.saldoPendente, state.pedidosHoje]);

  const svgCoordinates = useMemo(() => {
    const width = 600;
    const height = 180;
    const paddingX = 25;
    const paddingY = 25;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingY * 2;

    return chartData.map((pt, idx) => {
      const val = selectedMetric === "faturamento" 
        ? pt.faturamento 
        : selectedMetric === "comissoes" 
          ? pt.comissoes 
          : pt.pedidos;
      const x = paddingX + (idx / (chartData.length - 1)) * plotWidth;
      const y = height - paddingY - (val / (maxChartVal || 1)) * plotHeight;
      return { x, y, label: pt.hour, val };
    });
  }, [chartData, selectedMetric, maxChartVal]);

  const svgPathArea = useMemo(() => {
    if (svgCoordinates.length === 0) return "";
    const first = svgCoordinates[0];
    const last = svgCoordinates[svgCoordinates.length - 1];
    let d = `M ${first.x},${first.y}`;
    for (let i = 1; i < svgCoordinates.length; i++) {
      const prev = svgCoordinates[i - 1];
      const cur = svgCoordinates[i];
      const cx1 = prev.x + (cur.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (cur.x - prev.x) / 2;
      const cy2 = cur.y;
      d += ` C ${cx1},${cy1} ${cx2},${cy2} ${cur.x},${cur.y}`;
    }
    d += ` L ${last.x},155 L ${first.x},155 Z`;
    return d;
  }, [svgCoordinates]);

  const svgPathLine = useMemo(() => {
    if (svgCoordinates.length === 0) return "";
    const first = svgCoordinates[0];
    let d = `M ${first.x},${first.y}`;
    for (let i = 1; i < svgCoordinates.length; i++) {
      const prev = svgCoordinates[i - 1];
      const cur = svgCoordinates[i];
      const cx1 = prev.x + (cur.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (cur.x - prev.x) / 2;
      const cy2 = cur.y;
      d += ` C ${cx1},${cy1} ${cx2},${cy2} ${cur.x},${cur.y}`;
    }
    return d;
  }, [svgCoordinates]);

  // Daily target calculation
  const metaDiaria = isVip ? 3000.00 : 180.00;
  const percentMeta = Math.min(100, (state.faturamentoDiario / metaDiaria) * 100);
  const remainingMeta = Math.max(0, metaDiaria - state.faturamentoDiario);

  const formatCurrency = (val: number) => {
    if (hideValues) return "R$ ••••••";
    return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar: Clean & Minimalist */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
              Dashboard
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Shopee Open Platform Conectada</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Métricas de desempenho, faturamento e comissões consolidadas da sua operação de afiliado.
          </p>
        </div>

        {/* Action Controls: Period Filter & Tools */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented Filter Control */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60 text-xs font-medium">
            <button
              onClick={() => setSelectedPeriod("hoje")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedPeriod === "hoje"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setSelectedPeriod("ontem")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedPeriod === "ontem"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ontem
            </button>
            <button
              onClick={() => setSelectedPeriod("7dias")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedPeriod === "7dias"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setSelectedPeriod("mes")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedPeriod === "mes"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Este Mês
            </button>
          </div>

          {/* Toggle Privacy */}
          <button
            onClick={() => setHideValues(!hideValues)}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            title={hideValues ? "Mostrar valores" : "Ocultar valores"}
            aria-label="Alternar visualização de valores"
          >
            {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            title="Atualizar dados em tempo real"
            aria-label="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#EE4D2D]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Warmup Phase Notice for Code 101190 */}
      {isWarmupPhase && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Conta em Período de Aquecimento IA (Primeiras 5 Horas)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-mono-code font-bold">
                  Restam ~{warmupHoursRemaining}h
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Código 101190: para garantir conformidade e indexação natural de tráfego, as vendas e o saldo (até R$ 30,00 por dia) começarão a entrar na dashboard após 5 horas do seu primeiro acesso.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fastForwardWarmup}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-2xs"
            title="Acelerar 5 horas para testar a entrada de saldo e vendas imediatamente"
          >
            Avançar 5 Horas (Teste) ⚡
          </button>
        </div>
      )}

      {/* 4 Core High-Impact KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento do Dia */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Faturamento {selectedPeriod === "hoje" ? "Hoje" : selectedPeriod === "ontem" ? "Ontem" : selectedPeriod === "7dias" ? "Últimos 7 dias" : "do Mês"}
              </span>
              <div className="w-7 h-7 rounded-md bg-orange-50 text-[#EE4D2D] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <div className="text-2xl font-mono-code font-bold text-slate-900 mt-2 tracking-tight">
              {formatCurrency(displayFaturamento)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            {selectedPeriod === "hoje" ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Meta diária: <strong className="text-slate-800 font-mono-code">{formatCurrency(metaDiaria)}</strong>
                  </span>
                  <span className="font-mono-code font-semibold text-slate-900">
                    {percentMeta.toFixed(1)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#EE4D2D] h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${percentMeta}%` }}
                  />
                </div>
                {isVip && remainingMeta > 0 && (
                  <div className="text-[10px] text-slate-400 pt-0.5">
                    Faltam <span className="font-mono-code font-semibold text-slate-700">{formatCurrency(remainingMeta)}</span> para a meta
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+34.6% vs período anterior</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Saldo & Comissões Estimadas */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Comissões & Saldo
              </span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl font-mono-code font-bold text-slate-900 mt-2 tracking-tight">
              {formatCurrency(displayComissoes)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                Disponível p/ Saque:
              </span>
              <span className="font-mono-code font-semibold text-emerald-700">
                {formatCurrency(state.saldoDisponivel)}
              </span>
            </div>
            <div className="flex items-center justify-between" title="Liberado automaticamente assim que o produto for entregue ao cliente">
              <span className="text-slate-600 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                Pendente a receber:
              </span>
              <span className="font-mono-code font-semibold text-slate-800">
                {formatCurrency(state.saldoPendente)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pedidos Realizados */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Pedidos Realizados
              </span>
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl font-mono-code font-bold text-slate-900 mt-2 tracking-tight">
              {hideValues ? "••" : displayPedidos} <span className="text-xs font-normal text-slate-500">vendas</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Ticket Médio:</span>
            <span className="font-mono-code font-semibold text-slate-800">
              {formatCurrency(displayFaturamento / Math.max(1, displayPedidos))}
            </span>
          </div>
        </div>

        {/* Card 4: Cliques & Conversão */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Cliques nos Links
              </span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <MousePointerClick className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl font-mono-code font-bold text-slate-900 mt-2 tracking-tight">
              {hideValues ? "••••" : state.cliquesVisualizacoes.toLocaleString("pt-BR")}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Taxa de Conversão:</span>
            <span className="font-mono-code font-semibold text-emerald-600">
              4.8% <span className="text-[10px] text-slate-400 font-normal">(Alta)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Performance Graph: Sales Evolution Curve */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 font-display">
                Curva de Vendas por Horário
              </h2>
              {isVip && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-orange-50 text-[#EE4D2D] border border-orange-200/60">
                  Meta R$ 3.000,00
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Volume acumulado em tempo real das integrações Shopee Afiliados e TikTok Shop.
            </p>
          </div>

          {/* Metric Selector inside graph */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto border border-slate-200/60">
            <button
              onClick={() => setSelectedMetric("faturamento")}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                selectedMetric === "faturamento"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Faturamento (R$)
            </button>
            <button
              onClick={() => setSelectedMetric("comissoes")}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                selectedMetric === "comissoes"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Comissões (R$)
            </button>
            <button
              onClick={() => setSelectedMetric("pedidos")}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                selectedMetric === "pedidos"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pedidos (Qtd)
            </button>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="pt-4 relative">
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-slate-900 text-white px-2.5 py-1 rounded-md text-xs font-mono-code shadow-sm flex items-center gap-2 pointer-events-none z-10">
              <span className="text-slate-400">{hoveredPoint.label}:</span>
              <strong className="text-[#EE4D2D]">{hoveredPoint.value}</strong>
            </div>
          )}

          <div className="w-full h-44 sm:h-48">
            <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EE4D2D" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#EE4D2D" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="25" y1="25" x2="575" y2="25" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="25" y1="68" x2="575" y2="68" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="25" y1="112" x2="575" y2="112" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="25" y1="155" x2="575" y2="155" stroke="#E2E8F0" strokeWidth="1" />

              {/* Area Under Curve */}
              {svgPathArea && (
                <path d={svgPathArea} fill="url(#chartGradient)" />
              )}

              {/* Line Curve */}
              {svgPathLine && (
                <path d={svgPathLine} fill="none" stroke="#EE4D2D" strokeWidth="2" strokeLinecap="round" />
              )}

              {/* Interactive Data Points */}
              {svgCoordinates.map((coord, idx) => (
                <g key={idx}>
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="3.5"
                    fill="#FFFFFF"
                    stroke="#EE4D2D"
                    strokeWidth="2"
                    className="transition-all hover:r-5 cursor-pointer"
                    onMouseEnter={() => {
                      const displayVal = selectedMetric === "faturamento" || selectedMetric === "comissoes"
                        ? `R$ ${coord.val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `${coord.val} pedidos`;
                      setHoveredPoint({ label: coord.label, value: displayVal });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Hour labels below x-axis */}
                  <text
                    x={coord.x}
                    y="170"
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono-code"
                  >
                    {coord.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Real-Time Sales Stream & Channels / Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Feed de Vendas em Tempo Real */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 font-display">
                  Vendas em Tempo Real
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-slate-500">
                Transmissão direta dos pedidos originados nos canais conectados
              </p>
            </div>

            <button
              onClick={() => onNavigateTab("financeiro")}
              className="text-xs font-medium text-[#EE4D2D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver extrato completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Transactions List */}
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {state.transactions.slice(0, 5).map((tx) => {
              const isPending = tx.status === "pendente";
              return (
                <div
                  key={tx.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={tx.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120&q=80"}
                      alt={tx.product}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-md object-cover border border-slate-200/70 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-slate-900 truncate">
                        {tx.product}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-slate-700">{tx.channel}</span>
                        <span>·</span>
                        <span className="font-mono-code">{tx.date}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Venda: <strong className="text-slate-800 font-mono-code">{formatCurrency(tx.saleAmount || (tx.amount * 6.5))}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-mono-code font-semibold text-emerald-600">
                        +{formatCurrency(tx.amount)}
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {isPending ? (
                          <span className="text-slate-500 flex items-center gap-1 sm:justify-end">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Saldo Pendente
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1 sm:justify-end">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Liberado p/ Saque
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action button: test customer delivery release */}
                    {isPending && (
                      <button
                        onClick={() => releaseDeliveredSale(tx.id)}
                        className="px-2 py-1 rounded bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-[11px] font-medium border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
                        title="Simular confirmação de recebimento pelo cliente para liberar o saldo"
                      >
                        Liberar Saque
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-600">
            <Truck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800 font-medium">Regra de Liberação:</strong> As comissões entram como <strong>Saldo Pendente</strong>. Assim que a transportadora confirma o recebimento pelo cliente na Shopee ou TikTok Shop, o valor é liberado automaticamente para saque via PIX.
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Channels & Fast Actions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Channel Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 font-display">
              Desempenho por Canal de Venda
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Shopee Afiliados (Links Diretos)</span>
                  <span className="font-mono-code font-semibold text-slate-900">48% · {formatCurrency(state.faturamentoDiario * 0.48)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#EE4D2D] h-full rounded-full w-[48%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>TikTok Shop (Vídeos Minerados)</span>
                  <span className="font-mono-code font-semibold text-slate-900">34% · {formatCurrency(state.faturamentoDiario * 0.34)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full w-[34%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Grupos de WhatsApp & Telegram VIP</span>
                  <span className="font-mono-code font-semibold text-slate-900">18% · {formatCurrency(state.faturamentoDiario * 0.18)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[18%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab("divulgacao")}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Disparar Ofertas nos Grupos</span>
              </button>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ações Rápidas de Alta Escala
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab("catalogo")}
                className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <Package className="w-4 h-4 text-[#EE4D2D] mb-1.5" />
                <div className="text-xs font-semibold text-slate-900">
                  Explorar Catálogo
                </div>
                <div className="text-[11px] text-slate-500">
                  +14.000 produtos
                </div>
              </button>

              <button
                onClick={() => onNavigateTab("gerar-videos")}
                className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <Video className="w-4 h-4 text-[#EE4D2D] mb-1.5" />
                <div className="text-xs font-semibold text-slate-900">
                  Criar Vídeo IA
                </div>
                <div className="text-[11px] text-slate-500">
                  Roteiros virais
                </div>
              </button>
            </div>

            <button
              onClick={() => onNavigateTab("financeiro")}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>Solicitar Saque PIX ({formatCurrency(state.saldoDisponivel)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Performing Shopee & TikTok Products (Tabular & Clean) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 font-display">
              Produtos Mais Vendidos no Ecossistema
            </h3>
            <p className="text-xs text-slate-500">
              Produtos com pronta-entrega nacional e margem garantida para afiliados
            </p>
          </div>

          <button
            onClick={() => onNavigateTab("catalogo")}
            className="text-xs font-medium text-[#EE4D2D] hover:underline cursor-pointer"
          >
            Ver todos no catálogo →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 font-medium text-[11px]">
                <th className="pb-2.5 pl-2 font-normal">#</th>
                <th className="pb-2.5 font-normal">Produto</th>
                <th className="pb-2.5 font-normal">Categoria</th>
                <th className="pb-2.5 font-normal">Vendas</th>
                <th className="pb-2.5 font-normal">Preço</th>
                <th className="pb-2.5 font-normal text-right">Comissão / unid</th>
                <th className="pb-2.5 pr-2 font-normal text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRODUCTS.slice(0, 5).map((product, idx) => (
                <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 pl-2 font-mono-code font-semibold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5 min-w-[200px]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded object-cover border border-slate-200/70 shrink-0"
                      />
                      <span className="font-medium text-slate-800 line-clamp-1">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-500">
                    {product.category}
                  </td>
                  <td className="py-2.5 font-mono-code font-medium text-slate-700">
                    {product.unitsSold}
                  </td>
                  <td className="py-2.5 font-mono-code font-semibold text-slate-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="py-2.5 font-mono-code font-semibold text-emerald-600 text-right">
                    {formatCurrency(product.commissionValue)}
                  </td>
                  <td className="py-2.5 pr-2 text-right">
                    <button
                      onClick={() => onNavigateTab("catalogo", product)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      Divulgar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
