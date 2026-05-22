import { useState, useRef, useEffect } from 'react';
import { ActivityIntensity } from '../types';
import { ActivityHistory } from '../hooks/useHistory';
import { calculateActivityPoints } from '../utils/pointsCalculator';

interface Props {
  onAdd: (name: string, intensity: ActivityIntensity, duration: number, points: number) => void | Promise<void>;
  activityHistory: ActivityHistory[];
  currentWeight: number | null;
}

const INTENSITIES: ActivityIntensity[] = ['léger', 'modéré', 'élevé'];

export function ActivityForm({ onAdd, activityHistory, currentWeight }: Props) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<ActivityIntensity>('modéré');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<ActivityHistory[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim().length > 0) {
      const suggestions = activityHistory.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item: ActivityHistory) => {
    setName(item.name);
    setDuration(item.durationMinutes.toString());
    setIntensity(item.intensity as ActivityIntensity);
    setShowSuggestions(false);
  };

  const calculatedPoints = duration && currentWeight
    ? calculateActivityPoints(intensity, Number(duration), currentWeight)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && duration && currentWeight) {
      await onAdd(name.trim(), intensity, Number(duration), calculatedPoints);
      setName('');
      setDuration('');
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-group">
      <div ref={wrapperRef} className="autocomplete-wrapper">
        <input
          type="text"
          placeholder="Activité (ex: Course)"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => {
            if (name.trim() && filteredSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          required
        />
        {showSuggestions && (
          <ul className="suggestions-list">
            {filteredSuggestions.map((item, index) => (
              <li
                key={index}
                className="suggestion-item"
                onClick={() => handleSelectSuggestion(item)}
              >
                <span className="suggestion-name">{item.name}</span>
                <span className="suggestion-details">
                  {item.durationMinutes}min • {item.intensity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
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
      {!currentWeight && (
        <div className="warning-message">
          ⚠️ Veuillez renseigner votre poids pour calculer les points
        </div>
      )}
      {calculatedPoints > 0 && (
        <div className="points-preview">
          Points gagnés: +{calculatedPoints}
        </div>
      )}
      <button type="submit" disabled={!currentWeight}>+ Ajouter activité</button>
    </form>
  );
}
