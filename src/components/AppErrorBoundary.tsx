import React from 'react';
export class AppErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{
 declare props:Readonly<{children:React.ReactNode}>;
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error:Error){console.error('shopgo_view_error',{name:error.name,message:error.message});}
 render(){if(!this.state.failed)return this.props.children;return <section role="alert" className="mx-auto my-6 max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm"><h2 className="text-lg font-semibold">Não foi possível abrir esta tela</h2><p className="mt-3 text-sm leading-relaxed text-slate-500">Confira sua conexão e atualize a página para carregar a versão mais recente da ShopGO.</p><button onClick={()=>window.location.reload()} className="mt-5 w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white">Atualizar página</button></section>;}
}
