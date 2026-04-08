import ActivityCard from './ActivityCard.jsx';

export default function ActivityList({ activities }) {
  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 bg-bg-secondary border-2 border-dashed border-border-primary rounded-3xl">
        <div className="text-6xl mb-4 animate-bounce text-glow">🐾</div>
        <h3 className="font-serif font-bold text-xl text-text-primary mb-2">
          No activities yet
        </h3>
        <p className="text-sm text-text-muted leading-relaxed max-w-md">
          Add your first pet activity using the form above,<br className="hidden sm:block" />
          or adjust your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-neon-blue">📋</span>
          <h2 className="font-serif font-bold text-xl text-text-primary m-0">
            Activity Log
          </h2>
        </div>
        <div className="bg-neon-blue text-bg-primary rounded-full px-3 py-1 text-xs font-bold min-w-[2rem] text-center shadow-neon">
          {activities.length}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-4 sm:gap-6">
        {activities.map((activity, i) => (
          <div
            key={activity.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <ActivityCard activity={activity} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}