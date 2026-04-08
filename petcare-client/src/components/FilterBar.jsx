import { useState } from 'react';

export default function FilterBar({ filters, onApplyFilter }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onApplyFilter(localFilters);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-slate-900">Filter Activities</h2>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Pet Name</span>
            <input
              name="petName"
              value={localFilters.petName}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Buddy"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Activity Type</span>
            <input
              name="activityType"
              value={localFilters.activityType}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Walk, Vet Visit"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Start Date</span>
            <input
              name="startDate"
              type="date"
              value={localFilters.startDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">End Date</span>
            <input
              name="endDate"
              type="date"
              value={localFilters.endDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-800">Apply Filters</button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700 hover:bg-slate-50"
            onClick={() => {
              const reset = { petName: '', activityType: '', startDate: '', endDate: '' };
              setLocalFilters(reset);
              onApplyFilter(reset);
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
