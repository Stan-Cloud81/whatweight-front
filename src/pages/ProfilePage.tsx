import { useState } from 'react';
import { Gender, UserProfile } from '../types';

interface Props {
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  currentWeight: number | null;
}

export function ProfilePage({ userProfile, onUpdateProfile, currentWeight }: Props) {
  const [gender, setGender] = useState<Gender>(userProfile.gender || 'femme');
  const [birthDate, setBirthDate] = useState(userProfile.birthDate || '');
  const [height, setHeight] = useState(userProfile.height?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthDate && height) {
      onUpdateProfile({
        gender,
        birthDate,
        height: Number(height),
      });
      setIsEditing(false);
    }
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const age = birthDate ? calculateAge(birthDate) : null;

  return (
    <div className="page-content">
      <h2>👤 Mon profil</h2>

      <section className="section">
        <div className="profile-info-card">
          <div className="profile-info-item">
            <span className="profile-label">Sexe</span>
            <span className="profile-value">{gender === 'homme' ? 'Homme' : 'Femme'}</span>
          </div>
          
          <div className="profile-info-item">
            <span className="profile-label">Date de naissance</span>
            <span className="profile-value">
              {birthDate 
                ? new Date(birthDate).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : 'Non renseignée'}
            </span>
          </div>

          {age !== null && (
            <div className="profile-info-item">
              <span className="profile-label">Âge</span>
              <span className="profile-value">{age} ans</span>
            </div>
          )}

          <div className="profile-info-item">
            <span className="profile-label">Taille</span>
            <span className="profile-value">{height ? `${height} cm` : 'Non renseignée'}</span>
          </div>

          {currentWeight && (
            <div className="profile-info-item">
              <span className="profile-label">Poids actuel</span>
              <span className="profile-value">{currentWeight} kg</span>
            </div>
          )}
        </div>

        {!isEditing ? (
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Modifier mes informations
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <h3>Modifier le profil</h3>
            
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

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setGender(userProfile.gender || 'femme');
                  setBirthDate(userProfile.birthDate || '');
                  setHeight(userProfile.height?.toString() || '');
                  setIsEditing(false);
                }}
              >
                Annuler
              </button>
              <button type="submit" className="save-btn">
                Enregistrer
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="section">
        <h3>ℹ️ Informations</h3>
        <div className="info-card">
          <p>
            Vos informations personnelles sont utilisées pour calculer vos points de base quotidiens 
            selon la formule Weight Watchers.
          </p>
          <p>
            Les points sont recalculés automatiquement à chaque enregistrement de poids.
          </p>
        </div>
      </section>
    </div>
  );
}
