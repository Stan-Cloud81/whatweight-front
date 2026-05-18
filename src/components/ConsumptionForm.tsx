import { useState } from 'react';
import { MealType } from '../types';

interface Props {
  onAdd: (name: string, pointsPerUnit: number, mealType: MealType, quantity: number) => void;
}

const MEAL_TYPES: MealType[] = ['matin', 'midi', 'soir', 'en-cas', 'apéro'];

export function ConsumptionForm({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [pointsPerUnit, setPointsPerUnit] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>('midi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && pointsPerUnit) {
      onAdd(name.trim(), Number(pointsPerUnit), mealType, quantity);
      setName('');
      setPointsPerUnit('');
      setQuantity(1);
    }
  };

  const totalPoints = pointsPerUnit ? Number(pointsPerUnit) * quantity : 0;

  return (
    <form onSubmit={handleSubmit} className="input-group">
      <input
        type="text"
        placeholder="Nom (ex: Pomme)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
