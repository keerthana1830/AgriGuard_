import React, { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, PlusCircleIcon, TrashIcon } from './Icons';
import type { PurchaseLog, Pesticide, PesticideRating } from '../types';
import { pesticides } from './pesticides';
import { LogPurchaseModal } from './LogPurchaseModal';
import { soundService } from '../services/soundService';
import { StarRating } from './StarRating';

interface PesticideMarketProps {
  purchaseLogs: PurchaseLog[];
  onLogPurchase: (purchaseData: Omit<PurchaseLog, 'id' | 'date'>) => void;
  onDeletePurchase: (id: string) => void;
  pesticideRatings: Record<string, PesticideRating>;
  onRatePurchase: (purchaseId: string, rating: number) => void;
}

const TrendIndicator: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  switch (trend) {
    case 'up':
      return <ArrowUpIcon className="w-5 h-5 text-red-500" aria-label="Price increasing"/>;
    case 'down':
      return <ArrowDownIcon className="w-5 h-5 text-green-500" aria-label="Price decreasing"/>;
    case 'stable':
      return <MinusIcon className="w-5 h-5 text-gray-500" aria-label="Price stable"/>;
    default:
      return null;
  }
};

export const PesticideMarket: React.FC<PesticideMarketProps> = ({ purchaseLogs, onLogPurchase, onDeletePurchase, pesticideRatings, onRatePurchase }) => {
  const [loggablePesticide, setLoggablePesticide] = useState<Pesticide | null>(null);
  
  const handleDelete = (id: string) => {
    soundService.play('click');
    if (window.confirm('Are you sure you want to delete this purchase record?')) {
      onDeletePurchase(id);
    }
  };
  
  const handleSavePurchase = (logData: Omit<PurchaseLog, 'id' | 'date'>) => {
    onLogPurchase(logData);
    setLoggablePesticide(null);
  };

  const handleLogClick = (pesticide: Pesticide) => {
    soundService.play('click');
    setLoggablePesticide(pesticide);
  };

  return (
    <>
      {loggablePesticide && (
        <LogPurchaseModal
          pesticide={loggablePesticide}
          onClose={() => setLoggablePesticide(null)}
          onSave={handleSavePurchase}
        />
      )}
      <div className="space-y-8">
        <div className="p-4 bg-surface rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-text-primary mb-4">Pesticide Marketplace</h3>
          <div className="space-y-3">
            {pesticides.map((pesticide) => {
              const ratingData = pesticideRatings[pesticide.name];
              const avgRating = ratingData && ratingData.count > 0 ? ratingData.totalScore / ratingData.count : 0;

              return (
              <div key={pesticide.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-background rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors gap-2">
                <div>
                  <p className="font-semibold text-text-primary">{pesticide.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <StarRating rating={avgRating} />
                     <span className="text-xs text-text-secondary">
                        ({ratingData ? ratingData.count : 0} reviews)
                     </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                   <p className="text-sm text-text-secondary flex-grow sm:flex-grow-0">{pesticide.unit}</p>
                  <div className="text-right flex items-center gap-3">
                    <div>
                        <p className="font-bold text-lg text-text-primary">${pesticide.price.toFixed(2)}</p>
                    </div>
                    <TrendIndicator trend={pesticide.trend} />
                  </div>
                  <button onClick={() => handleLogClick(pesticide)}
                    className="p-2 text-primary hover:bg-green-100 dark:hover:bg-green-900/40 rounded-full"
                    aria-label={`Log purchase for ${pesticide.name}`}>
                    <PlusCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )})}
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-slate-500 text-center">Prices are for illustrative purposes only.</p>
        </div>
        
        {purchaseLogs.length > 0 && (
          <div className="p-4 bg-surface rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-text-primary mb-4">Recent Purchases</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
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
                    onClick={() => handleDelete(log.id)}
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                    aria-label="Delete purchase record"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
