import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Enforce project architecture import alignment for TanStack Query and DnD kit
import { useQuery } from '@tanstack/react-query';
import { DndContext, useSensors, useSensor, PointerSensor, KeyboardSensor, closestCorners } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const MOCK_COLUMNS = [
  { id: 'col-todo', title: 'To Do', icon: '🎯', border: 'border-t-2 border-t-text-tertiary' },
  { id: 'col-progress', title: 'In Progress', icon: '⚡', border: 'border-t-2 border-t-brand-500' },
  { id: 'col-review', title: 'Code Review', icon: '🔍', border: 'border-t-2 border-t-amber-500' },
  { id: 'col-done', title: 'Completed', icon: '✅', border: 'border-t-2 border-t-emerald-500' },
];

const MOCK_TASKS = [
  { id: 'task-1', columnId: 'col-todo', key: 'NCS-21', title: 'Architect client-side state machine using TanStack Query', priority: 'high', lead: 'Sarah', avatar: 'S' },
  { id: 'task-2', columnId: 'col-progress', key: 'NCS-04', title: 'Initialize Websocket multiplexing pipeline inside Express', priority: 'high', lead: 'Alex', avatar: 'A' },
  { id: 'task-3', columnId: 'col-progress', key: 'NCS-15', title: 'Configure global error boundary middleware in Express pipeline', priority: 'medium', lead: 'Marcus', avatar: 'M' },
  { id: 'task-4', columnId: 'col-review', key: 'NCS-19', title: 'Define custom operational AppError model definitions', priority: 'low', lead: 'Marcus', avatar: 'M' },
  { id: 'task-5', columnId: 'col-done', key: 'NCS-01', title: 'Draft system architecture blueprints and specifications docs', priority: 'medium', lead: 'Alex', avatar: 'A' },
];

export default function ProjectBoard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);

  // Setup DnD-Kit sensor tracking systems
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id; // Could be a column ID or another task ID

    // Business Logic for Drag and Drop is omitted from this skeleton foundation.
    // However, the state mutations can be hooked here.
    console.log(`DnD Event: Moved task ${activeId} over target ${overId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Board Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary font-sans">Project Board</h2>
          <p className="text-xs text-text-secondary mt-1">Sprint Board for Project Polaris. Real-time collaborations enabled.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500 text-[10px] font-bold flex items-center justify-center border-2 border-bg-primary text-white">S</div>
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-[10px] font-bold flex items-center justify-center border-2 border-bg-primary text-white">A</div>
            <div className="w-7 h-7 rounded-full bg-amber-500 text-[10px] font-bold flex items-center justify-center border-2 border-bg-primary text-white">M</div>
          </div>
          <button className="px-4 py-2 text-xs rounded-xl bg-bg-secondary hover:bg-bg-tertiary font-medium transition-colors border border-border-primary text-text-secondary hover:text-text-primary">
            Filters
          </button>
          <button className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity">
            + Add Issue
          </button>
        </div>
      </div>

      {/* Kanban lanes configuration */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 overflow-x-auto pb-4 items-start">
          {MOCK_COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => t.columnId === column.id);

            return (
              <div
                key={column.id}
                className={`p-4 rounded-2xl bg-bg-secondary/40 backdrop-blur-md border border-border-primary min-h-[450px] flex flex-col ${column.border}`}
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between mb-4 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{column.icon}</span>
                    <h3 className="text-sm font-semibold text-text-primary">{column.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary font-mono border border-border-primary">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="text-text-tertiary hover:text-text-primary">•••</button>
                </div>

                {/* Card stack container */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  <AnimatePresence>
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 rounded-xl border border-border-primary bg-bg-secondary/80 hover:border-brand-500/30 transition-all duration-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md group"
                      >
                        <div className="flex justify-between items-center gap-2 mb-2">
                          <span className="text-[10px] font-semibold font-mono text-text-tertiary tracking-wider">
                            {task.key}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            task.priority === 'high' 
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="text-xs text-text-secondary font-medium leading-relaxed mb-4 group-hover:text-text-primary transition-colors">
                          {task.title}
                        </h4>

                        <div className="flex justify-between items-center pt-2 border-t border-border-primary">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[8px] font-bold flex items-center justify-center text-white">
                              {task.avatar}
                            </div>
                            <span className="text-[10px] text-text-secondary">{task.lead}</span>
                          </div>
                          <span className="text-[10px] text-text-tertiary">💬 2</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="h-20 rounded-xl border border-dashed border-border-primary flex items-center justify-center text-text-tertiary text-xs">
                      Drop issues here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
