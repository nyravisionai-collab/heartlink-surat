/**
 * Phase 03: Media Manager
 * Handles local media streams (audio/video) with device selection and constraints.
 */

export class MediaManager {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.videoEnabled = true;
    this.audioEnabled = true;
    this.videoDevices = [];
    this.audioDevices = [];
    this.selectedVideoDevice = null;
    this.selectedAudioDevice = null;
  }

  async getDevices() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (e) {
      // Ignore temporary permission request
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter((d) => d.kind === 'videoinput');
      this.audioDevices = devices.filter((d) => d.kind === 'audioinput');
      return {
        video: this.videoDevices,
        audio: this.audioDevices,
      };
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
      return { video: [], audio: [] };
    }
  }

  async startMediaStream(constraints = {}) {
    const defaultConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        deviceId: this.selectedAudioDevice ? { exact: this.selectedAudioDevice } : undefined,
      },
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        deviceId: this.selectedVideoDevice ? { exact: this.selectedVideoDevice } : undefined,
      },
    };

    const mergedConstraints = {
      audio: this.audioEnabled ? { ...defaultConstraints.audio, ...constraints.audio } : false,
      video: this.videoEnabled ? { ...defaultConstraints.video, ...constraints.video } : false,
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(mergedConstraints);
      return this.localStream;
    } catch (err) {
      console.error('Failed to get media stream:', err);
      throw err;
    }
  }

  async startAudioOnly() {
    this.videoEnabled = false;
    return this.startMediaStream({ video: false, audio: true });
  }

  async startVideoOnly() {
    this.audioEnabled = false;
    return this.startMediaStream({ video: true, audio: false });
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  setVideoEnabled(enabled) {
    this.videoEnabled = enabled;
    this.applyTrackConstraints();
  }

  setAudioEnabled(enabled) {
    this.audioEnabled = enabled;
    this.applyTrackConstraints();
  }

  applyTrackConstraints() {
    if (!this.localStream) return;

    this.localStream.getVideoTracks().forEach((track) => {
      try {
        track.enabled = this.videoEnabled;
      } catch (e) {
        console.error('Failed to set video track enabled:', e);
      }
    });

    this.localStream.getAudioTracks().forEach((track) => {
      try {
        track.enabled = this.audioEnabled;
      } catch (e) {
        console.error('Failed to set audio track enabled:', e);
      }
    });
  }

  getLocalStream() {
    return this.localStream;
  }

  setRemoteStream(stream) {
    this.remoteStream = stream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  selectVideoDevice(deviceId) {
    this.selectedVideoDevice = deviceId || null;
  }

  selectAudioDevice(deviceId) {
    this.selectedAudioDevice = deviceId || null;
  }

  dispose() {
    this.stopLocalStream();
    this.remoteStream = null;
    this.videoDevices = [];
    this.audioDevices = [];
  }
}

export default MediaManager;
