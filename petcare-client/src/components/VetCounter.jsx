import { useState } from 'react';

export default function VetCounter({ selectedPet, setSelectedPet, api }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!selectedPet) {
      setError('Enter a pet name to check vet visits.');
      return;
    }

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

  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-slate-900">Vet Visit Counter</h2>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Pet Name</span>
          <input
            value={selectedPet}
            onChange={(event) => setSelectedPet(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            placeholder="Buddy"
          />
        </label>

        <button
          type="button"
          onClick={handleCheck}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-800"
        >
          Check Vet Visits
        </button>

        {loading && <p className="text-slate-600">Checking vet history...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {result && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p><strong>Pet:</strong> {result.petName}</p>
            <p><strong>Vet visits:</strong> {result.visits}</p>
            <p><strong>Last visit:</strong> {result.lastVetVisitDate ? new Date(result.lastVetVisitDate).toLocaleDateString() : 'No vet visit recorded'}</p>
            <p><strong>Days since last visit:</strong> {result.daysSinceLastVetVisit != null ? result.daysSinceLastVetVisit : 'N/A'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
