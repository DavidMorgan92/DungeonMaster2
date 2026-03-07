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
      const firstPos = CoordinateUtils.worldToScreen(corners[0], scaleFactor, offset)
      this.canvasManager.ctx.moveTo(firstPos.x, firstPos.y)
      for (let i = 1; i < corners.length; i++) {
        const screenPos = CoordinateUtils.worldToScreen(corners[i], scaleFactor, offset)
        this.canvasManager.ctx.lineTo(screenPos.x, screenPos.y)
      }
      this.canvasManager.ctx.closePath()
      this.canvasManager.ctx.fill()
    }

    if (this.hoveredSightBlocker && this.hoveredSightBlocker !== this.selectedSightBlocker)
      this.renderSightBlockerOutline('red', offset, scaleFactor, this.hoveredSightBlocker)

    if (this.selectedSightBlocker) {
      this.renderSightBlockerOutline('white', offset, scaleFactor, this.selectedSightBlocker)

      const centerScreen = CoordinateUtils.worldToScreen({
        x: this.selectedSightBlocker.x + this.selectedSightBlocker.width / 2,
        y: this.selectedSightBlocker.y + this.selectedSightBlocker.height / 2,
      }, scaleFactor, offset)

      this.canvasManager.ctx.drawImage(this.moveIcon,
        centerScreen.x - this.moveIcon.width / 2,
        centerScreen.y - this.moveIcon.height / 2)

      const cos = Math.cos(this.selectedSightBlocker.angle * Math.PI / 180)
      const sin = Math.sin(this.selectedSightBlocker.angle * Math.PI / 180)

      this.canvasManager.ctx.drawImage(this.rotateIcon,
        centerScreen.x - this.rotateIcon.width / 2 + cos * (this.selectedSightBlocker.width + this.rotateIcon.width + 16) * scaleFactor / 2,
        centerScreen.y - this.rotateIcon.height / 2 + sin * (this.selectedSightBlocker.width + this.rotateIcon.width + 16) * scaleFactor / 2)
    }

    this.canvasManager.ctx.restore()
  }

  renderSightBlockerOutline(colour, offset, scaleFactor, sightBlocker) {
    const corners = sightBlocker.getCorners(-sightBlocker.width / 2, -sightBlocker.height / 2)

    this.canvasManager.ctx.strokeStyle = colour
    this.canvasManager.ctx.lineWidth = 2

    this.canvasManager.ctx.beginPath()
    const firstPos = CoordinateUtils.worldToScreen(corners[0], scaleFactor, offset)
    this.canvasManager.ctx.moveTo(firstPos.x, firstPos.y)
    for (let i = 1; i < corners.length; i++) {
      const screenPos = CoordinateUtils.worldToScreen(corners[i], scaleFactor, offset)
      this.canvasManager.ctx.lineTo(screenPos.x, screenPos.y)
    }
    this.canvasManager.ctx.closePath()
    this.canvasManager.ctx.stroke()
  }

  handleMouseMove(event) {
    if (!this.editSightBlockers)
      return

    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    if (!this.dragging && !this.rotating) {
      const prevHovered = this.hoveredSightBlocker
      this.hoveredSightBlocker = null

      for (const blocker of this.canvasManager.compositor.sightBlockers) {
        const corners = blocker.getCorners(-blocker.width / 2, -blocker.height / 2)
        const screenCorners = corners.map(corner => CoordinateUtils.worldToScreen(corner, scaleFactor, offset))

        if (CoordinateUtils.pointInPolygon({ x: event.offsetX, y: event.offsetY }, screenCorners)) {
          this.hoveredSightBlocker = blocker
          break
        }
      }

      if (prevHovered !== this.hoveredSightBlocker)
        this.canvasManager.scheduleRender()
    }

    this.canvasManager.canvas.style.cursor = this.hoveredSightBlocker ? 'pointer' : 'grab'

    if (this.selectedSightBlocker) {
      if (this.dragging) {
        const worldPoint = CoordinateUtils.screenToWorld({ x: event.offsetX, y: event.offsetY }, scaleFactor, offset)
        this.selectedSightBlocker.x = worldPoint.x - this.selectedSightBlocker.width / 2
        this.selectedSightBlocker.y = worldPoint.y - this.selectedSightBlocker.height / 2
        this.canvasManager.scheduleRender()
        this.canvasManager.canvas.style.cursor = 'grabbing'
      } else if (this.rotating) {
        const centerScreen = CoordinateUtils.worldToScreen({
          x: this.selectedSightBlocker.x + this.selectedSightBlocker.width / 2,
          y: this.selectedSightBlocker.y + this.selectedSightBlocker.height / 2,
        }, scaleFactor, offset)
        const angle = Math.atan2(event.offsetY - centerScreen.y, event.offsetX - centerScreen.x) * 180 / Math.PI
        this.selectedSightBlocker.angle = angle
        this.canvasManager.scheduleRender()
        this.canvasManager.canvas.style.cursor = 'grabbing'
      }
    }
  }

  handleMouseDown(event) {
    if (!this.editSightBlockers)
      return

    if (this.hoveredSightBlocker)
      this.selectedSightBlocker = this.hoveredSightBlocker

    this.canvasManager.scheduleRender()

    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    if (this.selectedSightBlocker) {
      const centerScreen = CoordinateUtils.worldToScreen({
        x: this.selectedSightBlocker.x + this.selectedSightBlocker.width / 2,
        y: this.selectedSightBlocker.y + this.selectedSightBlocker.height / 2,
      }, scaleFactor, offset)

      const cos = Math.cos(this.selectedSightBlocker.angle * Math.PI / 180)
      const sin = Math.sin(this.selectedSightBlocker.angle * Math.PI / 180)

      const moveIconRect = {
        x: centerScreen.x - this.moveIcon.width / 2,
        y: centerScreen.y - this.moveIcon.height / 2,
        width: this.moveIcon.width,
        height: this.moveIcon.height,
      }

      if (CoordinateUtils.pointInRect({ x: event.offsetX, y: event.offsetY }, moveIconRect)) {
        this.dragging = true
        this.mouseHandler.disable()
      } else {
        const rotateRadius = (this.selectedSightBlocker.width + this.rotateIcon.width + 16) * scaleFactor / 2
        const rotateIconScreenX = centerScreen.x - this.rotateIcon.width / 2 + cos * rotateRadius
        const rotateIconScreenY = centerScreen.y - this.rotateIcon.height / 2 + sin * rotateRadius

        const rotateIconRect = {
          x: rotateIconScreenX,
          y: rotateIconScreenY,
          width: this.rotateIcon.width,
          height: this.rotateIcon.height,
        }

        if (CoordinateUtils.pointInRect({ x: event.offsetX, y: event.offsetY }, rotateIconRect)) {
          this.rotating = true
          this.mouseHandler.disable()
        }
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
}