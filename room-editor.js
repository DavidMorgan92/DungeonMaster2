class RoomEditor {
  constructor(canvasManager, moveIcon, rotateIcon, mouseHandler) {
    this.canvasManager = canvasManager
    this.moveIcon = moveIcon
    this.rotateIcon = rotateIcon
    this.mouseHandler = mouseHandler
    this.editSightBlockers = false

    this.canvasManager.addRenderOperation(this.renderSightBlockers.bind(this))

    this.canvasManager.canvas.addEventListener('mousemove', event => this.handleMouseMove(event))
    this.canvasManager.canvas.addEventListener('mousedown', event => this.handleMouseDown(event))
    this.canvasManager.canvas.addEventListener('mouseup', () => this.handleMouseUp())

    this.hoveredSightBlocker = null
    this.selectedSightBlocker = null
    this.dragging = false
    this.rotating = false
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
      const corners = blocker.getCorners(-blocker.width / 2, -blocker.height / 2)

      this.canvasManager.ctx.beginPath()
      this.canvasManager.ctx.moveTo(corners[0].x * scaleFactor + offset.x, corners[0].y * scaleFactor + offset.y)
      for (let i = 1; i < corners.length; i++) {
        this.canvasManager.ctx.lineTo(corners[i].x * scaleFactor + offset.x, corners[i].y * scaleFactor + offset.y)
      }
      this.canvasManager.ctx.closePath()
      this.canvasManager.ctx.fill()
    }

    if (this.hoveredSightBlocker && this.hoveredSightBlocker !== this.selectedSightBlocker)
      this.renderSightBlockerOutline('red', offset, scaleFactor, this.hoveredSightBlocker)

    if (this.selectedSightBlocker) {
      this.renderSightBlockerOutline('white', offset, scaleFactor, this.selectedSightBlocker)

      this.canvasManager.ctx.drawImage(this.moveIcon,
        (this.selectedSightBlocker.x + this.selectedSightBlocker.width / 2) * scaleFactor + offset.x - this.moveIcon.width / 2,
        (this.selectedSightBlocker.y + this.selectedSightBlocker.height / 2) * scaleFactor + offset.y - this.moveIcon.height / 2)

      const cos = Math.cos(this.selectedSightBlocker.angle * Math.PI / 180)
      const sin = Math.sin(this.selectedSightBlocker.angle * Math.PI / 180)

      this.canvasManager.ctx.drawImage(this.rotateIcon,
        (this.selectedSightBlocker.x + this.selectedSightBlocker.width / 2) * scaleFactor + offset.x - this.rotateIcon.width / 2 + cos * (this.selectedSightBlocker.width + this.rotateIcon.width + 16) * scaleFactor / 2,
        (this.selectedSightBlocker.y + this.selectedSightBlocker.height / 2) * scaleFactor + offset.y - this.rotateIcon.height / 2 + sin * (this.selectedSightBlocker.width + this.rotateIcon.width + 16) * scaleFactor / 2)
    }

    this.canvasManager.ctx.restore()
  }

  renderSightBlockerOutline(colour, offset, scaleFactor, sightBlocker) {
    const corners = sightBlocker.getCorners(-sightBlocker.width / 2, -sightBlocker.height / 2)

    this.canvasManager.ctx.strokeStyle = colour
    this.canvasManager.ctx.lineWidth = 2

    this.canvasManager.ctx.beginPath()
    this.canvasManager.ctx.moveTo(corners[0].x * scaleFactor + offset.x, corners[0].y * scaleFactor + offset.y)
    for (let i = 1; i < corners.length; i++) {
      this.canvasManager.ctx.lineTo(corners[i].x * scaleFactor + offset.x, corners[i].y * scaleFactor + offset.y)
    }
    this.canvasManager.ctx.closePath()
    this.canvasManager.ctx.stroke()
  }

  handleMouseMove(event) {
    if (!this.editSightBlockers)
      return

    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    const prevHovered = this.hoveredSightBlocker
    this.hoveredSightBlocker = null

    for (const blocker of this.canvasManager.compositor.sightBlockers) {
      if (this.pointInBox(event.offsetX, event.offsetY, {
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

    if (this.selectedSightBlocker) {
      if (this.dragging) {
        this.selectedSightBlocker.x = (event.offsetX - offset.x) / scaleFactor - this.selectedSightBlocker.width / 2
        this.selectedSightBlocker.y = (event.offsetY - offset.y) / scaleFactor - this.selectedSightBlocker.height / 2
        this.canvasManager.scheduleRender()
      } else if (this.rotating) {
        const centerX = (this.selectedSightBlocker.x + this.selectedSightBlocker.width / 2) * scaleFactor + offset.x
        const centerY = (this.selectedSightBlocker.y + this.selectedSightBlocker.height / 2) * scaleFactor + offset.y
        const angle = Math.atan2(event.offsetY - centerY, event.offsetX - centerX) * 180 / Math.PI
        this.selectedSightBlocker.angle = angle
        this.canvasManager.scheduleRender()
      }
    }
  }

  handleMouseDown(event) {
    if (!this.editSightBlockers)
      return

    this.selectedSightBlocker = this.hoveredSightBlocker

    this.canvasManager.scheduleRender()

    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()
    
    if (this.selectedSightBlocker) {
      const cos = Math.cos(this.selectedSightBlocker.angle * Math.PI / 180)
      const sin = Math.sin(this.selectedSightBlocker.angle * Math.PI / 180)

      if (this.pointInBox(event.offsetX, event.offsetY, {
        x: this.selectedSightBlocker.x * scaleFactor + offset.x + this.selectedSightBlocker.width * scaleFactor / 2 - this.moveIcon.width / 2,
        y: this.selectedSightBlocker.y * scaleFactor + offset.y + this.selectedSightBlocker.height * scaleFactor / 2 - this.moveIcon.height / 2,
        width: this.moveIcon.width,
        height: this.moveIcon.height,
      })) {
        this.dragging = true
        this.mouseHandler.disable()
      } else if (this.pointInBox(event.offsetX, event.offsetY, {
        x: this.selectedSightBlocker.x * scaleFactor + offset.x + this.selectedSightBlocker.width * scaleFactor / 2 + cos * (this.selectedSightBlocker.width + this.rotateIcon.width + 16) * scaleFactor / 2 - this.rotateIcon.width / 2,
        y: this.selectedSightBlocker.y * scaleFactor + offset.y + this.selectedSightBlocker.height * scaleFactor / 2 + sin * (this.selectedSightBlocker.width + this.rotateIcon.width + 16) * scaleFactor / 2 - this.rotateIcon.height / 2,
        width: this.rotateIcon.width,
        height: this.rotateIcon.height,
      })) {
        this.rotating = true
        this.mouseHandler.disable()
      }
    }
  }

  handleMouseUp() {
    if (!this.editSightBlockers)
      return

    this.dragging = false
    this.rotating = false
    this.mouseHandler.enable()
  }

  pointInBox(x, y, box) {
    return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height
  }
}