class Compositor {
  constructor(backgroundRenderer, sightProviders, sightBlockers) {
    this.backgroundRenderer = backgroundRenderer
    this.sightProviders = sightProviders
    this.sightBlockers = sightBlockers
    this.showSightBlockers = false
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

    if (this.showSightBlockers)
      this.renderSightBlockers(offsetX, offsetY, scaleFactor, ctx)
  }

  renderShadows(offsetX, offsetY, scaleFactor, shadowCtx) {
    shadowCtx.fillStyle = 'darkgray'
    shadowCtx.clearRect(0, 0, shadowCtx.canvas.width, shadowCtx.canvas.height)
    shadowCtx.fillRect(0, 0, shadowCtx.canvas.width, shadowCtx.canvas.height)
    shadowCtx.globalCompositeOperation = 'lighter'

    for (const provider of this.sightProviders) {
      provider.render(this.sightBlockers)

      shadowCtx.drawImage(provider.canvas,
        (provider.x - provider.radius) * scaleFactor + offsetX,
        (provider.y - provider.radius) * scaleFactor + offsetY,
        provider.radius * 2 * scaleFactor,
        provider.radius * 2 * scaleFactor)
    }
  }

  renderSightBlockers(offsetX, offsetY, scaleFactor, ctx) {
    ctx.save()
    ctx.fillStyle = 'rgb(0, 0, 0, 0.8)'
    for (const blocker of this.sightBlockers) {
      ctx.fillRect(
        blocker.x * scaleFactor + offsetX,
        blocker.y * scaleFactor + offsetY,
        blocker.width * scaleFactor,
        blocker.height * scaleFactor)
    }
    ctx.restore()
  }

  toggleShowSightBlockers(show) {
    this.showSightBlockers = show
  }
}