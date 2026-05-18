import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWeightTracker } from '../hooks/useWeightTracker';

export function WeightPage() {
  const { weightEntries, addWeightEntry, deleteWeightEntry } = useWeightTracker();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight) {
      addWeightEntry(Number(weight), date);
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const chartData = weightEntries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    poids: entry.weight,
  }));

  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null;
  const firstWeight = weightEntries.length > 0 ? weightEntries[0].weight : null;
  const weightDiff = latestWeight && firstWeight ? latestWeight - firstWeight : 0;

  return (
    <div className="page-content">
      <div className="weight-summary">
        <h2>Suivi du poids</h2>
        {latestWeight !== null && (
          <div className="weight-stats">
            <div className="weight-stat">
              <span className="stat-label">Poids actuel</span>
              <span className="stat-value">{latestWeight} kg</span>
            </div>
            {weightEntries.length > 1 && (
              <div className="weight-stat">
                <span className="stat-label">Évolution</span>
                <span className={`stat-value ${weightDiff < 0 ? 'positive' : weightDiff > 0 ? 'negative' : ''}`}>
                  {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <section className="section">
        <h3>📊 Graphique d'évolution</h3>
        {chartData.length > 0 ? (
          <div className="chart-container-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  width={40}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="poids" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">Aucune donnée de poids enregistrée</div>
        )}
      </section>

      <section className="section">
        <h3>➕ Ajouter un poids</h3>
        <form onSubmit={handleSubmit} className="input-group">
          <div className="input-row">
            <input
              type="number"
              placeholder="Poids (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.1"
              required
              style={{ flex: 1 }}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ flex: 1 }}
            />
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </section>

      <section className="section">
        <h3>📋 Historique</h3>
        {weightEntries.length > 0 ? (
          <div className="entries-list">
            {[...weightEntries].reverse().map((entry) => (
              <div key={entry.id} className="entry-item">
                <div className="entry-info">
                  <div className="entry-name">{entry.weight} kg</div>
                  <div className="entry-details">
                    {new Date(entry.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteWeightEntry(entry.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Aucun historique</div>
        )}
      </section>
    </div>
  );
}
