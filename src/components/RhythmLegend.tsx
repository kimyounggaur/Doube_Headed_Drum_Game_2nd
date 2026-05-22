import { strokeDefinitions } from '../data/strokes';

export function RhythmLegend() {
  return (
    <div className="rhythm-legend">
      {strokeDefinitions
        .filter((stroke) => stroke.id !== 'Rest')
        .map((stroke) => (
          <div key={stroke.id} className="legend-item">
            <span className="legend-dot" style={{ background: stroke.colorHint }} />
            <strong>{stroke.korean}</strong>
            <span>{stroke.touchLabel}</span>
            <small>{stroke.keyboard.join(' / ')}</small>
          </div>
        ))}
    </div>
  );
}
