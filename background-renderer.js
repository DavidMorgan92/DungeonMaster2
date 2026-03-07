class BackgroundRenderer {
  constructor(image) {
    this.image = image
  }

  render(ctx, offsetX, offsetY, scaleFactor) {
    ctx.drawImage(this.image, offsetX, offsetY, this.image.naturalWidth * scaleFactor, this.image.naturalHeight * scaleFactor)
  }
}