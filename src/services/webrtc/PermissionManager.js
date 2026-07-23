/**
 * Phase 03: Permission Manager
 * Handles microphone and camera permission requests and state tracking.
 */

export const PermissionStatus = {
  PROMPT: 'prompt',
  GRANTED: 'granted',
  DENIED: 'denied',
  UNSUPPORTED: 'unsupported',
};

export class PermissionManager {
  constructor() {
    this.audioPermission = PermissionStatus.PROMPT;
    this.videoPermission = PermissionStatus.PROMPT;
    this._cached = false;
  }

  async requestPermissions(constraints = { audio: true, video: true }) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.audioPermission = PermissionStatus.UNSUPPORTED;
      this.videoPermission = PermissionStatus.UNSUPPORTED;
      return { audio: false, video: false };
    }

    // Use the Permissions API if available to check status without triggering getUserMedia
    if (navigator.permissions && navigator.permissions.query) {
      try {
        if (constraints.audio !== false) {
          const micStatus = await navigator.permissions.query({ name: 'microphone' });
          this.audioPermission = micStatus.state === 'granted' ? PermissionStatus.GRANTED
            : micStatus.state === 'denied' ? PermissionStatus.DENIED
            : PermissionStatus.PROMPT;
        }
        if (constraints.video !== false) {
          const camStatus = await navigator.permissions.query({ name: 'camera' });
          this.videoPermission = camStatus.state === 'granted' ? PermissionStatus.GRANTED
            : camStatus.state === 'denied' ? PermissionStatus.DENIED
            : PermissionStatus.PROMPT;
        }

        // If all permissions are already granted, return immediately without calling getUserMedia
        const audioOk = constraints.audio === false || this.audioPermission === PermissionStatus.GRANTED;
        const videoOk = constraints.video === false || this.videoPermission === PermissionStatus.GRANTED;
        if (audioOk && videoOk) {
          return {
            audio: constraints.audio === false || this.audioPermission === PermissionStatus.GRANTED,
            video: constraints.video === false || this.videoPermission === PermissionStatus.GRANTED,
          };
        }
      } catch (e) {
        // Permissions API may not support these queries on all browsers; fall through to getUserMedia
      }
    }

    // Fallback: prompt via getUserMedia (but DON'T immediately stop tracks)
    // The actual media stream will be used by MediaManager.startMediaStream
    // We store the stream so it can be reused instead of requesting again
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      this.audioPermission = constraints.audio !== false ? PermissionStatus.GRANTED : this.audioPermission;
      this.videoPermission = constraints.video !== false ? PermissionStatus.GRANTED : this.videoPermission;

      // Store the stream for reuse so startMediaStream doesn't need to request again
      this._preGrantedStream = stream;

      return {
        audio: this.audioPermission === PermissionStatus.GRANTED,
        video: this.videoPermission === PermissionStatus.GRANTED,
      };
    } catch (err) {
      console.error('Permission request failed:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';

      if (constraints.audio !== false) {
        this.audioPermission = isDenied ? PermissionStatus.DENIED : this.audioPermission;
      }
      if (constraints.video !== false) {
        this.videoPermission = isDenied ? PermissionStatus.DENIED : this.videoPermission;
      }

      return {
        audio: this.audioPermission === PermissionStatus.GRANTED,
        video: this.videoPermission === PermissionStatus.GRANTED,
      };
    }
  }

  /**
   * Returns the pre-granted media stream if available (from requestPermissions),
   * so MediaManager can reuse it instead of calling getUserMedia again.
   */
  consumePreGrantedStream() {
    const stream = this._preGrantedStream || null;
    this._preGrantedStream = null;
    return stream;
  }

  async checkAudioPermission() {
    const result = await this.requestPermissions({ audio: true, video: false });
    return result.audio;
  }

  async checkVideoPermission() {
    const result = await this.requestPermissions({ audio: false, video: true });
    return result.video;
  }

  getAudioStatus() {
    return this.audioPermission;
  }

  getVideoStatus() {
    return this.videoPermission;
  }

  reset() {
    this.audioPermission = PermissionStatus.PROMPT;
    this.videoPermission = PermissionStatus.PROMPT;
    this._cached = false;
  }
}

export default PermissionManager;
