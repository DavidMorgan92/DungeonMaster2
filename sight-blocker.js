class SightBlocker {
  constructor(x, y, width, height, angle) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.angle = angle
  }

  getCorners() {
    const rad = this.angle * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const halfWidth = this.width / 2
    const halfHeight = this.height / 2

    return [
      { x: this.x + (-halfWidth * cos - -halfHeight * sin), y: this.y + (-halfWidth * sin + -halfHeight * cos) },
      { x: this.x + (halfWidth * cos - -halfHeight * sin), y: this.y + (halfWidth * sin + -halfHeight * cos) },
      { x: this.x + (halfWidth * cos - halfHeight * sin), y: this.y + (halfWidth * sin + halfHeight * cos) },
      { x: this.x + (-halfWidth * cos - halfHeight * sin), y: this.y + (-halfWidth * sin + halfHeight * cos) },
    ]
  }
}