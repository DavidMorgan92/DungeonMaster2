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

    const corners = this.getCorners(centerX, centerY)
    
    this.drawProjection(ctx, centerX, centerY, corners[0], corners[1])
    this.drawProjection(ctx, centerX, centerY, corners[1], corners[2])
    this.drawProjection(ctx, centerX, centerY, corners[2], corners[3])
    this.drawProjection(ctx, centerX, centerY, corners[3], corners[0])

    ctx.restore()
  }

  drawProjection(ctx, centerX, centerY, corner1, corner2) {
    ctx.beginPath()
    ctx.moveTo(corner1.x, corner1.y)
    ctx.lineTo(corner2.x, corner2.y)
    ctx.lineTo(corner2.x * 1000, corner2.y * 1000)
    ctx.lineTo(corner1.x * 1000, corner1.y * 1000)
    ctx.closePath()
    ctx.fill()
  }

  getCorners(centerX, centerY) {
    const rad = this.angle * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const halfWidth = this.width / 2
    const halfHeight = this.height / 2

    return [
      {
        x: this.x - centerX + (-halfWidth * cos - -halfHeight * sin),
        y: this.y - centerY + (-halfWidth * sin + -halfHeight * cos),
      },
      {
        x: this.x - centerX + (halfWidth * cos - -halfHeight * sin),
        y: this.y - centerY + (halfWidth * sin + -halfHeight * cos),
      },
      {
        x: this.x - centerX + (halfWidth * cos - halfHeight * sin),
        y: this.y - centerY + (halfWidth * sin + halfHeight * cos),
      },
      {
        x: this.x - centerX + (-halfWidth * cos - halfHeight * sin),
        y: this.y - centerY + (-halfWidth * sin + halfHeight * cos),
      },
    ]
  }
}