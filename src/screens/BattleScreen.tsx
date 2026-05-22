import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Pause from 'lucide-react/dist/esm/icons/pause';
import Play from 'lucide-react/dist/esm/icons/play';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { BattleStatusBar } from '../components/BattleStatusBar';
import { DebugPanel } from '../components/DebugPanel';
import { FormationBadge } from '../components/FormationBadge';
import { RhythmLegend } from '../components/RhythmLegend';
import { formationRecipes } from '../data/formations';
import { strokeMap } from '../data/strokes';
import { AudioEngine } from '../game/audio/AudioEngine';
import { createBattleState, createVisualEffectId, resolveCommand, resolveEnemyEvent, resolveFormation } from '../game/battle/CommandResolver';
import { enemyEventAt } from '../game/battle/EnemyDirector';
import { gradeForResult, hasBattleEnded } from '../game/battle/BattleEngine';
import { APPROACH_TIME_MS, RESULT_DELAY_MS, SIMULTANEOUS_INPUT_MS } from '../game/constants';
import { directKeyStroke, keyToSideStrength, strokeFromTouch, type InputSide, type InputStrength } from '../game/input';
import { clamp } from '../game/math';
import { getVisibleNotes, isChartFinished } from '../game/rhythm/ChartPlayer';
import { PatternDetector, type PatternCandidate } from '../game/rhythm/PatternDetector';
import { RhythmEngine, type HitResult } from '../game/rhythm/RhythmEngine';
import { currentBeat } from '../game/timing';
import { GameCanvas } from '../game/render/GameCanvas';
import type { BattleResult, BattleState, GameProgress, GameSettings, LevelDefinition, RhythmChart, StrokeType, VisualEffect } from '../game/types';
import { equippedEffects } from '../state/save';

interface BattleScreenProps {
  level: LevelDefinition;
  chart: RhythmChart;
  progress: GameProgress;
  settings: GameSettings;
  onExit: () => void;
  onComplete: (result: BattleResult) => void;
}

interface PendingInput {
  side: InputSide;
  strength: InputStrength;
  timer: number;
}

