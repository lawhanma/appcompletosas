import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Product } from "../types";
import { CampaignPreparation } from "./CampaignPreparation";

export function DivulgacaoAutomaticaModal({ product, isOpen, onClose }: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = isOpen && !!product;

  useEffect(() => {
    const element = dialog.current;
    if (!shown || !element) return;
    element.showModal();
    return () => element.close();
  }, [shown]);

  if (!shown || !product) return null;

  return (
    <dialog ref={dialog} aria-labelledby="prepare-campaign-title" onCancel={event => { event.preventDefault(); onClose(); }} className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70">
      <header className="flex items-start justify-between gap-3 bg-slate-950 p-5 text-white">
        <div className="min-w-0">
          <h2 id="prepare-campaign-title" className="text-lg font-semibold">Preparar divulgação</h2>
          <p className="mt-1 break-words text-sm text-slate-300">{product.name}</p>
        </div>
        <button type="button" aria-label="Fechar divulgação" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-slate-800"><X size={20} /></button>
      </header>
      <div className="p-4 sm:p-6">
        <CampaignPreparation key={product.id} product={product} />
      </div>
    </dialog>
  );
}
