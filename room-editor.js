class RoomEditor {
  constructor(canvasManager) {
    this.canvasManager = canvasManager
    this.editSightBlockers = false

    this.canvasManager.addRenderOperation(this.renderSightBlockers.bind(this))
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

    this.canvasManager.ctx.restore()
  }
}