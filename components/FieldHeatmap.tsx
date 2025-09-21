import React, { useMemo } from 'react';
import type { HistoryEntry } from '../types';
import { MapIcon } from './Icons';

interface FieldHeatmapProps {
  history: HistoryEntry[];
}

const ROWS = 4;
const COLS = 4;
const fieldPlots: string[] = Array.from({ length: ROWS * COLS }, (_, i) => {
  const row = String.fromCharCode(65 + Math.floor(i / COLS));
  const col = (i % COLS) + 1;
  return `${row}${col}`;
});

interface PlotData {
  totalInfection: number;
  scanCount: number;
  avgInfection: number;
}

const getHeatmapColor = (level: number): string => {
  if (level > 75) return 'bg-red-600';
  if (level > 60) return 'bg-red-500';
  if (level > 45) return 'bg-yellow-500';
  if (level > 30) return 'bg-yellow-400';
  if (level > 15) return 'bg-green-500';
  return 'bg-green-600';
};

export const FieldHeatmap: React.FC<FieldHeatmapProps> = ({ history }) => {
  const plotData = useMemo(() => {
    const data = new Map<string, { totalInfection: number; scanCount: number }>();
    history.forEach(entry => {
      if (entry.location) {
        const current = data.get(entry.location) ?? { totalInfection: 0, scanCount: 0 };
        current.totalInfection += entry.result.infectionLevel;
        current.scanCount += 1;
        data.set(entry.location, current);
      }
    });

    const finalData = new Map<string, PlotData>();
    data.forEach((value, key) => {
      finalData.set(key, {
        ...value,
        avgInfection: Math.round(value.totalInfection / value.scanCount),
      });
    });
    return finalData;
  }, [history]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-text-primary">Field Health Heatmap</h2>
        <p className="mt-2 text-lg text-text-secondary">Visualize infection hotspots based on your scan history. Hover over a plot for details.</p>
      </div>
      <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-8">
        <div className="grid grid-cols-4 gap-2 md:gap-4 aspect-square max-w-2xl mx-auto">
          {fieldPlots.map(plotId => {
            const data = plotData.get(plotId);
            const color = data ? getHeatmapColor(data.avgInfection) : 'bg-gray-200 dark:bg-slate-700';
            const textColor = data && data.avgInfection > 45 ? 'text-white' : 'text-text-primary';

            return (
              <div key={plotId} className="relative group flex items-center justify-center">
                <div className={`w-full h-full rounded-lg ${color} flex items-center justify-center font-bold ${textColor} transition-transform duration-200 group-hover:scale-105 shadow-md`}>
                  {plotId}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 w-max p-3 bg-gray-800 text-white dark:bg-slate-200 dark:text-gray-800 text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <h4 className="font-bold text-base">Plot {plotId}</h4>
                  {data ? (
                    <>
                      <p>Avg. Infection: <span className="font-bold">{data.avgInfection}%</span></p>
                      <p>Scans: <span className="font-bold">{data.scanCount}</span></p>
                    </>
                  ) : (
                    <p>No scans recorded</p>
                  )}
                   <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800 dark:border-t-slate-200"></div>
                </div>
              </div>
            );
          })}
        </div>
         <div className="flex justify-center items-center mt-8 space-x-4">
            <span className="font-semibold">Legend:</span>
            <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <span>Healthy</span>
            </div>
             <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span>Moderate</span>
            </div>
             <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span>High</span>
            </div>
        </div>
      </div>
       {history.length === 0 && (
         <div className="text-center py-16 bg-surface rounded-lg shadow-lg">
            <MapIcon className="w-16 h-16 mx-auto text-gray-400" />
            <p className="mt-4 text-xl text-text-secondary">No field data available yet.</p>
            <p className="mt-2">Scan plants on the dashboard to start building your heatmap!</p>
        </div>
       )}
    </div>
  );
};