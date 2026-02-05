const audio = document.getElementById("vine-boom");
const click = document.getElementById("boom");

click.addEventListener("click", () => {
    audio.currentTime = 0;
    audio.play();
})
