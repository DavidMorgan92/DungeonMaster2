class RoomSerializer {
  constructor(sightBlockers) {
    this.sightBlockers = sightBlockers
  }

  async save() {
    const room = {
      sightBlockers,
    }

    const content = JSON.stringify(room, null, 2)

    const handle = await window.showSaveFilePicker({
      suggestedName: 'room.json',
      types: [{
        description: 'JSON',
        accept: { 'application/json': ['.json'] },
      }],
    })

    const writable = await handle.createWritable()
    await writable.write(content)
    await writable.close()
  }
}