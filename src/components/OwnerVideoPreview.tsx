import { useEffect, useRef, useState } from "react";
import { Film, Pause, Play, RotateCcw } from "lucide-react";
import type { Product, VideoScene } from "../types";

const preparationMs = 20_000;
const steps = ["Organizando as cenas", "Preparando os enquadramentos", "Montando a prévia vertical"];

export function OwnerVideoPreview({ product, scenes }: { product: Product; scenes: VideoScene[] }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const startedAt = useRef(0);
  const preparing = progress !== null && progress < 100;
  const ready = progress === 100 && scenes.length > 0;
  const scene = ready ? scenes[sceneIndex] : undefined;

  useEffect(() => {
    if (!preparing) return;
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt.current;
      setProgress(Math.min(100, Math.floor(elapsed / preparationMs * 100)));
    }, 150);
    return () => window.clearInterval(timer);
  }, [preparing]);

  useEffect(() => {
    if (!playing || !ready) return;
    const timer = window.setTimeout(() => {
      if (sceneIndex >= scenes.length - 1) {
        setPlaying(false);
        return;
      }
      setSceneIndex(sceneIndex + 1);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [playing, ready, sceneIndex, scenes.length]);

  function prepare() {
    setPlaying(false);
    setSceneIndex(0);
    startedAt.current = performance.now();
    setProgress(0);
  }

  function play() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (sceneIndex === scenes.length - 1) setSceneIndex(0);
    setPlaying(true);
  }

  return (
    <section aria-labelledby="owner-preview-title" className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-lg sm:p-5">
      <header className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-400/15 text-orange-300"><Film className="size-5" aria-hidden="true" /></div>
        <div>
          <h2 id="owner-preview-title" className="font-semibold">Prévia animada do vídeo</h2>
          <p className="text-sm text-slate-300">Veja as cenas antes de criar o vídeo final no Flow.</p>
        </div>
      </header>
      <div className="relative mx-auto flex aspect-[9/16] w-full max-w-[15rem] flex-col overflow-hidden rounded-[1.6rem] border-4 border-slate-700 bg-slate-900 shadow-xl">
        <img src={product.imageUrl} alt="" className={`absolute inset-0 size-full object-cover ${preparing ? "opacity-30 motion-safe:animate-pulse" : "opacity-80"}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/55" />
        <div className="relative mt-auto space-y-2 p-4">
          {preparing ? (
            <>
              <p role="status" className="text-sm font-semibold text-orange-200">{steps[Math.min(2, Math.floor(progress / 34))]}</p>
              <progress aria-label="Progresso da prévia do vídeo" value={progress} max={100} className="h-2 w-full accent-orange-500" />
              <p className="text-xs text-slate-200">{progress}%</p>
            </>
          ) : scene ? (
            <div key={sceneIndex} className="space-y-2 motion-safe:animate-in motion-safe:fade-in">
              <p className="text-xs font-semibold text-orange-200">Cena {sceneIndex + 1} de {scenes.length} · {scene.time}</p>
              <p className="break-words text-lg font-bold leading-tight">{scene.textOverlay}</p>
              <p className="text-sm leading-snug text-slate-100">{scene.narration}</p>
            </div>
          ) : (
            <p className="line-clamp-4 break-words text-base font-semibold">{product.name}</p>
          )}
        </div>
      </div>
      {ready && (
        <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Controles da prévia">
          <button type="button" onClick={play} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-700 px-3 text-sm font-semibold hover:bg-slate-600">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}{playing ? "Pausar" : "Reproduzir"}</button>
          {scenes.map((_, index) => (
            <button type="button" key={index} onClick={() => { setPlaying(false); setSceneIndex(index); }} aria-label={`Cena ${index + 1}`} aria-pressed={sceneIndex === index} className={`grid size-11 place-items-center rounded-lg text-sm font-semibold ${sceneIndex === index ? "bg-orange-300 text-slate-950" : "bg-slate-800 hover:bg-slate-700"}`}>{index + 1}</button>
          ))}
        </div>
      )}
      <button type="button" onClick={prepare} disabled={preparing} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 text-sm font-semibold hover:bg-orange-700 disabled:opacity-65">
        {ready ? <RotateCcw className="size-4" aria-hidden="true" /> : <Film className="size-4" aria-hidden="true" />}
        {preparing ? "Montando prévia…" : ready ? "Gerar prévia novamente" : "Gerar prévia animada"}
      </button>
    </section>
  );
}
