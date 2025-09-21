// services/soundService.ts

let audioCtx: AudioContext | null = null;
let isInitialized = false;
let isSoundEnabled = true;

const initAudio = () => {
    if (isInitialized || typeof window === 'undefined') return;
    try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        isInitialized = true;
    } catch (e) {
        console.error("Web Audio API is not supported in this browser", e);
    }
};

const setSoundEnabled = (enabled: boolean) => {
    isSoundEnabled = enabled;
};

type SoundType = 'click' | 'scanStart' | 'success' | 'error' | 'achievementUnlocked' | 'messageSend' | 'messageReceive' | 'purchase' | 'delete' | 'toastAppear' | 'rate';

const playSound = (type: SoundType) => {
    if (!audioCtx || !isSoundEnabled) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
        case 'click':
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now);
            osc.start(now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.stop(now + 0.1);
            break;

        case 'scanStart':
            gain.gain.setValueAtTime(0.2, now);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
            osc.start(now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc.stop(now + 0.3);
            break;

        case 'success':
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.2, now);
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
            osc.start(now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc.stop(now + 0.3);
            break;
            
        case 'error':
            osc.type = 'square';
            gain.gain.setValueAtTime(0.3, now);
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
            osc.start(now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.stop(now + 0.2);
            break;

        case 'achievementUnlocked':
            osc.type = 'triangle';
            const freqs = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
            gain.gain.setValueAtTime(0.3, now);
            freqs.forEach((freq, i) => {
                osc.frequency.setValueAtTime(freq, now + i * 0.1);
            });
            osc.start(now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
            osc.stop(now + 0.5);
            break;

        case 'toastAppear':
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
            osc.start(now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            osc.stop(now + 0.15);
            break;

        case 'messageSend':
             gain.gain.setValueAtTime(0, now);
             gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
             osc.type = 'sine';
             osc.frequency.setValueAtTime(600, now);
             osc.start(now);
             gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
             osc.stop(now + 0.1);
             break;

        case 'messageReceive':
             gain.gain.setValueAtTime(0, now);
             gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
             osc.type = 'sine';
             osc.frequency.setValueAtTime(800, now);
             osc.start(now);
             gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
             osc.stop(now + 0.15);
             break;

        case 'purchase':
             osc.type = 'sine';
             gain.gain.setValueAtTime(0.2, now);
             osc.frequency.setValueAtTime(1046.50, now); // C6
             osc.frequency.setValueAtTime(1318.51, now + 0.05); // E6
             osc.start(now);
             gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
             osc.stop(now + 0.15);
             break;

        case 'delete':
            gain.gain.setValueAtTime(0.3, now);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);
            osc.start(now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            osc.stop(now + 0.25);
            break;
            
        case 'rate':
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.start(now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.stop(now + 0.1);
            break;
    }
};

export const soundService = {
    init: initAudio,
    play: playSound,
    setSoundEnabled,
};