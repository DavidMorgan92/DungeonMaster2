class SightBlocker {
  constructor(x, y, width, height, angle) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.angle = angle
  }

  render(ctx, centerX, centerY) {
    ctx.save()
    ctx.fillStyle = 'darkgray'

    // draw a shape that is the projection of the corners from the center
    const corners = this.getCorners(centerX, centerY)
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y)
    }
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  getCorners(centerX, centerY) {
    const rad = this.angle * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const halfWidth = this.width / 2
    const halfHeight = this.height / 2

    return [
      { x: this.x - centerX + (-halfWidth * cos - -halfHeight * sin), y: this.y - centerY + (-halfWidth * sin + -halfHeight * cos) },
      { x: this.x - centerX + (halfWidth * cos - -halfHeight * sin), y: this.y - centerY + (halfWidth * sin + -halfHeight * cos) },
      { x: this.x - centerX + (halfWidth * cos - halfHeight * sin), y: this.y - centerY + (halfWidth * sin + halfHeight * cos) },
      { x: this.x - centerX + (-halfWidth * cos - halfHeight * sin), y: this.y - centerY + (-halfWidth * sin + halfHeight * cos) },
    ]
  }
}