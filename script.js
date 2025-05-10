function toggleMenu() {
    const menu = document.getElementById("menuList");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}
// Menu toggle functionality
let menuOpen = true;

function toggleMenu() {
    const menuList = document.getElementById('menuList');
    const cloudImg = document.getElementById('cloud-img');
    const cloudContainer = document.getElementById('cloud-container');

    if (!menuOpen) {
        // Open menu
        menuList.style.display = 'flex';

        // Animate clouds up and fade away
        animateClouds(true);

        menuOpen = true;
    } else {
        // Close menu
        menuList.style.display = 'none';

        // Animate clouds back down and fade in
        animateClouds(false);

        menuOpen = false;
    }
}
// Cloud animation function
function animateClouds(moveUp) {
    const cloudContainer = document.getElementById('cloud-container');
    const cloudImg = document.getElementById('cloud-img');

    if (moveUp) {
        // Move clouds up and fade out
        cloudContainer.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
        cloudContainer.style.transform = 'translateY(-150px)';
        cloudContainer.style.opacity = '0';
    } else {
        // Move clouds back down and fade in
        cloudContainer.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
        cloudContainer.style.transform = 'translateY(0)';
        cloudContainer.style.opacity = '1';
    }
}

// Cloud hover effect
document.querySelector('.menubar').addEventListener('mouseenter', function () {
    const cloudContainer = document.getElementById('cloud-container');

    // Only apply hover effect if menu is closed
    if (!menuOpen) {
        cloudContainer.style.transition = 'transform 0.8s ease-out';
        cloudContainer.style.transform = 'translateY(-30px)';
    }
});

document.querySelector('.menubar').addEventListener('mouseleave', function () {
    const cloudContainer = document.getElementById('cloud-container');

    // Only reset hover effect if menu is closed
    if (!menuOpen) {
        cloudContainer.style.transition = 'transform 0.9s ease-out';
        cloudContainer.style.transform = 'translateY(0)';
    }
});

// Initialize menu state
document.addEventListener('DOMContentLoaded', function () {
    const menuList = document.getElementById('menuList');
    menuList.style.display = 'none'; // Ensure menu is hidden initially
});


// Mouth
const container = document.getElementById('container');
const head = document.getElementById('head');

const tintInput = document.getElementById('tint');
const mouthOpenInput = document.getElementById('mouth-open');

const eyes = document.querySelectorAll('.eye');

// events
function handlePointerMove(clientX, clientY) {
    eyes.forEach(eye => {
        const eyeball = eye.querySelector('.eyeball');
        const rect = eye.getBoundingClientRect();

        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;

        const angle = Math.atan2(clientY - eyeY, clientX - eyeX);

        const distance = eyeball.clientWidth / 2;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        eyeball.style.setProperty('--translate-x', `${x}px`);
        eyeball.style.setProperty('--translate-y', `${y}px`);
    });
}

function resetEyeballs() {
    eyes.forEach(eye => {
        const eyeball = eye.querySelector('.eyeball');
        eyeball.style.setProperty('--translate-x', '0');
        eyeball.style.setProperty('--translate-y', '0');
    });
}

container.addEventListener('mousemove', (e) => {
    handlePointerMove(e.clientX, e.clientY);
});

container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
    }
});

container.addEventListener('mouseleave', resetEyeballs);
container.addEventListener('touchend', resetEyeballs);
container.addEventListener('touchcancel', resetEyeballs);

tintInput.addEventListener('input', (e) => {
    const tint = e.target.value;
    document.body.style.setProperty('--tint', tint);
    document.body.style.setProperty('--glow-color', `${tint}d9`);
});

function onMouthInputChange(e) {
    const open = e.target.value;
    document.body.style.setProperty('--mouth-open', open);
}

function removeMouthInput() {
    mouthOpenInput.removeEventListener('input', onMouthInputChange);
    mouthOpenInput.parentElement.parentElement.remove();
}

mouthOpenInput.addEventListener('input', onMouthInputChange);
// ---

// audio visualization
window.addEventListener('load', () => {
    if (Math.random() < 0.5) {
        head.classList.add('head-left');
    }

    navigator.mediaDevices.getUserMedia({
        audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true
        }
    }).then(stream => {
        removeMouthInput();

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);

        let current = 0;
        const smoothing = .5;
        const minThreshold = 16;
        const maxPercentage = 100;

        function getVolume() {
            analyser.getByteFrequencyData(dataArray);
            let sum = dataArray.reduce((acc, current) => acc + current, 0);

            const average = sum / dataArray.length;

            const cleanAverage = average < minThreshold ? 0 : average;
            const target = (cleanAverage * maxPercentage) / 255;

            current += (target - current) * smoothing;

            document.body.style.setProperty('--mouth-open', current.toFixed(2));

            requestAnimationFrame(getVolume);
        }

        getVolume();
    });
});

