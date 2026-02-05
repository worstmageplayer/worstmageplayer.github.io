const gif = document.getElementById("mambo");
const mamboaudio = document.getElementById("mambomp3");

gif.addEventListener("click", () => {
    mamboaudio.currentTime = 0;
    mamboaudio.play();
})
