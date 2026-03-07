class MouseHandler {
  constructor(canvas, updateOffset, updateScaleFactor, getOffset, getScaleFactor) {
    this.canvas = canvas
    this.updateOffset = updateOffset
    this.updateScaleFactor = updateScaleFactor
    this.getOffset = getOffset
    this.getScaleFactor = getScaleFactor

    this.dragging = false
    this.lastMouseX = undefined
    this.lastMouseY = undefined
    this.mouseDeltaX = 0
    this.mouseDeltaY = 0

    this.canvas.addEventListener('mousedown', () => this.startDragging())
    this.canvas.addEventListener('mouseup', () => this.stopDragging())
    this.canvas.addEventListener('mouseleave', () => this.stopDragging())
    this.canvas.addEventListener('mousemove', event => this.scroll(event))
    this.canvas.addEventListener('wheel', event => this.zoom(event), { passive: false })

    this.enabled = false
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
    this.dragging = false
  }

  startDragging() {
    if (!this.enabled)
      return

    this.canvas.style.cursor = 'grabbing'
    this.dragging = true
  }

  stopDragging() {
    if (!this.enabled)
      return

    this.canvas.style.cursor = 'grab'
    this.dragging = false
  }

  scroll(event) {
    if (!this.enabled)
      return

    if (this.lastMouseX === undefined) {
      this.lastMouseX = event.offsetX
      this.lastMouseY = event.offsetY
    }

    this.mouseDeltaX = event.offsetX - this.lastMouseX
    this.mouseDeltaY = event.offsetY - this.lastMouseY

    this.lastMouseX = event.offsetX
    this.lastMouseY = event.offsetY

    if (this.dragging) {
      const offset = this.getOffset()
      this.updateOffset(offset.x + this.mouseDeltaX, offset.y + this.mouseDeltaY)
    }
  }

  zoom(event) {
    if (!this.enabled)
      return

    event.preventDefault()
    const prevScale = this.getScaleFactor()
    const zoomIntensity = 0.0015
    const delta = -event.deltaY

    const newScale = Math.min(Math.max(prevScale * (1 + delta * zoomIntensity), 1.0), 10.0)

    const px = event.offsetX
    const py = event.offsetY

    const offset = this.getOffset()

    this.updateOffset(px - ((px - offset.x) / prevScale) * newScale, py - ((py - offset.y) / prevScale) * newScale)
    this.updateScaleFactor(newScale)
  }
}
