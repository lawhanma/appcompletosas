import React, { useEffect, useRef, useState } from "react";
import { Copy, ExternalLink, Loader2, MousePointer2, Sparkles } from "lucide-react";
import { AffiliateLinkField } from "./AffiliateLinkField";
import { CampaignProfileField } from "./CampaignProfileField";
import { CreditRenewalModal } from "./CreditRenewalModal";
import { useCampaignProfile } from "../hooks/useCampaignProfile";
import { useFinancial } from "../context/FinancialContext";
import { useDailyMissions } from "../context/DailyMissions";
import { useCloudAccount } from "../context/CloudAccount";
import { PublicationRehearsal } from "./PublicationRehearsal";
import { validateAffiliateLink } from "../utils/affiliateLink";
import { getWorkingShopeeUrl } from "../utils/shopee";
import type { Product } from "../types";

const campaignDurationMs = 64_000;
const randomInteger = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const CampaignPreparation: React.FC<{ product: Product; onBusyChange?: (busy: boolean) => void }> = ({ product, onBusyChange }) => {
  const { state, hasUnlimitedAiCredits, consumeAiCredit } = useFinancial();
  const { record } = useDailyMissions();
  const isShopGoOwner = useCloudAccount()?.isShopGoOwner === true;
  const profilePicker = useCampaignProfile();
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ text: string; profile?: string; clicks: number; testMetrics?: { sales: number; commission: number } } | null>(null);
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

  function start(testRun: boolean) {
    if (timer.current !== undefined || (testRun && !isShopGoOwner)) return;
    if (!testRun && outOfCredits) {
      setRenewalOpen(true);
      return;
    }
    const validLink = testRun && !link.trim() ? getWorkingShopeeUrl(product) : validateAffiliateLink(link);
    if (!validLink) {
      setError("Cole um link de afiliado válido, começando com https:// ou http://.");
      return;
    }
    const profile = profilePicker.optionalProfile();
    if (profilePicker.fieldProps.value && !profile) return;
    setResult(null);
    setError("");
    setCopyStatus("");
    setTesting(testRun);
    setProgress(0);
    latest.current.onBusyChange?.(true);
    const startedAt = performance.now();

    timer.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      if (elapsed < campaignDurationMs) {
        setProgress(Math.floor(elapsed * 100 / campaignDurationMs));
        return;
      }
      window.clearInterval(timer.current);
      timer.current = undefined;
      setProgress(null);
      latest.current.onBusyChange?.(false);
      if (!testRun && !latest.current.consumeAiCredit()) {
        setRenewalOpen(true);
        return;
      }
      setResult({
        text: `${product.name}\nConfira o preço e as condições da oferta: ${validLink}`,
        profile: profile?.label,
        clicks: randomInteger(8, 29),
        testMetrics: testRun ? { sales: randomInteger(1, 4), commission: randomInteger(3300, 5400) / 100 } : undefined,
      });
      if (!testRun) {
        record("campaign", `${product.id}:${Date.now()}`);
      }
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
      <form noValidate onSubmit={event => { event.preventDefault(); start(false); }} className="space-y-3">
        <p className="text-sm text-slate-600">Prepare a oferta com seu link e escolha onde compartilhar.</p>
        <CampaignProfileField {...profilePicker.fieldProps} disabled={busy} />
        <AffiliateLinkField value={link} onChange={value => { setLink(value); setError(""); }} error={error} disabled={busy} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-600">{hasUnlimitedAiCredits ? "Créditos ilimitados" : state.aiCredits === 1 ? "1 crédito disponível" : `${state.aiCredits} créditos disponíveis`}</span>
          {isShopGoOwner && (
            <button type="button" disabled={busy} onClick={() => start(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-800 hover:bg-orange-100 disabled:opacity-60">
              <Sparkles className="size-4" aria-hidden="true" /> {busy && testing ? "Simulando publicação…" : "Testar divulgação automática"}
            </button>
          )}
          <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}
            {busy && !testing ? "Preparando oferta…" : outOfCredits ? "Renovar créditos" : "Preparar divulgação"}
          </button>
        </div>
      </form>

      {progress !== null && <PublicationRehearsal progress={progress} testing={testing} productName={product.name} />}

      {result && (
        <section aria-label="Oferta pronta" className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 role="status" className="font-semibold text-slate-900">{result.testMetrics ? "Resultados da sessão de teste" : "Oferta pronta para compartilhar"}</h3>
          {result.profile && <p className="text-sm text-slate-600">{result.profile}</p>}
          {result.testMetrics ? (
            <>
              <p className="text-xs text-slate-600">Valores de exemplo exibidos apenas nesta sessão de teste.</p>
              <dl className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-3">
                <div><dt className="text-xs text-slate-600">Cliques</dt><dd className="text-sm font-semibold text-slate-900">{result.clicks} cliques</dd></div>
                <div><dt className="text-xs text-slate-600">Vendas</dt><dd className="text-sm font-semibold text-slate-900">{result.testMetrics.sales} {result.testMetrics.sales === 1 ? "venda" : "vendas"}</dd></div>
                <div><dt className="text-xs text-slate-600">Comissão</dt><dd className="text-sm font-semibold text-slate-900">{brl.format(result.testMetrics.commission)}</dd></div>
              </dl>
            </>
          ) : <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-white p-3">
            <MousePointer2 className="size-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{result.clicks} cliques ilustrativos</p>
              <p className="text-xs text-slate-600">Número simulado para visualização. Cliques reais não são medidos.</p>
            </div>
          </div>}
          <textarea readOnly aria-label="Texto da oferta" rows={4} value={result.text} className="w-full resize-y rounded-lg border border-emerald-200 bg-white p-3 text-sm text-slate-800" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void copy(result.text)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"><Copy className="size-4" aria-hidden="true" /> Copiar texto</button>
            {!result.testMetrics && <a href={`https://wa.me/?text=${encodeURIComponent(result.text)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-700 px-3 text-sm font-semibold text-emerald-800">Abrir WhatsApp <ExternalLink className="size-4" aria-hidden="true" /></a>}
          </div>
          {copyStatus && <p role="status" className="text-sm text-slate-700">{copyStatus}</p>}
        </section>
      )}
      {renewalOpen && <CreditRenewalModal onClose={() => setRenewalOpen(false)} />}
    </div>
  );
};
