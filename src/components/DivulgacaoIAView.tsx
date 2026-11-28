import { useEffect, useState } from "react";
import { Film, Megaphone, Users } from "lucide-react";
import type { Product } from "../types";
import { PRODUCTS } from "../data/mockData";
import { useCloudAccount } from "../context/CloudAccount";
import { CampaignPreparation } from "./CampaignPreparation";
import { GruposOfertasView } from "./GruposOfertasView";

const tabs = [
  { id: "automatica", label: "Preparar divulgação", Icon: Megaphone },
  { id: "grupos", label: "Grupos de ofertas", Icon: Users },
  { id: "tiktok", label: "TikTok Shop", Icon: Film },
] as const;
type SubTab = typeof tabs[number]["id"];

export function DivulgacaoIAView({ initialProduct, onOpenVideoCreator, defaultSubTab = "automatica" }: {
  initialProduct?: Product | null;
  onOpenVideoCreator?: (product: Product) => void;
  defaultSubTab?: SubTab;
}) {
  const freePlan = useCloudAccount()?.membership.plan === "free";
  const available = freePlan ? PRODUCTS.filter(product => product.category === "Utilidades") : PRODUCTS;
  const [productId, setProductId] = useState(initialProduct?.id);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<SubTab>(defaultSubTab);
  const [busy, setBusy] = useState(false);
  const product = available.find(item => item.id === productId) ?? available[0];
  const term = search.trim().toLocaleLowerCase("pt-BR");
  const matches = available.filter(item => item.name.toLocaleLowerCase("pt-BR").includes(term));
  const options = matches.some(item => item.id === product?.id) || !product ? matches : [product, ...matches];

  useEffect(() => { setTab(defaultSubTab); }, [defaultSubTab]);
  useEffect(() => { if (initialProduct) setProductId(initialProduct.id); }, [initialProduct]);

  if (!product) return <p role="status">Nenhum produto disponível para divulgação.</p>;

  return (
    <div className="space-y-5">
      <nav aria-label="Opções de divulgação" className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-pressed={tab === id} disabled={busy && tab !== id} onClick={() => setTab(id)} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold disabled:opacity-45 ${tab === id ? "bg-orange-50 text-orange-800" : "text-slate-600 hover:bg-slate-50"}`}>
            <Icon className="size-4" aria-hidden="true" />{label}
          </button>
        ))}
      </nav>

      {tab === "automatica" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]">
          <section className="h-fit space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="campaign-product">
            <h2 id="campaign-product" className="font-semibold text-slate-900">Produto da oferta</h2>
            <label className="block text-sm font-medium text-slate-700">Buscar produto
              <input disabled={busy} value={search} onChange={event => setSearch(event.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" />
            </label>
            <label className="block text-sm font-medium text-slate-700">Selecionar produto
              <select disabled={busy} value={product.id} onChange={event => setProductId(event.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3">
                {options.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            {!matches.length && <p role="status" className="text-sm text-slate-600">Nenhum produto encontrado nessa busca.</p>}
            <img src={product.imageUrl} alt="" width={96} height={96} loading="lazy" className="size-24 rounded-xl border border-slate-200 object-contain" />
            <p className="break-words text-sm font-semibold text-slate-800">{product.name}</p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="campaign-title">
            <h2 id="campaign-title" className="mb-3 text-xl font-semibold text-slate-900">Preparar divulgação</h2>
            <CampaignPreparation key={product.id} product={product} onBusyChange={setBusy} />
          </section>
        </div>
      )}

      {tab === "grupos" && <GruposOfertasView initialProduct={product} onOpenVideoCreator={onOpenVideoCreator} />}
      {tab === "tiktok" && (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Criativos para o TikTok Shop</h2>
          <p className="text-sm text-slate-600">Prepare o texto da oferta antes de compartilhar no TikTok.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setTab("automatica")} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800">Preparar oferta</button>
            {onOpenVideoCreator && <button type="button" onClick={() => onOpenVideoCreator(product)} className="min-h-11 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">Criar roteiro no Flow</button>}
          </div>
        </section>
      )}
    </div>
  );
}
