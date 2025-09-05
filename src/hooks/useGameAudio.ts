
import { useRef, useCallback, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface GameAudioHook {
  playMove: (player: 'X' | 'O') => void;
  playWin: () => void;
  playDraw: () => void;
  playReset: () => void;
  toggleBackgroundMusic: () => void;
  setVolume: (volume: number) => void;
  isMusicPlaying: boolean;
}

let proceduralMusicInterval: NodeJS.Timeout | null = null;

export function useGameAudio(): GameAudioHook {
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const masterVolumeRef = useRef<number>(0.7);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[Audio] AudioContext created. state=', audioContextRef.current.state);
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume()
          .then(() => console.log('[Audio] AudioContext resumed'))
          .catch((e) => console.warn('[Audio] Failed to resume AudioContext', e));
      }
    };

    // Create background music element but don't require the file
    if (!backgroundMusicRef.current) {
      backgroundMusicRef.current = new Audio();
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = masterVolumeRef.current;
      // Optional background music - will be generated procedurally if file doesn't exist
      backgroundMusicRef.current.src = '/audio/background-music.mp3';
      backgroundMusicRef.current.addEventListener('error', () => {
        // If file doesn't exist, we'll use procedural music
        console.warn('[Audio] Background music file not found or failed to load; will use procedural audio');
      });
      backgroundMusicRef.current.addEventListener('play', () => {
        console.log('[Audio] Background music playing');
      });
      backgroundMusicRef.current.addEventListener('pause', () => {
        console.log('[Audio] Background music paused');
      });
    }

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    return () => {
      // No cierres el AudioContext aquí para evitar que quede en estado "closed" durante la sesión/HMR
      if (proceduralMusicInterval) {
        clearInterval(proceduralMusicInterval);
        proceduralMusicInterval = null;
      }
    };
  }, []);

  // Asegura que exista un AudioContext válido y activo
  const ensureAudioContext = useCallback((): AudioContext | null => {
    let ctx = audioContextRef.current;

    if (!ctx || ctx.state === 'closed') {
      try {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        console.log('[Audio] New AudioContext created in ensureAudioContext. state=', ctx.state);
      } catch (e) {
        console.warn('[Audio] Failed to create AudioContext', e);
        return null;
      }
    }

    if (ctx.state === 'suspended') {
      ctx.resume()
        .then(() => console.log('[Audio] AudioContext resumed in ensureAudioContext'))
        .catch((e) => console.warn('[Audio] Failed to resume in ensureAudioContext', e));
    }

    return ctx;
  }, []);

  const createTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    const ctx = ensureAudioContext();
    if (!ctx) {
      console.warn('[Audio] Cannot play tone: no AudioContext available');
      return;
    }

    console.log('[Audio] Playing tone', { frequency, duration, type, volume, state: ctx.state });

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;

    const master = Math.max(0, Math.min(1, masterVolumeRef.current ?? 1));
    const effectiveVolume = Math.max(0, Math.min(1, volume * master));

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(effectiveVolume, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);

    // Cleanup after stop
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }, [ensureAudioContext]);

  const playMove = useCallback((player: 'X' | 'O') => {
    if (player === 'X') {
      // Higher pitched sound for X
      createTone(800, 0.2, 'square', 0.2);
    } else {
      // Lower pitched sound for O
      createTone(400, 0.2, 'triangle', 0.2);
    }
  }, [createTone]);

  const playWin = useCallback(() => {
    // Victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((note, index) => {
      setTimeout(() => {
        createTone(note, 0.4, 'sine', 0.4);
      }, index * 150);
    });
  }, [createTone]);

  const playDraw = useCallback(() => {
    // Descending tone for draw
    createTone(400, 0.3, 'sawtooth', 0.3);
    setTimeout(() => createTone(300, 0.3, 'sawtooth', 0.3), 150);
    setTimeout(() => createTone(200, 0.5, 'sawtooth', 0.3), 300);
  }, [createTone]);

  const playReset = useCallback(() => {
    // Quick ascending chirp
    createTone(200, 0.1, 'square', 0.2);
    setTimeout(() => createTone(400, 0.1, 'square', 0.2), 50);
    setTimeout(() => createTone(600, 0.1, 'square', 0.2), 100);
  }, [createTone]);

  const startProceduralMusic = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx || proceduralMusicInterval) return;

    const chords = [
      [261.63, 329.63, 392.00], // C major
      [293.66, 369.99, 440.00], // D minor
      [329.63, 415.30, 493.88], // E minor
      [349.23, 440.00, 523.25], // F major
    ];

    let chordIndex = 0;
    
    proceduralMusicInterval = setInterval(() => {
      const chord = chords[chordIndex % chords.length];
      chord.forEach((frequency, i) => {
        setTimeout(() => {
          createTone(frequency * 0.5, 2, 'sine', 0.4); // Lower octave, audible
        }, i * 50);
      });
      chordIndex++;
    }, 3000);
  }, [ensureAudioContext, createTone]);

  const stopProceduralMusic = useCallback(() => {
    if (proceduralMusicInterval) {
      clearInterval(proceduralMusicInterval);
      proceduralMusicInterval = null;
    }
  }, []);

  const toggleBackgroundMusic = useCallback(() => {
    console.log('[Audio] toggleBackgroundMusic', { isMusicPlaying });
    const ctx = ensureAudioContext();
    if (!ctx) return;

    if (isMusicPlaying) {
      // Stop music
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
      stopProceduralMusic();
      setIsMusicPlaying(false);
      toast({ title: 'Música desactivada', description: 'Has pausado la música de fondo.' });
    } else {
      // Start music
      if (backgroundMusicRef.current && backgroundMusicRef.current.src) {
        backgroundMusicRef.current.play()
          .then(() => {
            console.log('[Audio] Background music started via file');
            setIsMusicPlaying(true);
            toast({ title: 'Música activada', description: 'Reproduciendo música de fondo.' });
          })
          .catch((e) => {
            console.warn('[Audio] Failed to play file, using procedural', e);
            startProceduralMusic();
            setIsMusicPlaying(true);
            toast({ title: 'Música activada', description: 'Usando música procedimental.' });
          });
      } else {
        startProceduralMusic();
        setIsMusicPlaying(true);
        toast({ title: 'Música activada', description: 'Usando música procedimental.' });
      }
    }
  }, [isMusicPlaying, ensureAudioContext, startProceduralMusic, stopProceduralMusic]);

  const setVolume = useCallback((volume: number) => {
    const v = Math.max(0, Math.min(1, volume));
    masterVolumeRef.current = v;
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = v;
    }
  }, []);

  return {
    playMove,
    playWin,
    playDraw,
    playReset,
    toggleBackgroundMusic,
    setVolume,
    isMusicPlaying
  };
}
