import React, { useState, useRef, useEffect } from 'react';
import { analyzePlantImage } from '../services/geminiService';
import type { HistoryEntry, ScanResult, PlayerStats, PurchaseLog, Pesticide } from '../types';
import { ResultCard } from './ResultCard';
import { Spinner } from './Spinner';
import { ScoreCard } from './ScoreCard';
import { WeatherWidget } from './WeatherWidget';
import { ArrowUpTrayIcon, PhotoIcon, CameraIcon } from './Icons';
import { pesticides } from './pesticides';
import { LogPurchaseModal } from './LogPurchaseModal';
import { soundService } from '../services/soundService';


interface DashboardProps {
  onNewScan: (entry: HistoryEntry) => void;
  setCurrentView: (view: 'dashboard' | 'history' | 'field' | 'resources') => void;
  playerStats: PlayerStats;
  onLogPurchase: (purchaseData: Omit<PurchaseLog, 'id' | 'date'>) => void;
}

// Helper to simulate scanning different field plots
const getRandomLocation = () => {
  const row = String.fromCharCode(65 + Math.floor(Math.random() * 4)); // A-D
  const col = Math.floor(Math.random() * 4) + 1; // 1-4
  return `${row}${col}`;
};

// Helper to simulate weather data for a location
const getSimulatedWeather = (): HistoryEntry['weather'] => {
    const conditions: Array<{ condition: string; icon: 'sun' | 'cloud' | 'rain' }> = [
      { condition: 'Sunny', icon: 'sun' },
      { condition: 'Cloudy', icon: 'cloud' },
      { condition: 'Rainy', icon: 'rain' },
      { condition: 'Partly Cloudy', icon: 'cloud' },
    ];
    const temp = Math.floor(Math.random() * (35 - 15 + 1)) + 15; // Random temp between 15-35°C
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    return {
      temp,
      ...randomCondition,
    };
};

