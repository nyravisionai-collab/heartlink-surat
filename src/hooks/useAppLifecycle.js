/**
 * Phase 06: App Lifecycle Handler
 * Handles visibility changes, tab hidden/visible, resume, background.
 */
import { useCallback, useEffect, useRef } from 'react'
import Logger from '../utils/Logger.js'

export const useAppLifecycle = (onHidden, onVisible, onResume, onBackground) => {
  const visibleRef = useRef(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibleRef.current = false
        Logger.info('App hidden')
        onHidden?.()
      } else {
        visibleRef.current = true
        Logger.info('App visible')
        onVisible?.()
      }
    }

    const handleFocus = () => {
      Logger.info('App focused/resumed')
      visibleRef.current = true
      onResume?.()
    }

    const handleBlur = () => {
      Logger.info('App backgrounded')
      visibleRef.current = false
      onBackground?.()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [onHidden, onVisible, onResume, onBackground])

  return { isVisible: !document.hidden }
}
