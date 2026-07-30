import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUnifiedCalendar, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../api/useCalendar';
import MonthView from '../components/MonthView';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';
import AgendaView from '../components/AgendaView';
import CreateEventModal from '../components/CreateEventModal';
import EditEventModal from '../components/EditEventModal';
import ConnectionStatus from '../../realtime/components/ConnectionStatus';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId || localStorage.getItem('nexora_workspace_id') || user?.currentWorkspaceId;

  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day' | 'agenda'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Date range: includes prev + next month for smooth navigation
  const startRange = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
  const endRange = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();

  const {
    data: events = [],
    isLoading,
    isError,
  } = useUnifiedCalendar(organizationId, workspaceId, startRange, endRange, { type: typeFilter });

  const createEvent = useCreateEvent(organizationId, workspaceId);
  const updateEvent = useUpdateEvent(organizationId, workspaceId);
  const deleteEvent = useDeleteEvent(organizationId, workspaceId);

  /* ── Navigation ── */
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else if (viewMode === 'day') next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else if (viewMode === 'day') next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  /* ── Handlers ── */
  const handleCreateEvent = (payload) => {
    createEvent.mutate(payload, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleUpdateEvent = (eventId, payload) => {
    updateEvent.mutate({ eventId, payload }, {
      onSuccess: () => setSelectedEvent(null),
    });
  };

  const handleDeleteEvent = (eventId) => {
    deleteEvent.mutate(eventId, {
      onSuccess: () => setSelectedEvent(null),
    });
  };

  /* ── Date label ── */
  const currentLabel = viewMode === 'month'
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : viewMode === 'week'
    ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">

      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <span>📅</span> Workspace Calendar
            </h1>
            <ConnectionStatus />
          </div>
          <p className="text-xs text-text-secondary">
            Unified view of events, milestones, task deadlines, and sprints.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Month label */}
          <span className="text-sm font-bold text-text-primary hidden md:block min-w-[180px] text-right">
            {currentLabel}
          </span>

          {/* Prev / Today / Next */}
          <div className="flex items-center gap-0.5 border border-border-primary rounded-xl overflow-hidden bg-bg-primary">
            <button
              onClick={handlePrev}
              className="px-3 py-2 text-xs hover:bg-bg-tertiary text-text-secondary transition-colors"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-xs font-semibold text-text-primary hover:bg-bg-tertiary transition-colors border-x border-border-primary"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-2 text-xs hover:bg-bg-tertiary text-text-secondary transition-colors"
            >
              ▶
            </button>
          </div>

          {/* View switcher */}
          <div className="flex items-center border border-border-primary rounded-xl overflow-hidden bg-bg-primary">
            {[
              { key: 'month', icon: '📆' },
              { key: 'week',  icon: '🗓️' },
              { key: 'day',   icon: '📄' },
              { key: 'agenda',icon: '📋' },
            ].map(({ key, icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`px-3 py-2 text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 ${
                  viewMode === key
                    ? 'bg-brand-500 text-white'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                <span className="hidden sm:inline">{icon}</span> {key}
              </button>
            ))}
          </div>

          {/* ✦ Create Event — the key button */}
          <button
            id="create-event-btn"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:from-brand-500 hover:to-[#8f75ef] font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-xl active:scale-95"
          >
            <span className="text-base leading-none">✦</span>
            Create Event
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md flex-wrap">
        <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wide">Filter:</span>
        {[
          { value: '', label: '🔀 All', },
          { value: 'event', label: '📌 Events' },
          { value: 'milestone', label: '🎯 Milestones' },
          { value: 'deadline', label: '⏳ Deadlines' },
          { value: 'sprint', label: '🏃 Sprints' },
          { value: 'personal', label: '👤 Personal' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              typeFilter === f.value
                ? 'bg-brand-500 text-white'
                : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-text-tertiary font-mono">
          {isLoading ? 'Loading...' : isError ? '⚠️ Error' : `${events.length} item${events.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 overflow-hidden animate-pulse p-6">
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-bg-tertiary/40 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {isError && !isLoading && (
        <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-3">
          <span className="text-3xl">⚠️</span>
          <p className="text-sm font-bold text-rose-500">Failed to load calendar</p>
          <p className="text-xs text-text-tertiary">Check your workspace connection and try again.</p>
        </div>
      )}

      {/* ── Calendar Views ── */}
      {!isLoading && !isError && (
        <>
          {viewMode === 'month' && (
            <MonthView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} />
          )}
          {viewMode === 'week' && (
            <WeekView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} />
          )}
          {viewMode === 'day' && (
            <DayView currentDate={currentDate} events={events} onEventClick={setSelectedEvent} />
          )}
          {viewMode === 'agenda' && (
            <AgendaView events={events} onEventClick={setSelectedEvent} />
          )}

          {/* Empty state (only show in month/week/day when no events) */}
          {events.length === 0 && viewMode !== 'agenda' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* non-blocking overlay hint */}
            </div>
          )}
        </>
      )}

      {/* ── Create Event Modal ── */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        isLoading={createEvent.isPending}
      />

      {/* ── Edit Event Modal ── */}
      <EditEventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        isUpdating={updateEvent.isPending}
        isDeleting={deleteEvent.isPending}
      />
    </div>
  );
}
