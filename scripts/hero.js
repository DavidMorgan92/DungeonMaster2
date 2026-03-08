class Hero extends SightProvider {
  constructor(x, y, radius, icon, name) {
    super(x, y, radius)

    this.icon = icon.cloneNode()
    this.name = name
  }
}