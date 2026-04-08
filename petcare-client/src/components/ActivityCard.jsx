const TYPE_CONFIG = {
  'vet visit':  { emoji:'🏥', bg:'bg-red-900/20', color:'text-red-400', border:'border-red-500/30', label:'Vet Visit' },
  'vet':        { emoji:'🏥', bg:'bg-red-900/20', color:'text-red-400', border:'border-red-500/30', label:'Vet' },
  'walk':       { emoji:'🦮', bg:'bg-green-900/20', color:'text-green-400', border:'border-green-500/30', label:'Walk' },
  'grooming':   { emoji:'✂️',  bg:'bg-blue-900/20', color:'text-blue-400', border:'border-blue-500/30', label:'Grooming' },
  'groom':      { emoji:'✂️',  bg:'bg-blue-900/20', color:'text-blue-400', border:'border-blue-500/30', label:'Grooming' },
  'play':       { emoji:'🎾', bg:'bg-yellow-900/20', color:'text-yellow-400', border:'border-yellow-500/30', label:'Play' },
  'feed':       { emoji:'🍖', bg:'bg-purple-900/20', color:'text-purple-400', border:'border-purple-500/30', label:'Feed' },
  'bath':       { emoji:'🛁', bg:'bg-cyan-900/20', color:'text-cyan-400', border:'border-cyan-500/30', label:'Bath' },
  'training':   { emoji:'🎓', bg:'bg-indigo-900/20', color:'text-indigo-400', border:'border-indigo-500/30', label:'Training' },
  'medication': { emoji:'💊', bg:'bg-pink-900/20', color:'text-pink-400', border:'border-pink-500/30', label:'Medication' },
};

function getTypeConfig(activityType) {
  if (!activityType) return { emoji:'📋', bg:'bg-gray-900/20', color:'text-gray-400', border:'border-gray-500/30', label:'Activity' };
  const key = activityType.toLowerCase().trim();
  for (const [pattern, cfg] of Object.entries(TYPE_CONFIG)) {
    if (key.includes(pattern)) return cfg;
  }
  return { emoji:'📋', bg:'bg-gray-900/20', color:'text-gray-400', border:'border-gray-500/30', label: activityType };
}

export default function ActivityCard({ activity, index = 0 }) {
  const cfg = getTypeConfig(activity.activityType);
  const actDate = new Date(activity.activityDate);
  const dayName = actDate.toLocaleDateString('en-US', { weekday:'short' });
  const dateStr = actDate.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

  return (
    <article className="group bg-bg-card border border-border-primary rounded-2xl p-6 shadow-neon hover:shadow-neon-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:border-neon-blue/50">
      <div className="flex items-start gap-4 sm:gap-6">
        {/* Activity type icon */}
        <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 ${cfg.bg} ${cfg.border} border-2 rounded-xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-neon`}>
          {cfg.emoji}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-text-primary m-0 truncate">
              {activity.petName}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color} border ${cfg.border} transition-colors duration-200`}>
              {cfg.label}
            </span>
          </div>

          {activity.description && (
            <p className="text-sm text-text-secondary mb-4 leading-relaxed line-clamp-2">
              {activity.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-text-muted">
            <div className="flex items-center gap-2">
              <span className="text-base text-neon-cyan">📅</span>
              <span>{dayName}, {dateStr}</span>
            </div>
            {activity.duration != null && (
              <div className="flex items-center gap-2">
                <span className="text-base text-neon-cyan">⏱️</span>
                <span>{activity.duration} min</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}