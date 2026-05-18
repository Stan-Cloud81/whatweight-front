import { useState } from 'react';
import { ActivityIntensity } from '../types';

interface Props {
  onAdd: (name: string, intensity: ActivityIntensity, duration: number, points: number) => void;
}

const INTENSITIES: ActivityIntensity[] = ['léger', 'modéré', 'élevé'];

export function ActivityForm({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [points, setPoints] = useState('');
  const [intensity, setIntensity] = useState<ActivityIntensity>('modéré');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && duration && points) {
      onAdd(name.trim(), intensity, Number(duration), Number(points));
      setName('');
      setDuration('');
      setPoints('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-group">
      <input
        type="text"
        placeholder="Activité (ex: Course)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div className="input-row">
        <input
          type="number"
          placeholder="Durée (min)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="1"
          required
          style={{ flex: 1 }}
        />
        <select
          value={intensity}
          onChange={(e) => setIntensity(e.target.value as ActivityIntensity)}
          style={{ flex: 1 }}
        >
          {INTENSITIES.map((int) => (
            <option key={int} value={int}>
              {int.charAt(0).toUpperCase() + int.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="input-row">
        <input
          type="number"
          placeholder="Points gagnés"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          min="0"
          step="0.5"
          required
          style={{ flex: 1 }}
        />
      </div>
      <button type="submit">+ Ajouter activité</button>
    </form>
  );
}
