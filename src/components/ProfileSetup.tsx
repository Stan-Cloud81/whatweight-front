import { useState } from 'react';
import { Gender } from '../types';

interface Props {
  onComplete: (gender: Gender, birthDate: string, height: number) => void;
}

export function ProfileSetup({ onComplete }: Props) {
  const [gender, setGender] = useState<Gender>('femme');
  const [birthDate, setBirthDate] = useState('');
  const [height, setHeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthDate && height) {
      onComplete(gender, birthDate, Number(height));
    }
  };

  return (
    <div className="profile-setup-overlay">
      <div className="profile-setup-dialog">
        <h2>Configuration du profil</h2>
        <p className="profile-setup-description">
          Pour calculer vos points de base quotidiens, nous avons besoin de quelques informations.
        </p>
        
        <form onSubmit={handleSubmit} className="profile-setup-form">
          <div className="form-group">
            <label>Sexe</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value as Gender)}
              required
            >
              <option value="femme">Femme</option>
              <option value="homme">Homme</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date de naissance</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Taille (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="100"
              max="250"
              required
              placeholder="Ex: 170"
            />
          </div>

          <button type="submit" className="profile-submit-btn">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
