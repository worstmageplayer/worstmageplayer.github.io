const jumpscareOverlay = document.getElementById("jumpscareOverlay");
const jumpscareImage = document.getElementById("jumpscareImage");
const jumpscareAudio = document.getElementById("jumpscareAudio");

let rand = 0;
const DURATION = 420;

setInterval(() => {
    rand = Math.floor(Math.random() * 50);
    if (rand == 1) {
        // replay image
        const base = jumpscareImage.getAttribute('data-base-src') || jumpscareImage.src;
        jumpscareImage.setAttribute('data-base-src', base);
        jumpscareImage.src = base.split('?')[0] + '?_=' + Date.now();

        // show image
        jumpscareOverlay.classList.add('show');
        jumpscareOverlay.setAttribute('aria-hidden', 'false');

        // play audio
        jumpscareAudio.currentTime = 0;
        jumpscareAudio.play();

        setTimeout(() => {
            jumpscareOverlay.classList.remove('show');
            jumpscareOverlay.setAttribute('aria-hidden', 'true');
            playing = false;
        }, DURATION);
    }
}, 1000);
