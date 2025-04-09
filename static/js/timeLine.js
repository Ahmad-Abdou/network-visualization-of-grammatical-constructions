const playBtn = document.getElementById('playButton')
const timeSlider = document.getElementById('timeSlider')
const btnShape = document.getElementById('shape')
let simulation_timeline = null
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
        
        if (simulation_timeline) {
            let alphaValue = 0.1 + (timeSlider.value / timeSlider.max) * 0.9;
            simulation_timeline.alpha(alphaValue);
        }
    }, 100)
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
        simulation_timeline.alpha(1).alphaTarget(0).alphaDecay(0.02).restart()
        startPlaying()
    } else {
        stopPlaying()
        simulation_timeline.alpha(0)
    }
})

timeSlider.addEventListener('input', () => {
    if (Number(timeSlider.value) >= Number(timeSlider.max)) {
        stopPlaying()
    }
    
    if (simulation_timeline && !isPlaying) {
        let alphaValue = 0.1 + (timeSlider.value / timeSlider.max) * 0.9;
        simulation_timeline.alpha(alphaValue).restart();
    }
})