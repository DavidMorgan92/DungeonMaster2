class Hero extends SightProvider {
  constructor(x, y, radius, icon, name) {
    super(x, y, radius)

    this.icon = icon
    this.name = name
  }
}