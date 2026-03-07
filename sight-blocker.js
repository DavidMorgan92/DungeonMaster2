class SightBlocker {
  constructor(x, y, width, height, angle) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.angle = angle
  }

  render(ctx, centerX, centerY, radius) {
    ctx.save()
    ctx.fillStyle = 'darkgray'
    ctx.globalCompositeOperation = 'destination-out'

    const corners = this.getCorners(centerX, centerY)
    
    ctx.beginPath()
    ctx.moveTo(corners[0].x, corners[0].y)
    ctx.lineTo(corners[1].x, corners[1].y)
    ctx.lineTo(corners[2].x, corners[2].y)
    ctx.lineTo(corners[3].x, corners[3].y)
    ctx.closePath()
    ctx.fill()

    this.drawProjection(ctx, radius, corners[0], corners[1])
    this.drawProjection(ctx, radius, corners[1], corners[2])
    this.drawProjection(ctx, radius, corners[2], corners[3])
    this.drawProjection(ctx, radius, corners[3], corners[0])

    ctx.restore()
  }

  drawProjection(ctx, radius, corner1, corner2) {
    ctx.beginPath()
    ctx.moveTo(corner1.x, corner1.y)
    ctx.lineTo(corner2.x, corner2.y)
    ctx.lineTo(radius + (corner2.x - radius) * 1000, radius + (corner2.y - radius) * 1000)
    ctx.lineTo(radius + (corner1.x - radius) * 1000, radius + (corner1.y - radius) * 1000)
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