document.addEventListener('DOMContentLoaded', () => {

  /* --- DETECT TOUCH DEVICE --- */
  let isTouchDevice = false;
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
    isTouchDevice = true;
  }

  /* --- CUSTOM CURSOR --- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');
  
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  if (isTouchDevice) {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorOutline) cursorOutline.style.display = 'none';
  } else {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update the dot immediately
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }
    });

    // Outer circle trailing lerp effect
    const animateOutline = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      
      if (cursorOutline) {
        cursorOutline.style.left = `${cursorX}px`;
        cursorOutline.style.top = `${cursorY}px`;
      }
      
      requestAnimationFrame(animateOutline);
    };
    animateOutline();

    // Hover states for links and buttons
    const hoverables = document.querySelectorAll('a, button, .btn-primary, .project-card, .nav-item, input, textarea, select');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hovering');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hovering');
      });
    });
  }

  /* --- BACKGROUND CANVAS PARTICLE SYSTEM (PLEXUS VISUAL) --- */
  const canvas = document.getElementById('bgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = isTouchDevice ? 25 : 70;
    const connectionDist = 120;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 1.5 + 1;
        this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.35)' : 'rgba(157, 78, 221, 0.35)';
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce on boundary
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
    
    // Draw links between nearby particles
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        
        // Interactive link to mouse cursor
        if (!isTouchDevice && mouseX > 0 && mouseY > 0) {
          const dx = particles[i].x - mouseX;
          const dy = particles[i].y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist * 1.5) {
            const alpha = (1 - dist / (connectionDist * 1.5)) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(157, 78, 221, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };
    
    const animateCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();
      requestAnimationFrame(animateCanvas);
    };
    animateCanvas();
  }

  /* --- HEADER & SCROLL PROGRESS --- */
  const header = document.getElementById('header');
  const progressBar = document.getElementById('progressBar');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Update scroll progress bar
    if (progressBar && scrollHeight > 0) {
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    }

    // Shrink header on scroll
    if (header) {
      if (scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  /* --- PARALLAX BACKGROUND GLOW --- */
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX - window.innerWidth / 2) / 70;
    const y = (e.clientY - window.innerHeight / 2) / 70;
    const decorations = document.querySelector('.bg-decorations');
    
    if (decorations) {
      // Keep canvas independent but shift other background objects slightly
      const orbs = document.querySelectorAll('.bg-glow-orb');
      orbs.forEach((orb, index) => {
        const factor = (index + 1) * 10;
        orb.style.transform = `translate(${x * (index === 0 ? 1 : -1)}px, ${y * (index === 0 ? 1 : -1)}px)`;
      });
    }
  });

  /* --- STATS COUNT-UP ANIMATION --- */
  let statsAnimated = false;
  const animateStats = () => {
    if (statsAnimated) return;
    statsAnimated = true;
    
    const stats = document.querySelectorAll('.stat-num');
    stats.forEach(stat => {
      const target = +stat.getAttribute('data-val');
      let current = 0;
      const duration = 1500; // Animation duration in ms
      const steps = 50;
      const stepTime = duration / steps;
      const increment = target / steps;

      const updateCount = () => {
        current += increment;
        if (current >= target) {
          stat.innerText = target + (target === 9 || target === 4 ? '+' : '%');
        } else {
          stat.innerText = Math.floor(current) + '+';
          setTimeout(updateCount, stepTime);
        }
      };
      updateCount();
    });
  };

  /* --- ENTRANCE ANIMATIONS (INTERSECTION OBSERVER) --- */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // 1. Skill progress fills
        const skillFills = entry.target.querySelectorAll('.skill-progress-fill');
        skillFills.forEach(fill => {
          fill.style.width = fill.getAttribute('data-percent');
        });

        // 2. Count statistics numbers
        const stats = entry.target.querySelectorAll('.stat-num');
        if (stats.length > 0) {
          animateStats();
        }

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  /* --- 3D TILT EFFECT ON PROJECTS --- */
  if (!isTouchDevice) {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        const rotateX = (yc - y) / 18;
        const rotateY = (x - xc) / 18;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }


  /* --- VIEW FINDER VIDEO TIMER --- */
  const timeCode = document.querySelector('.vdo-time-code');
  if (timeCode) {
    let totalSeconds = 0;
    const formatTime = (secs) => {
      const h = String(Math.floor(secs / 3600)).padStart(2, '0');
      const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      return `${h}:${m}:${s}`;
    };
    setInterval(() => {
      totalSeconds++;
      timeCode.innerText = formatTime(totalSeconds);
    }, 1000);
  }

  /* --- CINEMATIC VIDEO SHUTTER INTRO OPENING --- */
  const videoIntro = document.getElementById('videoIntro');
  const cinematicText = document.getElementById('cinematicText');
  const cinematicCanvas = document.getElementById('cinematicIntroCanvas');
  const heroLightCanvas = document.getElementById('heroLightCanvas');
  
  if (videoIntro && cinematicCanvas) {
    const cCtx = cinematicCanvas.getContext('2d');
    const cImg = new Image();
    cImg.src = 'vijay-profile.jpg';
    
    cImg.onload = () => {
      // Fit canvas to window viewport size
      const resizeCinematicCanvas = () => {
        cinematicCanvas.width = window.innerWidth;
        cinematicCanvas.height = window.innerHeight;
      };
      resizeCinematicCanvas();
      window.addEventListener('resize', resizeCinematicCanvas);
      
      let frameCount = 0;
      const durationFrames = 360; // 6 seconds at 60 FPS
      
      // Streak particle properties
      const streakY = cinematicCanvas.height / 2;
      let streakAlpha = 0;
      
      // Floating volumetric particles / cinematic embers
      const volumetricParticles = [];
      const particleCount = isTouchDevice ? 30 : 90;
      for (let i = 0; i < particleCount; i++) {
        volumetricParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight + window.innerHeight,
          vy: Math.random() * 1.2 + 0.4,
          vx: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2.5 + 0.8,
          alpha: Math.random() * 0.5 + 0.1,
          glow: Math.random() > 0.6
        });
      }
      
      const renderIntroFrame = () => {
        if (frameCount >= durationFrames) {
          // Transition to main page after 6 seconds (360 frames)
          videoIntro.style.opacity = '0';
          document.body.classList.remove('intro-active');
          setTimeout(() => {
            videoIntro.style.display = 'none';
          }, 1200);
          return;
        }
        
        cCtx.fillStyle = '#000000';
        cCtx.fillRect(0, 0, cinematicCanvas.width, cinematicCanvas.height);
        
        // 1. STREAK PHASE (Frames 0 to 90 - First 1.5 seconds)
        if (frameCount < 90) {
          const progress = frameCount / 90;
          streakAlpha = progress < 0.25 ? progress * 4 : (1 - progress) * 1.33;
          
          // Volumetric glowing trail
          const grad = cCtx.createLinearGradient(0, 0, cinematicCanvas.width, 0);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(progress, `rgba(0, 242, 254, ${streakAlpha * 0.45})`);
          grad.addColorStop(Math.min(1, progress + 0.05), `rgba(255, 255, 255, ${streakAlpha * 0.9})`);
          grad.addColorStop(Math.min(1, progress + 0.1), `rgba(0, 242, 254, ${streakAlpha * 0.45})`);
          grad.addColorStop(1, 'transparent');
          
          cCtx.fillStyle = grad;
          cCtx.fillRect(0, streakY - 150, cinematicCanvas.width, 300);
          
          // Concentrated sharp light streak line
          cCtx.beginPath();
          cCtx.strokeStyle = `rgba(255, 255, 255, ${streakAlpha})`;
          cCtx.lineWidth = 4;
          cCtx.shadowBlur = 20;
          cCtx.shadowColor = '#00f2fe';
          cCtx.moveTo(0, streakY);
          cCtx.lineTo(cinematicCanvas.width * progress, streakY);
          cCtx.stroke();
          cCtx.shadowBlur = 0; // Reset
        }
        
        // 2. IMAGE REVEAL & 3D CAMERA PUSH (Frames 45 to 360)
        if (frameCount >= 45) {
          const imgProgress = (frameCount - 45) / (durationFrames - 45); // 0 to 1
          
          // Image properties (Centering inside canvas)
          const imgScaleRatio = Math.min(cinematicCanvas.width / cImg.naturalWidth, cinematicCanvas.height / cImg.naturalHeight) * 0.55;
          const initialW = cImg.naturalWidth * imgScaleRatio;
          const initialH = cImg.naturalHeight * imgScaleRatio;
          
          // Camera push: Scale increases from 0.95 to 1.12
          const zoomScale = 0.95 + imgProgress * 0.17;
          const w = initialW * zoomScale;
          const h = initialH * zoomScale;
          
          const x = (cinematicCanvas.width - w) / 2;
          const y = (cinematicCanvas.height - h) / 2;
          
          // Volumetric blur / depth of field decay (Starts high, resolves to sharp)
          const blurVal = Math.max(0, 24 * (1 - imgProgress * 2.2)); // resolves to 0 at 45% progress
          
          // Fading image opacity in smoothly
          const imgAlpha = Math.min(1, imgProgress * 2.5);
          
          cCtx.save();
          cCtx.globalAlpha = imgAlpha;
          cCtx.filter = `blur(${blurVal}px) contrast(1.1) brightness(0.9)`;
          
          // 3D Tilt perspective effect: subtle rotation based on time
          const rotateAngle = Math.sin(frameCount * 0.008) * 0.01;
          cCtx.translate(cinematicCanvas.width / 2, cinematicCanvas.height / 2);
          cCtx.rotate(rotateAngle);
          cCtx.translate(-cinematicCanvas.width / 2, -cinematicCanvas.height / 2);
          
          cCtx.drawImage(cImg, x, y, w, h);
          cCtx.restore();
          
          // 3. AMBIENT FUTURISTIC GLOWS AND LENS FLARES
          cCtx.save();
          cCtx.globalCompositeOperation = 'screen';
          
          // Left cyan ambient flare
          const fx1 = cinematicCanvas.width * 0.35 + Math.sin(frameCount * 0.005) * 40;
          const fy1 = cinematicCanvas.height * 0.45 + Math.cos(frameCount * 0.006) * 30;
          const radGrad1 = cCtx.createRadialGradient(fx1, fy1, 0, fx1, fy1, 350);
          radGrad1.addColorStop(0, `rgba(0, 242, 254, ${Math.min(0.24, imgProgress * 0.5)})`);
          radGrad1.addColorStop(0.3, `rgba(0, 242, 254, ${Math.min(0.1, imgProgress * 0.2)})`);
          radGrad1.addColorStop(1, 'transparent');
          cCtx.fillStyle = radGrad1;
          cCtx.beginPath();
          cCtx.arc(fx1, fy1, 350, 0, Math.PI * 2);
          cCtx.fill();
          
          // Right purple ambient flare
          const fx2 = cinematicCanvas.width * 0.65 + Math.cos(frameCount * 0.004) * 40;
          const fy2 = cinematicCanvas.height * 0.55 + Math.sin(frameCount * 0.005) * 30;
          const radGrad2 = cCtx.createRadialGradient(fx2, fy2, 0, fx2, fy2, 400);
          radGrad2.addColorStop(0, `rgba(157, 78, 221, ${Math.min(0.22, imgProgress * 0.5)})`);
          radGrad2.addColorStop(0.3, `rgba(157, 78, 221, ${Math.min(0.08, imgProgress * 0.2)})`);
          radGrad2.addColorStop(1, 'transparent');
          cCtx.fillStyle = radGrad2;
          cCtx.beginPath();
          cCtx.arc(fx2, fy2, 400, 0, Math.PI * 2);
          cCtx.fill();
          
          cCtx.restore();
        }
        
        // 4. DRAW RISING CINEMATIC GLOWING DUST PARTICLES (Volumetric Embers)
        volumetricParticles.forEach(p => {
          p.y -= p.vy;
          p.x += p.vx;
          
          if (p.y < -10) {
            p.y = cinematicCanvas.height + 10;
            p.x = Math.random() * cinematicCanvas.width;
          }
          
          cCtx.beginPath();
          cCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          cCtx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
          
          if (p.glow) {
            cCtx.shadowBlur = 8;
            cCtx.shadowColor = '#00f2fe';
            cCtx.fill();
            cCtx.shadowBlur = 0; // Reset
          } else {
            cCtx.fill();
          }
        });
        
        // 5. REVEAL MODERN GLASS TEXT BLOCK (Starts fading in at 3.5 seconds / frame 210)
        if (frameCount === 210 && cinematicText) {
          cinematicText.classList.add('reveal-text');
        }
        
        frameCount++;
        requestAnimationFrame(renderIntroFrame);
      };
      
      renderIntroFrame();
    };
  }

  /* --- HOMEPAGE HERO PROFILE LIGHT OVERLAY (Active Video Overlay) --- */
  if (heroLightCanvas) {
    const hCtx = heroLightCanvas.getContext('2d');
    
    const resizeHeroCanvas = () => {
      const parent = heroLightCanvas.parentElement;
      if (parent) {
        heroLightCanvas.width = parent.clientWidth || 340;
        heroLightCanvas.height = parent.clientHeight || 440;
      }
    };
    resizeHeroCanvas();
    window.addEventListener('resize', resizeHeroCanvas);
    
    // Continuous drifting warm flares and sparks logic
    const sparks = [];
    for (let i = 0; i < 20; i++) {
      sparks.push({
        x: Math.random() * 340,
        y: Math.random() * 440 + 440,
        vy: Math.random() * 0.4 + 0.2,
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.3 + 0.1,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02
      });
    }
    
    const flares = [
      { x: 60, y: 80, radius: 150, color: 'rgba(0, 242, 254, 0.2)', colorLight: 'rgba(0, 242, 254, 0.1)', speed: 0.005 },
      { x: 260, y: 360, radius: 180, color: 'rgba(157, 78, 221, 0.18)', colorLight: 'rgba(157, 78, 221, 0.08)', speed: 0.003 }
    ];
    
    let hTime = 0;
    const renderHeroFlares = () => {
      hCtx.clearRect(0, 0, heroLightCanvas.width, heroLightCanvas.height);
      
      // Draw flares
      hCtx.save();
      hCtx.globalCompositeOperation = 'screen';
      flares.forEach((flare, idx) => {
        const dx = Math.sin(hTime * flare.speed + idx) * 35;
        const dy = Math.cos(hTime * flare.speed * 0.8 + idx) * 25;
        const fx = flare.x + dx;
        const fy = flare.y + dy;
        
        const grad = hCtx.createRadialGradient(fx, fy, 0, fx, fy, flare.radius);
        grad.addColorStop(0, flare.color);
        grad.addColorStop(0.3, flare.colorLight);
        grad.addColorStop(1, 'transparent');
        
        hCtx.fillStyle = grad;
        hCtx.beginPath();
        hCtx.arc(fx, fy, flare.radius, 0, Math.PI * 2);
        hCtx.fill();
      });
      hCtx.restore();
      
      // Draw sparks
      sparks.forEach(p => {
        p.y -= p.vy;
        p.x += Math.sin(p.angle) * 0.2;
        p.angle += p.speed;
        
        if (p.y < 0) {
          p.y = heroLightCanvas.height + 10;
          p.x = Math.random() * heroLightCanvas.width;
        }
        
        hCtx.beginPath();
        hCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        hCtx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
        hCtx.shadowBlur = 4;
        hCtx.shadowColor = 'rgba(0, 242, 254, 0.6)';
        hCtx.fill();
        hCtx.shadowBlur = 0;
      });
      
      hTime++;
      requestAnimationFrame(renderHeroFlares);
    };
    renderHeroFlares();
  }
});
