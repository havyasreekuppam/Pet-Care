export default function ActivityCard({ activity }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{activity.petName}</h3>
          <p className="mt-1 text-sm text-slate-600">{activity.activityType}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.1em] text-slate-700">
          {new Date(activity.activityDate).toLocaleDateString()}
        </span>
      </div>

      {activity.description && <p className="mt-4 text-slate-700">{activity.description}</p>}
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        {activity.duration != null && <span>Duration: {activity.duration} min</span>}
        <span>Created: {new Date(activity.createdAt).toLocaleDateString()}</span>
      </div>
    </article>
  );
}
