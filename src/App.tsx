import { useState } from 'react';
import type { BattleResult, EquipmentDefinition, LevelDefinition, RhythmChart } from './game/types';
import { chartMap } from './data/charts';
import { levelMap } from './data/levels';
import { MainMenu } from './screens/MainMenu';
import { CampaignScreen } from './screens/CampaignScreen';
import { BattleScreen } from './screens/BattleScreen';
import { TrainingScreen, trainingLevelForChart } from './screens/TrainingScreen';
import { CodexScreen } from './screens/CodexScreen';
import { EquipmentScreen } from './screens/EquipmentScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ResultScreen } from './screens/ResultScreen';
import { usePersistentProgress, usePersistentSettings } from './state/useGameStore';
import { applyBattleResult, saveProgress } from './state/save';
import './styles/theme.css';
import './styles/global.css';

type Screen = 'menu' | 'campaign' | 'training' | 'codex' | 'equipment' | 'settings' | 'battle' | 'result';

interface BattleRequest {
  level: LevelDefinition;
  chart: RhythmChart;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [progress, setProgress] = usePersistentProgress();
  const [settings, setSettings] = usePersistentSettings();
  const [battleRequest, setBattleRequest] = useState<BattleRequest | undefined>();
  const [lastResult, setLastResult] = useState<BattleResult | undefined>();

  const startLevel = (level: LevelDefinition) => {
    const chart = chartMap[level.chartIds[0]];
    setBattleRequest({ level, chart });
    setScreen('battle');
  };

  const startTraining = (chart: RhythmChart, mode: 'follow' | 'battle' = 'follow') => {
    setBattleRequest({ level: trainingLevelForChart(chart, mode), chart });
    setScreen('battle');
  };

  const completeBattle = (result: BattleResult) => {
    setLastResult(result);
    const originalLevel = levelMap[result.levelId];
    if (originalLevel) {
      setProgress(applyBattleResult(progress, result, originalLevel));
    } else if (result.victory) {
      const next = { ...progress, xp: progress.xp + result.xpGained };
      setProgress(next);
      saveProgress(next);
    }
    setScreen('result');
  };

  const equipItem = (item: EquipmentDefinition) => {
    const next = {
      ...progress,
      equipped: {
        ...progress.equipped,
        [item.slot]: item.id,
      },
    };
    setProgress(next);
  };

  if (screen === 'campaign') {
    return <CampaignScreen progress={progress} onBack={() => setScreen('menu')} onStart={startLevel} />;
  }

  if (screen === 'training') {
    return <TrainingScreen onBack={() => setScreen('menu')} onStartTraining={startTraining} />;
  }

  if (screen === 'codex') {
    return <CodexScreen onBack={() => setScreen('menu')} onPractice={(chart) => startTraining(chart, 'follow')} />;
  }

  if (screen === 'equipment') {
    return <EquipmentScreen progress={progress} onBack={() => setScreen('menu')} onEquip={equipItem} />;
  }

  if (screen === 'settings') {
    return <SettingsScreen settings={settings} onChange={setSettings} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'battle' && battleRequest) {
    return (
      <BattleScreen
        level={battleRequest.level}
        chart={battleRequest.chart}
        progress={progress}
        settings={settings}
        onExit={() => setScreen('campaign')}
        onComplete={completeBattle}
      />
    );
  }

  if (screen === 'result' && lastResult) {
    return (
      <ResultScreen
        result={lastResult}
        onHome={() => setScreen('menu')}
        onRetry={() => {
          if (battleRequest) {
            setScreen('battle');
          } else {
            setScreen('campaign');
          }
        }}
      />
    );
  }

  return (
    <MainMenu
      progress={progress}
      onNavigate={(nextScreen) => {
        setScreen(nextScreen);
      }}
    />
  );
}
