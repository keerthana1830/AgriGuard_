import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoryEntry, PurchaseLog } from '../types';
import { HistoryItem } from './HistoryItem';
import { ChartBarIcon, TrashIcon } from './Icons';
import { soundService } from '../services/soundService';
import { StarRating } from './StarRating';

interface HistoryProps {
  history: HistoryEntry[];
  purchaseLogs: PurchaseLog[];
  onDeleteHistory: (id: string) => void;
  onDeletePurchase: (id: string) => void;
  onRatePurchase: (purchaseId: string, rating: number) => void;
}

const SavingsSummary: React.FC<{ totalSavings: number; totalSpent: number }> = ({ totalSavings, totalSpent }) => {
  const netSavings = totalSavings - totalSpent;

  const getNetSavingsColor = () => {
    if (netSavings > 0) return 'text-green-500 dark:text-green-400';
    if (netSavings < 0) return 'text-red-500 dark:text-red-400';
    return 'text-text-primary';
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Financial Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300 font-semibold">Total Estimated Savings</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">${totalSavings.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300 font-semibold">Total Pesticide Spend</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold">Net Savings</p>
          <p className={`text-2xl font-bold ${getNetSavingsColor()}`}>${netSavings.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export const History: React.FC<HistoryProps> = ({ history, purchaseLogs, onDeleteHistory, onDeletePurchase, onRatePurchase }) => {
  // Assuming 1 credit = $1 for simplicity. This can be adjusted.
  const SAVINGS_MULTIPLIER = 1;

  const chartData = history
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      estimatedSavings: Math.round((100 - entry.result.infectionLevel) / 10) * SAVINGS_MULTIPLIER,
      infectionLevel: entry.result.infectionLevel,
    }))
    .reverse();
    
  const totalSavings = chartData.reduce((sum, item) => sum + item.estimatedSavings, 0);
  const totalSpent = purchaseLogs.reduce((sum, item) => sum + item.cost, 0);

  const handleDeletePurchaseClick = (id: string) => {
    soundService.play('click');
    if (window.confirm('Are you sure you want to delete this purchase record? This will also restore the score points deducted for the purchase.')) {
        onDeletePurchase(id);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-text-primary">Scan & Purchase History</h2>
        <p className="mt-2 text-lg text-text-secondary">Review your past activities and track your financial savings.</p>
      </div>

      {history.length === 0 && purchaseLogs.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-lg shadow-lg">
          <p className="text-xl text-text-secondary">No scans or purchases recorded yet.</p>
          <p className="mt-2">Go to the dashboard to scan your first plant!</p>
        </div>
      ) : (
        <>
          <SavingsSummary totalSavings={totalSavings} totalSpent={totalSpent} />

          {history.length > 0 && (
            <>
              <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
                  <ChartBarIcon className="w-6 h-6 mr-2 text-primary" />
                  Savings & Infection Rate Over Time
                </h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid stroke="rgba(125, 125, 125, 0.3)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgb(var(--color-text-secondary))' }} />
                      <YAxis tick={{ fill: 'rgb(var(--color-text-secondary))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgb(var(--color-surface))',
                          borderColor: 'rgb(var(--color-text-secondary))'
                        }} 
                        formatter={(value, name) => name === 'Infection Level' ? `${value}%` : `$${value}`} 
                      />
                      <Legend wrapperStyle={{ color: 'rgb(var(--color-text-primary))' }} />
                      <Bar dataKey="infectionLevel" fill="#ef4444" name="Infection Level" />
                      <Bar dataKey="estimatedSavings" fill="#22c55e" name="Estimated Savings ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary">Scan Records</h3>
                {history.map((entry) => (
                  <HistoryItem key={entry.id} entry={entry} onDelete={onDeleteHistory} />
                ))}
              </div>
            </>
          )}

          {purchaseLogs.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary">Purchase Records</h3>
                <div className="bg-surface rounded-lg shadow-lg p-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {purchaseLogs.map(log => (
                            <div key={log.id} className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-background rounded-md gap-2">
                                <div className="flex-grow">
                                    <p className="font-semibold text-text-primary">{log.pesticideName}</p>
                                    <p className="text-sm text-text-secondary">{new Date(log.date).toLocaleDateString()}</p>
                                </div>
                                <div className="w-full sm:w-auto flex items-center justify-between">
                                  <div className="flex flex-col items-start sm:items-end">
                                      {log.rating ? (
                                        <>
                                          <StarRating rating={log.rating} />
                                          <p className="text-xs text-text-secondary mt-1">You rated</p>
                                        </>
                                      ) : (
                                        <>
                                          <StarRating rating={0} onRate={(rating) => onRatePurchase(log.id, rating)} />
                                          <p className="text-xs text-text-secondary mt-1">Rate it</p>
                                        </>
                                      )}
                                  </div>
                                  <div className="text-right ml-4">
                                      <p className="font-bold text-lg text-text-primary">${log.cost.toFixed(2)}</p>
                                      <p className="text-sm text-text-secondary">{log.quantity} {log.unit}(s)</p>
                                  </div>
                                </div>
                                <button
                                    onClick={() => handleDeletePurchaseClick(log.id)}
                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                                    aria-label="Delete purchase record"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
