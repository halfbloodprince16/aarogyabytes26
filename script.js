/* =====================================================================
   AAROGYA.BYTES 2026 — Digital Inauguration
   Pure frontend: HTML + CSS + JS only. No backend, no server calls.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     1. Build the QR code.
        It encodes the URL of confirm.html sitting next to this file.
        Scanning it on a phone opens the "Session Inaugurated" page.
        (The curtain animation itself is triggered by clicking the
        QR button on THIS screen — see note in the README.)
     --------------------------------------------------------------- */
  const qrTargetUrl = new URL('confirm.html', window.location.href).href;

  if (window.QRCode) {
    new QRCode(document.getElementById('qrcode'), {
      text: qrTargetUrl,
      width: 256,
      height: 256,
      colorDark: '#1B4F72',
      colorLight: '#fffaf0',
      correctLevel: QRCode.CorrectLevel.M
    });
  } else {
    document.getElementById('qrcode').textContent = 'QR library failed to load — check internet connection.';
  }

  /* ---------------------------------------------------------------
     2. Curtain-opening trigger
     --------------------------------------------------------------- */
  const qrLaunch   = document.getElementById('qrLaunch');
  const stage      = document.getElementById('stage');
  const backdrop   = document.getElementById('backdrop');
  const placeholder= document.getElementById('backdropPlaceholder');
  const video      = document.getElementById('inaugurationVideo');
  const soundBtn   = document.getElementById('soundBtn');
  const leftCurtain= stage.querySelector('.curtain-left');

  let launched = false;

  qrLaunch.addEventListener('click', () => {
    if (launched) return;
    launched = true;

    qrLaunch.classList.add('hidden');
    qrLaunch.setAttribute('aria-disabled', 'true');

    stage.classList.add('open');
    startEffects();

    // Reveal the video once the curtain has fully finished sliding open
    leftCurtain.addEventListener('transitionend', revealVideo, { once: true });

    // Safety fallback in case transitionend doesn't fire (e.g. reduced motion)
    setTimeout(revealVideo, 2200);
  });

  let revealed = false;
  function revealVideo() {
    if (revealed) return;
    revealed = true;

    placeholder.style.display = 'none';
    video.style.display = 'block';

    video.muted = true; // required by browsers to allow autoplay
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked entirely — show a manual play affordance
        soundBtn.textContent = '▶ Tap to play video';
        soundBtn.classList.add('show');
        soundBtn.onclick = () => {
          video.play();
          soundBtn.classList.remove('show');
        };
        return;
      });
    }

    // Offer to unmute since autoplay only works muted
    soundBtn.textContent = '🔈 Tap for sound';
    soundBtn.classList.add('show');
    soundBtn.onclick = () => {
      video.muted = !video.muted;
      soundBtn.textContent = video.muted ? '🔈 Tap for sound' : '🔊 Sound on';
    };
  }

  /* ---------------------------------------------------------------
     3. Crackers / confetti effect on an HTML canvas
     --------------------------------------------------------------- */
  const canvas = document.getElementById('effectsCanvas');
  const ctx = canvas.getContext('2d');
  const COLORS = ['#D4AF37', '#F4D883', '#9A1414', '#1B4F72', '#2E7D32', '#fff3d6'];

  function fitCanvas() {
    canvas.width = stage.clientWidth;
    canvas.height = stage.clientHeight;
  }
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  let particles = [];
  let animId = null;
  let effectStart = 0;
  const EFFECT_DURATION = 4200; // ms

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.06,
        life: 60 + Math.random() * 30,
        age: 0,
        size: 2 + Math.random() * 2.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.random() > 0.5 ? 'circle' : 'rect'
      });
    }
  }

  function spawnConfettiFall(count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 1.4,
        vy: 1.5 + Math.random() * 2,
        gravity: 0.01,
        life: 220 + Math.random() * 80,
        age: 0,
        size: 3 + Math.random() * 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        spin: Math.random() * 0.2 - 0.1,
        rotation: Math.random() * Math.PI
      });
    }
  }

  function startEffects() {
    fitCanvas();
    particles = [];
    effectStart = performance.now();

    // A few staggered firework bursts across the stage
    const burstPoints = [
      { x: canvas.width * 0.22, y: canvas.height * 0.32, delay: 0 },
      { x: canvas.width * 0.78, y: canvas.height * 0.28, delay: 260 },
      { x: canvas.width * 0.5,  y: canvas.height * 0.22, delay: 520 },
      { x: canvas.width * 0.35, y: canvas.height * 0.4,  delay: 900 },
      { x: canvas.width * 0.65, y: canvas.height * 0.38, delay: 1200 }
    ];
    burstPoints.forEach(p => {
      setTimeout(() => spawnBurst(p.x, p.y, 46), p.delay);
    });

    // Falling confetti/ribbon shower for the duration of the effect
    spawnConfettiFall(90);
    const confettiInterval = setInterval(() => {
      if (performance.now() - effectStart > EFFECT_DURATION - 800) {
        clearInterval(confettiInterval);
        return;
      }
      spawnConfettiFall(10);
    }, 220);

    if (!animId) animate();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.age++;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      if (p.rotation !== undefined) p.rotation += p.spin;

      const lifeRatio = 1 - p.age / p.life;
      ctx.globalAlpha = Math.max(lifeRatio, 0);
      ctx.fillStyle = p.color;

      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.rotation !== undefined) ctx.rotate(p.rotation);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
      }
      ctx.restore();
    });

    particles = particles.filter(p => p.age < p.life && p.y < canvas.height + 20);
    ctx.globalAlpha = 1;

    if (performance.now() - effectStart < EFFECT_DURATION + 1000 || particles.length) {
      animId = requestAnimationFrame(animate);
    } else {
      animId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

});
