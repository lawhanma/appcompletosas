import React, { useEffect, useRef, useState } from "react";
import { Copy, ExternalLink, Loader2, MousePointer2, Sparkles } from "lucide-react";
import { AffiliateLinkField } from "./AffiliateLinkField";
import { CampaignProfileField } from "./CampaignProfileField";
import { CreditRenewalModal } from "./CreditRenewalModal";
import { useCampaignProfile } from "../hooks/useCampaignProfile";
import { useFinancial } from "../context/FinancialContext";
import { useDailyMissions } from "../context/DailyMissions";
import { validateAffiliateLink } from "../utils/affiliateLink";
import type { Product } from "../types";

const steps = [
  "Conferindo o link de afiliado",
  "Preparando o texto da oferta",
  "Montando as opções de compartilhamento",
];

export const CampaignPreparation: React.FC<{ product: Product; onBusyChange?: (busy: boolean) => void }> = ({ product, onBusyChange }) => {
  const { state, hasUnlimitedAiCredits, consumeAiCredit } = useFinancial();
  const { record } = useDailyMissions();
  const profilePicker = useCampaignProfile();
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<{ text: string; profile?: string; exampleClicks: number } | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [renewalOpen, setRenewalOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef({ consumeAiCredit, onBusyChange });
  latest.current = { consumeAiCredit, onBusyChange };
  const busy = progress !== null;
  const outOfCredits = !hasUnlimitedAiCredits && state.aiCredits <= 0;

  useEffect(() => () => {
    window.clearInterval(timer.current);
    if (timer.current !== undefined) latest.current.onBusyChange?.(false);
  }, []);

  function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timer.current !== undefined) return;
    if (outOfCredits) {
      setRenewalOpen(true);
      return;
    }
    const validLink = validateAffiliateLink(link);
    if (!validLink) {
      setError("Cole um link de afiliado válido, começando com https:// ou http://.");
      return;
    }
    const profile = profilePicker.optionalProfile();
    setResult(null);
    setError("");
    setCopyStatus("");
    setProgress(0);
    latest.current.onBusyChange?.(true);
    const startedAt = performance.now();

    timer.current = window.setInterval(() => {
      const next = Math.min(100, Math.floor((performance.now() - startedAt) / 608));
      if (next < 100) {
        setProgress(next);
        return;
      }
      window.clearInterval(timer.current);
      timer.current = undefined;
      setProgress(null);
      latest.current.onBusyChange?.(false);
      if (!latest.current.consumeAiCredit()) {
        setRenewalOpen(true);
        return;
      }
      setResult({
        text: `${product.name}\nConfira o preço e as condições da oferta: ${validLink}`,
        profile: profile?.label,
        exampleClicks: 8 + Math.floor(Math.random() * 22),
      });
      record("campaign", `${product.id}:${Date.now()}`);
    }, 250);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Texto copiado.");
    } catch {
      setCopyStatus("Selecione o texto acima para copiar manualmente.");
    }
  }

  return (
    <div className="space-y-4">
      <form noValidate onSubmit={start} className="space-y-3">
        <p className="text-sm text-slate-600">Prepare a oferta com seu link e escolha onde compartilhar.</p>
        <CampaignProfileField {...profilePicker.fieldProps} disabled={busy} />
        <AffiliateLinkField value={link} onChange={value => { setLink(value); setError(""); }} error={error} disabled={busy} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-600">{hasUnlimitedAiCredits ? "Créditos ilimitados" : state.aiCredits === 1 ? "1 crédito disponível" : `${state.aiCredits} créditos disponíveis`}</span>
          <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}
            {busy ? "Preparando oferta…" : outOfCredits ? "Renovar créditos" : "Preparar divulgação"}
          </button>
        </div>
      </form>

      {progress !== null && (
        <div className="space-y-2 rounded-xl border border-orange-100 bg-orange-50 p-4">
          <p role="status" className="text-sm font-semibold text-slate-900">{steps[Math.min(2, Math.floor(progress / 34))]}</p>
          <progress aria-label="Progresso da divulgação" max={100} value={progress} className="block h-2 w-full accent-orange-600" />
        </div>
      )}

      {result && (
        <section aria-label="Oferta pronta" className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 role="status" className="font-semibold text-slate-900">Oferta pronta para compartilhar</h3>
          {result.profile && <p className="text-sm text-slate-600">{result.profile}</p>}
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-white p-3">
            <MousePointer2 className="size-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{result.exampleClicks} cliques ilustrativos</p>
              <p className="text-xs text-slate-600">Número simulado para visualização. Cliques reais não são medidos.</p>
            </div>
          </div>
          <textarea readOnly aria-label="Texto da oferta" rows={4} value={result.text} className="w-full resize-y rounded-lg border border-emerald-200 bg-white p-3 text-sm text-slate-800" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void copy(result.text)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"><Copy className="size-4" aria-hidden="true" /> Copiar texto</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(result.text)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-700 px-3 text-sm font-semibold text-emerald-800">Abrir WhatsApp <ExternalLink className="size-4" aria-hidden="true" /></a>
          </div>
          {copyStatus && <p role="status" className="text-sm text-slate-700">{copyStatus}</p>}
        </section>
      )}
      {renewalOpen && <CreditRenewalModal onClose={() => setRenewalOpen(false)} />}
    </div>
  );
};
