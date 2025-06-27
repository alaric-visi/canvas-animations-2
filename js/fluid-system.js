
   class InteractiveFluidSystem {
    constructor(canvasOrId) {
        this.canvas = (typeof canvasOrId === 'string')
            ? document.getElementById(canvasOrId)
            : canvasOrId;

        if (!this.canvas) {
            throw new Error('InteractiveFluidSystem → canvas not found.');
        }

        this.ctx   = this.canvas.getContext('2d');
        this.nodes = [];
        this.attractors = [];
        this.mouse = {
            x: 0, y: 0,
            radius: 140,
            isPressed: false,
            forceMultiplier: 2
        };

        this.setup();
    }

    setup() {
        for (let i = 0; i < 3; i++) {
            this.attractors.push(new Attractor(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }

        for (let i = 0; i < 80; i++) {
            this.nodes.push(new Node(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }

        this.canvas.addEventListener('mousemove',  e => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', () => this.handleMouseDown());
        this.canvas.addEventListener('mouseup',   () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave',() => this.handleMouseLeave());

        this.animate();
    }

    handleMouseMove(e){
        const r = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - r.left;
        this.mouse.y = e.clientY - r.top;
    }
    handleMouseDown(){ this.mouse.isPressed = true;  this.mouse.forceMultiplier = 5; }
    handleMouseUp()  { this.mouse.isPressed = false; this.mouse.forceMultiplier = 2; }
    handleMouseLeave(){ this.handleMouseUp(); }

    applyAttractorForces(node){
        this.attractors.forEach(a=>{
            const dx = a.x - node.x, dy = a.y - node.y;
            const dist = Math.hypot(dx,dy);
            if(dist < 300){
                const f = (300 - dist) / 300 * 1.2;
                node.vx += dx / dist * f;
                node.vy += dy / dist * f;
            }
        });
    }
    applyMouseInteraction(node){
        const dx = this.mouse.x - node.x, dy = this.mouse.y - node.y;
        const dist = Math.hypot(dx,dy);
        if(dist < this.mouse.radius){
            const f = (this.mouse.radius - dist) / this.mouse.radius * this.mouse.forceMultiplier;
            if(this.mouse.isPressed){
                node.vx += dx / dist * f * 2;
                node.vy += dy / dist * f * 2;
            }else{
                node.vx -= dx / dist * f;
                node.vy -= dy / dist * f;
            }
        }
    }
    updateNode(node){
        node.vx += Math.sin(node.x * 0.01) * 0.15;
        node.vy += Math.cos(node.y * 0.01) * 0.15;
        node.vx += (Math.random() - 0.5) * 0.3;
        node.vy += (Math.random() - 0.5) * 0.3;

        node.vx *= 0.92;
        node.vy *= 0.92;

        node.x = (node.x + node.vx + this.canvas.width)  % this.canvas.width;
        node.y = (node.y + node.vy + this.canvas.height) % this.canvas.height;
    }

    drawNode(node){
        const g = this.ctx.createRadialGradient(node.x,node.y,0,node.x,node.y,node.radius*2.5);
        g.addColorStop(0,'rgba(255,140,0,1)');
        g.addColorStop(1,'rgba(255,105,180,0.8)');

        this.ctx.beginPath();
        this.ctx.arc(node.x,node.y,node.radius*1.8,0,Math.PI*2);
        this.ctx.fillStyle = g;
        this.ctx.fill();
    }
    createConnections(){
        for(let i=0;i<this.nodes.length;i++){
            for(let j=i+1;j<this.nodes.length;j++){
                const n1=this.nodes[i], n2=this.nodes[j];
                const dx=n2.x-n1.x, dy=n2.y-n1.y;
                const dist=Math.hypot(dx,dy);
                if(dist<100){
                    const a=1-dist/100;
                    this.ctx.beginPath();
                    this.ctx.moveTo(n1.x,n1.y); this.ctx.lineTo(n2.x,n2.y);
                    this.ctx.strokeStyle = i%2===0 ?
                        `rgba(255,140,0,${a*0.8})` :
                        `rgba(255,105,180,${a*0.8})`;
                    this.ctx.lineWidth=2.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate(){
        this.ctx.globalCompositeOperation='source-over';
        this.ctx.fillStyle='#dfdad3';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        this.attractors.forEach(a=>a.move(this.canvas));

        this.nodes.forEach(n=>{
            this.applyAttractorForces(n);
            this.applyMouseInteraction(n);
            this.updateNode(n);
            this.drawNode(n);
        });

        this.createConnections();
        requestAnimationFrame(()=>this.animate());
    }
}

class Node{
    constructor(x,y){
        this.x=x;this.y=y;
        this.vx=(Math.random()-0.5)*4;
        this.vy=(Math.random()-0.5)*4;
        this.radius=Math.random()*5+4;
    }
}
class Attractor{
    constructor(x,y){
        this.x=x;this.y=y;
        this.vx=(Math.random()-0.5)*3;
        this.vy=(Math.random()-0.5)*3;
    }
    move(canvas){
        this.x+=this.vx; this.y+=this.vy;
        if(this.x<0||this.x>canvas.width){
            this.vx*=-1; this.vx+=(Math.random()-0.5)*0.5;
        }
        if(this.y<0||this.y>canvas.height){
            this.vy*=-1; this.vy+=(Math.random()-0.5)*0.5;
        }
    }
}

window.addEventListener('DOMContentLoaded',()=>{
    new InteractiveFluidSystem('canvas3');
});
