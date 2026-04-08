import { useState } from 'react';

const initialState = { petName: '', activityType: '', description: '', duration: '', activityDate: '' };
const ACTIVITY_TYPES = ['Walk', 'Vet Visit', 'Grooming', 'Play', 'Feed', 'Bath', 'Training', 'Medication'];

export default function ActivityForm({ onAddActivity }) {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.petName || !form.activityType) return;
    onAddActivity({
      petName: form.petName,
      activityType: form.activityType,
      description: form.description,
      duration: form.duration ? Number(form.duration) : null,
      activityDate: form.activityDate || new Date().toISOString()
    });
    setForm(initialState);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <section className="card" style={{ padding:'28px 32px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px' }}>
        <span style={{ fontSize:'1.5rem' }}>➕</span>
        <h2 className="section-title">Log New Activity</h2>
      </div>

      {submitted && (
        <div style={{
          background:'#e8f5e9', border:'1.5px solid #a5d6a7', borderRadius:'14px',
          padding:'12px 16px', color:'#2e7d32', fontWeight:700, marginBottom:'16px',
          display:'flex', alignItems:'center', gap:'8px', fontSize:'14px'
        }}>
          ✅ Activity logged successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <div style={{ display:'grid', gap:'16px', gridTemplateColumns:'1fr 1fr' }}>
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              🐶 Pet Name *
            </label>
            <input
              className="field-input"
              name="petName"
              value={form.petName}
              onChange={handleChange}
              placeholder="Buddy, Luna, Charlie..."
              required
            />
          </div>

          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              🏷️ Activity Type *
            </label>
            <select
              className="field-input"
              name="activityType"
              value={form.activityType}
              onChange={handleChange}
              required
              style={{ cursor:'pointer' }}
            >
              <option value="">Choose type...</option>
              {ACTIVITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
            📝 Notes
          </label>
          <textarea
            className="field-input"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Any observations, notes, or details..."
            style={{ resize:'vertical' }}
          />
        </div>

        <div style={{ display:'grid', gap:'16px', gridTemplateColumns:'1fr 1fr' }}>
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              ⏱️ Duration (min)
            </label>
            <input
              className="field-input"
              name="duration"
              type="number"
              min="1"
              value={form.duration}
              onChange={handleChange}
              placeholder="30"
            />
          </div>

          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text-mid)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              📅 Date
            </label>
            <input
              className="field-input"
              name="activityDate"
              type="date"
              value={form.activityDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ paddingTop:'4px' }}>
          <button type="submit" className="btn-primary">
            🐾 Log Activity
          </button>
        </div>
      </form>
    </section>
  );
}