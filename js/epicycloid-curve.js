
   class EpicycloidCurve {
    constructor(canvasOrId) {
        this.canvas = (typeof canvasOrId === 'string')
            ? document.getElementById(canvasOrId)
            : canvasOrId;

        if (!this.canvas) {
            throw new Error('EpicycloidCurve → canvas not found.');
        }

        this.ctx    = this.canvas.getContext('2d');
        this.time   = 0;
        this.layers = [
            { radius1: 50, radius2: 20, offset: 0,              colorIndex: 0 },
            { radius1: 70, radius2: 30, offset: Math.PI / 3,    colorIndex: 1 },
            { radius1: 90, radius2: 40, offset: Math.PI / 6,    colorIndex: 2 }
        ];
        this.colors         = ['#FF69B4', '#4a90e2', '#f39c12'];
        this.speed          = 0.1;
        this.isSpeedBoosted = false;

        this.addClickListener();
        this.animate();
    }

    addClickListener() {
        this.canvas.addEventListener('click', () => {
            if (!this.isSpeedBoosted) {
                this.isSpeedBoosted = true;
                this.speed = 0.3;
                setTimeout(() => {
                    this.isSpeedBoosted = false;
                    this.speed = 0.1;
                }, 5000);
            }
        });
    }

    drawEpicycloid(layer) {
        const ctx       = this.ctx;
        const centerX   = this.canvas.width  / 2;
        const centerY   = this.canvas.height / 2;
        const { radius1, radius2, offset, colorIndex } = layer;
        const phase = this.time * 0.2;

        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
            const x = centerX +
                      (radius1 + radius2) * Math.cos(t + offset) -
                      radius2 * Math.cos(((radius1 + radius2) / radius2) * (t + offset + phase));
            const y = centerY +
                      (radius1 + radius2) * Math.sin(t + offset) -
                      radius2 * Math.sin(((radius1 + radius2) / radius2) * (t + offset + phase));
            t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.strokeStyle = this.colors[colorIndex];
        ctx.lineWidth   = 4;
        ctx.globalAlpha = 0.7;
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

        this.layers.forEach(layer => this.drawEpicycloid(layer));

        this.time += this.speed;
        if (Math.floor(this.time * 10) % 100 === 0) this.updateColors();

        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new EpicycloidCurve('canvas1');
});
