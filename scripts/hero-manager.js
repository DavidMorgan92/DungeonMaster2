class HeroManager {
  constructor(heroes, canvasManager, mouseHandler) {
    this.heroes = heroes
    this.canvasManager = canvasManager
    this.mouseHandler = mouseHandler

    this.canvasManager.addRenderOperation(this.render.bind(this))

    this.imageLoader = new ImageLoader()

    this.canvasManager.canvas.addEventListener('mousemove', event => this.handleMouseMove(event))

    this.hoveredHero = null
    this.dragging = false
  }

  render() {
    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    this.canvasManager.ctx.save()
    this.canvasManager.ctx.globalCompositeOperation = 'source-over'

    for (const hero of this.heroes) {
      const centerScreen = CoordinateUtils.worldToScreen(hero, scaleFactor, offset)

      this.canvasManager.ctx.drawImage(hero.icon,
        centerScreen.x - (hero.icon.width / 2 * scaleFactor),
        centerScreen.y - (hero.icon.height / 2 * scaleFactor),
        hero.icon.width * scaleFactor,
        hero.icon.height * scaleFactor)
    }

    this.canvasManager.ctx.restore()

    if (this.hoveredHero)
      this.renderHoveredHero(scaleFactor, offset)
  }

  renderHoveredHero(scaleFactor, offset) {
    const radius = (Math.max(this.hoveredHero.icon.width, this.hoveredHero.icon.height) + 15) * scaleFactor / 2
    const screenPoint = CoordinateUtils.worldToScreen(this.hoveredHero, scaleFactor, offset)

    this.canvasManager.ctx.save()
    this.canvasManager.ctx.strokeStyle = 'white'
    this.canvasManager.ctx.lineWidth = 3
    this.canvasManager.ctx.beginPath()
    this.canvasManager.ctx.arc(screenPoint.x, screenPoint.y, radius, 0, Math.PI * 2)
    this.canvasManager.ctx.stroke()
    this.canvasManager.ctx.restore()
  }

  async changeHeroIcon(index) {
    await this.imageLoader.load(this.heroes[index].icon)
  }

  handleMouseMove(event) {
    if (!this.dragging) {
      const prevHovered = this.hoveredHero
      this.hoveredHero = null

      const scaleFactor = this.canvasManager.getScaleFactor()
      const offset = this.canvasManager.getOffset()
      const screenPoint = { x: event.offsetX, y: event.offsetY }

      for (const hero of this.heroes) {
        if (this.pointOverHero(screenPoint, hero, scaleFactor, offset)) {
          this.hoveredHero = hero
          break
        }
      }

      if (prevHovered !== this.hoveredHero)
        this.canvasManager.scheduleRender()
    }
  }

  pointOverHero(point, hero, scaleFactor, offset) {
    const heroRect = {
      x: hero.x - hero.icon.width / 2,
      y: hero.y - hero.icon.height / 2,
      width: hero.icon.width,
      height: hero.icon.height,
    }

    const screenRect = CoordinateUtils.worldRectToScreen(heroRect, scaleFactor, offset)

    return CoordinateUtils.pointInRect(point, screenRect)
  }
}