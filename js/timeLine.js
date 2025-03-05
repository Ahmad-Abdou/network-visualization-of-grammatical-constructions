const playBtn = document.getElementById('playButton')
const timeSlider = document.getElementById('timeSlider')
const btnShape = document.getElementById('shape')

let interval
let isPlaying = false
let isAlreadyStopped = false

function startPlaying() {
    interval = setInterval(() => {
    if (Number(timeSlider.value) >= Number(timeSlider.max)) {
            stopPlaying()
            isAlreadyStopped = true
            return
        }
        timeSlider.value = Number(timeSlider.value) + 1
        isAlreadyStopped =  false
    }, 10)
}

function stopPlaying() {
    clearInterval(interval)
    isPlaying = false
    btnShape.classList = 'stop'
    if(isAlreadyStopped) {
      timeSlider.value = 0
      isPlaying = true
      btnShape.classList = 'run'
      startPlaying()
    }
}

playBtn.addEventListener('click', () => {
  if (!isPlaying) {
        isPlaying = true
        btnShape.classList = 'run'
        startPlaying()
  } else {
      stopPlaying()
    }
})

timeSlider.addEventListener('input', () => {
    if (Number(timeSlider.value) >= Number(timeSlider.max)) {
        stopPlaying()
    }
})