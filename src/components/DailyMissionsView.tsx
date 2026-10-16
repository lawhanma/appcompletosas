import React from 'react';
import {ArrowRight, Check, CheckCircle2, Copy, Flame, Gift, PackageSearch, Share2, Sparkles, Target, Trophy} from 'lucide-react';
import {useDailyMissions} from '../context/DailyMissions';
import type {NavTab} from '../types';

export function DailyMissionsView({onNavigate}: {onNavigate: (tab: NavTab, subTab?: 'automatica'|'grupos') => void}) {
  const {progress,record} = useDailyMissions();
  const missions = [
    {id:'visit',title:'Comece com o pé direito',description:'Entre na plataforma e organize sua rotina de hoje.',current:1,target:1,xp:10,icon:Flame,action:'Check-in feito',tab:'dashboard' as NavTab},
    {id:'products',title:'Encontre seus próximos campeões',description:'Abra as métricas de 3 produtos diferentes no catálogo.',current:progress.products.length,target:3,xp:30,icon:PackageSearch,action:'Explorar produtos',tab:'catalogo' as NavTab},
    {id:'links',title:'Deixe suas ofertas prontas',description:'Copie o link de 2 produtos diferentes para preparar suas ofertas.',current:progress.links.length,target:2,xp:30,icon:Copy,action:'Pegar links',tab:'catalogo' as NavTab},
    {id:'posts',title:'Leve suas ofertas mais longe',description:'Faça 5 posts em grupos de ofertas hoje. Depois de publicar, registre cada post aqui.',current:progress.posts,target:5,xp:60,icon:Share2,action:'Ver grupos de ofertas',tab:'divulgacao' as NavTab,sub:'grupos' as const},
    {id:'campaign',title:'Coloque a divulgação para rodar',description:'Conclua uma divulgação automática hoje, até aparecer o relatório.',current:progress.campaigns.length,target:1,xp:50,icon:Sparkles,action:'Iniciar divulgação',tab:'divulgacao' as NavTab,sub:'automatica' as const},
  ];
  const completed = missions.filter(m=>m.current>=m.target).length;
  const earned = missions.reduce((sum,m)=>sum+(m.current>=m.target ? m.xp : 0),0);
  return <section className="space-y-6">
    <header className="flex items-start gap-3"><div className="bg-orange-100 text-[#EE4D2D] p-3 rounded-2xl"><Target className="w-6 h-6"/></div><div>
      <h1 className="text-2xl font-bold text-slate-900">Missões diárias</h1>
      <p className="text-sm text-slate-500 mt-1">Pequenas ações hoje. Mais consistência para sua operação.</p>
    </div></header>
    <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
      <Trophy className="absolute right-5 top-5 w-20 h-20 text-orange-400/15"/>
      <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">Seu desafio de hoje</span>
      <h2 className="text-xl sm:text-2xl font-bold mt-3">{completed===5 ? 'Dia completo. Ótimo trabalho!' : 'Um passo de cada vez, todos os dias.'}</h2>
      <p className="text-slate-300 text-sm mt-2">{completed} de 5 missões concluídas · {earned} de 180 pontos conquistados</p>
      <div role="progressbar" aria-label="Missões concluídas" aria-valuemin={0} aria-valuemax={5} aria-valuenow={completed} className="h-2 bg-white/15 rounded-full mt-5 overflow-hidden"><div className="h-full bg-orange-400 rounded-full transition-all" style={{width:`${completed*20}%`}}/></div>
      <p className="text-xs text-slate-400 mt-3">Novas missões à meia-noite, no horário de Brasília.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {missions.map(m=>{const done=m.current>=m.target;const Icon=m.icon;return <article key={m.id} className={`rounded-2xl border bg-white p-5 flex flex-col gap-4 ${done?'border-emerald-200':'border-slate-200'}`}>
        <div className="flex items-center justify-between"><div className={`p-2.5 rounded-xl ${done?'bg-emerald-50 text-emerald-600':'bg-orange-50 text-[#EE4D2D]'}`}><Icon className="w-5 h-5"/></div><span className={`text-xs font-semibold rounded-full px-3 py-1 ${done?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{done?'Concluída':`+${m.xp} pontos`}</span></div>
        <div className="flex-1"><h3 className="font-semibold text-slate-900">{m.title}</h3><p className="text-sm text-slate-500 mt-1 leading-relaxed">{m.description}</p></div>
        <div><div className="flex justify-between text-xs mb-2"><span className="text-slate-500">Progresso</span><span className="font-semibold text-slate-700">{m.current}/{m.target}</span></div><div role="progressbar" aria-label={m.title} aria-valuemin={0} aria-valuemax={m.target} aria-valuenow={m.current} className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${done?'bg-emerald-500':'bg-[#EE4D2D]'}`} style={{width:`${Math.min(100,m.current/m.target*100)}%`}}/></div></div>
        {done ? <div className="text-sm text-emerald-700 flex items-center gap-2 py-2"><CheckCircle2 className="w-4 h-4"/>{m.xp} pontos conquistados</div> : <div className="flex gap-2 flex-wrap"><button onClick={()=>onNavigate(m.tab,m.sub)} className="text-xs font-semibold text-[#EE4D2D] rounded-lg bg-orange-50 hover:bg-orange-100 px-3 py-2.5 flex items-center gap-2">{m.action}<ArrowRight className="w-3.5 h-3.5"/></button>{m.id==='posts'&&<button onClick={()=>record('post')} className="text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2.5 flex items-center gap-1"><Check className="w-3.5 h-3.5"/>Já publiquei +1</button>}</div>}
      </article>})}
    </div>
    <aside className="rounded-xl bg-orange-50 border border-orange-100 p-4 flex gap-3"><Gift className="w-5 h-5 text-[#EE4D2D] shrink-0"/><p className="text-xs leading-relaxed text-slate-600">Os pontos acompanham sua rotina e não têm valor em dinheiro. O progresso é salvo neste navegador, separado por conta. Posts externos são informados por você; divulgar não garante vendas.</p></aside>
  </section>;
}
