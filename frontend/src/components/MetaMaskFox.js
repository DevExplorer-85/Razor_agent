'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 3D Interactive Dollar Note (Banknote) component with Scroll & Cursor Animation.
 * As the user scrolls down the page, the 3D Dollar Note rotates, floats, and flips in perspective,
 * while maintaining real-time cursor tracking and floating particle effects.
 */
export default function MetaMaskFox({ width = 450, height = 450 }) {
  const canvasRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Mouse & Scroll inertia variables
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;
    let scrollRotZ = 0;
    let currentScrollZ = 0;
    let pulseTime = 0;

    // Track Mouse Cursor
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      targetRotY = Math.max(-0.75, Math.min(0.75, dx * 0.9));
      targetRotX = Math.max(-0.55, Math.min(0.55, -dy * 0.75));
    };

    // Track Page Scroll for 3D Note Rotation & Translation
    const handleScroll = () => {
      const scrollOffset = window.scrollY || 0;
      setScrollY(scrollOffset);

      // 3D rotation driven by scroll position
      scrollRotZ = (scrollOffset * 0.003) % (Math.PI * 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Floating Green & Gold Money Sparkles
    const numSparkles = 28;
    const sparkles = Array.from({ length: numSparkles }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 320,
      z: (Math.random() - 0.5) * 220,
      radius: 1.5 + Math.random() * 3,
      speedY: -0.3 - Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.6,
      symbol: Math.random() > 0.6 ? '$' : '•',
    }));

    // Animation Loop
    const render = () => {
      pulseTime += 0.03;

      // Smooth inertia lerp for mouse and scroll
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentScrollZ += (scrollRotZ - currentScrollZ) * 0.06;

      const currentScroll = window.scrollY || 0;
      const scrollYOffset = Math.sin(currentScroll * 0.004) * 20;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + Math.sin(pulseTime * 1.5) * 8 + scrollYOffset * 0.5;

      // --- Radial Emerald Money Glow ---
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, 40,
        centerX, centerY, 210
      );
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      glowGrad.addColorStop(0.5, 'rgba(5, 150, 105, 0.1)');
      glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 210, 0, Math.PI * 2);
      ctx.fill();

      // Combined 3D Rotation Matrix (Cursor X/Y + Scroll Z Spin)
      const totalRotY = currentRotY + Math.sin(currentScroll * 0.003) * 0.45;
      const totalRotX = currentRotX + Math.cos(currentScroll * 0.002) * 0.25;
      const totalRotZ = currentScrollZ;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);
      const cosZ = Math.cos(totalRotZ);
      const sinZ = Math.sin(totalRotZ);

      const project3D = (x, y, z) => {
        // Rotate Z
        let rx0 = x * cosZ - y * sinZ;
        let ry0 = x * sinZ + y * cosZ;
        let rz0 = z;

        // Rotate Y
        let rx1 = rx0 * cosY + rz0 * sinY;
        let ry1 = ry0;
        let rz1 = -rx0 * sinY + rz0 * cosY;

        // Rotate X
        let rx2 = rx1;
        let ry2 = ry1 * cosX - rz1 * sinX;
        let rz2 = ry1 * sinX + rz1 * cosX;

        // Perspective projection
        const fov = 420;
        const scale = fov / (fov + rz2 + 120);
        return {
          x: centerX + rx2 * scale,
          y: centerY - ry2 * scale,
          scale,
          z: rz2,
        };
      };

      // --- Draw Floating Sparkles ($ & Dots) ---
      sparkles.forEach((p) => {
        p.y += p.speedY;
        if (p.y < -160) p.y = 160;
        const pt = project3D(p.x, p.y, p.z);

        if (p.symbol === '$') {
          ctx.font = `${Math.floor(12 * pt.scale)}px "Inter", sans-serif`;
          ctx.fillStyle = `rgba(52, 211, 153, ${p.opacity * Math.min(1, pt.scale)})`;
          ctx.fillText('$', pt.x, pt.y);
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.radius * pt.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity * Math.min(1, pt.scale)})`;
          ctx.fill();
        }
      });

      // --- 3D DOLLAR NOTE (BANKNOTE) GEOMETRY ---
      const noteW = 215; // half width (was 140)
      const noteH = 115;  // half height (was 75)
      const thickness = 9;

      // 3D Box Vertices for Note
      const corners = [
        { x: -noteW, y: noteH, z: thickness },
        { x: noteW, y: noteH, z: thickness },
        { x: noteW, y: -noteH, z: thickness },
        { x: -noteW, y: -noteH, z: thickness },
        { x: -noteW, y: noteH, z: -thickness },
        { x: noteW, y: noteH, z: -thickness },
        { x: noteW, y: -noteH, z: -thickness },
        { x: -noteW, y: -noteH, z: -thickness },
      ];

      const proj = corners.map(c => project3D(c.x, c.y, c.z));

      // Draw Note Edge Thickness / Bevel Shadow
      ctx.beginPath();
      ctx.moveTo(proj[0].x, proj[0].y);
      ctx.lineTo(proj[1].x, proj[1].y);
      ctx.lineTo(proj[5].x, proj[5].y);
      ctx.lineTo(proj[4].x, proj[4].y);
      ctx.closePath();
      ctx.fillStyle = '#044E35';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(proj[1].x, proj[1].y);
      ctx.lineTo(proj[2].x, proj[2].y);
      ctx.lineTo(proj[6].x, proj[6].y);
      ctx.lineTo(proj[5].x, proj[5].y);
      ctx.closePath();
      ctx.fillStyle = '#065F46';
      ctx.fill();

      // Front Face Polygon Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(proj[0].x, proj[0].y);
      ctx.lineTo(proj[1].x, proj[1].y);
      ctx.lineTo(proj[2].x, proj[2].y);
      ctx.lineTo(proj[3].x, proj[3].y);
      ctx.closePath();

      // Banknote Paper Background Fill
      const noteGrad = ctx.createLinearGradient(proj[0].x, proj[0].y, proj[2].x, proj[2].y);
      noteGrad.addColorStop(0, '#ECFDF5');
      noteGrad.addColorStop(0.5, '#D1FAE5');
      noteGrad.addColorStop(1, '#A7F3D0');
      ctx.fillStyle = noteGrad;
      ctx.fill();

      // Banknote Outer Emerald Border
      ctx.lineWidth = 6 * proj[0].scale;
      ctx.strokeStyle = '#059669';
      ctx.stroke();

      // Inner Fine Guilloche Border
      const innerCorner0 = project3D(-noteW + 12, noteH - 12, thickness + 0.5);
      const innerCorner1 = project3D(noteW - 12, noteH - 12, thickness + 0.5);
      const innerCorner2 = project3D(noteW - 12, -noteH + 12, thickness + 0.5);
      const innerCorner3 = project3D(-noteW + 12, -noteH + 12, thickness + 0.5);

      ctx.beginPath();
      ctx.moveTo(innerCorner0.x, innerCorner0.y);
      ctx.lineTo(innerCorner1.x, innerCorner1.y);
      ctx.lineTo(innerCorner2.x, innerCorner2.y);
      ctx.lineTo(innerCorner3.x, innerCorner3.y);
      ctx.closePath();
      ctx.lineWidth = 3 * proj[0].scale;
      ctx.strokeStyle = '#047857';
      ctx.stroke();

      // Denomination Corners "100" & "$"
      const avgScale = (proj[0].scale + proj[2].scale) / 2;
      ctx.fillStyle = '#065F46';
      ctx.font = `900 ${Math.floor(24 * avgScale)}px "Inter", sans-serif`;

      // Top Left $100
      ctx.fillText('$100', innerCorner0.x + 12 * avgScale, innerCorner0.y + 26 * avgScale);
      // Top Right 100
      ctx.fillText('100', innerCorner1.x - 48 * avgScale, innerCorner1.y + 26 * avgScale);
      // Bottom Left 100
      ctx.fillText('100', innerCorner3.x + 12 * avgScale, innerCorner3.y - 12 * avgScale);
      // Bottom Right $100
      ctx.fillText('$100', innerCorner2.x - 62 * avgScale, innerCorner2.y - 12 * avgScale);

      // Central Oval Frame for Insovant AI Dollar Emblem
      const centerPt = project3D(0, 0, thickness + 1);
      ctx.beginPath();
      ctx.ellipse(centerPt.x, centerPt.y, 66 * centerPt.scale, 48 * centerPt.scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 4 * centerPt.scale;
      ctx.strokeStyle = '#059669';
      ctx.stroke();

      // Big Central "$" Symbol inside Oval
      ctx.fillStyle = '#047857';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      ctx.shadowBlur = 14;
      ctx.font = `900 ${Math.floor(58 * centerPt.scale)}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', centerPt.x, centerPt.y + 2);

      // Header Text: "INSOVANT AI FINANCIAL CONTROLLER"
      const topTextPt = project3D(0, noteH - 24, thickness + 1);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#065F46';
      ctx.font = `800 ${Math.floor(13 * topTextPt.scale)}px "Inter", sans-serif`;
      ctx.fillText('INSOVANT AI FINANCIAL CONTROLLER', topTextPt.x, topTextPt.y);

      // Sub-Text: "ONE HUNDRED DOLLARS • TRUST LAYER SECURED"
      const bottomTextPt = project3D(0, -noteH + 20, thickness + 1);
      ctx.fillStyle = '#047857';
      ctx.font = `700 ${Math.floor(12 * bottomTextPt.scale)}px "Inter", sans-serif`;
      ctx.fillText('ONE HUNDRED DOLLARS • TRUST LAYER SECURED', bottomTextPt.x, bottomTextPt.y);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [width, height]);

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab'
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          filter: 'drop-shadow(0 20px 40px rgba(5, 150, 105, 0.22))',
        }}
      />
    </div>
  );
}
