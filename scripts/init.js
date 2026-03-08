(function () {
  const heroImage = document.getElementById('hero')

  const heroes = [
    new Hero(100, 100, 500, heroImage, 'Nidhel'),
    new Hero(600, 200, 400, heroImage, 'Kethra'),
  ]

  const sightBlockers = [
    new SightBlocker(200, 200, 100, 100, 20),
    new SightBlocker(400, 300, 150, 150, 45),
  ]

  const mainCanvas = document.getElementById('main-canvas')
  const background = document.getElementById('background')
  const { canvasManager, mouseHandler } = initCanvas(mainCanvas, background, heroes, sightBlockers)

  const moveIcon = document.getElementById('move-icon')
  const rotateIcon = document.getElementById('rotate-icon')
  const roomEditor = new RoomEditor(canvasManager, moveIcon, rotateIcon, mouseHandler)

  const roomSerializer = new RoomSerializer(sightBlockers, background, heroes)
  const backgroundImageLoader = new BackgroundImageLoader(background)

  const heroManager = new HeroManager(heroes, canvasManager)

  initDrawerUi()
  initRoomUi(roomSerializer, roomEditor, canvasManager, heroes)
  initHeroesUi(heroes, canvasManager)
  initHeroesSelectUi(heroes)
  initSightBlockersUi(roomEditor)
  initBackgroundLoaderUi(backgroundImageLoader, canvasManager)
})()

function initDrawerUi() {
  let drawerIsOpen = true
  const openCloseDrawerButton = document.getElementById('open-close-drawer')
  const drawer = document.getElementById('drawer')

  openCloseDrawerButton.addEventListener('click', () => {
    drawerIsOpen = !drawerIsOpen

    const classList = drawerIsOpen ? '' : 'closed'
    drawer.classList = classList
    openCloseDrawerButton.classList = classList
    openCloseDrawerButton.textContent = drawerIsOpen ? '🞀' : '🞂'
  })
}

function initRoomUi(roomSerializer, roomEditor, canvasManager, heroes) {
  document.getElementById('save-room').addEventListener('click', async () => {
    await roomSerializer.save()
    roomEditor.reset()
    canvasManager.scheduleRender()
  })

  document.getElementById('load-room').addEventListener('click', async () => {
    await roomSerializer.load()
    roomEditor.reset()
    canvasManager.scheduleRender()
    initHeroesSelectUi(heroes)
  })
}

function initHeroesUi(heroes, canvasManager) {
  const heroesSelect = document.getElementById('heroes')
  const heroNameInput = document.getElementById('hero-name')

  document.getElementById('add-hero').addEventListener('click', () => {
    const newHero = new Hero(200, 200, 500)
    heroes.push(newHero)
    heroesSelect.add(new Option('New Hero'))
    canvasManager.scheduleRender()
  })

  document.getElementById('remove-hero').addEventListener('click', () => {
    if (heroesSelect.selectedIndex > -1) {
      heroes.splice(heroesSelect.selectedIndex, 1)
      heroesSelect.remove(heroesSelect.selectedIndex)
    }

    canvasManager.scheduleRender()
  })

  heroesSelect.addEventListener('change', () => {
    if (heroesSelect.selectedIndex < 0) {
      heroNameInput.value = ''
      return
    }

    const selectedOption = heroesSelect.options[heroesSelect.selectedIndex]
    heroNameInput.value = selectedOption.text
  })

  heroNameInput.addEventListener('input', () => {
    if (heroesSelect.selectedIndex < 0)
      return

    const selectedOption = heroesSelect.options[heroesSelect.selectedIndex]
    selectedOption.text = heroNameInput.value
  })
}

function initHeroesSelectUi(heroes) {
  const heroesSelect = document.getElementById('heroes')
  heroesSelect.options.length = 0

  for (const hero of heroes) {
    heroesSelect.add(new Option(hero.name))
  }
}

function initSightBlockersUi(roomEditor) {
  const editSightBlockersCheckbox = document.getElementById('edit-sight-blockers')
  const addSightBlockerButton = document.getElementById('add-sight-blocker')
  const deleteSelectedSightBlockerButton = document.getElementById('delete-selected-sight-blocker')

  editSightBlockersCheckbox.addEventListener('change', (event) => {
    roomEditor.toggleEditSightBlockers(event.target.checked)
    addSightBlockerButton.disabled = !event.target.checked
    deleteSelectedSightBlockerButton.disabled = !event.target.checked
  })

  addSightBlockerButton.addEventListener('click', () => roomEditor.startAddingSightBlocker())
  deleteSelectedSightBlockerButton.addEventListener('click', () => roomEditor.deleteSelectedSightBlocker())
  editSightBlockersCheckbox.dispatchEvent(new Event('change'))
}

function initBackgroundLoaderUi(backgroundImageLoader, canvasManager) {
  document.getElementById('change-background').addEventListener('click', async () => {
    await backgroundImageLoader.load()
    canvasManager.scheduleRender()
  })
}