class BackgroundRenderer {
  constructor(image) {
    this.image = image
  }

  render(ctx, offsetX, offsetY, scaleFactor) {
    const topLeft = CoordinateUtils.worldToScreen({ x: 0, y: 0 }, scaleFactor, { x: offsetX, y: offsetY })
    ctx.drawImage(this.image, topLeft.x, topLeft.y, this.image.naturalWidth * scaleFactor, this.image.naturalHeight * scaleFactor)
  }
}