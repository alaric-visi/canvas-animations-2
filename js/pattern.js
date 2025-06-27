
   class InteractivePattern {
    constructor(canvasOrId) {
        this.canvas = (typeof canvasOrId === 'string')
            ? document.getElementById(canvasOrId)
            : canvasOrId;

        if (!this.canvas) {
            throw new Error('InteractivePattern → canvas not found.');
        }

        this.ctx = this.canvas.getContext('2d');
        this.w  = this.canvas.width;
        this.h  = this.canvas.height;
        this.halfW = this.w / 2;
        this.halfH = this.h / 2;
        this.cellSize = 10;
        this.t = 0;
        this.mouse = {
            x: this.halfW,
            y: this.halfH,
            isClicking: false,
            distortion: 1
        };
        this.colors = { orange: '#FD8739', pink: '#FF69B4', blue: '#4A90E2' };
        this.addEventListeners();
        this.draw();
    }

    addEventListeners() {
        this.canvas.addEventListener('mousemove', e => {
            const r = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - r.left;
            this.mouse.y = e.clientY - r.top;
        });
        this.canvas.addEventListener('mousedown', () => {
            this.mouse.isClicking = true;
            this.mouse.distortion = 2;
        });
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.isClicking = false;
            this.mouse.distortion = 1;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = this.halfW;
            this.mouse.y = this.halfH;
            this.mouse.isClicking = false;
            this.mouse.distortion = 1;
        });
    }

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(223,218,211,0.1)';
        ctx.fillRect(0, 0, this.w, this.h);
        for (let gx = -this.halfW; gx < this.halfW; gx += this.cellSize) {
            for (let gy = -this.halfH; gy < this.halfH; gy += this.cellSize) {

                const U = Math.log(gx + this.halfW + 1) +
                          (this.mouse.x - this.halfW) / this.w;
                const V = Math.log(gy + this.halfH + 1) +
                          (this.mouse.y - this.halfH) / this.h;

                const dx = gx - (U * V - V * V) * this.mouse.distortion;
                const dy = gy - (-this.t / 2 * U * V) * this.mouse.distortion;
                const D  = Math.hypot(dx, dy);
                const mdx = gx + this.halfW - this.mouse.x;
                const mdy = gy + this.halfH - this.mouse.y;
                const mouseD = Math.hypot(mdx, mdy);
                const diag  = Math.hypot(this.halfW, this.halfH);
                const I = Math.abs(Math.cos(D)) *
                          (1 + Math.max(0, 1 - mouseD / diag) * 0.5);
                const angle = Math.atan2(gy - (this.halfH - this.mouse.y),
                                         gx - (this.halfW - this.mouse.x));
                const phase = (angle + Math.PI + this.t *
                              (this.mouse.isClicking ? 2 : 1) * 0.05) /
                              (Math.PI * 2);
                const seg = phase % 1;
                let colour = this.colors.blue;
                if (seg < 1/3)       colour = this.colors.orange;
                else if (seg < 2/3)  colour = this.colors.pink;
                ctx.beginPath();
                ctx.fillStyle = colour;
                ctx.globalAlpha = I;
                const size = I * 5;
                ctx.arc(gx + this.halfW, gy + this.halfH, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        this.t += 0.03;
        requestAnimationFrame(() => this.draw());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new InteractivePattern('canvas5');
});
