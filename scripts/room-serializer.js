class RoomSerializer {
  constructor(sightBlockers, backgroundElement, heroes) {
    this.sightBlockers = sightBlockers
    this.backgroundElement = backgroundElement
    this.heroes = heroes

    this.fileTypes = [{
      description: 'JSON',
      accept: { 'application/json': ['.json'] },
    }]
  }

  async save() {
    const background = await this.getImageAsBase64(this.backgroundElement)
    const heroIcons = await Promise.all(this.heroes.map(hero => this.getImageAsBase64(hero.icon)))

    const room = {
      sightBlockers: this.sightBlockers,
      heroes: this.heroes.map((hero, index) => ({
        x: hero.x,
        y: hero.y,
        radius: hero.radius,
        name: hero.name,
        icon: heroIcons[index],
      })),
      background,
    }

    const content = JSON.stringify(room, null, 2)

    const handle = await window.showSaveFilePicker({
      suggestedName: 'room.json',
      types: this.fileTypes,
    })

    const writable = await handle.createWritable()
    await writable.write(content)
    await writable.close()
  }

  async load() {
    const [fileHandle] = await window.showOpenFilePicker({
      multiple: false,
      types: this.fileTypes,
    })

    const file = await fileHandle.getFile()
    const content = await file.text()
    const room = JSON.parse(content)

    this.sightBlockers.splice(0, this.sightBlockers.length)

    for (const sightBlocker of room.sightBlockers)
      this.sightBlockers.push(new SightBlocker(sightBlocker.x, sightBlocker.y, sightBlocker.width, sightBlocker.height, sightBlocker.angle))

    this.heroes.splice(0, this.heroes.length)

    for (const hero of room.heroes) {
      const iconElement = document.createElement('img')
      iconElement.src = hero.icon
      this.heroes.push(new Hero(hero.x, hero.y, hero.radius, iconElement, hero.name))
      iconElement.remove()
    }

    this.backgroundElement.src = room.background
  }

  async getImageAsBase64(imageElement) {
    if (imageElement.src.startsWith('data:'))
      return imageElement.src

    const response = await fetch(imageElement.src)
    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}