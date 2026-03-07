class RoomSerializer {
  constructor(sightBlockers) {
    this.sightBlockers = sightBlockers

    this.fileTypes = [{
      description: 'JSON',
      accept: { 'application/json': ['.json'] },
    }]
  }

  async save() {
    const room = {
      sightBlockers: this.sightBlockers,
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

    for (const sightBlocker of room.sightBlockers) {
      this.sightBlockers.push(new SightBlocker(sightBlocker.x, sightBlocker.y, sightBlocker.width, sightBlocker.height, sightBlocker.angle))
    }
  }
}