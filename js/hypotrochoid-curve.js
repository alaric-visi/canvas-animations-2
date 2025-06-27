
   class HypotrochoidCurve {
    constructor(canvasOrId) {
        this.canvas = (typeof canvasOrId === 'string')
            ? document.getElementById(canvasOrId)
            : canvasOrId;

        if (!this.canvas) {
            throw new Error('HypotrochoidCurve → canvas not found.');
        }

        this.ctx    = this.canvas.getContext('2d');
        this.time   = 0;
        this.layers = [
            { radius1: 100, radius2: 40, d: 30, colorIndex: 0 },
            { radius1:  70, radius2: 30, d: 20, colorIndex: 1 },
            { radius1: 120, radius2: 50, d: 40, colorIndex: 2 },
            { radius1:  90, radius2: 60, d: 50, colorIndex: 0 },
            { radius1:  50, radius2: 20, d: 15, colorIndex: 1 }
        ];
        this.colors         = ['#FF69B4', '#4a90e2', '#f39c12'];
        this.speed          = 0.05;
        this.isSpeedBoosted = false;

        this.addClickListener();
        this.animate();
    }

    addClickListener() {
        this.canvas.addEventListener('click', () => {
            if (!this.isSpeedBoosted) {
                this.isSpeedBoosted = true;
                this.speed = 0.15;
                setTimeout(() => {
                    this.isSpeedBoosted = false;
                    this.speed = 0.05;
                }, 5000);
            }
        });
    }

    drawHypotrochoid(layer) {
        const ctx       = this.ctx;
        const centerX   = this.canvas.width  / 2;
        const centerY   = this.canvas.height / 2;
        const { radius1, radius2, d, colorIndex } = layer;
        const phase = this.time * 0.7;

        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
            const x = centerX +
                      (radius1 - radius2) * Math.cos(t + phase) +
                      d * Math.cos(((radius1 - radius2) / radius2) * (t + phase));
            const y = centerY +
                      (radius1 - radius2) * Math.sin(t + phase) -
                      d * Math.sin(((radius1 - radius2) / radius2) * (t + phase));

            t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.strokeStyle = this.colors[colorIndex];
        ctx.lineWidth   = 3;
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    updateColors() {
        this.layers.forEach(layer => {
            layer.colorIndex = (layer.colorIndex + 1) % this.colors.length;
        });
    }

    animate() {
        const ctx = this.ctx;
        ctx.fillStyle = '#dfdad3';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.layers.forEach(layer => this.drawHypotrochoid(layer));
        this.time += this.speed;
        if (Math.floor(this.time * 10) % 100 === 0) this.updateColors();

        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new HypotrochoidCurve('canvas2');
});
