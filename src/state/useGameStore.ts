import { useEffect, useState } from 'react';
import type { GameProgress, GameSettings } from '../game/types';
import { loadProgress, loadSettings, saveProgress, saveSettings } from './save';

export function usePersistentProgress(): [GameProgress, (progress: GameProgress) => void] {
  const [progress, setProgressState] = useState<GameProgress>(() => loadProgress());

  const setProgress = (next: GameProgress) => {
    setProgressState(next);
    saveProgress(next);
  };

  return [progress, setProgress];
}

export function usePersistentSettings(): [GameSettings, (settings: GameSettings) => void] {
  const [settings, setSettingsState] = useState<GameSettings>(() => loadSettings());

  const setSettings = (next: GameSettings) => {
    setSettingsState(next);
    saveSettings(next);
  };

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false';
  }, [settings.reducedMotion]);

  return [settings, setSettings];
}
