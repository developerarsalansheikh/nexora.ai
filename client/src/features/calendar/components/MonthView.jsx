import React from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthView({ currentDate, events = [], onEventClick }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create matrix of calendar days
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(year, month, day));
  }

  const getEventsForDay = (date) => {
    if (!date) return [];
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
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-border-primary bg-bg-primary/60 text-center py-2.5">
        {DAYS.map((d) => (
          <span key={d} className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
            {d}
          </span>
        ))}
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 auto-rows-fr gap-px bg-border-primary/40">
        {calendarCells.map((date, idx) => {
          const dayEvents = getEventsForDay(date);
          const isToday =
            date &&
            date.toDateString() === new Date().toDateString();

          return (
            <div
              key={idx}
              className={`min-h-[110px] p-2 bg-bg-secondary/60 flex flex-col justify-between transition-colors ${
                !date ? 'bg-bg-tertiary/20' : 'hover:bg-bg-secondary'
              }`}
            >
              {date ? (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-brand-500 text-white' : 'text-text-secondary'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-mono text-text-tertiary font-semibold">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 overflow-y-auto max-h-[75px]">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        onClick={() => onEventClick?.(event)}
                        className="px-2 py-1 rounded text-[10px] font-medium truncate cursor-pointer transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: `${event.color || '#6366f1'}20`,
                          color: event.color || '#6366f1',
                          borderLeft: `3px solid ${event.color || '#6366f1'}`,
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-text-tertiary font-mono pl-1 font-semibold">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
