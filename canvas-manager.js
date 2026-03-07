class CanvasManager {
  constructor(canvas, compositor) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    this.compositor = compositor

    this.shadowCanvas = document.createElement('canvas')
    this.shadowCanvas.width = canvas.width
    this.shadowCanvas.height = canvas.height
    this.shadowCtx = this.shadowCanvas.getContext('2d')

    this.offsetX = 0
    this.offsetY = 0
    this.scaleFactor = 1.0

    window.addEventListener('resize', () => this.handleResize())
    this.handleResize()
  }

  handleResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect()
    this.canvas.width = rect.width
    this.canvas.height = rect.height
    this.shadowCanvas.width = rect.width
    this.shadowCanvas.height = rect.height
    this.scheduleRender()
  }

  scheduleRender() {
    if (this.renderScheduled)
      return

    this.renderScheduled = true

    requestAnimationFrame(() => {
      this.renderScheduled = false
      this.compositor.render(this.offsetX, this.offsetY, this.scaleFactor, this.ctx, this.shadowCtx)
    })
  }

  updateOffset(newOffsetX, newOffsetY) {
    this.offsetX = newOffsetX
    this.offsetY = newOffsetY
    this.scheduleRender()
  }

  updateScaleFactor(newScaleFactor) {
    this.scaleFactor = newScaleFactor
    this.scheduleRender()
  }

  getOffset() {
    return { x: this.offsetX, y: this.offsetY }
  }

  getScaleFactor() {
    return this.scaleFactor
  }
}

function initCanvas(canvas, sightProviders, sightBlockers) {
  const background = document.getElementById('background')

  const backgroundRenderer = new BackgroundRenderer(background)
  const compositor = new Compositor(backgroundRenderer, sightProviders, sightBlockers)
  const canvasManager = new CanvasManager(canvas, compositor)
  
  new MouseHandler(canvas,
    canvasManager.updateOffset.bind(canvasManager),
    canvasManager.updateScaleFactor.bind(canvasManager),
    canvasManager.getOffset.bind(canvasManager),
    canvasManager.getScaleFactor.bind(canvasManager))
}