class Compositor {
  constructor(backgroundRenderer, sightProviders) {
    this.backgroundRenderer = backgroundRenderer
    this.sightProviders = sightProviders
  }

  render(offsetX, offsetY, scaleFactor, ctx, shadowCtx) {
    ctx.fillStyle = 'lightgray'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    this.backgroundRenderer.render(ctx, offsetX, offsetY, scaleFactor)

    shadowCtx.fillStyle = 'darkgray'
    shadowCtx.fillRect(0, 0, shadowCtx.canvas.width, shadowCtx.canvas.height)

    for (const provider of this.sightProviders) {
      provider.render()

      shadowCtx.drawImage(provider.canvas,
        (provider.x - provider.radius) * scaleFactor + offsetX,
        (provider.y - provider.radius) * scaleFactor + offsetY,
        provider.radius * 2 * scaleFactor,
        provider.radius * 2 * scaleFactor)
    }

    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(shadowCtx.canvas, 0, 0)
    ctx.restore()
  }
}