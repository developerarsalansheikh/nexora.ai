import React from 'react';

export default function BurndownChart({ burndownData }) {
  if (!burndownData) {
    return (
      <div className="h-64 flex items-center justify-center text-text-tertiary text-xs border border-dashed border-border-primary rounded-xl">
        No burndown data available for this sprint.
      </div>
    );
  }

  const { totalPoints = 10, remainingPoints = 5, snapshots = [] } = burndownData;

  // Mock trajectory data points if snapshots are empty
  const pointsData = snapshots.length > 0 ? snapshots : [
    { day: 'Day 1', ideal: totalPoints, actual: totalPoints },
    { day: 'Day 3', ideal: Math.round(totalPoints * 0.75), actual: Math.round(totalPoints * 0.8) },
    { day: 'Day 7', ideal: Math.round(totalPoints * 0.5), actual: Math.round(totalPoints * 0.45) },
    { day: 'Day 10', ideal: Math.round(totalPoints * 0.25), actual: remainingPoints },
    { day: 'Day 14', ideal: 0, actual: remainingPoints },
  ];

  const maxVal = Math.max(totalPoints, ...pointsData.map((p) => p.actual || p.remainingPoints || 0), 10);
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 30;

  const pointsCount = pointsData.length;
  const stepX = (chartWidth - padding * 2) / Math.max(pointsCount - 1, 1);

  // Generate SVG path points
  const idealPath = pointsData
    .map((p, idx) => {
      const x = padding + idx * stepX;
      const val = p.idealPoints !== undefined ? p.idealPoints : p.ideal;
      const y = chartHeight - padding - (val / maxVal) * (chartHeight - padding * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const actualPath = pointsData
    .map((p, idx) => {
      const x = padding + idx * stepX;
      const val = p.remainingPoints !== undefined ? p.remainingPoints : p.actual;
      const y = chartHeight - padding - (val / maxVal) * (chartHeight - padding * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <span>📉</span> Sprint Burndown Trajectory
          </h3>
          <p className="text-[11px] text-text-tertiary mt-0.5">
            Ideal linear burn vs actual remaining story points ({remainingPoints} pts left of {totalPoints} pts)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-gray-400 border border-dashed border-gray-400" />
            <span className="text-text-tertiary text-[10px]">Ideal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-brand-500 font-bold" />
            <span className="text-brand-400 font-semibold text-[10px]">Actual</span>
          </div>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
            return (
              <line
                key={idx}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="currentColor"
                className="text-border-primary/40"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Ideal Line */}
          <path d={idealPath} fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="6 6" />

          {/* Actual Line */}
          <path d={actualPath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

          {/* Actual Points */}
          {pointsData.map((p, idx) => {
            const x = padding + idx * stepX;
            const val = p.remainingPoints !== undefined ? p.remainingPoints : p.actual;
            const y = chartHeight - padding - (val / maxVal) * (chartHeight - padding * 2);
            return (
              <g key={idx} className="group cursor-pointer">
                <circle cx={x} cy={y} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                <title>{`${p.day || `Day ${idx + 1}`}: ${val} pts remaining`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
