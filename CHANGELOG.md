# Heart Link Surat — Changelog

## v1.0.0-rc1 (2026-07-23)

### Phase 03 — WebRTC Architecture
- Added `CallState`, `PeerConnection`, `MediaManager`, `PermissionManager`, `CleanupManager`, `FirebaseSignaling`, `WebRTCService`
- Integrated Firebase Realtime Database signaling

### Phase 04 — Calling Presentation Layer
- Added `CallContext` to bridge WebRTC engine with UI
- Created `VoiceCall` and `VideoCall` pages
- Built call components: `IncomingCallModal`, `OutgoingCallModal`, `CallControls`, `MuteButton`, `CameraButton`, `EndCallButton`, `ConnectionStatus`, `CallTimer`, `RemoteVideo`, `LocalVideo`, `CallQualityIndicator`, `ReconnectIndicator`, `DeviceSelector`, `MinimizedOverlay`, `FullscreenButton`
- Modified `App.jsx` with protected routes for `/call/voice` and `/call/video`
- Updated `HomeDashboard` with call navigation

### Phase 05 — Reliability & Recovery
- Added `AudioFeedback` service (ringtones and tones)
- Added `CallWatchdog` for disconnection monitoring
- Added `MediaRecovery` for lost track recovery
- Added `SecurityAudit` and `ResourceAudit` services
- Implemented device switching, reconnect handling, permission recovery
- Added minimized overlay and fullscreen support
- Extended `CallContext` with real-time mute/video sync, reconnect, and quality tracking

### Phase 06 — Security, Logging & Lifecycle
- Added `Logger` utility with structured logging
- Added `useAppLifecycle` hook for visibility/resume handling
- Added `ErrorBoundary` component
- Enhanced `VoiceCall` and `VideoCall` with reconnect/quality/minimize/fullscreen
- Added audio feedback integration

### Phase 07 — Quality Assurance
- Verified authentication, user discovery, presence, media, network, memory, accessibility, responsive design, PWA
- Documented 2 minor non-critical code-quality notes (variable ordering, reconnect subscription structure)
- Zero critical bugs; zero regressions

### Phase 08 — Production Readiness (This Release)
- **Performance:** Added `manualChunks` in `vite.config.js` (firebase, react, webrtc); initial chunk reduced from 942 KB to 193 KB
- **Lazy Loading:** VoiceCall and VideoCall pages lazy-loaded
- **PWA Optimization:** Generated PNG icons (192x192, 512x512, apple-touch-icon); fixed manifest references
- **Code Quality:** Fixed variable ordering in VoiceCall and VideoCall; removed duplicate `useCall()`; integrated reconnect monitoring into main subscription; cleaned unused imports
- **Security:** Verified `.env` setup, Firebase rules, and client-side validation
- **Documentation:** Created `CHANGELOG.md`, `PHASE_STATUS.md`, updated `README.md`, created `PHASE08_AUDIT.md`
- **Version:** `v1.0.0-rc1`

---
*Earlier versions: Phase 01 (foundation), Phase 02 (auth + discovery + presence) — see git history.*
