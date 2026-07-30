import React from 'react';

export default function WeekView({ currentDate, events = [], onEventClick }) {
  // Compute start of current week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + idx);
    return day;
  });

  const getEventsForDay = (date) => {
    return events.filter((e) => {
      const eDate = new Date(e.startDate);
      return (
        eDate.getDate() === date.getDate() &&
        eDate.getMonth() === date.getMonth() &&
        eDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border-primary bg-bg-primary/60 text-center py-3">
        {weekDays.map((date, idx) => {
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span
                className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                  isToday ? 'bg-brand-500 text-white' : 'text-text-primary'
                }`}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Week Columns */}
      <div className="grid grid-cols-7 min-h-[450px] divide-x divide-border-primary/40 bg-bg-secondary/40">
        {weekDays.map((date, idx) => {
          const dayEvents = getEventsForDay(date);
          return (
            <div key={idx} className="p-2 space-y-2">
              {dayEvents.map((event) => (
                <div
                  key={event._id}
                  onClick={() => onEventClick?.(event)}
                  className="p-2 rounded-xl text-xs font-medium cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
                  style={{
                    backgroundColor: `${event.color || '#6366f1'}20`,
                    color: event.color || '#6366f1',
                    borderLeft: `4px solid ${event.color || '#6366f1'}`,
                  }}
                >
                  <div className="font-bold truncate">{event.title}</div>
                  <div className="text-[10px] opacity-80 mt-1 font-mono">
                    {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
