class Compositor {
  constructor(backgroundRenderer, sightProviders, sightBlockers) {
    this.backgroundRenderer = backgroundRenderer
    this.sightProviders = sightProviders
    this.sightBlockers = sightBlockers
  }

  render(offsetX, offsetY, scaleFactor, ctx, shadowCtx) {
    ctx.fillStyle = 'lightgray'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    this.backgroundRenderer.render(ctx, offsetX, offsetY, scaleFactor)

    this.renderShadows(offsetX, offsetY, scaleFactor, shadowCtx)

    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(shadowCtx.canvas, 0, 0)
    ctx.restore()
  }

  renderShadows(offsetX, offsetY, scaleFactor, shadowCtx) {
    shadowCtx.fillStyle = 'darkgray'
    shadowCtx.fillRect(0, 0, shadowCtx.canvas.width, shadowCtx.canvas.height)

    for (const provider of this.sightProviders) {
      provider.render(this.sightBlockers)

      shadowCtx.drawImage(provider.canvas,
        (provider.x - provider.radius) * scaleFactor + offsetX,
        (provider.y - provider.radius) * scaleFactor + offsetY,
        provider.radius * 2 * scaleFactor,
        provider.radius * 2 * scaleFactor)
    }
  }
}