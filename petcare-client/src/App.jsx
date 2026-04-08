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
      setError('Unable to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 rounded-3xl bg-white p-8 shadow-md">
          <h1 className="text-4xl font-semibold text-slate-900">PetCare</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Track pet activities, appointments, vet visits, and wellness checks in one place.</p>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="space-y-8">
            <ActivityForm onAddActivity={handleAdd} />
            <FilterBar filters={filters} onApplyFilter={handleFilter} />
            {error && <div className="rounded-xl bg-rose-100 p-4 text-rose-700">{error}</div>}
            {loading ? (
              <div className="rounded-xl bg-white p-6 text-slate-700 shadow-sm">Loading activities...</div>
            ) : (
              <ActivityList activities={activities} />
            )}
          </section>

          <aside className="space-y-6">
            <VetCounter selectedPet={selectedPet} setSelectedPet={setSelectedPet} api={api} />
            <div className="rounded-3xl bg-white p-6 shadow-md">
              <h2 className="text-xl font-semibold text-slate-900">Activity Summary</h2>
              <p className="mt-3 text-slate-600">View all entries and filter by pet name, activity type, or date range.</p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
