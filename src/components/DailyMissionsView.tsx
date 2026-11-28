import { ArrowRight, Check, CheckCircle2, Copy, Flame, PackageSearch, Share2, Sparkles, Trophy } from "lucide-react";
import { useDailyMissions } from "../context/DailyMissions";
import type { NavTab } from "../types";

type Mission = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  points: number;
  icon: typeof Flame;
  tab: NavTab;
  subTab?: "automatica" | "grupos";
};

export function DailyMissionsView({ onNavigate }: { onNavigate: (tab: NavTab, subTab?: Mission["subTab"]) => void }) {
  const { progress, record } = useDailyMissions();
  const missions: Mission[] = [
    { id: "visit", title: "Check-in diário", description: "Acesse sua conta ShopGO.", current: 1, target: 1, points: 10, icon: Flame, tab: "dashboard" },
    { id: "products", title: "Explore o catálogo", description: "Abra os detalhes de 3 produtos diferentes.", current: progress.products.length, target: 3, points: 30, icon: PackageSearch, tab: "catalogo" },
    { id: "links", title: "Separe seus links", description: "Copie o link de 2 produtos diferentes.", current: progress.links.length, target: 2, points: 30, icon: Copy, tab: "catalogo" },
    { id: "campaign", title: "Prepare uma divulgação", description: "Gere o texto da oferta com seu link de afiliado.", current: progress.campaigns.length, target: 1, points: 50, icon: Sparkles, tab: "divulgacao", subTab: "automatica" },
    { id: "posts", title: "Publique em grupos", description: "Publique 5 ofertas e marque cada postagem aqui.", current: progress.posts, target: 5, points: 60, icon: Share2, tab: "divulgacao", subTab: "grupos" },
  ];
  const pending = missions.filter(mission => mission.current < mission.target);
  const complete = missions.filter(mission => mission.current >= mission.target);
  const totalPoints = missions.reduce((sum, mission) => sum + mission.points, 0);
  const earned = complete.reduce((sum, mission) => sum + mission.points, 0);
  const next = pending[0];

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Missões diárias</h1>
        <p className="mt-1 text-sm text-slate-600">As tarefas reiniciam à meia-noite, no horário de Brasília.</p>
      </header>

      <div className="grid gap-5 overflow-hidden rounded-2xl bg-slate-950 p-5 text-white sm:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] sm:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-orange-300"><Trophy className="size-5" aria-hidden="true" /> Progresso de hoje</div>
          <p className="text-3xl font-bold tracking-tight">{complete.length}<span className="text-base font-medium text-slate-300"> / {missions.length} concluídas</span></p>
          <progress aria-label="Missões concluídas" value={complete.length} max={missions.length} className="block h-2 w-full accent-orange-400" />
          <p className="text-sm text-slate-300">{earned} de {totalPoints} pontos</p>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          {next ? <>
            <p className="text-xs font-medium text-orange-300">Próxima missão</p>
            <h2 className="my-1 text-base font-semibold">{next.title}</h2>
            <button type="button" onClick={() => onNavigate(next.tab, next.subTab)} aria-label={`Ir concluir: ${next.title}`} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700">
              Ir concluir <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </> : <p className="text-base font-semibold text-emerald-300">Todas as missões de hoje estão concluídas.</p>}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {[...pending, ...complete].map(mission => {
          const done = mission.current >= mission.target;
          const Icon = mission.icon;
          return (
            <article key={mission.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-lg p-2.5 ${done ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}><Icon className="size-5" aria-hidden="true" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{mission.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{mission.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">+{mission.points} pts</span>
              </div>
              <div className="mt-auto">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-600"><span>{done ? "Concluída" : "Em andamento"}</span><span>{Math.min(mission.current, mission.target)}/{mission.target}</span></div>
                <progress aria-label={mission.title} value={Math.min(mission.current, mission.target)} max={mission.target} className={`block h-1.5 w-full ${done ? "accent-emerald-600" : "accent-orange-600"}`} />
              </div>
              {done ? <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" aria-hidden="true" /> Pontos conquistados</span> : (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => onNavigate(mission.tab, mission.subTab)} aria-label={`Ir concluir: ${mission.title}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange-50 px-3 text-sm font-semibold text-orange-800 hover:bg-orange-100">
                    Ir concluir <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                  {mission.id === "posts" && <button type="button" onClick={() => record("post")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Check className="size-4" aria-hidden="true" /> Já publiquei +1</button>}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <p className="text-xs text-slate-600">O progresso e os pontos ficam salvos neste navegador, por conta.</p>
    </section>
  );
}
