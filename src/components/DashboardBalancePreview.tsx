import { useEffect, useState } from "react";
import { TrendingUp, Wallet } from "lucide-react";
import { getPreviewTodayBalance, PREVIEW_AVAILABLE_BALANCE } from "../utils/dashboardPreviewBalance";

export function DashboardBalancePreview({ formatCurrency }: { formatCurrency: (value: number) => string }) {
  const [balance, setBalance] = useState(() => getPreviewTodayBalance(new Date()));

  useEffect(() => {
    const update = () => setBalance(getPreviewTodayBalance(new Date()));
    const timer = window.setInterval(update, 15_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <section aria-label="Prévia do painel" className="space-y-3 rounded-xl border border-orange-200 bg-white p-4 shadow-xs sm:col-span-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-sm font-semibold text-slate-950">Prévia do painel</h2>
        <p className="text-xs text-slate-600">Valores ilustrativos · horário de Brasília</p>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg bg-orange-50 p-3">
          <dt className="flex items-center gap-2 text-xs font-medium text-orange-900"><TrendingUp className="size-4" aria-hidden="true" /> Saldo de hoje</dt>
          <dd className="mt-2 text-xl font-bold tracking-tight tabular-nums text-slate-950 sm:text-2xl">{formatCurrency(balance)}</dd>
        </div>
        <div className="min-w-0 rounded-lg bg-slate-100 p-3">
          <dt className="flex items-center gap-2 text-xs font-medium text-slate-700"><Wallet className="size-4" aria-hidden="true" /> Saldo disponível</dt>
          <dd className="mt-2 text-xl font-bold tracking-tight tabular-nums text-slate-950 sm:text-2xl">{formatCurrency(PREVIEW_AVAILABLE_BALANCE)}</dd>
        </div>
      </dl>
    </section>
  );
}
