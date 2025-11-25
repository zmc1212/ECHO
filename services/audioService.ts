export class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialization on first user interaction to satisfy browser policies
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 1) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playBoot() {
    this.init();
    // Rising power-up sound
    this.playTone(100, 'sawtooth', 0.5, 0.5);
    setTimeout(() => this.playTone(200, 'square', 0.4, 0.4), 100);
    setTimeout(() => this.playTone(400, 'sine', 0.6, 0.3), 300);
  }

  playTyping() {
    // High pitched random blips
    const freq = 800 + Math.random() * 400;
    this.playTone(freq, 'square', 0.05, 0.05);
  }

  playHover() {
    // Subtle low hum
    this.playTone(200, 'sine', 0.1, 0.1);
  }

  playSelect() {
    // Affirmative chirp
    this.playTone(880, 'square', 0.1, 0.2);
    setTimeout(() => this.playTone(1760, 'square', 0.2, 0.2), 50);
  }

  playAlert() {
    this.playTone(150, 'sawtooth', 0.4, 0.5);
    setTimeout(() => this.playTone(120, 'sawtooth', 0.4, 0.5), 200);
  }
}

export const audioService = new AudioService();