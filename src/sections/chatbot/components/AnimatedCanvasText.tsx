import React, { useEffect, useRef } from 'react';

const AnimatedCanvasText = ({ text, className = '', fontSize = '24px', color = 'white' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let opacity = 0;
        let fadeIn = true;

        // Set canvas size
        const updateCanvasSize = () => {
            ctx.font = `${fontSize} Arial`;
            const metrics = ctx.measureText(text);
            canvas.width = metrics.width + 20; // Add padding
            canvas.height = parseInt(fontSize) + 10; // Add padding
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update opacity
            if (fadeIn) {
                opacity += 0.02;
                if (opacity >= 1) {
                    fadeIn = false;
                }
            } else {
                opacity -= 0.02;
                if (opacity <= 0.4) {
                    fadeIn = true;
                }
            }

            // Draw text
            ctx.font = `${fontSize} Arial`;
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            animationFrameId = requestAnimationFrame(animate);
        };

        updateCanvasSize();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [text, fontSize, color]);

    return <canvas ref={canvasRef} className={className} />;
};

export default AnimatedCanvasText;