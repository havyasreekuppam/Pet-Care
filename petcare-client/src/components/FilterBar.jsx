import { useState } from 'react';

const ACTIVITY_TYPES = ['Walk', 'Vet Visit', 'Grooming', 'Play', 'Feed', 'Bath', 'Training', 'Medication'];

export default function FilterBar({ filters, onApplyFilter }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = Object.values(localFilters).some(v => v !== '');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onApplyFilter(localFilters);
  };

  const handleReset = () => {
    const reset = { petName: '', activityType: '', startDate: '', endDate: '' };
    setLocalFilters(reset);
    onApplyFilter(reset);
  };

  return (
    <section className="card" style={{ padding:'24px 28px' }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          width:'100%', background:'none', border:'none', cursor:'pointer', padding:0
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'1.3rem' }}>🔍</span>
          <h2 className="section-title">Filter Activities</h2>
          {hasActiveFilters && (
            <span style={{
              background:'var(--paw-brown)', color:'white',
              borderRadius:'999px', padding:'2px 10px',
              fontSize:'11px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em'
            }}>
              Active
            </span>
          )}
        </div>
        <span style={{ color:'var(--text-light)', fontSize:'18px', transition:'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'grid', gap:'16px', gridTemplateColumns:'1fr 1fr' }}>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                🐶 Pet Name
              </label>
              <input
                className="field-input"
                name="petName"
                value={localFilters.petName}
                onChange={handleChange}
                placeholder="Buddy"
              />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                🏷️ Activity Type
              </label>
              <select
                className="field-input"
                name="activityType"
                value={localFilters.activityType}
                onChange={handleChange}
                style={{ cursor:'pointer' }}
              >
                <option value="">All types</option>
                {ACTIVITY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gap:'16px', gridTemplateColumns:'1fr 1fr' }}>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                📅 From Date
              </label>
              <input
                className="field-input"
                name="startDate"
                type="date"
                value={localFilters.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                📅 To Date
              </label>
              <input
                className="field-input"
                name="endDate"
                type="date"
                value={localFilters.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display:'flex', gap:'12px', paddingTop:'4px' }}>
            <button type="submit" className="btn-primary">
              🔍 Apply Filters
            </button>
            <button type="button" className="btn-secondary" onClick={handleReset}>
              ✕ Clear All
            </button>
          </div>
        </form>
      )}

      {!isExpanded && hasActiveFilters && (
        <div style={{ marginTop:'12px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {localFilters.petName && (
            <span style={{ background:'#fef3e7', border:'1.5px solid var(--border-soft)', borderRadius:'999px', padding:'4px 12px', fontSize:'13px', color:'var(--text-mid)', fontWeight:600 }}>
              🐶 {localFilters.petName}
            </span>
          )}
          {localFilters.activityType && (
            <span style={{ background:'#fef3e7', border:'1.5px solid var(--border-soft)', borderRadius:'999px', padding:'4px 12px', fontSize:'13px', color:'var(--text-mid)', fontWeight:600 }}>
              🏷️ {localFilters.activityType}
            </span>
          )}
          {(localFilters.startDate || localFilters.endDate) && (
            <span style={{ background:'#fef3e7', border:'1.5px solid var(--border-soft)', borderRadius:'999px', padding:'4px 12px', fontSize:'13px', color:'var(--text-mid)', fontWeight:600 }}>
              📅 {localFilters.startDate || '...'} → {localFilters.endDate || '...'}
            </span>
          )}
          <button onClick={handleReset} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'13px', color:'var(--paw-brown)', fontWeight:700 }}>
            Clear
          </button>
        </div>
      )}
    </section>
  );
}