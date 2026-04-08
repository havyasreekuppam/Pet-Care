import { useState } from 'react';

export default function VetCounter({ selectedPet, setSelectedPet, api }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!selectedPet) { setError('Enter a pet name first.'); return; }
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/activities/vet-counter/${encodeURIComponent(selectedPet)}`);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Unable to retrieve vet visit data.');
    } finally {
      setLoading(false);
    }
  };

  const urgency = result ? (
    result.daysSinceLastVetVisit == null ? 'unknown' :
    result.daysSinceLastVetVisit > 365 ? 'overdue' :
    result.daysSinceLastVetVisit > 180 ? 'soon' : 'ok'
  ) : null;

  const urgencyConfig = {
    overdue: { color:'#c62828', bg:'#fce4ec', icon:'🚨', text:'Overdue for a checkup!' },
    soon:    { color:'#f57f17', bg:'#fff8e1', icon:'⚠️', text:'Consider scheduling soon' },
    ok:      { color:'#2e7d32', bg:'#e8f5e9', icon:'✅', text:'Up to date!' },
    unknown: { color:'#1565c0', bg:'#e3f2fd', icon:'📋', text:'No vet visits recorded' },
  };

  return (
    <section className="card" style={{ padding:'24px 28px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
        <span style={{ fontSize:'1.5rem' }}>🏥</span>
        <h2 className="section-title">Vet Visit Counter</h2>
      </div>

      <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
        <input
          className="field-input"
          value={selectedPet}
          onChange={(e) => { setSelectedPet(e.target.value); setResult(null); }}
          placeholder="Pet name..."
          style={{ flex:1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
        />
        <button
          className="btn-primary"
          onClick={handleCheck}
          style={{ whiteSpace:'nowrap', padding:'12px 16px' }}
          disabled={loading}
        >
          {loading ? '...' : '🔎'}
        </button>
      </div>

      {error && (
        <p style={{ color:'#c62828', fontSize:'13px', fontWeight:600, marginBottom:'12px' }}>
          ⚠️ {error}
        </p>
      )}

      {result && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {/* Urgency banner */}
          {urgency && (
            <div style={{
              background: urgencyConfig[urgency].bg,
              borderRadius:'12px', padding:'12px 14px',
              display:'flex', alignItems:'center', gap:'8px',
              color: urgencyConfig[urgency].color, fontWeight:700, fontSize:'14px'
            }}>
              {urgencyConfig[urgency].icon} {urgencyConfig[urgency].text}
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div className="stat-box">
              <div className="stat-number">{result.visits}</div>
              <div className="stat-label">Vet Visits</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">
                {result.daysSinceLastVetVisit != null ? result.daysSinceLastVetVisit : '—'}
              </div>
              <div className="stat-label">Days Since</div>
            </div>
          </div>

          {/* Last visit date */}
          <div style={{
            background:'var(--cream)', border:'1.5px solid var(--border-soft)',
            borderRadius:'12px', padding:'12px 14px', fontSize:'13px', color:'var(--text-mid)'
          }}>
            <span style={{ fontWeight:700 }}>Last visit:</span>{' '}
            {result.lastVetVisitDate
              ? new Date(result.lastVetVisitDate).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
              : 'No vet visits on record'}
          </div>
        </div>
      )}
    </section>
  );
}