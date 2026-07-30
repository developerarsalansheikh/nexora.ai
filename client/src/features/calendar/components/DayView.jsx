import React from 'react';

export default function DayView({ currentDate, events = [], onEventClick }) {
  const dayEvents = events.filter((e) => {
    const eDate = new Date(e.startDate);
    return (
      eDate.getDate() === currentDate.getDate() &&
      eDate.getMonth() === currentDate.getMonth() &&
      eDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const hours = Array.from({ length: 12 }).map((_, idx) => idx + 8); // 8 AM to 7 PM

  return (
    <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-3">
        <h3 className="text-sm font-bold text-text-primary">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
          {dayEvents.length} Events Scheduled
        </span>
      </div>

      <div className="space-y-3">
        {hours.map((hour) => {
          const hourEvents = dayEvents.filter((e) => new Date(e.startDate).getHours() === hour);

          return (
            <div key={hour} className="flex gap-4 items-start border-b border-border-primary/30 pb-3">
              <span className="w-16 text-xs font-mono font-semibold text-text-tertiary">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </span>

              <div className="flex-1 space-y-2">
                {hourEvents.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => onEventClick?.(event)}
                    className="p-3 rounded-xl border bg-bg-primary hover:border-brand-500/30 transition-all cursor-pointer"
                    style={{
                      borderLeft: `4px solid ${event.color || '#6366f1'}`,
                    }}
                  >
                    <h4 className="text-xs font-bold text-text-primary">{event.title}</h4>
                    {event.description && (
                      <p className="text-[11px] text-text-secondary mt-1">{event.description}</p>
                    )}
                  </div>
                ))}
                {hourEvents.length === 0 && <div className="h-4" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
