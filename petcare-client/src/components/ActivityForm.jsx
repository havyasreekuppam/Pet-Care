import { useState } from 'react';

const initialState = {
  petName: '',
  activityType: '',
  description: '',
  duration: '',
  activityDate: ''
};

export default function ActivityForm({ onAddActivity }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.petName || !form.activityType) {
      return;
    }
    onAddActivity({
      petName: form.petName,
      activityType: form.activityType,
      description: form.description,
      duration: form.duration ? Number(form.duration) : null,
      activityDate: form.activityDate || new Date().toISOString()
    });
    setForm(initialState);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-slate-900">Add New Activity</h2>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Pet Name</span>
            <input
              name="petName"
              value={form.petName}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
              placeholder="Buddy"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Activity Type</span>
            <input
              name="activityType"
              value={form.activityType}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
              placeholder="Vet Visit, Walk, Grooming"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
            rows="3"
            placeholder="Add details about the activity"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Duration (minutes)</span>
            <input
              name="duration"
              type="number"
              value={form.duration}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
              placeholder="30"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Activity Date</span>
            <input
              name="activityDate"
              type="date"
              value={form.activityDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
            />
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-800"
        >
          Add Activity
        </button>
      </form>
    </section>
  );
}
