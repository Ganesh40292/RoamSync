import React, { useEffect, useRef, useState } from 'react';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const animationFrameId = useRef(null);
  
  // DOM element refs for overlay text animations
  const welcomeRef = useRef(null);
  const tripRef = useRef(null);
  const syncRef = useRef(null);
  const aiRef = useRef(null);
  const tagRef = useRef(null);
  const divRef = useRef(null);
  
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  // Handle the skip action
  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 800); // match transition duration
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrap = wrapRef.current;
    
    let t = 0;
    let brandPopped = false;
    const TOTAL = 5800;
    const start = performance.now();

    // High-DPI / Retina display resolution handling
    const resize = () => {
      if (!canvas || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const getW = () => wrap.getBoundingClientRect().width;
    const getH = () => wrap.getBoundingClientRect().height;

    // Stars
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.5,
      r: Math.random() * 1.5 + 0.3,
      op: Math.random() * 0.6 + 0.3,
      tw: Math.random() * Math.PI * 2
    }));

    // Fireflies / nature particles
    const fireflies = Array.from({ length: 35 }, () => ({
      x: Math.random(),
      y: 0.5 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0005,
      r: Math.random() * 2 + 1,
      op: Math.random(),
      phase: Math.random() * Math.PI * 2
    }));

    // Road dashes
    const dashes = Array.from({ length: 14 }, (_, i) => ({ z: i / 14 }));

    // Exhaust puffs
    const puffs = [];
    const addPuff = (x, y) => {
      puffs.push({
        x,
        y,
        vx: -(Math.random() * 1.5 + 0.5),
        vy: -(Math.random() * 0.4),
        r: Math.random() * 4 + 3,
        life: 40 + Math.random() * 20,
        maxLife: 60
      });
    };

    // Aurora bands
    const auroraWaves = [
      { color: '#06b6d4', amp: 0.06, freq: 1.2, phase: 0 },
      { color: '#34d399', amp: 0.05, freq: 0.8, phase: 1 },
      { color: '#8b5cf6', amp: 0.04, freq: 1.5, phase: 2 },
      { color: '#3b82f6', amp: 0.045, freq: 1.0, phase: 0.5 },
      { color: '#f59e0b', amp: 0.025, freq: 2.0, phase: 1.5 },
    ];

    const drawAurora = (alpha, w, h, tt) => {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      auroraWaves.forEach((wave, wi) => {
        const baseY = h * (0.08 + wi * 0.055);
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 6) {
          const nx = x / w;
          const y = baseY + Math.sin(nx * wave.freq * Math.PI * 2 + tt * 0.7 + wave.phase) * h * wave.amp
                          + Math.sin(nx * wave.freq * 1.7 * Math.PI + tt * 0.4 + wave.phase * 1.3) * h * wave.amp * 0.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h * 0.5);
        ctx.lineTo(0, h * 0.5);
        ctx.closePath();
        const grd = ctx.createLinearGradient(0, baseY - h * 0.08, 0, baseY + h * 0.12);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(0.3, wave.color + '55');
        grd.addColorStop(0.6, wave.color + '22');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fill();
      });
      ctx.restore();
    };

    const drawNature = (w, h, scroll, alpha) => {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Rolling hills far
      ctx.beginPath();
      ctx.moveTo(0, h);
      const hBase = h * 0.56;
      for (let x = 0; x <= w; x += 4) {
        const nx = (x / w + scroll * 0.12) % 2;
        const y = hBase + Math.sin(nx * Math.PI * 2) * h * 0.06 + Math.sin(nx * Math.PI * 5) * h * 0.02;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = '#0a200a'; // darkened for premium contrast
      ctx.fill();

      // Mid hills
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const nx = (x / w + scroll * 0.22) % 2;
        const y = hBase + h * 0.04 + Math.sin(nx * Math.PI * 2.5 + 1) * h * 0.055 + Math.sin(nx * Math.PI * 6 + 2) * h * 0.015;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = '#071807';
      ctx.fill();

      // Tree line scrolling
      const treeColors = ['#051c05', '#081f08', '#041704', '#0c240c'];
      const treeCount = 25;
      for (let i = 0; i < treeCount; i++) {
        const baseX = ((i / treeCount + scroll * 0.35) % 1.1) * w * 1.1 - w * 0.05;
        const treeH = h * 0.09 + (i % 4) * h * 0.015;
        const ty = hBase + h * 0.02;
        const tw2 = treeH * 0.5;
        ctx.beginPath();
        ctx.moveTo(baseX, ty);
        ctx.lineTo(baseX - tw2, ty + treeH);
        ctx.lineTo(baseX + tw2, ty + treeH);
        ctx.closePath();
        ctx.fillStyle = treeColors[i % 4];
        ctx.fill();
        
        // Second layer tree cap
        ctx.beginPath();
        ctx.moveTo(baseX, ty - treeH * 0.3);
        ctx.lineTo(baseX - tw2 * 0.7, ty + treeH * 0.5);
        ctx.lineTo(baseX + tw2 * 0.7, ty + treeH * 0.5);
        ctx.closePath();
        ctx.fillStyle = '#0b260b';
        ctx.fill();
      }

      // Fireflies
      fireflies.forEach(f => {
        f.x = (f.x + f.vx + 1) % 1;
        f.y = Math.max(0.5, Math.min(0.85, f.y + f.vy));
        f.phase += 0.04;
        const glow = (Math.sin(f.phase) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(f.x * w, f.y * h, f.r, 0, Math.PI * 2);
        const fg = ctx.createRadialGradient(f.x * w, f.y * h, 0, f.x * w, f.y * h, f.r * 4);
        fg.addColorStop(0, `rgba(180,255,180,${0.8 * glow})`);
        fg.addColorStop(1, 'transparent');
        ctx.fillStyle = fg;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(f.x * w, f.y * h, f.r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,255,180,${glow})`;
        ctx.fill();
      });

      ctx.restore();
    };

    const drawRoad = (w, h, groundY) => {
      const vanX = w * 0.5, vanY = groundY - h * 0.02;
      const roadW_bottom = w * 0.72, roadW_top = 55;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(vanX - roadW_top / 2, vanY);
      ctx.lineTo(vanX + roadW_top / 2, vanY);
      ctx.lineTo(vanX + roadW_bottom / 2, h + 10);
      ctx.lineTo(vanX - roadW_bottom / 2, h + 10);
      ctx.closePath();
      const rg = ctx.createLinearGradient(0, vanY, 0, h);
      rg.addColorStop(0, '#121212');
      rg.addColorStop(0.4, '#181818');
      rg.addColorStop(1, '#101010');
      ctx.fillStyle = rg;
      ctx.fill();

      // Road gloss
      const gloss = ctx.createLinearGradient(vanX - 40, vanY, vanX + 40, vanY);
      gloss.addColorStop(0, 'transparent');
      gloss.addColorStop(0.5, 'rgba(255,255,255,0.03)');
      gloss.addColorStop(1, 'transparent');
      ctx.fillStyle = gloss;
      ctx.fill();

      // Edge lines
      ctx.beginPath();
      ctx.moveTo(vanX - roadW_top / 2, vanY);
      ctx.lineTo(vanX - roadW_bottom / 2, h + 10);
      ctx.strokeStyle = 'rgba(255,200,50,0.4)'; 
      ctx.lineWidth = 2.5; 
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(vanX + roadW_top / 2, vanY);
      ctx.lineTo(vanX + roadW_bottom / 2, h + 10);
      ctx.strokeStyle = 'rgba(255,200,50,0.4)'; 
      ctx.lineWidth = 2.5; 
      ctx.stroke();

      // Center dashes
      dashes.forEach(d => {
        d.z = (d.z + 0.018) % 1;
        const frac = d.z * d.z;
        const dx = vanX;
        const dy = vanY + frac * (h + 10 - vanY);
        const dw = 3 + frac * 38;
        const dh = 1.5 + frac * 10;
        ctx.save();
        ctx.globalAlpha = frac * 0.8;
        ctx.fillStyle = '#fff';
        ctx.fillRect(dx - dw / 2, dy, dw, dh);
        ctx.restore();
      });

      ctx.restore();
    };

    const drawWheel = (wx, wy, r, rot) => {
      ctx.beginPath(); 
      ctx.arc(wx, wy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#111'; 
      ctx.fill();
      
      ctx.strokeStyle = '#333'; 
      ctx.lineWidth = r * 0.28; 
      ctx.stroke();
      
      ctx.beginPath(); 
      ctx.arc(wx, wy, r * 0.72, 0, Math.PI * 2);
      ctx.strokeStyle = '#555'; 
      ctx.lineWidth = 1.5; 
      ctx.stroke();
      
      for (let i = 0; i < 7; i++) {
        const a = rot + i * Math.PI / 3.5;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * r * 0.65, wy + Math.sin(a) * r * 0.65);
        ctx.lineTo(wx + Math.cos(a + Math.PI) * r * 0.65, wy + Math.sin(a + Math.PI) * r * 0.65);
        ctx.strokeStyle = '#2d2d2d'; 
        ctx.lineWidth = 1.8; 
        ctx.stroke();
      }
      ctx.beginPath(); 
      ctx.arc(wx, wy, r * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#777'; 
      ctx.fill();
    };

    const drawBike = (bx, by, sc, lean, wrot, alpha, speed) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(bx, by);
      ctx.scale(sc, sc);
      ctx.rotate(lean);

      const s = 1;

      // Ground shadow
      ctx.save();
      ctx.translate(0, 75 * s); 
      ctx.scale(1, 0.15);
      ctx.beginPath(); 
      ctx.ellipse(0, 0, 95 * s, 28 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; 
      ctx.fill();
      ctx.restore();

      // Wheels
      drawWheel(-58 * s, 32 * s, 30 * s, wrot);
      drawWheel(60 * s, 34 * s, 28 * s, wrot);

      // Swingarm
      ctx.beginPath(); 
      ctx.moveTo(-58 * s, 32 * s); 
      ctx.lineTo(8 * s, -18 * s);
      ctx.strokeStyle = '#2d2d2d'; 
      ctx.lineWidth = 5 * s; 
      ctx.lineCap = 'round'; 
      ctx.stroke();

      // Main frame
      ctx.beginPath();
      ctx.moveTo(8 * s, -18 * s); 
      ctx.lineTo(48 * s, 22 * s);
      ctx.strokeStyle = '#c084fc'; // Purple accent matching project design
      ctx.lineWidth = 6 * s; 
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-50 * s, 22 * s); 
      ctx.lineTo(-12 * s, -22 * s);
      ctx.strokeStyle = '#a855f7'; 
      ctx.lineWidth = 5 * s; 
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-12 * s, -22 * s); 
      ctx.lineTo(8 * s, -18 * s);
      ctx.strokeStyle = '#c084fc'; 
      ctx.lineWidth = 5 * s; 
      ctx.stroke();

      // Fork
      ctx.beginPath(); 
      ctx.moveTo(38 * s, -12 * s); 
      ctx.lineTo(60 * s, 34 * s);
      ctx.strokeStyle = '#777'; 
      ctx.lineWidth = 5 * s; 
      ctx.stroke();

      // Fairing (full front cowl)
      ctx.beginPath();
      ctx.moveTo(18 * s, -38 * s);
      ctx.quadraticCurveTo(52 * s, -32 * s, 70 * s, -8 * s);
      ctx.quadraticCurveTo(68 * s, 14 * s, 45 * s, 12 * s);
      ctx.quadraticCurveTo(28 * s, 0 * s, 18 * s, -38 * s);
      ctx.fillStyle = '#818cf8'; // Indigo accent
      ctx.fill();
      ctx.strokeStyle = '#6366f1'; 
      ctx.lineWidth = 1.5 * s; 
      ctx.stroke();

      // Fairing detail stripe
      ctx.beginPath();
      ctx.moveTo(22 * s, -30 * s);
      ctx.quadraticCurveTo(50 * s, -24 * s, 62 * s, -4 * s);
      ctx.strokeStyle = 'rgba(192,132,252,0.6)'; 
      ctx.lineWidth = 3 * s; 
      ctx.stroke();

      // Fuel tank
      ctx.beginPath(); 
      ctx.ellipse(-6 * s, -28 * s, 28 * s, 12 * s, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1'; 
      ctx.fill();
      ctx.strokeStyle = '#818cf8'; 
      ctx.lineWidth = 1.5 * s; 
      ctx.stroke();

      // Seat
      ctx.beginPath();
      ctx.moveTo(-32 * s, -26 * s); 
      ctx.quadraticCurveTo(-20 * s, -38 * s, -6 * s, -32 * s); 
      ctx.quadraticCurveTo(4 * s, -28 * s, -4 * s, -22 * s); 
      ctx.quadraticCurveTo(-20 * s, -20 * s, -32 * s, -26 * s);
      ctx.fillStyle = '#111'; 
      ctx.fill();

      // Headlight
      ctx.beginPath(); 
      ctx.ellipse(67 * s, -8 * s, 9 * s, 7 * s, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#fffde8'; 
      ctx.fill();
      
      const hg = ctx.createRadialGradient(67 * s, -8 * s, 0, 67 * s, -8 * s, 22 * s);
      hg.addColorStop(0, 'rgba(255,252,200,0.8)'); 
      hg.addColorStop(1, 'transparent');
      ctx.beginPath(); 
      ctx.ellipse(67 * s, -8 * s, 22 * s, 16 * s, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = hg; 
      ctx.fill();

      // Taillight
      ctx.beginPath(); 
      ctx.ellipse(-64 * s, 10 * s, 7 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; 
      ctx.fill();
      
      const tg = ctx.createRadialGradient(-64 * s, 10 * s, 0, -64 * s, 10 * s, 18 * s);
      tg.addColorStop(0, 'rgba(239,68,68,0.7)'); 
      tg.addColorStop(1, 'transparent');
      ctx.beginPath(); 
      ctx.ellipse(-64 * s, 10 * s, 18 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = tg; 
      ctx.fill();

      // Exhaust
      ctx.beginPath();
      ctx.moveTo(-18 * s, 20 * s); 
      ctx.quadraticCurveTo(-48 * s, 38 * s, -68 * s, 28 * s);
      ctx.strokeStyle = '#444'; 
      ctx.lineWidth = 5 * s; 
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-18 * s, 20 * s); 
      ctx.quadraticCurveTo(-48 * s, 42 * s, -68 * s, 34 * s);
      ctx.strokeStyle = '#333'; 
      ctx.lineWidth = 3 * s; 
      ctx.stroke();

      // RIDER
      const legA = Math.sin(t * 0.12) * 12;
      ctx.save(); 
      ctx.translate(-10 * s, 0);
      ctx.beginPath(); 
      ctx.moveTo(-2 * s, -10 * s); 
      ctx.lineTo(-18 * s + legA, 16 * s); 
      ctx.strokeStyle = '#18181b'; 
      ctx.lineWidth = 9 * s; 
      ctx.lineCap = 'round'; 
      ctx.stroke();
      
      ctx.beginPath(); 
      ctx.moveTo(-18 * s + legA, 16 * s); 
      ctx.lineTo(-10 * s, 32 * s); 
      ctx.strokeStyle = '#27272a'; 
      ctx.lineWidth = 7 * s; 
      ctx.stroke();
      ctx.restore();

      // Body (tucked aero posture)
      ctx.beginPath();
      ctx.moveTo(-10 * s, -18 * s); 
      ctx.quadraticCurveTo(8 * s, -36 * s, 24 * s, -24 * s); 
      ctx.quadraticCurveTo(32 * s, -14 * s, 26 * s, -4 * s); 
      ctx.quadraticCurveTo(8 * s, 4 * s, -10 * s, -18 * s);
      ctx.fillStyle = '#18181b'; 
      ctx.fill();
      
      // Racing stripe on rider suit
      ctx.beginPath();
      ctx.moveTo(-4 * s, -20 * s); 
      ctx.quadraticCurveTo(12 * s, -34 * s, 22 * s, -22 * s);
      ctx.strokeStyle = '#c084fc'; 
      ctx.lineWidth = 3 * s; 
      ctx.stroke();

      // Arms to bars
      ctx.beginPath(); 
      ctx.moveTo(18 * s, -26 * s); 
      ctx.quadraticCurveTo(34 * s, -18 * s, 40 * s, -6 * s);
      ctx.strokeStyle = '#18181b'; 
      ctx.lineWidth = 6 * s; 
      ctx.lineCap = 'round'; 
      ctx.stroke();

      // Helmet
      ctx.beginPath(); 
      ctx.arc(16 * s, -40 * s, 16 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1'; 
      ctx.fill();
      
      ctx.beginPath(); 
      ctx.ellipse(16 * s, -28 * s, 17 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4f46e5'; 
      ctx.fill();
      
      // Visor
      ctx.beginPath(); 
      ctx.arc(16 * s, -40 * s, 15 * s, -0.5, 0.6);
      ctx.strokeStyle = 'rgba(147,197,253,0.6)'; 
      ctx.lineWidth = 5 * s; 
      ctx.stroke();
      
      // Helmet reflection
      ctx.beginPath(); 
      ctx.arc(10 * s, -46 * s, 5 * s, -0.8, 0.2);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; 
      ctx.lineWidth = 3 * s; 
      ctx.stroke();

      ctx.restore();
    };

    const lerp = (a, b, val) => a + (b - a) * val;
    const easeOut = (val) => 1 - Math.pow(1 - val, 3);
    const easeInOut = (val) => val < 0.5 ? 4 * val * val * val : (val - 1) * (2 * val - 2) * (2 * val - 2) + 1;

    const frame = (now) => {
      t++;
      const elapsed = now - start;
      const prog = Math.min(1, elapsed / TOTAL);
      const w = getW();
      const h = getH();

      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, w, h);

      const natureAlpha = prog < 0.7 ? 1 : Math.max(0, 1 - (prog - 0.7) / 0.15);
      const auroraAlpha = prog < 0.72 ? 0 : Math.min(1, (prog - 0.72) / 0.2);
      const skyDawn = Math.min(1, Math.max(0, (prog - 0.35) * 2));

      // SKY
      const skyG = ctx.createLinearGradient(0, 0, 0, h * 0.62);
      if (prog < 0.65) {
        const r = Math.floor(2 + skyDawn * 30);
        const g = Math.floor(5 + skyDawn * 20);
        const b = Math.floor(22 + skyDawn * 40);
        skyG.addColorStop(0, `rgb(${r},${g},${b})`);
        skyG.addColorStop(1, `rgb(${r + 8},${g + 12},${b + 28})`);
      } else {
        const fade = (prog - 0.65) / 0.15;
        const r = Math.floor(32 - fade * 30);
        const g = Math.floor(25 - fade * 23);
        const b = Math.floor(62 - fade * 60);
        skyG.addColorStop(0, `rgb(${Math.max(2, r)},${Math.max(2, g)},${Math.max(2, b)})`);
        skyG.addColorStop(1, `rgb(2, 5, 18)`);
      }
      ctx.fillStyle = skyG; 
      ctx.fillRect(0, 0, w, h);

      // Interactive Cursor Glow (Aurora Particle Trail)
      if (isHovered && mousePos.x >= 0 && mousePos.y >= 0) {
        const radius = Math.min(w, h) * 0.18;
        const cg = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, radius);
        cg.addColorStop(0, 'rgba(52,211,153,0.12)'); // Emerald tint
        cg.addColorStop(0.5, 'rgba(99,102,241,0.04)'); // Indigo tint
        cg.addColorStop(1, 'transparent');
        ctx.save();
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // AURORA
      const tt = t * 0.012;
      drawAurora(auroraAlpha, w, h, tt);

      // STARS
      const starA = prog < 0.5 ? 1 : Math.max(0, 1 - (prog - 0.5) / 0.25);
      const starA2 = auroraAlpha > 0 ? auroraAlpha * 0.4 : 0;
      stars.forEach(s => {
        const tw2 = Math.sin(t * 0.025 + s.tw) * 0.3 + 0.7;
        ctx.beginPath(); 
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.op * tw2 * (starA + starA2)})`;
        ctx.fill();
      });

      // MOON
      const moonA = Math.max(0, 1 - prog * 4);
      if (moonA > 0.01) {
        ctx.save(); 
        ctx.globalAlpha = moonA;
        ctx.beginPath(); 
        ctx.arc(w * 0.8, h * 0.1, 26, 0, Math.PI * 2); 
        ctx.fillStyle = '#fffde0'; 
        ctx.fill();
        
        ctx.beginPath(); 
        ctx.arc(w * 0.8 + 11, h * 0.1 - 3, 22, 0, Math.PI * 2); 
        ctx.fillStyle = '#06080f'; 
        ctx.fill();
        ctx.restore();
      }

      const groundY = h * 0.6;

      // NATURE
      drawNature(w, h, prog, natureAlpha);

      // ROAD
      const roadA = prog < 0.75 ? 1 : Math.max(0, 1 - (prog - 0.75) / 0.1);
      if (roadA > 0.01) {
        ctx.save(); 
        ctx.globalAlpha = roadA;
        drawRoad(w, h, groundY);
        ctx.restore();
      }

      // GROUND STRIP
      if (natureAlpha > 0.01) {
        ctx.save(); 
        ctx.globalAlpha = natureAlpha;
        const gg = ctx.createLinearGradient(0, groundY, 0, h);
        gg.addColorStop(0, '#071807'); 
        gg.addColorStop(1, '#020902');
        ctx.fillStyle = gg;
        ctx.fillRect(0, groundY + 2, w, h - groundY);
        ctx.restore();
      }

      // BIKE POSITIONS & LEAN ANIMATION
      let bx, by, bsc, blean, balpha;

      if (prog < 0.28) {
        const p = prog / 0.28;
        bx = lerp(w * 1.05, w * 0.72, easeOut(p));
        by = groundY - 12;
        bsc = lerp(0.14, 0.28, p);
        blean = 0.03;
        balpha = Math.min(1, p * 3);
      } else if (prog < 0.58) {
        const p = (prog - 0.28) / 0.3;
        bx = lerp(w * 0.72, w * 0.18, easeInOut(p));
        by = groundY - 10 + Math.sin(p * Math.PI * 2) * 8;
        bsc = lerp(0.28, 0.52, p);
        blean = Math.sin(p * Math.PI * 2) * 0.07;
        balpha = 1;
      } else if (prog < 0.76) {
        const p = (prog - 0.58) / 0.18;
        bx = lerp(w * 0.18, w * 0.48, easeOut(p));
        by = lerp(groundY - 10, groundY + 55, easeOut(p));
        bsc = lerp(0.52, 2.4, easeOut(p));
        blean = -0.02;
        balpha = 1;
      } else {
        const p = (prog - 0.76) / 0.1;
        bx = w * 0.48 + p * w * 0.05;
        by = groundY + 55 + p * h * 0.6;
        bsc = 2.4 + p * 3;
        blean = -0.01;
        balpha = Math.max(0, 1 - p * 2.5);
      }

      const wrot = t * 0.22;

      // HEADLIGHT CONE
      if (balpha > 0.05 && bsc < 1.8) {
        ctx.save();
        ctx.globalAlpha = balpha * 0.5;
        const hbx = bx + 67 * bsc, hby = by - 8 * bsc;
        const hlen = w * 1.3;
        const spread = 0.32;
        ctx.beginPath();
        ctx.moveTo(hbx, hby);
        ctx.lineTo(hbx + Math.cos(-spread) * hlen, hby + Math.sin(-spread) * hlen);
        ctx.lineTo(hbx + Math.cos(spread) * hlen, hby + Math.sin(spread) * hlen);
        ctx.closePath();
        const lg = ctx.createRadialGradient(hbx, hby, 0, hbx + hlen * 0.4, hby, hlen);
        lg.addColorStop(0, 'rgba(220,230,255,0.25)');
        lg.addColorStop(0.5, 'rgba(150,180,255,0.06)');
        lg.addColorStop(1, 'transparent');
        ctx.fillStyle = lg; 
        ctx.fill();
        ctx.restore();
      }

      // SPEED LINES
      if (prog > 0.28 && prog < 0.76) {
        const spd = Math.min(1, (prog - 0.28) / 0.15);
        for (let i = 0; i < 10; i++) {
          const ly = by - 50 + i * 14;
          const llen = 60 + Math.random() * 140;
          ctx.save();
          ctx.globalAlpha = spd * 0.3 * (0.3 + Math.random() * 0.5);
          ctx.fillStyle = '#fff';
          ctx.fillRect(bx - 180 - llen, ly, llen, 1.2);
          ctx.restore();
        }
      }

      // EXHAUST PUFFS
      if (balpha > 0.2 && Math.random() > 0.45) {
        addPuff(bx - 65 * bsc, by + 28 * bsc);
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.x += p.vx; 
        p.y += p.vy; 
        p.r += 0.3; 
        p.life--;
        const a = (p.life / p.maxLife) * 0.35;
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,180,180,${a})`;
        ctx.fill();
        if (p.life <= 0) puffs.splice(i, 1);
      }

      drawBike(bx, by, bsc, blean, wrot, balpha, prog);

      // BRAND REVEAL AT 0.82 PROGRESS
      if (prog >= 0.82 && !brandPopped) {
        brandPopped = true;
        revealBrand();
      }

      // AUTO-COMPLETE TRANSITION
      if (prog >= 1) {
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 1200); // give user a moment to see the tagline
        return; // stop anim loop
      }

      animationFrameId.current = requestAnimationFrame(frame);
    };

    const revealBrand = () => {
      const wl = welcomeRef.current;
      const trip = tripRef.current;
      const sync = syncRef.current;
      const ai = aiRef.current;
      const tag = tagRef.current;
      const div = divRef.current;

      if (wl) {
        setTimeout(() => {
          wl.style.transition = 'color 0.8s ease, letter-spacing 0.8s ease';
          wl.style.color = 'rgba(255,255,255,0.45)';
          wl.style.letterSpacing = '8px';
        }, 100);
      }

      if (trip) {
        setTimeout(() => {
          trip.style.transition = 'opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), transform 0.7s cubic-bezier(0.34,1.56,0.64,1)';
          trip.style.opacity = '1';
          trip.style.transform = 'translateY(0) scale(1)';
        }, 400);
      }

      if (sync) {
        setTimeout(() => {
          sync.style.transition = 'opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), transform 0.7s cubic-bezier(0.34,1.56,0.64,1)';
          sync.style.opacity = '1';
          sync.style.transform = 'translateY(0) scale(1)';
        }, 680);
      }

      // Flash Effect
      setTimeout(() => {
        const fl = document.createElement('div');
        fl.style.cssText = 'position:absolute;inset:0;background:rgba(52,211,153,0.06);pointer-events:none;animation:ffl 0.5s ease forwards;z-index:5;';
        wrapRef.current?.appendChild(fl);
        const styleTag = document.createElement('style');
        styleTag.textContent = '@keyframes ffl{0%{opacity:0}30%{opacity:1}100%{opacity:0}}';
        document.head.appendChild(styleTag);
        setTimeout(() => {
          fl.remove();
          styleTag.remove();
        }, 600);
      }, 600);

      if (ai) {
        setTimeout(() => {
          ai.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          ai.style.opacity = '1';
          ai.style.transform = 'translateY(0)';
        }, 900);
      }

      if (div) {
        setTimeout(() => {
          div.style.transition = 'width 1s ease';
          div.style.width = '200px';
        }, 1000);
      }

      if (tag) {
        setTimeout(() => {
          tag.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
          tag.style.opacity = '1';
          tag.style.transform = 'translateY(0)';
        }, 1200);
      }
    };

    animationFrameId.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resize);
    };
  }, [isHovered, mousePos, onComplete]);

  // Track mouse coordinates for interactive glow
  const handleMouseMove = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      id="wrap" 
      ref={wrapRef} 
      className={`intro-animation-container ${isFadingOut ? 'fade-out' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
    >
      <canvas id="cv" ref={canvasRef}></canvas>
      <div id="overlay">
        <div id="welcome-line" ref={welcomeRef}>Welcome to</div>
        <div id="brand-row">
          <div id="word-trip" ref={tripRef}>Trip</div>
          <div id="word-sync" ref={syncRef}>Sync</div>
          <div id="word-ai" ref={aiRef}>AI</div>
        </div>
        <div id="divider" ref={divRef}></div>
        <div id="tagline" ref={tagRef}>Collaborative Travel Planning</div>
      </div>
      
      {/* Premium Glass Skip Button */}
      <button className="skip-intro-btn" onClick={handleSkip}>
        Skip Intro
      </button>
    </div>
  );
}
