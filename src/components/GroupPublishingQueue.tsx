import React, { useState } from 'react';
import type { FacebookGroup } from '../data/facebookGroups';
import { normalizeGroupLink } from '../utils/groupLink';

export const GroupPublishingQueue: React.FC<{
  groups: FacebookGroup[]; text: string; ready: boolean; onClose: () => void;
}> = ({ groups, text, ready, onClose }) => {
  const [selected, setSelected] = useState(() => groups.map(g => g.id));
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const queue = groups.filter(g => selected.includes(g.id));
  const current = queue.find(g => !reviewed.includes(g.id));
  const count = queue.filter(g => reviewed.includes(g.id)).length;
  return <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="group-queue-title">
    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
      <div className="flex justify-between gap-4"><h3 id="group-queue-title" className="font-bold text-lg">Divulgar nos grupos selecionados</h3><button onClick={onClose} aria-label="Fechar sequência">Fechar</button></div>
      <p className="text-sm text-slate-600">Copie o texto, abra cada grupo e revise as regras. Você cola e confirma a publicação na própria plataforma. O ShopGO não envia automaticamente nem confirma vendas.</p>
      <div className="flex gap-3 text-xs"><button onClick={() => setSelected(groups.map(g => g.id))}>Selecionar todos</button><button onClick={() => setSelected(groups.filter(g => g.platform === 'facebook').map(g => g.id))}>Somente Facebook</button></div>
      <div className="max-h-40 overflow-auto border rounded-lg p-3 space-y-2">{groups.map(g => <label key={g.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(g.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, g.id] : prev.filter(id => id !== g.id))}/>{g.name} ({g.platform})</label>)}</div>
      <p className="text-sm font-bold">{count} de {queue.length} revisados por você</p>
      {!ready && <p role="alert" className="text-sm text-orange-700">Feche esta janela e informe seu link de afiliado para preparar a publicação.</p>}
      {current ? <div className="rounded-xl bg-slate-50 p-4 space-y-3">
        <h4 className="font-bold">Próximo: {current.name}</h4><p className="text-xs">{current.rules}</p>
        <textarea aria-label="Texto para copiar" readOnly value={text} rows={6} className="w-full border rounded-lg p-3 text-sm"/>
        <div className="flex flex-wrap gap-3 text-sm">
          <button disabled={!ready} className="bg-orange-600 text-white px-3 py-2 rounded-lg disabled:opacity-50" onClick={async () => {try {await navigator.clipboard.writeText(text);setMessage('Texto copiado. Abra o grupo e cole na publicação.');} catch {setMessage('Não foi possível copiar. Selecione e copie o texto acima manualmente.');}}}>1. Copiar texto</button>
          {ready && <a className="bg-blue-600 text-white px-3 py-2 rounded-lg" href={normalizeGroupLink(current.groupUrl) || undefined} target="_blank" rel="noopener noreferrer">2. Abrir grupo</a>}
          <button onClick={() => {setReviewed(prev => [...prev, current.id]);setMessage('');}}>Já revisei / próximo</button>
        </div>
      </div> : <p>{queue.length ? 'Sequência revisada. Esse registro não comprova que as publicações foram aprovadas.' : 'Selecione os grupos que deseja revisar.'}</p>}
      <p role="status" className="text-sm text-slate-600">{message}</p>
    </div>
  </div>;
};
