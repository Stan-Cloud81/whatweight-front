import { useState, useRef, useEffect } from 'react';
import { MealType } from '../types';
import { FoodHistory } from '../hooks/useHistory';

interface Props {
  onAdd: (name: string, pointsPerUnit: number, mealType: MealType, quantity: number) => void;
  foodHistory: FoodHistory[];
}

const MEAL_TYPES: MealType[] = ['matin', 'midi', 'soir', 'en-cas', 'apéro'];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && pointsPerUnit) {
      onAdd(name.trim(), Number(pointsPerUnit), mealType, quantity);
      setName('');
      setPointsPerUnit('');
      setQuantity(1);
      setShowSuggestions(false);
    }
  };

  const totalPoints = pointsPerUnit ? Number(pointsPerUnit) * quantity : 0;

  return (
    <form onSubmit={handleSubmit} className="input-group">
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
      <div className="input-row">
        <input
          type="number"
          placeholder="Points/unité"
          value={pointsPerUnit}
          onChange={(e) => setPointsPerUnit(e.target.value)}
          min="0"
          step="0.5"
          required
          style={{ flex: 1 }}
        />
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          style={{ flex: 1 }}
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
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
