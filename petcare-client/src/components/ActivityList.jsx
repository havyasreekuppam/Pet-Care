import ActivityCard from './ActivityCard.jsx';

export default function ActivityList({ activities }) {
  if (!activities.length) {
    return (
      <div className="rounded-3xl bg-white p-8 text-slate-700 shadow-sm">
        No activities found. Add an entry or adjust filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
