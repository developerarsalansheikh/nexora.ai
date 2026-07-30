import React from 'react';

export default function AgendaView({ events = [], onEventClick }) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  if (sortedEvents.length === 0) {
    return (
      <div className="p-10 text-center text-text-tertiary text-xs border border-dashed border-border-primary rounded-2xl bg-bg-secondary/20">
        No upcoming events or deadlines found in agenda.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md space-y-4">
      <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
        <span>📑</span> Upcoming Agenda
      </h3>

      <div className="space-y-3">
        {sortedEvents.map((event) => {
          const sDate = new Date(event.startDate);
          return (
            <div
              key={event._id}
              onClick={() => onEventClick?.(event)}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border-primary bg-bg-primary hover:border-brand-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: event.color || '#6366f1' }}
                />
                <div>
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-400 transition-colors">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-[11px] text-text-tertiary mt-0.5">{event.description}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-semibold text-text-secondary">
                  {sDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-[10px] uppercase font-bold text-text-tertiary mt-0.5">
                  {event.type}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
