/**
 * Phase 05: Device Selector
 */
import React, { useState, useEffect } from 'react'

const DeviceSelector = ({ service, onSelectVideo, onSelectAudio }) => {
  const [devices, setDevices] = useState({ video: [], audio: [] })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const result = await service.mediaManager.getDevices()
      setDevices(result)
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [service])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-white text-xs rounded-xl transition-colors"
        aria-label="Select device"
      >
        Devices
      </button>
    )
  }

  return (
    <div className="absolute bottom-16 left-4 z-50 bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-2xl min-w-[240px] animate-slide-up">
      <h4 className="text-sm font-semibold text-white mb-3">Video Devices</h4>
      <div className="space-y-1 mb-4">
        {devices.video.map((d) => (
          <button
            key={d.deviceId}
            onClick={() => {
              onSelectVideo?.(d.deviceId)
              setOpen(false)
            }}
            className="w-full text-left px-3 py-2 hover:bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors"
          >
            {d.label || 'Camera ' + d.deviceId.slice(0, 8)}
          </button>
        ))}
      </div>
      <h4 className="text-sm font-semibold text-white mb-3">Audio Devices</h4>
      <div className="space-y-1">
        {devices.audio.map((d) => (
          <button
            key={d.deviceId}
            onClick={() => {
              onSelectAudio?.(d.deviceId)
              setOpen(false)
            }}
            className="w-full text-left px-3 py-2 hover:bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors"
          >
            {d.label || 'Mic ' + d.deviceId.slice(0, 8)}
          </button>
        ))}
      </div>
      <button
        onClick={() => setOpen(false)}
        className="mt-3 text-xs text-dark-500 hover:text-white"
      >
        Close
      </button>
    </div>
  )
}

export default DeviceSelector
