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
    shadowCtx.clearRect(0, 0, shadowCtx.canvas.width, shadowCtx.canvas.height)
    shadowCtx.fillRect(0, 0, shadowCtx.canvas.width, shadowCtx.canvas.height)
    shadowCtx.globalCompositeOperation = 'lighter'

    for (const provider of this.sightProviders) {
      provider.render(this.sightBlockers)

      const topLeft = CoordinateUtils.worldToScreen({
        x: provider.x - provider.radius,
        y: provider.y - provider.radius,
      }, scaleFactor, { x: offsetX, y: offsetY })
      const size = provider.radius * 2 * scaleFactor

      shadowCtx.drawImage(provider.canvas,
        topLeft.x,
        topLeft.y,
        size,
        size)
    }
  }
}