export const Dashboard: React.FC<DashboardProps> = ({ onNewScan, setCurrentView, playerStats, onLogPurchase }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recommendedPesticide, setRecommendedPesticide] = useState<Pesticide | null>(null);
  const [pesticideToLog, setPesticideToLog] = useState<Pesticide | null>(null);

  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const resetScanState = () => {
    setScanResult(null);
    setError(null);
    setRecommendedPesticide(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("Image size exceeds 4MB. Please choose a smaller file.");
        return;
      }
      handleCloseCamera();
      resetScanState();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImagePreview(reader.result as string);
        setImageData({ base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const scanImage = async (dataToScan: { base64: string; mimeType: string }, previewUrl: string) => {
    setIsScanning(true);
    resetScanState();
    setImagePreview(previewUrl);
    setImageData(dataToScan);
    soundService.play('scanStart');

    try {
      const result = await analyzePlantImage(dataToScan.base64, dataToScan.mimeType);
      soundService.play('success');
      const foundPesticide = pesticides.find(p => result.recommendation.toLowerCase().includes(p.name.toLowerCase()));
      setRecommendedPesticide(foundPesticide || null);
      setScanResult(result);
      if (previewUrl) {
        onNewScan({
          id: new Date().toISOString(),
          date: new Date().toISOString(),
          image: previewUrl,
          result: result,
          location: getRandomLocation(),
          weather: getSimulatedWeather(),
        });
      }
    } catch (err) {
      soundService.play('error');
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanButtonClick = () => {
    soundService.play('click');
    if (!imageData || !imagePreview) {
      setError("Please select an image first.");
      return;
    }
    scanImage(imageData, imagePreview);
  };
  
  const triggerFileSelect = () => {
    soundService.play('click');
    fileInputRef.current?.click()
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleOpenCamera = async () => {
    soundService.play('click');
    resetScanState();
    setImagePreview(null);
    setImageData(null);
    if(isCameraOpen) {
      handleCloseCamera();
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permissionStatus.state === 'denied') {
          setError("Camera permission is blocked. Please enable it in your browser's site settings to use this feature.");
          return;
        }
      } catch (err) {
        console.warn("Could not query camera permissions. Proceeding to request access directly.", err);
      }
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        setIsCameraOpen(true);
      } else {
        setError("Your browser does not support camera access.");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setError("Camera permission was denied. Please enable it in your browser's site settings to use this feature.");
        } else if (err.name === "NotFoundError") {
            setError("No camera found. Please ensure a camera is connected and enabled.");
        } else {
            setError("Could not access the camera. It might be in use by another app or there could be a hardware issue.");
        }
      } else {
          setError("An unexpected error occurred while trying to access the camera.");
      }
    }
  };
  
  const handleTakePhoto = () => {
    soundService.play('click');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64String = dataUrl.split(',')[1];
        
        const newImageData = { base64: base64String, mimeType: 'image/jpeg' };
        
        handleCloseCamera();
        
        setTimeout(() => scanImage(newImageData, dataUrl), 100);
      } else {
        setError("Could not process the image.");
        handleCloseCamera();
      }
    }
  };

  const handleOpenLogModal = (pesticide: Pesticide) => {
    setPesticideToLog(pesticide);
  };

  const handleSavePurchaseLog = (logData: Omit<PurchaseLog, 'id' | 'date'>) => {
    onLogPurchase(logData);
    setPesticideToLog(null);
  };

  return (
    <>
    {pesticideToLog && (
        <LogPurchaseModal
          pesticide={pesticideToLog}
          onClose={() => setPesticideToLog(null)}
          onSave={handleSavePurchaseLog}
        />
    )}
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-text-primary">Dashboard</h2>
        <p className="mt-2 text-lg text-text-secondary">Welcome back, AgriGuard!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ScoreCard stats={playerStats} />
        </div>
        <div>
          <WeatherWidget />
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* Image Preview & Scan Button */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 flex items-center justify-center bg-background relative overflow-hidden">
              {isCameraOpen ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center gap-4">
                      <button
                          onClick={handleCloseCamera}
                          className="px-4 py-2 text-sm text-white font-semibold bg-gray-700/80 rounded-full shadow-lg hover:bg-gray-800 backdrop-blur-sm"
                          aria-label="Cancel"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={handleTakePhoto}
                          className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
                          aria-label="Take Photo"
                      >
                      </button>
                  </div>
                </>
              ) : imagePreview ? (
                <img src={imagePreview} alt="Plant preview" className="max-h-full max-w-full rounded-md object-contain" />
              ) : (
                <div className="text-center text-text-secondary">
                  <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-slate-500" />
                  <p className="mt-2 font-semibold">Image preview will appear here</p>
                </div>
              )}
            </div>
            <button
              onClick={handleScanButtonClick}
              disabled={!imageData || isScanning || isCameraOpen}
              className="mt-4 w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed"
            >
              <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
              {isScanning ? 'Analyzing...' : 'Scan Uploaded Plant'}
            </button>
          </div>

          {/* Input Options Area */}
          <div className="text-center md:text-left space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Step 1: Provide an Image</h3>
              <p className="mt-2 text-text-secondary">Choose one of the options below to get started.</p>
            </div>

            <button
              onClick={triggerFileSelect}
              className="w-full flex items-center text-left p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-primary dark:hover:border-primary transition-colors"
            >
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              <PhotoIcon className="w-10 h-10 text-primary mr-4 flex-shrink-0" />
              <div>
                <span className="font-bold text-lg text-text-primary">Upload from Device</span>
                <p className="text-sm text-text-secondary">Select a PNG, JPG, or WEBP file (Max 4MB)</p>
              </div>
            </button>

            <button
              onClick={handleOpenCamera}
              className="w-full flex items-center text-left p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-primary dark:hover:border-primary transition-colors"
            >
              <CameraIcon className="w-10 h-10 text-secondary mr-4 flex-shrink-0" />
              <div>
                <span className="font-bold text-lg text-text-primary">Use Your Camera</span>
                <p className="text-sm text-text-secondary">Capture a live photo of your plant</p>
              </div>
            </button>
          </div>
        </div>

        {error && <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-center">{error}</div>}
      </div>

      {isScanning && <Spinner message="Our AI is analyzing your plant, please wait..." />}
      
      {scanResult && imagePreview && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-text-primary mb-4">Analysis Complete</h3>
          <ResultCard 
            result={scanResult} 
            image={imagePreview} 
            setCurrentView={setCurrentView} 
            recommendedPesticide={recommendedPesticide}
            onLogRecommendedPurchase={handleOpenLogModal}
          />
        </div>
      )}
    </div>
    </>
  );
};
