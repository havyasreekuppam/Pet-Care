import { useEffect, useState } from 'react';
import axios from 'axios';
import ActivityForm from './components/ActivityForm.jsx';
import ActivityList from './components/ActivityList.jsx';
import FilterBar from './components/FilterBar.jsx';
import VetCounter from './components/VetCounter.jsx';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000' });

function App() {
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState({ petName: '', activityType: '', startDate: '', endDate: '' });
  const [selectedPet, setSelectedPet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/activities');
      setActivities(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load activities. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadActivities(); }, []);

  const handleAdd = async (activity) => {
    try {
      const response = await api.post('/api/activities', activity);
      setActivities((current) => [response.data, ...current]);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to add activity');
    }
  };

  const handleFilter = async (newFilters) => {
    setFilters(newFilters);
    try {
      setLoading(true);
      const params = {};
      if (newFilters.petName) params.petName = newFilters.petName;
      if (newFilters.activityType) params.activityType = newFilters.activityType;
      if (newFilters.startDate) params.startDate = newFilters.startDate;
      if (newFilters.endDate) params.endDate = newFilters.endDate;
      const response = await api.get('/api/activities/filter', { params });
      setActivities(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to filter activities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Hero Header */}
        <header className="fade-up" style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 50%, #3d7bbf 100%)',
          borderRadius: '28px',
          padding: '40px 48px',
          marginBottom: '36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(29, 90, 143, 0.35)',
        }}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
          <div style={{ position:'absolute', bottom:'-20px', right:'120px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(0, 212, 255, 0.1)' }} />

          <div style={{ display:'flex', alignItems:'center', gap:'16px', position:'relative' }}>
            <span style={{ fontSize:'3rem' }}>🐾</span>
            <div>
              <h1 style={{ fontFamily:'"Playfair Display", serif', fontSize:'2.8rem', fontWeight:700, color:'white', lineHeight:1, marginBottom:'8px', textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}>
                PetCare
              </h1>
              <p style={{ color:'rgba(255,255,255,0.9)', fontSize:'1.05rem', fontFamily:'"Nunito", sans-serif', fontWeight:500, textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}>
                Track activities, vet visits & wellness — all in one cozy place 🌿
              </p>
            </div>
          </div>

          {/* Quick stats bar */}
          <div style={{ display:'flex', gap:'24px', marginTop:'28px', position:'relative' }}>
            {[
              { emoji:'📋', label:'Total Activities', value: activities.length },
              { emoji:'🏥', label:'Pets Tracked', value: [...new Set(activities.map(a => a.petName))].length },
              { emoji:'📅', label:'This Month', value: activities.filter(a => new Date(a.activityDate) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '12px 20px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                minWidth: '110px',
              }}>
                <div style={{ color:'white', fontFamily:'"Playfair Display", serif', fontSize:'1.6rem', fontWeight:700, lineHeight:1 }}>
                  {stat.emoji} {stat.value}
                </div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700, marginTop:'4px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* Main layout */}
        <main style={{ display:'grid', gap:'28px', gridTemplateColumns:'1fr', alignItems:'start' }}>
          <div style={{ display:'grid', gap:'28px', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,0.6fr)', alignItems:'start' }}
               className="lg-grid">

            {/* Left column */}
            <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
              <div className="fade-up delay-1">
                <ActivityForm onAddActivity={handleAdd} />
              </div>
              <div className="fade-up delay-2">
                <FilterBar filters={filters} onApplyFilter={handleFilter} />
              </div>

              {error && (
                <div className="fade-up" style={{
                  background:'#fce8e8', border:'1.5px solid #f5c6c6', borderRadius:'16px',
                  padding:'16px 20px', color:'#c62828', fontWeight:600, display:'flex', gap:'8px', alignItems:'center'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="fade-up delay-3">
                {loading ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {[1,2,3].map(i => (
                      <div key={i} className="shimmer" style={{ height:'100px' }} />
                    ))}
                  </div>
                ) : (
                  <ActivityList activities={activities} />
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
              <div className="fade-up delay-2">
                <VetCounter selectedPet={selectedPet} setSelectedPet={setSelectedPet} api={api} />
              </div>
              <div className="fade-up delay-3 card" style={{ padding:'24px' }}>
                <h2 className="section-title" style={{ marginBottom:'12px' }}>💡 Quick Tips</h2>
                <ul style={{ listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:'10px' }}>
                  {[
                    { icon:'🔍', text:'Filter by pet name or activity type to find specific records' },
                    { icon:'📅', text:'Use date range filters to review monthly activity patterns' },
                    { icon:'🏥', text:'Check vet visit counter to see when your pet is due for a checkup' },
                  ].map((tip, i) => (
                    <li key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start', fontSize:'13.5px', color:'var(--text-mid)', lineHeight:1.5 }}>
                      <span style={{ flexShrink:0 }}>{tip.icon}</span>
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;