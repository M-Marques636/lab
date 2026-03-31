const phrases = [
  "EU NAO AGUENTO MAIS",
  "ISSO TUDO É UMA MENTIRA",
  "EU NÃO SEI PROGRAMAR",
  "PAMONHA"
];

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
let currentPhrase = 0;
let scrambleInterval = null;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseVX = 0;
let mouseVY = 0;

const canvas = document.createElement("canvas");
canvas.className = "lab-canvas";
canvas.style.position = "fixed";
canvas.style.inset = "0";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = "-1";
const ctx = canvas.getContext("2d");
const stars = [];
let width = 0;
let height = 0;
let animationFrame = null;

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .neon-burst {
      animation: neonBurst 0.45s ease-out forwards;
    }

    @keyframes neonBurst {
      0% {
        transform: translateY(0) scale(1);
        text-shadow: 0 0 18px rgba(56,189,248,0.45), 0 0 80px rgba(168,85,247,0.22);
      }
      50% {
        transform: translateY(-4px) scale(1.06);
        text-shadow: 0 0 30px rgba(56,189,248,0.95), 0 0 130px rgba(168,85,247,0.35);
      }
      100% {
        transform: translateY(0) scale(1);
      }
    }

    .lab-canvas {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function createStars(count = 70) {
  stars.length = 0;
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
      glow: 2 + Math.random() * 10
    });
  }
}

function updateMouseVelocity(x, y) {
  mouseVX = Math.max(-20, Math.min(20, x - lastMouseX));
  mouseVY = Math.max(-20, Math.min(20, y - lastMouseY));
  lastMouseX = x;
  lastMouseY = y;
}

function drawFrame(timestamp) {
  ctx.clearRect(0, 0, width, height);
  stars.forEach((star) => {
    star.x += star.speedX + mouseVX * 0.02;
    star.y += star.speedY + mouseVY * 0.02;
    star.alpha = 0.25 + Math.sin(timestamp * 0.003 + star.phase) * 0.15;

    if (star.x < -50) star.x = width + 50;
    if (star.x > width + 50) star.x = -50;
    if (star.y < -50) star.y = height + 50;
    if (star.y > height + 50) star.y = -50;

    const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.glow);
    gradient.addColorStop(0, `rgba(255,255,255,${star.alpha * 0.55})`);
    gradient.addColorStop(0.65, `rgba(56,189,248,${star.alpha * 0.16})`);
    gradient.addColorStop(1, "rgba(56,189,248,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.glow, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, star.alpha + 0.25)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  mouseVX *= 0.92;
  mouseVY *= 0.92;
  animationFrame = window.requestAnimationFrame(drawFrame);
}

function scrambleText(targetText) {
  const header = document.querySelector("h1");
  if (!header) return;
  const original = header.textContent.split("");
  const finalText = targetText.split("");
  const maxLength = Math.max(original.length, finalText.length);
  let progress = 0;
  const duration = 700;
  const interval = 35;

  if (scrambleInterval) {
    clearInterval(scrambleInterval);
  }

  scrambleInterval = setInterval(() => {
    progress += interval;
    const fraction = Math.min(1, progress / duration);

    header.textContent = Array.from({ length: maxLength }, (_, index) => {
      if (index < finalText.length && Math.random() < fraction) {
        return finalText[index];
      }
      if (index < original.length && Math.random() < 0.4) {
        return original[index];
      }
      return letters[Math.floor(Math.random() * letters.length)];
    }).join("").slice(0, finalText.length);

    if (fraction >= 1) {
      clearInterval(scrambleInterval);
      header.textContent = targetText;
      scrambleInterval = null;
    }
  }, interval);
}

function initHeaderInteractions() {
  const header = document.querySelector("h1");
  if (!header) return;

  header.addEventListener("mouseenter", () => {
    header.classList.add("neon-burst");
  });

  header.addEventListener("animationend", () => {
    header.classList.remove("neon-burst");
  });

  header.addEventListener("click", () => {
    const next = (currentPhrase + 1) % phrases.length;
    scrambleText(phrases[next]);
    currentPhrase = next;
  });

  header.addEventListener("touchstart", () => {
    const next = (currentPhrase + 1) % phrases.length;
    scrambleText(phrases[next]);
    currentPhrase = next;
  });
}

function init() {
  injectStyles();
  document.body.appendChild(canvas);
  resizeCanvas();
  createStars();
  initHeaderInteractions();
  drawFrame(0);

  window.addEventListener("resize", () => {
    resizeCanvas();
    createStars();
  });

  window.addEventListener("pointermove", (event) => {
    updateMouseVelocity(event.clientX, event.clientY);
  });
}

document.addEventListener("DOMContentLoaded", init);
