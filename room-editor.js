class RoomEditor {
  constructor(canvasManager, moveIcon) {
    this.canvasManager = canvasManager
    this.moveIcon = moveIcon
    this.editSightBlockers = false

    this.canvasManager.addRenderOperation(this.renderSightBlockers.bind(this))

    this.canvasManager.canvas.addEventListener('mousemove', event => this.handleMouseMove(event))
    this.canvasManager.canvas.addEventListener('click', event => this.handleClick())

    this.hoveredSightBlocker = null
    this.selectedSightBlocker = null
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

    if (this.hoveredSightBlocker && this.hoveredSightBlocker !== this.selectedSightBlocker)
      this.renderSightBlockerOutline('red', offset, scaleFactor, this.hoveredSightBlocker)

    if (this.selectedSightBlocker) {
      this.renderSightBlockerOutline('white', offset, scaleFactor, this.selectedSightBlocker)
      this.canvasManager.ctx.drawImage(this.moveIcon,
        (this.selectedSightBlocker.x + this.selectedSightBlocker.width / 2) * scaleFactor + offset.x - this.moveIcon.width / 2,
        (this.selectedSightBlocker.y + this.selectedSightBlocker.height / 2) * scaleFactor + offset.y - this.moveIcon.height / 2)
    }

    this.canvasManager.ctx.restore()
  }

  renderSightBlockerOutline(colour, offset, scaleFactor, sightBlocker) {
    this.canvasManager.ctx.strokeStyle = colour
    this.canvasManager.ctx.lineWidth = 2
    this.canvasManager.ctx.strokeRect(
      sightBlocker.x * scaleFactor + offset.x,
      sightBlocker.y * scaleFactor + offset.y,
      sightBlocker.width * scaleFactor,
      sightBlocker.height * scaleFactor)
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

  handleClick() {
    if (!this.editSightBlockers)
      return

    this.selectedSightBlocker = this.hoveredSightBlocker

    this.canvasManager.scheduleRender()
  }
}