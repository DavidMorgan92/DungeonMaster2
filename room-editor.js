class RoomEditor {
  constructor(canvasManager, moveIcon, mouseHandler) {
    this.canvasManager = canvasManager
    this.moveIcon = moveIcon
    this.mouseHandler = mouseHandler
    this.editSightBlockers = false

    this.canvasManager.addRenderOperation(this.renderSightBlockers.bind(this))

    this.canvasManager.canvas.addEventListener('mousemove', event => this.handleMouseMove(event))
    this.canvasManager.canvas.addEventListener('mousedown', event => this.handleMouseDown(event))
    this.canvasManager.canvas.addEventListener('mouseup', () => this.handleMouseUp())

    this.hoveredSightBlocker = null
    this.selectedSightBlocker = null
    this.dragging = false
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
      if (this.pointInbox(event.offsetX, event.offsetY, {
        x: blocker.x * scaleFactor + offset.x,
        y: blocker.y * scaleFactor + offset.y,
        width: blocker.width * scaleFactor,
        height: blocker.height * scaleFactor,
      })) {
        this.hoveredSightBlocker = blocker
        break
      }
    }

    if (prevHovered !== this.hoveredSightBlocker)
      this.canvasManager.scheduleRender()

    this.canvasManager.canvas.style.cursor = this.hoveredSightBlocker ? 'pointer' : 'grab'

    if (this.dragging && this.selectedSightBlocker) {
      this.selectedSightBlocker.x = (event.offsetX - offset.x) / scaleFactor - this.selectedSightBlocker.width / 2
      this.selectedSightBlocker.y = (event.offsetY - offset.y) / scaleFactor - this.selectedSightBlocker.height / 2
      this.canvasManager.scheduleRender()
    }
  }

  handleMouseDown(event) {
    if (!this.editSightBlockers)
      return

    this.selectedSightBlocker = this.hoveredSightBlocker

    this.canvasManager.scheduleRender()

    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    if (this.selectedSightBlocker && this.pointInbox(event.offsetX, event.offsetY, {
      x: this.selectedSightBlocker.x * scaleFactor + offset.x + this.selectedSightBlocker.width * scaleFactor / 2 - this.moveIcon.width / 2,
      y: this.selectedSightBlocker.y * scaleFactor + offset.y + this.selectedSightBlocker.height * scaleFactor / 2 - this.moveIcon.height / 2,
      width: this.selectedSightBlocker.width * scaleFactor - this.selectedSightBlocker.width * scaleFactor / 2 + this.moveIcon.width / 2,
      height: this.selectedSightBlocker.height * scaleFactor - this.selectedSightBlocker.height * scaleFactor / 2 + this.moveIcon.height / 2,
    })) {
      this.dragging = true
      this.mouseHandler.disable()
    }
  }

  handleMouseUp() {
    if (!this.editSightBlockers)
      return

    this.dragging = false
    this.mouseHandler.enable()
  }

  pointInbox(x, y, box) {
    return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height
  }
}