import { ArrowRight, RefreshCw, Wallet } from "lucide-react";
import { usePromotionRewards } from "../context/PromotionRewards";
import { rewardMoney } from "./PromotionCampaignCard";

export function PromotionBalanceSummary({ onOpenFinance }: { onOpenFinance?: () => void }) {
  const rewards = usePromotionRewards();
  const wallet = rewards?.wallet;
  const ready = Boolean(wallet?.server_now) && !rewards?.error;

  return (
    <section aria-label="Saldo das divulgações" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Wallet className="size-4 text-emerald-700" aria-hidden="true" /> Saldo das divulgações
        </h2>
        {rewards && <button type="button" aria-label="Atualizar saldo" disabled={rewards.loading} onClick={() => void rewards.reload()} className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50"><RefreshCw className="size-4" aria-hidden="true" /></button>}
      </div>
      {ready && wallet ? (
        <dl className="space-y-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-slate-600">Disponível</dt><dd className="font-semibold tabular-nums text-emerald-700">{rewardMoney(wallet.available_cents)}</dd></div>
          <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-slate-600">Pendente</dt><dd className="font-semibold tabular-nums text-slate-900">{rewardMoney(wallet.pending_cents)}</dd></div>
          <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-slate-600">Saques solicitados</dt><dd className="font-semibold tabular-nums text-slate-900">{rewardMoney(wallet.requested_cents)}</dd></div>
        </dl>
      ) : (
        <p role="status" className="text-sm text-slate-600">{rewards?.loading ? "Consultando o saldo…" : "Saldo indisponível no momento. Tente atualizar."}</p>
      )}
      {onOpenFinance && <button type="button" onClick={onOpenFinance} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-orange-800 hover:bg-orange-50">Ver financeiro <ArrowRight className="size-4" aria-hidden="true" /></button>}
    </section>
  );
}
