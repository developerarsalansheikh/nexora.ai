import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

// Default Kanban columns - maps to TASK_STATUS enum values
const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' },
];

export default function KanbanBoard({
  tasks = [],
  onReorder,
  onCardClick,
  onAddTask,
  swimlane = 'status',
}) {
  const [activeTask, setActiveTask] = useState(null);

  // DnD-Kit sensor configuration (8px activation distance to prevent click conflicts)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Build column data from tasks grouped by status (or swimlane property)
  const columns = useMemo(() => {
    const grouped = {};

    // Initialize all columns
    KANBAN_COLUMNS.forEach((col) => {
      grouped[col.id] = [];
    });

    // Group tasks into their status columns, sorted by order
    const sorted = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    sorted.forEach((task) => {
      const col = task[swimlane] || 'backlog';
      if (grouped[col]) {
        grouped[col].push(task);
      } else {
        // Task has a status not in our columns — place in backlog
        grouped['backlog'].push(task);
      }
    });

    return KANBAN_COLUMNS.map((col) => ({
      ...col,
      tasks: grouped[col.id] || [],
    }));
  }, [tasks, swimlane]);

  // Find task by ID across all columns
  const findTask = useCallback(
    (taskId) => tasks.find((t) => t._id === taskId),
    [tasks],
  );

  // Find which column a task belongs to
  const findColumn = useCallback(
    (taskId) => {
      for (const col of columns) {
        if (col.tasks.some((t) => t._id === taskId)) {
          return col.id;
        }
      }
      return null;
    },
    [columns],
  );

  // ─── DnD Event Handlers ───────────────────────────────────────────────────

  const handleDragStart = (event) => {
    const { active } = event;
    const task = findTask(active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event) => {
    // DragOver is handled visually by @dnd-kit droppable highlights
    // Actual reorder happens on DragEnd
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Determine source and destination columns
    const sourceColumn = findColumn(activeId);
    let destColumn = null;

    // Check if we dropped on a column directly
    if (KANBAN_COLUMNS.find((c) => c.id === overId)) {
      destColumn = overId;
    } else {
      // Dropped on another task — find its column
      destColumn = findColumn(overId);
    }

    if (!sourceColumn || !destColumn) return;

    // Build reorder payload for API persistence
    const destTasks = columns.find((c) => c.id === destColumn)?.tasks || [];

    // Calculate new order for the moved task
    let items = [];

    if (sourceColumn === destColumn) {
      // Same-column reorder
      const columnTasks = [...destTasks];
      const oldIdx = columnTasks.findIndex((t) => t._id === activeId);
      const newIdx = columnTasks.findIndex((t) => t._id === overId);

      if (oldIdx === -1 || (overId !== destColumn && newIdx === -1)) return;

      const reordered =
        overId === destColumn
          ? columnTasks // Dropped on column itself — no reorder within
          : arrayMove(columnTasks, oldIdx, newIdx >= 0 ? newIdx : columnTasks.length - 1);

      items = reordered.map((t, idx) => ({
        taskId: t._id,
        status: destColumn,
        order: idx,
      }));
    } else {
      // Cross-column move
      const sourceTasks = columns.find((c) => c.id === sourceColumn)?.tasks.filter((t) => t._id !== activeId) || [];
      const insertIdx = destTasks.findIndex((t) => t._id === overId);

      const newDestTasks = [...destTasks];
      const movedTask = findTask(activeId);
      if (movedTask) {
        newDestTasks.splice(insertIdx >= 0 ? insertIdx : newDestTasks.length, 0, movedTask);
      }

      // Build items for source column (re-index)
      const sourceItems = sourceTasks.map((t, idx) => ({
        taskId: t._id,
        status: sourceColumn,
        order: idx,
      }));

      // Build items for destination column (re-index)
      const destItems = newDestTasks.map((t, idx) => ({
        taskId: t._id,
        status: destColumn,
        order: idx,
      }));

      items = [...sourceItems, ...destItems];
    }

    // Persist via API
    if (items.length > 0 && onReorder) {
      onReorder(items);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 flex-1 overflow-x-auto pb-4 items-start">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            columnId={column.id}
            title={column.title}
            tasks={column.tasks}
            onCardClick={onCardClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      {/* Drag Overlay — floating card that follows cursor during drag */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
        {activeTask ? <KanbanCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
