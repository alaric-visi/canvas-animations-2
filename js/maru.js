
   class MaruPattern {
    constructor(canvasOrId) {
        this.canvas = (typeof canvasOrId === 'string')
            ? document.getElementById(canvasOrId)
            : canvasOrId;

        if (!this.canvas) {
            throw new Error('MaruPattern → canvas not found.');
        }

        this.ctx = this.canvas.getContext('2d');
        this.w = this.canvas.width;
        this.h = this.canvas.height;
        this.minDim = Math.min(this.w, this.h);
        this.frameCount = 0;
        this.innerRadius  = 5;
        this.targetRadius = 5;
        this.growing      = false;
        this.colorIndex   = 0;
        this.lineColors = ['#FF69B4', '#4A90E2', '#F39C12'];
        this.addClickHandler();
        this.draw();
    }

    hexToRgb(hex) {
        const [r, g, b] = hex.match(/\w\w/g).map(h => parseInt(h, 16));
        return { r, g, b };
    }
    drawLine(x1, y1, x2, y2, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }
    drawCircle(x, y, r, rgb, alpha = 1) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
        this.ctx.fill();
    }

    addClickHandler() {
        this.canvas.addEventListener('click', () => {
            if (this.growing) return;
            this.growing      = true;
            this.targetRadius = this.minDim / 2 - 20;
            this.colorIndex   = (this.colorIndex + 1) % this.lineColors.length;

            setTimeout(() => {
                this.targetRadius = 5;
                this.growing      = false;
            }, 2000);
        });
    }

    maruPattern() {
        const { ctx, frameCount } = this;
        const segs       = 8;
        const angleStep  = Math.PI * 2 / segs;
        const lineLen    = this.minDim * 0.07;             
        const baseRadius = this.minDim * 0.25;

        for (let j = 0; j < segs; j++) {
            const x = Math.sin(angleStep * j) * baseRadius;
            const y = Math.cos(angleStep * j) * baseRadius;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI - angleStep * j);

            for (let i = 0; i < 15; i++) {
                const color = this.lineColors[(i + j) % this.lineColors.length];

                this.drawLine(lineLen * 3, 0, lineLen * 3, -(lineLen * 6), color);
                this.drawLine(0, -(lineLen * 3), lineLen * 3, -(lineLen * 5), color);
                this.drawLine(-lineLen, -(lineLen * 5), lineLen * 3, 0, color);

                const scale = 0.92 - (Math.sin(frameCount / 20) / 20);
                ctx.scale(scale, scale);
                ctx.rotate(0.02);
            }
            ctx.restore();
        }
    }

    drawCenterElements() {
        const { ctx, frameCount } = this;
        const cx = this.w / 2;
        const cy = this.h / 2;
        const outerR = this.minDim * 0.05 + Math.sin(frameCount / 50) * this.minDim * 0.016;
        this.drawCircle(cx, cy, outerR, this.hexToRgb('#FF69B4'), 0.7);  // pink ring
        const starSeg = 10;
        const starR   = this.minDim * 0.035;
        const angle   = Math.PI * 2 / starSeg;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(frameCount / 100);

        for (let i = 0; i < starSeg; i++) {
            const color = this.lineColors[i % this.lineColors.length];
            const x1 = Math.cos(angle * i) * starR;
            const y1 = Math.sin(angle * i) * starR;
            const x2 = Math.cos(angle * i) * (starR + this.minDim * 0.02);
            const y2 = Math.sin(angle * i) * (starR + this.minDim * 0.02);
            this.drawLine(x1, y1, x2, y2, color);
        }
        ctx.restore();

        const rgb = this.hexToRgb(this.lineColors[this.colorIndex]);
        this.drawCircle(cx, cy, this.innerRadius, rgb, 0.8);
        this.innerRadius += (this.targetRadius - this.innerRadius) * 0.05;
    }

    draw() {
        this.ctx.fillStyle = '#dfdad3';
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.ctx.save();
        this.ctx.translate(this.w / 2, this.h / 2);
        this.maruPattern();
        this.ctx.restore();
        this.drawCenterElements();
        this.frameCount++;
        requestAnimationFrame(() => this.draw());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new MaruPattern('canvas6');
});
