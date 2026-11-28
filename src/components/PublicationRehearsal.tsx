import { Check, ClipboardPen, Facebook, Film, Instagram, Link2, MessageCircle, Music2, Send, Share2 } from "lucide-react";

const channels = [
  { name: "Kwai", Icon: Film, detail: "Formatando o criativo vertical", color: "text-orange-300" },
  { name: "TikTok", Icon: Music2, detail: "Ajustando a legenda para vídeo curto", color: "text-cyan-300" },
  { name: "Facebook", Icon: Facebook, detail: "Organizando o texto para o grupo", color: "text-blue-300" },
  { name: "WhatsApp", Icon: MessageCircle, detail: "Montando a mensagem da oferta", color: "text-emerald-300" },
  { name: "Instagram", Icon: Instagram, detail: "Preparando a legenda do criativo", color: "text-fuchsia-300" },
  { name: "X", Icon: Send, detail: "Resumindo a oferta para publicação curta", color: "text-slate-200" },
];

const preparation = [
  { name: "Link", Icon: Link2, detail: "Conferindo o link de afiliado", color: "text-orange-300" },
  { name: "Texto", Icon: ClipboardPen, detail: "Preparando o texto da oferta", color: "text-cyan-300" },
  { name: "Compartilhamento", Icon: Share2, detail: "Montando as opções para compartilhar", color: "text-emerald-300" },
];

export function PublicationRehearsal({ progress, testing, productName }: { progress: number; testing: boolean; productName: string }) {
  const stages = testing ? channels : preparation;
  const active = Math.min(stages.length - 1, Math.floor(progress * stages.length / 100));
  const ActiveIcon = stages[active].Icon;
  const progressLabel = testing ? "Progresso do teste de divulgação" : "Progresso da divulgação";

  return (
    <section aria-label={testing ? "Simulação de publicação" : "Preparação da oferta"} className="relative isolate space-y-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-lg sm:p-5">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#48271c_0%,transparent_60%)]" />
      <header className="space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight">{testing ? "Simulação de publicação" : "Preparando divulgação"}</h3>
        <p className="break-words text-sm text-slate-300">{productName}</p>
        {testing && <p className="text-xs text-orange-200">Sessão de teste · sem envio de conteúdo às redes</p>}
      </header>
      <div className="flex min-h-24 items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3 sm:gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-full sm:size-20" style={{ background: `conic-gradient(#fb923c ${progress}%, #334155 0)` }} aria-hidden="true">
          <div className="grid size-[calc(100%_-_6px)] place-items-center rounded-full bg-slate-950">
            <span className="text-sm font-semibold tabular-nums sm:text-lg">{progress}%</span>
          </div>
        </div>
        <div className="min-w-0 space-y-1">
          <div className={`flex items-center gap-2 text-sm font-semibold ${stages[active].color}`}>
            <ActiveIcon className="size-4 shrink-0 motion-safe:animate-pulse" aria-hidden="true" />
            <span>{stages[active].name}</span>
          </div>
          <p role="status" className="text-sm text-slate-100">{stages[active].detail}</p>
          <p className="text-xs text-slate-300">Etapa {active + 1} de {stages.length}</p>
        </div>
      </div>
      <progress aria-label={progressLabel} max={100} value={progress} className="sr-only" />
      <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300 motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${progress}%` }} />
      </div>
      <ul className="grid grid-cols-2 gap-2 min-[440px]:grid-cols-3">
        {stages.map(({ name, Icon, color }, index) => (
          <li key={name} aria-current={index === active ? "step" : undefined} className={`flex min-h-14 min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 motion-safe:transition-colors ${index === active ? "border-orange-400/80 bg-orange-400/10" : "border-slate-700/80 bg-slate-900/85"}`}>
            <Icon className={`size-4 shrink-0 ${color}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="break-words text-xs font-semibold">{name}</p>
              <p className="mt-0.5 text-[11px] text-slate-300">{index < active ? "Concluída" : index === active ? "Em andamento" : "Na fila"}</p>
            </div>
            {index < active && <Check className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
