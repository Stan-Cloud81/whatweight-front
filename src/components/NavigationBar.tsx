import { ViewMode } from '../types';

interface Props {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function NavigationBar({ currentView, onViewChange }: Props) {
  return (
    <nav className="nav-bar">
      <button
        className={`nav-btn ${currentView === 'daily' ? 'active' : ''}`}
        onClick={() => onViewChange('daily')}
        title="Suivi quotidien"
      >
        <span className="nav-icon">📝</span>
        <span className="nav-label">Aujourd'hui</span>
      </button>
      <button
        className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
        onClick={() => onViewChange('history')}
        title="Historique"
      >
        <span className="nav-icon">📊</span>
        <span className="nav-label">Historique</span>
      </button>
      <button
        className={`nav-btn ${currentView === 'weight' ? 'active' : ''}`}
        onClick={() => onViewChange('weight')}
        title="Suivi du poids"
      >
        <span className="nav-icon">⚖️</span>
        <span className="nav-label">Poids</span>
      </button>
    </nav>
  );
}
