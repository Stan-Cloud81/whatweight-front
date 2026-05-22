import { useState, useRef, useEffect } from 'react';
import { MealType } from '../types';
import { FoodHistory } from '../hooks/useHistory';

interface Props {
  onAdd: (name: string, pointsPerUnit: number, mealType: MealType, quantity: number) => void | Promise<void>;
  foodHistory: FoodHistory[];
}

const MEAL_TYPES: MealType[] = ['matin', 'midi', 'soir', 'en-cas/plaisir'];

const MEAL_ICONS: Record<MealType, string> = {
  'matin': '/icons/petit-dejeuner.png',
  'midi': '/icons/dejeuner.png',
  'soir': '/icons/diner.png',
  'en-cas/plaisir': '/icons/plaisir.png',
};

const MEAL_LABELS: Record<MealType, string> = {
  'matin': 'Matin',
  'midi': 'Midi',
  'soir': 'Soir',
  'en-cas/plaisir': 'Plaisir',
};

export function ConsumptionForm({ onAdd, foodHistory }: Props) {
  const [name, setName] = useState('');
  const [pointsPerUnit, setPointsPerUnit] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>('midi');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<FoodHistory[]>([]);
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
      const suggestions = foodHistory.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item: FoodHistory) => {
    setName(item.name);
    setPointsPerUnit(item.pointsPerUnit.toString());
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && pointsPerUnit) {
      await onAdd(name.trim(), Number(pointsPerUnit), mealType, quantity);
      setName('');
      setPointsPerUnit('');
      setQuantity(1);
      setShowSuggestions(false);
    }
  };

  const totalPoints = pointsPerUnit ? Number(pointsPerUnit) * quantity : 0;

  return (
    <form onSubmit={handleSubmit} className="input-group">
      <div className="consumption-inputs-row">
        <div className="left-inputs">
          <div ref={wrapperRef} className="autocomplete-wrapper">
            <input
              type="text"
              placeholder="Nom (ex: Pomme)"
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
                    <span className="suggestion-points">{item.pointsPerUnit} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="number"
            placeholder="Points/unité"
            value={pointsPerUnit}
            onChange={(e) => setPointsPerUnit(e.target.value)}
            min="0"
            step="0.25"
            required
          />
        </div>
        <div className="meal-type-selector">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`meal-icon-btn ${mealType === type ? 'selected' : ''}`}
              onClick={() => setMealType(type)}
            >
              <img src={MEAL_ICONS[type]} alt={type} />
              <span className="meal-label">{MEAL_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="quantity-control">
        <button
          type="button"
          className="quantity-btn"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
        >
          −
        </button>
        <span className="quantity-display">
          Quantité: {quantity} {totalPoints > 0 && `(${totalPoints} pts)`}
        </span>
        <button
          type="button"
          className="quantity-btn"
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </button>
      </div>
      <button type="submit">+ Ajouter consommation</button>
    </form>
  );
}
