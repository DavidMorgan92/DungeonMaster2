class HeroManager {
  constructor(heroes, canvasManager) {
    this.heroes = heroes
    this.canvasManager = canvasManager

    this.canvasManager.addRenderOperation(this.render.bind(this))

    this.imageLoader = new ImageLoader()
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
  }

  async changeHeroIcon(index) {
    await this.imageLoader.load(this.heroes[index].icon)
  }
}