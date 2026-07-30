import React from 'react';

export default function VelocityChart({ velocityData = [] }) {
  if (!velocityData || velocityData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-tertiary text-xs border border-dashed border-border-primary rounded-xl">
        No completed sprint velocity data available yet.
      </div>
    );
  }

  const maxVal = Math.max(...velocityData.flatMap((v) => [v.plannedPoints || 0, v.completedPoints || 0]), 10);

  return (
    <div className="p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <span>📊</span> Sprint Velocity History
          </h3>
          <p className="text-[11px] text-text-tertiary mt-0.5">
            Comparison of planned story points vs completed story points across past sprints
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-bg-tertiary border border-border-primary" />
            <span className="text-text-tertiary text-[10px]">Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-brand-500" />
            <span className="text-brand-400 font-semibold text-[10px]">Completed</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-48 flex items-end gap-6 pt-6 pb-2 px-4 border-b border-border-primary">
        {velocityData.map((item, idx) => {
          const plannedHeight = (item.plannedPoints / maxVal) * 100;
          const completedHeight = (item.completedPoints / maxVal) * 100;

          return (
            <div key={item.sprintId || idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex justify-center items-end gap-1.5 h-36">
                {/* Planned Bar */}
                <div
                  className="w-1/3 bg-bg-tertiary rounded-t-md border-t border-x border-border-primary transition-all duration-300 group-hover:bg-bg-secondary"
                  style={{ height: `${Math.max(plannedHeight, 5)}%` }}
                  title={`Planned: ${item.plannedPoints} pts`}
                />
                {/* Completed Bar */}
                <div
                  className="w-1/3 bg-gradient-to-t from-brand-600 to-[#9f85ff] rounded-t-md shadow-sm transition-all duration-300 group-hover:brightness-110"
                  style={{ height: `${Math.max(completedHeight, 5)}%` }}
                  title={`Completed: ${item.completedPoints} pts`}
                />
              </div>

              <span className="text-[10px] font-semibold text-text-secondary truncate max-w-[80px]">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
