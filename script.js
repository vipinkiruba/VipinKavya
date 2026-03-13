// 1. Initialize GSAP Plugins
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Enable scrolling and reset opacity
gsap.set('.fade-up', { visibility: 'visible', autoAlpha: 0 });

// 2. Initial fade-up dynamic animations (Retro bounce entry)
gsap.utils.toArray('.fade-up').forEach(element => {
    gsap.fromTo(element,
        { autoAlpha: 0, y: 50 },
        {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.5)", // Retro bouncy feel
            scrollTrigger: {
                trigger: element,
                start: "top 85%", // when top of element hits 85% of viewport
                toggleActions: "play none none reverse"
            }
        }
    );
});

// 3. Creative Route Map Animation (Tuk-Tuk Path)
window.addEventListener("load", () => {
    gsap.to("#tuk-tuk", {
        scrollTrigger: {
            trigger: ".map-creative",
            start: "top 75%",
            end: "bottom 30%",
            scrub: 1
        },
        motionPath: {
            path: "#route-path",
            align: "#route-path",
            alignOrigin: [0.5, 0.5],
            autoRotate: true
        },
        ease: "power1.inOut"
    });
});

// 4. Generate Buntings Programmatically for dynamic width
function generateBuntings() {
    const container = document.getElementById('buntings');
    const screenWidth = window.innerWidth;
    const flagWidth = 30; // 15px border-left + 15px border-right
    const qty = Math.ceil(screenWidth / flagWidth) + 2; // Extra for safety margin

    // Clear existing
    container.innerHTML = '';

    // Create new flags
    for (let i = 0; i < qty; i++) {
        let flag = document.createElement('div');
        flag.className = `bunting-flag color-${i % 5}`;
        container.appendChild(flag);
    }
}
window.addEventListener('resize', generateBuntings);
generateBuntings();

// 5. Audio Control Logic
const audioBtn = document.getElementById('audio-btn');
const bgAudio = document.getElementById('bg-audio');
let isPlaying = false;
let userInteracted = false;

// Modern browsers block autoplay until user clicks/scrolls, this starts it automatically on first action
function tryPlayAudio() {
    if (!isPlaying && !userInteracted) {
        bgAudio.play().then(() => {
            isPlaying = true;
            audioBtn.textContent = '🔔';
            audioBtn.style.transform = "scale(1.1)";
        }).catch(e => console.log('Auto-play blocked pending interaction', e));
        userInteracted = true;
    }
}

// Add invisible listeners to start music automatically
['click', 'touchstart', 'scroll'].forEach(evt =>
    window.addEventListener(evt, tryPlayAudio, { once: true, passive: true })
);

audioBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering the global ones
    userInteracted = true; // Mark as interacted

    if (isPlaying) {
        bgAudio.pause();
        audioBtn.textContent = '🔕';
        audioBtn.style.transform = "scale(1)";
    } else {
        bgAudio.play().catch(e => console.log('Audio play failed:', e));
        audioBtn.textContent = '🔔';
        audioBtn.style.transform = "scale(1.1)";

        // Spawn particles immediately when audio starts to give feedback
        addParticles(window.innerWidth - 45, 45, 30);
    }
    isPlaying = !isPlaying;
});

// 6. Retro Touch/Mouse Interactive Graphics (Confetti Particles)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 3; // Bigger, blocky retro size
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;

        // Matchbox / Thiruvizha Color Palette
        const colors = ['#FACC15', '#FF4D6D', '#4CAF50', '#0ea5e9', '#FF9800'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 1;

        // Simple shape geometry (circles or squares for retro feel)
        this.shape = Math.random() > 0.5 ? 'square' : 'circle';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02; // fade out faster like bursting confetti
        if (this.size > 0.2) this.size -= 0.05; // shrink

        // add slight gravity effect to particles
        this.speedY += 0.05;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // draw square
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        ctx.restore();
    }
}

function handleParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    handleParticles();
    requestAnimationFrame(animate);
}

function addParticles(x, y, amount) {
    for (let i = 0; i < amount; i++) {
        particles.push(new Particle(x, y));
    }
}

// Sparkle Burst interactions
window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    addParticles(touch.clientX, touch.clientY, 3);
});

window.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    addParticles(touch.clientX, touch.clientY, 20); // big burst
});

window.addEventListener('mousemove', (e) => {
    // Only trail moderately to keep performance up
    if (Math.random() > 0.5) {
        addParticles(e.clientX, e.clientY, 2);
    }
});

window.addEventListener('click', (e) => {
    addParticles(e.clientX, e.clientY, 30); // huge blocky burst on click
});

// 7. Dynamic Device Detection for Map Starting Point
document.addEventListener("DOMContentLoaded", () => {
    const startingPoint = document.querySelector('.groom-house');
    if (startingPoint) {
        const ua = navigator.userAgent;
        let deviceName = "Your Location"; // fallback

        if (/iPhone/i.test(ua)) deviceName = "Your iPhone";
        else if (/iPad/i.test(ua)) deviceName = "Your iPad";
        else if (/Android/i.test(ua)) {
            // Try to extract Android device brand if possible, else generic
            if (/Samsung/i.test(ua)) deviceName = "Your Samsung";
            else if (/Pixel/i.test(ua)) deviceName = "Your Pixel";
            else if (/OnePlus/i.test(ua)) deviceName = "Your OnePlus";
            else deviceName = "Your Android";
        }
        else if (/Macintosh|Mac OS X/i.test(ua)) deviceName = "Your Mac";
        else if (/Windows/i.test(ua)) deviceName = "Your PC";

        startingPoint.textContent = deviceName;
    }
});

// Start loop
animate();

// 8. Countdown logic
const countdownObj = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
};

function updateCountdown() {
    // Muhurtham Date: 20th Nov 2026 09:45 AM
    const weddingDate = new Date('November 20, 2026 09:45:00').getTime();
    const now = new Date().getTime();

    const distance = weddingDate - now;

    if (distance < 0) {
        // If event has passed, reset to 00
        countdownObj.days.innerText = "00";
        countdownObj.hours.innerText = "00";
        countdownObj.minutes.innerText = "00";
        countdownObj.seconds.innerText = "00";
        return;
    }

    // Time calculations
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Format to 2 digits
    countdownObj.days.innerText = days < 10 ? '0' + days : days;
    countdownObj.hours.innerText = hours < 10 ? '0' + hours : hours;
    countdownObj.minutes.innerText = minutes < 10 ? '0' + minutes : minutes;
    countdownObj.seconds.innerText = seconds < 10 ? '0' + seconds : seconds;
}

// Initial call and set interval
updateCountdown();
setInterval(updateCountdown, 1000);
