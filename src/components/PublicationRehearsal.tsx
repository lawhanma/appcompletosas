import { Check, Facebook, Film, Instagram, Loader2, MessageCircle, Music2, Send } from "lucide-react";

const channels = [
  { name: "Kwai", Icon: Film },
  { name: "TikTok", Icon: Music2 },
  { name: "Facebook", Icon: Facebook },
  { name: "WhatsApp", Icon: MessageCircle },
  { name: "Instagram", Icon: Instagram },
  { name: "X", Icon: Send },
];

export function PublicationRehearsal({ progress }: { progress: number }) {
  const active = Math.min(channels.length - 1, Math.floor(progress * channels.length / 100));
  return (
    <section aria-labelledby="rehearsal-title" className="space-y-4 rounded-2xl bg-slate-950 p-4 text-white shadow-sm">
      <header className="space-y-1">
        <h3 id="rehearsal-title" className="font-semibold">Simulação de publicação</h3>
        <p className="text-xs text-slate-300">Prévia das etapas em seis redes. Nenhum conteúdo é enviado durante o teste.</p>
      </header>
      <div className="space-y-1.5">
        <p role="status" className="text-sm text-orange-200">Processando etapa de teste no {channels[active].name}</p>
        <progress aria-label="Progresso do teste de divulgação" max={100} value={progress} className="block h-2 w-full accent-orange-500" />
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {channels.map(({ name, Icon }, index) => (
          <li key={name} className={`flex min-h-12 items-center gap-2 rounded-xl border px-2.5 py-2 ${index === active ? "border-orange-400 bg-orange-400/10" : "border-slate-700 bg-slate-900"}`}>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">{name}</p>
              <p className="text-[11px] text-slate-300">{index < active ? "Concluída" : index === active ? "Em teste" : "Na fila"}</p>
            </div>
            {index < active && <Check className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />}
            {index === active && <Loader2 className="size-4 shrink-0 text-orange-300 motion-safe:animate-spin" aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
