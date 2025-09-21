import React, { useState } from 'react';
import type { PurchaseLog, Pesticide } from '../types';

interface LogPurchaseModalProps {
  pesticide: Pesticide;
  onClose: () => void;
  onSave: (log: Omit<PurchaseLog, 'id' | 'date'>) => void;
}

export const LogPurchaseModal: React.FC<LogPurchaseModalProps> = ({ pesticide, onClose, onSave }) => {
  const [cost, setCost] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(cost);
    const quantityNum = parseFloat(quantity);
    if (!isNaN(costNum) && !isNaN(quantityNum) && costNum > 0 && quantityNum > 0) {
      onSave({
        pesticideName: pesticide.name,
        cost: costNum,
        quantity: quantityNum,
        unit: pesticide.unit.split(' ')[1] as 'liter' | 'kg',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
        <h3 className="text-xl font-bold text-text-primary">Log Purchase: {pesticide.name}</h3>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-text-secondary">Total Cost ($)</label>
            <input type="number" id="cost" value={cost} onChange={(e) => setCost(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., 50.25" step="0.01" required
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-text-secondary">
              Quantity ({pesticide.unit.split(' ')[1]}s)
            </label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., 5" step="0.1" required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-text-primary rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
              Save Purchase
            </button>
          </div>
        </form>
         <style>{`
            @keyframes fade-in-up {
              0% { opacity: 0; transform: translateY(20px) scale(0.98); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.3s ease-out forwards;
            }
        `}</style>
      </div>
    </div>
  );
};
