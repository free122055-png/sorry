// Ambient Audio Synthesizer for Quran Audio Background Sounds
// Creates realistic, soothing ambient environments without relying on broken external audio URLs

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private activeSoundId: string | null = null;
  private nodes: (AudioNode | number)[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.45;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  public play(soundId: string) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.activeSoundId = soundId;
    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.nodes.push(masterGain);

    if (soundId === "rain") {
      // Pink/Brownian noise filtered for gentle continuous rainfall
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      this.nodes.push(noise, filter);

    } else if (soundId === "fire") {
      // Crackling fireplace sound (filtered noise with random bursts)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.985 ? 1 : 0.08);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      this.nodes.push(noise, filter);

    } else if (soundId === "waves") {
      // Ocean waves - noise modulated with a slow LFO oscillator
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.32;
        data[i] = (b0 + b1 + b2) * 0.4;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const waveGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8 second wave cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(waveGain.gain);

      noise.connect(waveGain);
      waveGain.connect(masterGain);
      noise.start();
      lfo.start();
      this.nodes.push(noise, waveGain, lfo, lfoGain);

    } else if (soundId === "birds") {
      // Gentle chirping oscillator bursts + light ambient breeze
      const playChirp = () => {
        if (!this.ctx || this.activeSoundId !== "birds") return;
        const osc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();
        osc.type = "sine";
        const startFreq = 2200 + Math.random() * 800;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq + 600, this.ctx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(startFreq - 400, this.ctx.currentTime + 0.18);

        chirpGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

        osc.connect(chirpGain);
        chirpGain.connect(masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      };

      const timer = window.setInterval(() => {
        if (Math.random() > 0.4) {
          playChirp();
          if (Math.random() > 0.5) {
            setTimeout(playChirp, 140);
          }
        }
      }, 1200);

      this.nodes.push(timer as any);

    } else if (soundId === "wind") {
      // Deep whispering wind
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      lfo.start();
      this.nodes.push(noise, filter, lfo, lfoGain);

    } else if (soundId === "river") {
      // Flowing water stream
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1100, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      this.nodes.push(noise, filter);

    } else if (soundId === "owl") {
      // Night nature with soft hooting
      const playHoot = () => {
        if (!this.ctx || this.activeSoundId !== "owl") return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(360, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.42);
      };

      const timer = window.setInterval(() => {
        if (Math.random() > 0.45) {
          playHoot();
          setTimeout(playHoot, 320);
        }
      }, 3500);

      this.nodes.push(timer as any);

    } else if (soundId === "thunder") {
      // Low rumbling distant thunder
      const playRumble = () => {
        if (!this.ctx || this.activeSoundId !== "thunder") return;
        const bufferSize = this.ctx.sampleRate * 2.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.8));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(180, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start();
      };

      playRumble();
      const timer = window.setInterval(() => {
        if (Math.random() > 0.5) {
          playRumble();
        }
      }, 4000);
      this.nodes.push(timer as any);

    } else if (soundId === "train") {
      // Rhythmic distant train travel
      const playClickClack = () => {
        if (!this.ctx || this.activeSoundId !== "train") return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(95, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      };

      const timer = window.setInterval(() => {
        playClickClack();
        setTimeout(playClickClack, 140);
        setTimeout(playClickClack, 320);
      }, 1000);
      this.nodes.push(timer as any);
    }
  }

  public stop() {
    this.nodes.forEach(node => {
      try {
        if (typeof node === "number") {
          clearInterval(node);
        } else if ((node as any).stop) {
          (node as any).stop();
        } else if ((node as any).disconnect) {
          (node as any).disconnect();
        }
      } catch (e) {}
    });
    this.nodes = [];
    this.activeSoundId = null;
  }

  public getActiveSound(): string | null {
    return this.activeSoundId;
  }
}

export const ambientSound = new AmbientSoundEngine();
