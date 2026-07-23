/**
 * Phase 03: Cleanup Manager
 * Handles clean resource disposal for WebRTC connections, streams, and listeners.
 */

export class CleanupManager {
  constructor() {
    this.resources = new Set();
    this.timers = new Set();
    this.listeners = new Map(); // event -> set of callbacks
  }

  register(resource) {
    this.resources.add(resource);
    return resource;
  }

  unregister(resource) {
    this.resources.delete(resource);
  }

  registerTimer(timerId) {
    this.timers.add(timerId);
    return timerId;
  }

  clearTimer(timerId) {
    if (this.timers.has(timerId)) {
      clearTimeout(timerId);
      clearInterval(timerId);
      this.timers.delete(timerId);
    }
  }

  clearAllTimers() {
    this.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    this.timers.clear();
  }

  addEventListener(target, event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    target.addEventListener(event, callback);
    return () => {
      target.removeEventListener(event, callback);
      this.listeners.get(event)?.delete(callback);
    };
  }

  removeAllEventListeners(target) {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        target.removeEventListener(event, callback);
      });
    });
    this.listeners.clear();
  }

  cleanupResource(resource) {
    if (resource && typeof resource.dispose === 'function') {
      try {
        resource.dispose();
      } catch (e) {
        console.error('Resource dispose error:', e);
      }
    } else if (resource && typeof resource.stop === 'function') {
      try {
        resource.stop();
      } catch (e) {
        console.error('Resource stop error:', e);
      }
    } else if (resource && typeof resource.close === 'function') {
      try {
        resource.close();
      } catch (e) {
        console.error('Resource close error:', e);
      }
    }
    this.resources.delete(resource);
  }

  cleanupAll() {
    // Clean up all registered resources
    this.resources.forEach((resource) => {
      this.cleanupResource(resource);
    });
    this.resources.clear();

    // Clear all timers
    this.clearAllTimers();

    // Remove event listeners tracked per event type
    // Note: This requires manual removal for specific targets
  }

  dispose() {
    this.cleanupAll();
  }
}

export default CleanupManager;
