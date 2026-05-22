import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import type { GameSettings } from '../game/types';
import { DEFAULT_SETTINGS } from '../game/constants';
import { Button } from '../components/Button';
import { Panel } from '../components/Panel';

interface SettingsScreenProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onBack: () => void;
}

export function SettingsScreen({ settings, onChange, onBack }: SettingsScreenProps) {
  return (
    <main className="app-screen compact">
      <header className="screen-header">
        <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack}>
          돌아가기
        </Button>
        <div>
          <p className="eyebrow">설정</p>
          <h1>입력과 사운드</h1>
        </div>
      </header>
      <Panel title="판정 보정">
        <SettingRange
          label="오디오 지연 보정"
          value={settings.offsetMs}
          min={-200}
          max={200}
          step={5}
          suffix="ms"
          onChange={(offsetMs) => onChange({ ...settings, offsetMs })}
        />
        <SettingRange
          label="판정 범위"
          value={settings.judgementScale}
          min={0.75}
          max={1.35}
          step={0.05}
          suffix="x"
          onChange={(judgementScale) => onChange({ ...settings, judgementScale })}
        />
        <SettingRange
          label="노트 속도"
          value={settings.noteSpeed}
          min={0.75}
          max={1.35}
          step={0.05}
          suffix="x"
          onChange={(noteSpeed) => onChange({ ...settings, noteSpeed })}
        />
      </Panel>
      <Panel title="사운드와 접근성">
        <SettingRange
          label="볼륨"
          value={settings.volume}
          min={0}
          max={1}
          step={0.05}
          suffix=""
          onChange={(volume) => onChange({ ...settings, volume })}
        />
        <label className="setting-toggle">
          <input type="checkbox" checked={settings.muted} onChange={(event) => onChange({ ...settings, muted: event.currentTarget.checked })} />
          <span>음소거</span>
        </label>
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => onChange({ ...settings, reducedMotion: event.currentTarget.checked })}
          />
          <span>흔들림 줄이기</span>
        </label>
        <Button icon={<RotateCcw size={17} />} onClick={() => onChange({ ...DEFAULT_SETTINGS })}>
          기본값
        </Button>
      </Panel>
    </main>
  );
}

function SettingRange({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="setting-range">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.currentTarget.value))} />
      <strong>
        {value}
        {suffix}
      </strong>
    </label>
  );
}
