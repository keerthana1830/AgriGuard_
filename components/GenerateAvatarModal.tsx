import React, { useState } from 'react';
import { generateAvatarImage } from '../services/geminiService';
import { Spinner } from './Spinner';
import { SparklesIcon, XCircleIcon } from './Icons';

interface GenerateAvatarModalProps {
  onClose: () => void;
  onSaveAvatar: (base64Image: string) => void;
}

export const GenerateAvatarModal: React.FC<GenerateAvatarModalProps> = ({ onClose, onSaveAvatar }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your avatar.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const image = await generateAvatarImage(prompt);
      setGeneratedImage(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (generatedImage) {
      onSaveAvatar(generatedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-lg animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Generate Avatar with AI</h2>
          <button onClick={onClose}><XCircleIcon className="w-7 h-7 text-text-secondary hover:text-text-primary" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="avatar-prompt" className="block text-sm font-medium text-text-secondary">
              Describe your desired avatar (e.g., "a happy sunflower with sunglasses")
            </label>
            <div className="flex gap-2 mt-1">
              <input
                id="avatar-prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter avatar description..."
                className="w-full px-4 py-2 bg-background border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5"/>
                <span>Generate</span>
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="w-full aspect-square bg-background rounded-lg flex items-center justify-center overflow-hidden">
            {isLoading && <Spinner message="Generating your masterpiece..." />}
            {generatedImage && !isLoading && (
              <img src={generatedImage} alt="Generated avatar" className="w-full h-full object-cover" />
            )}
            {!isLoading && !generatedImage && (
                <p className="text-text-secondary">Your generated image will appear here.</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-text-primary rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!generatedImage || isLoading} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400">
              Use this Image
            </button>
          </div>
        </div>
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