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

    for (const blocker of this.sightBlockers) {
      ctx.save()
      ctx.translate(blocker.x * scaleFactor + offsetX, blocker.y * scaleFactor + offsetY)
      ctx.rotate(blocker.angle * Math.PI / 180)
      ctx.fillStyle = 'black'
      ctx.fillRect(-blocker.width * scaleFactor / 2, -blocker.height * scaleFactor / 2, blocker.width * scaleFactor, blocker.height * scaleFactor)
      ctx.restore()
    }

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
      provider.render()

      shadowCtx.drawImage(provider.canvas,
        (provider.x - provider.radius) * scaleFactor + offsetX,
        (provider.y - provider.radius) * scaleFactor + offsetY,
        provider.radius * 2 * scaleFactor,
        provider.radius * 2 * scaleFactor)
    }
  }
}