export function BattleScreen({ level, chart, progress, settings, onExit, onComplete }: BattleScreenProps) {
  const [running, setRunning] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [battleState, setBattleState] = useState(() => createBattleState(level.alertGauge ? 20 : 0));
  const [effects, setEffects] = useState<VisualEffect[]>([]);
  const [score, setScore] = useState(0);
  const [accuracyWeight, setAccuracyWeight] = useState(0);
  const [judgedCount, setJudgedCount] = useState(0);
  const [candidate, setCandidate] = useState<PatternCandidate | undefined>();
  const [recentInput, setRecentInput] = useState('대기');
  const [fps, setFps] = useState(60);

  const engineRef = useRef(new RhythmEngine(chart));
  const audioRef = useRef(new AudioEngine());
  const startRef = useRef(0);
  const currentRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);
  const endedRef = useRef(false);
  const lastEnemyIndexRef = useRef(0);
  const pendingRef = useRef<PendingInput | undefined>(undefined);
  const lastFrameRef = useRef(performance.now());
  const detectorRef = useRef(
    new PatternDetector(formationRecipes, unlockedFormationIds(progress), () => currentRef.current),
  );
  const equipmentEffects = useMemo(() => equippedEffects(progress), [progress]);
  const debugEnabled = useMemo(() => new URLSearchParams(window.location.search).has('debug'), []);

  useEffect(() => {
    engineRef.current = new RhythmEngine(chart);
    detectorRef.current = new PatternDetector(formationRecipes, unlockedFormationIds(progress), () => currentRef.current);
    setBattleState(createBattleState(level.alertGauge ? 20 : 0));
    setCurrentTimeMs(0);
    setEffects([]);
    setScore(0);
    setAccuracyWeight(0);
    setJudgedCount(0);
    setCandidate(undefined);
    setRecentInput('대기');
    setRunning(false);
    endedRef.current = false;
    lastEnemyIndexRef.current = 0;
  }, [chart, level, progress]);

  const addEffect = useCallback((kind: VisualEffect['kind'], text: string, lane?: VisualEffect['lane'], durationMs = 900) => {
    const effect: VisualEffect = {
      id: createVisualEffectId(kind),
      kind,
      text,
      createdAt: currentRef.current,
      durationMs,
      lane,
    };
    setEffects((items) => [effect, ...items].slice(0, 12));
  }, []);

  const finish = useCallback(
    (outcome: 'victory' | 'defeat', state: BattleState) => {
      if (endedRef.current) {
        return;
      }
      endedRef.current = true;
      setRunning(false);
      const totalNotes = chart.notes.length;
      const accuracy = totalNotes > 0 ? (accuracyWeight / totalNotes) * 100 : 0;
      const victory = outcome === 'victory';
      const grade = gradeForResult(victory, accuracy, state.maxCombo);
      const xpGained = victory ? 100 + level.difficulty * 35 + gradeBonus(grade) : 35;
      audioRef.current.playEffect(victory ? 'clear' : 'enemy', settings.volume, settings.muted);
      window.setTimeout(() => {
        onComplete({
          levelId: level.id,
          levelTitle: level.titleKo,
          victory,
          score,
          accuracy,
          maxCombo: state.maxCombo,
          grade,
          xpGained,
          unlocked: victory ? level.unlocks ?? [] : [],
        });
      }, RESULT_DELAY_MS);
    },
    [accuracyWeight, chart.notes.length, level, onComplete, score, settings.muted, settings.volume],
  );

  const applyHit = useCallback(
    (hit: HitResult) => {
      const strokeForCommand = hit.inputStroke;
      const definition = strokeMap[strokeForCommand];
      setRecentInput(`${definition.korean} ${hit.judgement.toUpperCase()}`);
      setJudgedCount((count) => count + 1);
      setAccuracyWeight((weight) => weight + (hit.judgement === 'perfect' ? 1 : hit.judgement === 'great' ? 0.78 : hit.judgement === 'good' ? 0.45 : 0));
      setScore((value) => value + hit.score + (hit.judgement !== 'miss' ? battleState.combo * 12 : 0));

      const command = resolveCommand(battleState, strokeForCommand, hit.judgement, {
        nowMs: currentRef.current,
        levelId: level.id,
        commandPowerBonus: equipmentEffects.commandPowerBonus,
      });

      let nextState = command.state;
      if (level.alertGauge && hit.wrongStroke && isStrong(strokeForCommand) && hit.note && isSoft(hit.note.type)) {
        nextState = {
          ...nextState,
          alertGauge: clamp(nextState.alertGauge + 18, 0, 100),
        };
        addEffect('miss', '경보 상승!');
      }

      const detection = detectorRef.current.record({
        stroke: strokeForCommand,
        judgement: hit.judgement,
        beat: hit.beat,
      });
      setCandidate(detection.candidate);
      if (detection.formation) {
        nextState = resolveFormation(nextState, detection.formation, currentRef.current);
        addEffect('formation', detection.formation.bannerText, 'both', 1200);
        audioRef.current.playEffect('formation', settings.volume, settings.muted);
      } else {
        addEffect(command.effectKind, command.eventText, strokeMap[strokeForCommand].lane);
      }

      audioRef.current.playStroke(strokeForCommand, hit.judgement, settings.volume, settings.muted);
      setBattleState(nextState);
    },
    [addEffect, battleState, equipmentEffects.commandPowerBonus, level.alertGauge, level.id, settings.muted, settings.volume],
  );

  const submitStroke = useCallback(
    (stroke: StrokeType) => {
      if (!running || endedRef.current) {
        return;
      }
      const hit = engineRef.current.hit(stroke, currentRef.current, settings.offsetMs, settings.judgementScale + equipmentEffects.timingWindowBonus);
      applyHit(hit);
    },
    [applyHit, equipmentEffects.timingWindowBonus, running, settings.judgementScale, settings.offsetMs],
  );

  useEffect(() => {
    if (!running) {
      return;
    }

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;
      currentRef.current = elapsed;
      setCurrentTimeMs(elapsed);
      setFps(1000 / Math.max(1, delta));

      const misses = engineRef.current.collectMisses(elapsed, settings.offsetMs, settings.judgementScale + equipmentEffects.timingWindowBonus);
      if (misses.length > 0) {
        misses.forEach(applyHit);
      }

      setBattleState((previous) => {
        let next = previous;
        const enemy = enemyEventAt(level, elapsed, lastEnemyIndexRef.current);
        if (enemy) {
          lastEnemyIndexRef.current = enemy.index;
          next = resolveEnemyEvent(next, enemy.event, elapsed, equipmentEffects.defenseBonus);
          addEffect(enemy.event === 'cannon' ? 'cannon' : enemy.event === 'arrowRain' ? 'arrow' : 'charge', enemyText(enemy.event), 'both');
          audioRef.current.playEffect('enemy', settings.volume, settings.muted);
        }

        const outcome = hasBattleEnded(level, next, elapsed, isChartFinished(chart, elapsed));
        if (outcome) {
          finish(outcome, next);
        }
        return next;
      });

      if (!endedRef.current) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [addEffect, applyHit, chart, equipmentEffects.defenseBonus, equipmentEffects.timingWindowBonus, finish, level, running, settings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      const direct = directKeyStroke(event.key);
      if (direct) {
        event.preventDefault();
        submitStroke(direct);
        return;
      }

      const sideStrength = keyToSideStrength(event.key);
      if (!sideStrength) {
        return;
      }
      event.preventDefault();
      handleSideInput(sideStrength.side, sideStrength.strength);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (pendingRef.current) {
        window.clearTimeout(pendingRef.current.timer);
      }
    };
  }, [submitStroke]);

  const handleSideInput = (side: InputSide, strength: InputStrength) => {
    const pending = pendingRef.current;
    if (pending && pending.side !== side && pending.strength === strength) {
      window.clearTimeout(pending.timer);
      pendingRef.current = undefined;
      submitStroke(strokeFromTouch('both', strength));
      return;
    }

    if (pending) {
      window.clearTimeout(pending.timer);
      submitStroke(strokeFromTouch(pending.side, pending.strength));
    }

    const timer = window.setTimeout(() => {
      submitStroke(strokeFromTouch(side, strength));
      pendingRef.current = undefined;
    }, SIMULTANEOUS_INPUT_MS);
    pendingRef.current = { side, strength, timer };
  };

  const startBattle = async () => {
    await audioRef.current.resume();
    startRef.current = performance.now() - currentRef.current;
    lastFrameRef.current = performance.now();
    setRunning(true);
  };

  const visibleNotes = getVisibleNotes(
    chart,
    currentTimeMs,
    engineRef.current.getResolvedIds(),
    APPROACH_TIME_MS / Math.max(0.6, settings.noteSpeed + equipmentEffects.noteSpeedBonus),
  );
  const beat = currentBeat(currentTimeMs, chart);
  const activeFormation = battleState.activeFormationUntil > currentTimeMs ? battleState.activeFormationId : undefined;

  return (
    <main className="battle-screen">
      <header className="battle-header">
        <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onExit}>
          나가기
        </Button>
        <div>
          <p className="eyebrow">{chart.name}</p>
          <h1>{level.titleKo}</h1>
        </div>
        <Button variant={running ? 'secondary' : 'primary'} icon={running ? <Pause size={17} /> : <Play size={17} />} onClick={startBattle}>
          {running ? '진행 중' : '시작'}
        </Button>
      </header>

      <BattleStatusBar state={battleState} />
      <section className="battle-stage">
        <GameCanvas
          chart={chart}
          level={level}
          battleState={battleState}
          currentTimeMs={currentTimeMs}
          visibleNotes={visibleNotes}
          effects={effects}
          settings={settings}
        />
        {!running && !endedRef.current ? (
          <div className="start-overlay">
            <h2>북채를 들어 군령을 시작하세요</h2>
            <p>첫 클릭 후 사운드가 켜집니다. 키보드 F/D/J/K 또는 하단 터치 영역을 사용하세요.</p>
            <Button variant="primary" icon={<Play size={18} />} onClick={startBattle}>
              전투 시작
            </Button>
          </div>
        ) : null}
      </section>

      <section className="battle-hud">
        <FormationBadge activeId={activeFormation} candidateId={candidate?.recipe.id} progress={candidate?.progress} />
        <div className="score-strip">
          <span>점수 {score.toLocaleString()}</span>
          <span>콤보 {battleState.combo}</span>
          <span>정확도 {judgedCount ? Math.round((accuracyWeight / judgedCount) * 100) : 0}%</span>
          <span>{recentInput}</span>
        </div>
      </section>

      <section className="touch-drum" aria-label="장구 입력">
        <button onPointerDown={() => handleSideInput('left', 'soft')}>구<br /><small>D/S</small></button>
        <button className="strong" onPointerDown={() => handleSideInput('left', 'strong')}>궁<br /><small>F/A</small></button>
        <button className="both" onPointerDown={() => submitStroke('Deo')}>더<br /><small>Enter</small></button>
        <button className="both strong" onPointerDown={() => submitStroke('Dung')}>덩<br /><small>Space</small></button>
        <button className="strong right" onPointerDown={() => handleSideInput('right', 'strong')}>따<br /><small>J/L</small></button>
        <button className="right" onPointerDown={() => handleSideInput('right', 'soft')}>다<br /><small>K/;</small></button>
      </section>

      <details className="legend-details">
        <summary>입력표</summary>
        <RhythmLegend />
      </details>

      {debugEnabled ? (
        <DebugPanel
          currentTime={currentTimeMs}
          currentBeat={beat}
          offsetMs={settings.offsetMs}
          activeNotes={visibleNotes.length}
          recentInput={recentInput}
          battleState={battleState}
          patternBuffer={detectorRef.current.getBuffer().map((item) => strokeMap[item.stroke].korean).join(' ')}
          fps={fps}
          effects={effects}
        />
      ) : null}
    </main>
  );
}

function unlockedFormationIds(progress: GameProgress): string[] {
  return [...new Set(['wonjin', 'iljajin', ...progress.unlockedFormations])];
}

function gradeBonus(grade: string): number {
  return grade === 'S' ? 80 : grade === 'A' ? 55 : grade === 'B' ? 35 : grade === 'C' ? 20 : 0;
}

function isStrong(stroke: StrokeType): boolean {
  return stroke === 'Gung' || stroke === 'Tta' || stroke === 'Dung';
}

function isSoft(stroke: StrokeType): boolean {
  return stroke === 'Gu' || stroke === 'Da' || stroke === 'Deo';
}

function enemyText(event: string): string {
  if (event === 'cannon') {
    return '적 포격!';
  }
  if (event === 'arrowRain') {
    return '화살비!';
  }
  if (event === 'ambush') {
    return '매복 기습!';
  }
  if (event === 'charge') {
    return '적 돌격!';
  }
  return '적 사기 상승!';
}
