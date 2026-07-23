/**
 * Phase 05: Audio Feedback Service
 * Provides ringtone, busy tone, reconnect tone, and call end tone.
 */
class AudioFeedback {
  constructor() {
    this.audioCtx = null
    this.gain = null
    this.enabled = false
  }

  init() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      this.gain = this.audioCtx.createGain()
      this.gain.connect(this.audioCtx.destination)
      this.enabled = true
    } catch (e) {
      console.warn('Audio feedback not supported:', e)
      this.enabled = false
    }
  }

  playTone(type, duration = 0.5) {
    if (!this.enabled || !this.audioCtx) return
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
      const osc = this.audioCtx.createOscillator()
      const gainNode = this.audioCtx.createGain()
      osc.connect(gainNode)
      gainNode.connect(this.gain)

      if (type === 'ringtone') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1320, this.audioCtx.currentTime + 0.2)
      } else if (type === 'busy') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime)
      } else if (type === 'reconnect') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(660, this.audioCtx.currentTime)
        osc.frequency.linearRampToValueAtTime(880, this.audioCtx.currentTime + duration)
      } else if (type === 'end') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, this.audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(220, this.audioCtx.currentTime + duration)
      } else {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime)
      }

      osc.start()
      osc.stop(this.audioCtx.currentTime + duration)

      // Disconnect nodes to prevent Web Audio memory leaks
      setTimeout(() => {
        try {
          osc.disconnect()
          gainNode.disconnect()
        } catch (e) {
          // ignore
        }
      }, (duration + 0.1) * 1000)
    } catch (e) {
      console.warn('Failed to play tone:', e)
    }
  }

  dispose() {
    if (this.audioCtx) {
      this.audioCtx.close()
    }
    this.enabled = false
  }
}

export default new AudioFeedback()
