// This is a utility script to generate PWA icons
// Run this in the browser console or as a separate script

export const generateIcons = () => {
  const sizes = [192, 512]
  
  sizes.forEach(size => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, '#0284c7')
    gradient.addColorStop(1, '#0ea5e9')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    
    // Phone icon
    ctx.fillStyle = 'white'
    ctx.beginPath()
    
    // Simplified phone icon path
    const centerX = size / 2
    const centerY = size / 2
    const iconSize = size * 0.5
    
    // Draw phone icon (simplified)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(iconSize / 24, iconSize / 24)
    
    // Phone handset path
    ctx.beginPath()
    ctx.moveTo(-6, -2)
    ctx.bezierCurveTo(-6, -2, -5, -3, -4, -3)
    ctx.lineTo(4, -3)
    ctx.bezierCurveTo(5, -3, 6, -2, 6, -2)
    ctx.lineTo(6, 2)
    ctx.bezierCurveTo(6, 2, 5, 3, 4, 3)
    ctx.lineTo(-4, 3)
    ctx.bezierCurveTo(-5, 3, -6, 2, -6, 2)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
    
    // Download or display the icon
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `icon-${size}x${size}.png`
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  })
}

// Auto-run in browser
if (typeof window !== 'undefined') {
  window.generateIcons = generateIcons
}
