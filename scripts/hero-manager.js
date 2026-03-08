class HeroManager {
  constructor(heroes, canvasManager, mouseHandler) {
    this.heroes = heroes
    this.canvasManager = canvasManager
    this.mouseHandler = mouseHandler

    this.canvasManager.addRenderOperation(this.render.bind(this))

    this.imageLoader = new ImageLoader()

    this.canvasManager.canvas.addEventListener('mousemove', event => this.handleMouseMove(event))
    this.canvasManager.canvas.addEventListener('mousedown', event => this.handleMouseDown(event))
    this.canvasManager.canvas.addEventListener('mouseup', () => this.handleMouseUp())
    this.canvasManager.canvas.addEventListener('mouseleave', () => this.handleMouseLeave())

    this.hoveredHero = null
    this.selectedHero = null
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
      this.renderHeroOutline(this.hoveredHero, scaleFactor, offset, 'red')
    
    if (this.selectedHero)
      this.renderHeroOutline(this.selectedHero, scaleFactor, offset, 'white')
  }

  renderHeroOutline(hero, scaleFactor, offset, colour) {
    const radius = (Math.max(hero.icon.width, hero.icon.height) + 15) * scaleFactor / 2
    const screenPoint = CoordinateUtils.worldToScreen(hero, scaleFactor, offset)

    this.canvasManager.ctx.save()
    this.canvasManager.ctx.strokeStyle = colour
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
    const screenPoint = { x: event.offsetX, y: event.offsetY }
    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    if (!this.dragging) {
      const prevHovered = this.hoveredHero
      this.hoveredHero = null

      for (const hero of this.heroes) {
        if (this.pointOverHero(screenPoint, hero, scaleFactor, offset)) {
          this.hoveredHero = hero
          break
        }
      }

      if (prevHovered !== this.hoveredHero)
        this.canvasManager.scheduleRender()
    }

    if (this.selectedHero && this.dragging) {
      const worldPoint = CoordinateUtils.screenToWorld(screenPoint, scaleFactor, offset)
      this.selectedHero.x = worldPoint.x
      this.selectedHero.y = worldPoint.y
      this.canvasManager.scheduleRender()
    }
  }

  handleMouseDown(event) {
    const scaleFactor = this.canvasManager.getScaleFactor()
    const offset = this.canvasManager.getOffset()

    if (this.hoveredHero)
      this.selectHero(this.hoveredHero)

    const screenPoint = { x: event.offsetX, y: event.offsetY }

    if (this.selectedHero) {
      if (this.pointOverHero(screenPoint, this.selectedHero, scaleFactor, offset)) {
        this.dragging = true
        this.mouseHandler.disable()
      }
    }
  }

  handleMouseUp() {
    this.dragging = false
    this.mouseHandler.enable()
    this.canvasManager.canvas.style.cursor = 'grab'
  }

  handleMouseLeave() {
    this.dragging = false
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

  selectHero(hero) {
    this.selectedHero = hero
    this.canvasManager.scheduleRender()

    const index = this.heroes.indexOf(hero)
    this.onHeroSelected(index)
  }

  selectHeroByIndex(index) {
    this.selectedHero = this.heroes[index]
    this.canvasManager.scheduleRender()
  }

  deselectHero() {
    this.selectHero = null
    this.canvasManager.scheduleRender()
  }
}