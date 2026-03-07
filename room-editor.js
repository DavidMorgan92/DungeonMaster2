class RoomEditor {
  constructor(canvasManager) {
    this.canvasManager = canvasManager
    this.editSightBlockers = false

    this.canvasManager.addRenderOperation(this.renderSightBlockers.bind(this))

    this.canvasManager.canvas.addEventListener('mousemove', event => this.handleMouseMove(event))

    this.hoveredSightBlocker = null
  }

  toggleEditSightBlockers(show) {
    this.editSightBlockers = show
    this.canvasManager.scheduleRender()
  }

  renderSightBlockers() {
    if (!this.editSightBlockers)
      return

    this.canvasManager.ctx.save()
    this.canvasManager.ctx.globalCompositeOperation = 'source-over'
    this.canvasManager.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'

    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    for (const blocker of this.canvasManager.compositor.sightBlockers) {
      this.canvasManager.ctx.fillRect(
        blocker.x * scaleFactor + offset.x,
        blocker.y * scaleFactor + offset.y,
        blocker.width * scaleFactor,
        blocker.height * scaleFactor)
    }

    if (this.hoveredSightBlocker) {
      this.canvasManager.ctx.strokeStyle = 'red'
      this.canvasManager.ctx.lineWidth = 2
      this.canvasManager.ctx.strokeRect(
        this.hoveredSightBlocker.x * scaleFactor + offset.x,
        this.hoveredSightBlocker.y * scaleFactor + offset.y,
        this.hoveredSightBlocker.width * scaleFactor,
        this.hoveredSightBlocker.height * scaleFactor)
    }

    this.canvasManager.ctx.restore()
  }

  handleMouseMove(event) {
    if (!this.editSightBlockers)
      return

    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    const prevHovered = this.hoveredSightBlocker
    this.hoveredSightBlocker = null

    for (const blocker of this.canvasManager.compositor.sightBlockers) {
      if (event.offsetX >= blocker.x * scaleFactor + offset.x &&
          event.offsetX <= (blocker.x + blocker.width) * scaleFactor + offset.x &&
          event.offsetY >= blocker.y * scaleFactor + offset.y &&
          event.offsetY <= (blocker.y + blocker.height) * scaleFactor + offset.y) {
        this.hoveredSightBlocker = blocker
        break
      }
    }

    if (prevHovered !== this.hoveredSightBlocker)
      this.canvasManager.scheduleRender()

    this.canvasManager.canvas.style.cursor = this.hoveredSightBlocker ? 'pointer' : 'grab'
  }
}