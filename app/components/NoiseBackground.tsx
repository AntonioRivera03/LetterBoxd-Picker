'use client';

import React, { useRef, useEffect } from 'react';

interface NoiseBackgroundProps {
    speed?: number;
    particleCount?: number;
}

const NoiseBackground: React.FC<NoiseBackgroundProps> = ({ speed = 1, particleCount = 200 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Refs to hold mutable values for the animation loop without restarting it
    const speedRef = useRef(speed);
    const countRef = useRef(particleCount);

    // Update refs when props change
    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    useEffect(() => {
        countRef.current = particleCount;
    }, [particleCount]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            life: number;
            maxLife: number;

            constructor(w: number, h: number) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * (Math.min(w, h) * 0.2);
                this.x = w / 2 + Math.cos(angle) * dist;
                this.y = h / 2 + Math.sin(angle) * dist;

                this.vx = 0;
                this.vy = 0;
                this.size = Math.random() * 2 + 1;

                const colors = ['rgba(255, 255, 255, 0.8)', 'rgba(20, 184, 166, 0.6)', 'rgba(59, 130, 246, 0.6)', 'rgba(147, 51, 234, 0.5)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];

                this.life = 0;
                this.maxLife = Math.random() * 200 + 100;
            }

            update(w: number, h: number) {
                const cx = w / 2;
                const cy = h / 2;

                const dx = this.x - cx;
                const dy = this.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let angle = Math.atan2(dy, dx);

                const currentSpeed = speedRef.current;
                const baseSpeed = 2 + (dist / (Math.min(w, h) * 0.5)) * 3;
                const adjustedSpeed = baseSpeed * currentSpeed;

                this.vx = Math.cos(angle) * adjustedSpeed;
                this.vy = Math.sin(angle) * adjustedSpeed;

                this.x += this.vx;
                this.y += this.vy;
                this.life++;

                if (this.x < -50 || this.x > w + 50 || this.y < -50 || this.y > h + 50 || this.life > this.maxLife) {
                    this.reset(w, h);
                }
            }

            reset(w: number, h: number) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * (Math.min(w, h) * 0.1);
                this.x = w / 2 + Math.cos(angle) * dist;
                this.y = h / 2 + Math.sin(angle) * dist;
                this.life = 0;
                this.size = Math.random() * 2 + 1;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Don't clear particles on resize, just let them be naturally reset or updated
        };

        window.addEventListener('resize', resize);
        resize();

        // Initial population
        for (let i = 0; i < countRef.current; i++) {
            particles.push(new Particle(canvas.width, canvas.height));
        }

        const render = () => {
            if (!ctx) return;

            // Handle count changes dynamically
            const targetCount = countRef.current;
            if (particles.length < targetCount) {
                for (let i = 0; i < targetCount - particles.length; i++) {
                    particles.push(new Particle(canvas.width, canvas.height));
                }
            } else if (particles.length > targetCount) {
                particles.splice(targetCount); // Remove excess from end
            }

            // Clear background - Explicitly Black with Trail
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update(canvas.width, canvas.height);
                p.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] w-full h-full pointer-events-none bg-black"
        />
    );
};

export default NoiseBackground;
