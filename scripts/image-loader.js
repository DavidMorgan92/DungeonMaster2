class ImageLoader {
  async load(imageElement) {
    const [fileHandle] = await window.showOpenFilePicker({
      multiple: false,
      types: [{
        description: 'Image files',
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
      }],
    })

    const file = await fileHandle.getFile()
    const content = await this.fileToBase64(file)

    imageElement.src = content
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}