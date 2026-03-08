class SightProvider {
  constructor(x, y, radius) {
    this.x = x
    this.y = y
    this.radius = radius

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.radius * 2
    this.canvas.height = this.radius * 2

    this.ctx = this.canvas.getContext('2d')
    this.ctx.fillStyle = 'white'
  }

  render(sightBlockers) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.beginPath()
    this.ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2)
    this.ctx.fill()

    for (const sightBlocker of sightBlockers) {
      sightBlocker.render(this.ctx, this.x - this.radius, this.y - this.radius, this.radius)
    }
  }
}