import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Copy, ExternalLink, Search, Sparkles, X } from "lucide-react";
import { useCloudAccount } from "../context/CloudAccount";
import type { FacebookGroup } from "../data/facebookGroups";
import { PRODUCTS } from "../data/mockData";
import { apiFetch } from "../lib/apiFetch";
import { validateAffiliateLink } from "../utils/affiliateLink";
import { normalizeGroupLink } from "../utils/groupLink";
import { getWorkingShopeeUrl } from "../utils/shopee";
import type { Product } from "../types";

export function GroupSalesTextDialog({ group, onClose }: { group: FacebookGroup; onClose: () => void }) {
  const account = useCloudAccount();
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef<AbortController | null>(null);
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [affiliateLink, setAffiliateLink] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const allowed = account?.membership.plan === "free" ? PRODUCTS.filter(item => item.category === "Utilidades") : PRODUCTS;
  const query = search.trim().toLocaleLowerCase("pt-BR");
  const filtered = allowed.filter(item => `${item.name} ${item.category}`.toLocaleLowerCase("pt-BR").includes(query));
  const groupUrl = normalizeGroupLink(group.groupUrl, group.platform);

  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => {
      request.current?.abort();
      node?.close();
    };
  }, []);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || request.current) return;
    const link = affiliateLink.trim() ? validateAffiliateLink(affiliateLink) : getWorkingShopeeUrl(product);
    if (!link) {
      setStatus("O link de afiliado precisa começar com https:// ou http://.");
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setText("");
    setStatus("");
    const fallback = `🛍️ Achadinho de ${product.category.toLocaleLowerCase("pt-BR")} na Shopee\n\n${product.name}\n\nVeja as opções e confira o preço e o frete no anúncio. Se gostar, é só abrir o link abaixo.`;
    let copy = fallback;
    let usedAi = false;
    try {
      const res = await apiFetch("/api/ai/generate-group-sales-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: product.name, category: product.category, groupName: group.name, platform: group.platform }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(11000)]),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.text === "string" && data.text.trim() && !/https?:\/\//i.test(data.text)) {
          copy = data.text.trim();
          usedAi = true;
        }
      }
    } catch {
      // The product-specific template keeps the posting flow available if the AI times out.
    } finally {
      if (!controller.signal.aborted) {
        setText(`${copy}\n\n${affiliateLink.trim() ? "Link de afiliado" : "Ver na Shopee"}: ${link}`);
        setStatus(usedAi ? "Texto pronto para revisar e copiar." : "Texto preparado com o modelo do catálogo. Você pode editar antes de copiar.");
        setBusy(false);
      }
      request.current = null;
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Texto copiado.");
    } catch {
      setStatus("Selecione o texto acima e copie manualmente.");
    }
  }

  return (
    <dialog ref={dialog} aria-labelledby="group-sales-title" onCancel={event => { event.preventDefault(); onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl backdrop:bg-slate-900/60">
      <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-slate-200 bg-white p-4 sm:p-5">
        <div className="rounded-xl bg-orange-50 p-2.5 text-orange-700"><Sparkles className="size-5" aria-hidden="true" /></div>
        <div className="min-w-0 flex-1">
          <h2 id="group-sales-title" className="text-base font-bold">Texto de venda para postagem no grupo</h2>
          <p className="mt-1 break-words text-sm text-slate-600">{group.name}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-slate-100"><X className="size-5" /></button>
      </header>
      <form onSubmit={generate} className="space-y-4 p-4 sm:p-5">
        <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
          <legend className="mb-2 text-sm font-semibold">Escolha um produto</legend>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
            <Search className="size-4 text-slate-500" aria-hidden="true" />
            <input value={search} onChange={event => setSearch(event.target.value)} type="search" aria-label="Pesquisar produto" placeholder="Buscar pelo nome ou categoria" className="w-full bg-transparent py-2 text-sm" />
          </label>
          <select aria-label="Produto para o anúncio" value={product?.id ?? ""} onChange={event => { setProduct(allowed.find(item => item.id === event.target.value) ?? null); setText(""); setStatus(""); }} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
            <option value="" disabled>{filtered.length ? "Selecione o produto" : "Nenhum produto encontrado"}</option>
            {product && !filtered.includes(product) && <option value={product.id}>{product.name}</option>}
            {filtered.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <label className="block text-sm font-medium">
            Link de afiliado <span className="font-normal text-slate-500">(opcional)</span>
            <input type="text" inputMode="url" value={affiliateLink} onChange={event => { setAffiliateLink(event.target.value); setText(""); setStatus(""); }} placeholder="https://" className="mt-1 block min-h-11 w-full rounded-lg border border-slate-200 px-3 font-normal" />
          </label>
        </fieldset>
        <button type="submit" disabled={!product || busy} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 sm:w-auto">
          <Sparkles className="size-4" aria-hidden="true" /> {busy ? "Preparando texto…" : "Gerar texto de venda"}
        </button>
        {text && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold">
              Texto para postar
              <textarea rows={7} value={text} onChange={event => setText(event.target.value)} className="mt-1 block w-full resize-y rounded-lg border border-slate-200 p-3 font-normal leading-relaxed" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyText} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white"><Copy className="size-4" /> Copiar texto</button>
              {groupUrl && <a href={groupUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold">Abrir grupo <ExternalLink className="size-4" /></a>}
            </div>
          </div>
        )}
        <p role="status" className="text-sm text-slate-600">{status}</p>
      </form>
    </dialog>
  );
}
