import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useFinancial} from './FinancialContext';
import {advanceMission, freshMissions, missionDay, missionKey, readMissions, type MissionEvent, type MissionProgress} from '../utils/dailyMissions';

interface Missions {progress: MissionProgress; record: (event: MissionEvent, id?: string) => void}
const Context = createContext<Missions | null>(null);
export function DailyMissionsProvider({children}: {children: React.ReactNode}) {
  const {userEmail} = useFinancial();
  const owner = missionKey(userEmail);
  const load = () => {try {return readMissions(localStorage.getItem(owner));} catch {return freshMissions();}};
  const [saved,setSaved] = useState(() => ({owner,progress:load()}));
  const progress = saved.owner === owner ? saved.progress : load();
  useEffect(() => {
    const refresh = () => setSaved(current => current.owner !== owner || current.progress.day !== missionDay()
      ? {owner,progress:load()} : current);
    refresh();
    const timer = window.setInterval(refresh,30000);
    window.addEventListener('focus',refresh);
    return () => {clearInterval(timer);window.removeEventListener('focus',refresh);};
  },[owner]);
  useEffect(() => {
    if (saved.owner !== owner || !userEmail) return;
    try {localStorage.setItem(owner,JSON.stringify(saved.progress));} catch { /* Still works for this visit. */ }
  },[saved,owner,userEmail]);
  const record = useCallback((event: MissionEvent, id = '') => setSaved(current => ({owner,
    progress:advanceMission(current.owner === owner ? current.progress : load(),event,id),
  })),[owner]);
  return <Context.Provider value={{progress,record}}>{children}</Context.Provider>;
}
export function useDailyMissions() {
  const context = useContext(Context);
  if (!context) throw new Error('DailyMissionsProvider is required');
  return context;
}
