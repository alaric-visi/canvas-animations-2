
class RippleAttractor{
    constructor(x,y){
        this.x=x;this.y=y;
        this.vx=(Math.random()-0.5)*0.1;
        this.vy=(Math.random()-0.5)*0.1;
    }
    move(c){
        this.x+=this.vx; this.y+=this.vy;
        if(this.x<0||this.x>c.width)  this.vx*=-1;
        if(this.y<0||this.y>c.height) this.vy*=-1;
    }
}

class RippleNode{
    constructor(x,y){
        this.x=x;this.y=y;
        this.vx=(Math.random()-0.5)*0.2;
        this.vy=(Math.random()-0.5)*0.2;
        this.size=Math.random()*20+15;
        this.rotation=Math.random()*Math.PI*2;
    }
    updatePosition(c){
        this.x+=this.vx; this.y+=this.vy;
        if(this.x<0||this.x>c.width)  this.vx*=-1;
        if(this.y<0||this.y>c.height) this.vy*=-1;
        this.vx*=0.97; this.vy*=0.97;
    }
}

class RadialRippleSystem{
    constructor(canvasOrId){
        this.canvas = (typeof canvasOrId==='string')
            ? document.getElementById(canvasOrId)
            : canvasOrId;

        if(!this.canvas){
            throw new Error('RadialRippleSystem → canvas not found.');
        }

        this.ctx  = this.canvas.getContext('2d');
        this.nodes=[]; this.attractors=[]; this.ripples=[];
        this.mouse={x:0,y:0,radius:300,isPressed:false,forceMultiplier:0.5};

        this.init();
    }

    init(){
        for(let i=0;i<5;i++){
            this.attractors.push(new RippleAttractor(
                Math.random()*this.canvas.width,
                Math.random()*this.canvas.height
            ));
        }
        for(let i=0;i<25;i++){
            this.nodes.push(new RippleNode(
                Math.random()*this.canvas.width,
                Math.random()*this.canvas.height
            ));
        }

        this.canvas.addEventListener('mousemove',e=>this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown',()=>this.mouse.isPressed=true);
        this.canvas.addEventListener('mouseup',  ()=>this.mouse.isPressed=false);
        this.canvas.addEventListener('mouseleave',()=>this.mouse.isPressed=false);
        this.canvas.addEventListener('click',e=>this.createRipple(e));

        this.animate();
    }

    handleMouseMove(e){
        const r=this.canvas.getBoundingClientRect();
        this.mouse.x=e.clientX-r.left;
        this.mouse.y=e.clientY-r.top;
    }
    createRipple(e){
        const r=this.canvas.getBoundingClientRect();
        this.ripples.push({x:e.clientX-r.left,y:e.clientY-r.top,radius:0,alpha:1});
    }

    applyAttractorForces(node){
        this.attractors.forEach(a=>{
            const dx=a.x-node.x, dy=a.y-node.y, d=Math.hypot(dx,dy);
            if(d<400){
                const f=(400-d)/400*0.1;
                node.vx += dx/d*f;
                node.vy += dy/d*f;
            }
        });
    }
    applyMouseForces(node){
        const dx=this.mouse.x-node.x, dy=this.mouse.y-node.y, d=Math.hypot(dx,dy);
        if(d<this.mouse.radius){
            const f=(this.mouse.radius-d)/this.mouse.radius*this.mouse.forceMultiplier;
            node.vx += dx/d*f;
            node.vy += dy/d*f;
        }
    }
    applyRepulsionForces(node){
        this.nodes.forEach(other=>{
            if(node===other) return;
            const dx=node.x-other.x, dy=node.y-other.y, d=Math.hypot(dx,dy);
            if(d<100){
                const f=(100-d)/100*0.2;
                node.vx += dx/d*f;
                node.vy += dy/d*f;
            }
        });
    }

    drawTriangle(node){
        const s=node.size, h=s/2, ctx=this.ctx;
        ctx.save();
        ctx.translate(node.x,node.y);
        ctx.rotate(node.rotation);
        ctx.beginPath();
        ctx.moveTo(0,-h);
        ctx.lineTo(h,h);
        ctx.lineTo(-h,h);
        ctx.closePath();
        ctx.fillStyle='rgba(74,144,226,0.4)';
        ctx.fill();
        ctx.restore();
    }
    createConnections(){
        this.nodes.forEach((n1,i)=>{
            for(let j=i+1;j<this.nodes.length;j++){
                const n2=this.nodes[j], dx=n2.x-n1.x, dy=n2.y-n1.y, d=Math.hypot(dx,dy);
                if(d<250){
                    const a=1-d/250;
                    this.ctx.beginPath();
                    this.ctx.moveTo(n1.x,n1.y);
                    this.ctx.lineTo(n2.x,n2.y);
                    this.ctx.strokeStyle=`rgba(255,69,0,${a*0.4})`;
                    this.ctx.lineWidth=2;
                    this.ctx.stroke();
                }
            }
        });
    }
    updateAndDrawRipples(){
        this.ripples=this.ripples.filter(r=>r.alpha>0);
        this.ripples.forEach(r=>{
            r.radius+=1; r.alpha-=0.002;
            const g=this.ctx.createRadialGradient(r.x,r.y,r.radius/3,r.x,r.y,r.radius);
            g.addColorStop(0,`rgba(255,69,0,${r.alpha})`);
            g.addColorStop(1,'rgba(255,105,180,0)');
            this.ctx.beginPath();
            this.ctx.arc(r.x,r.y,r.radius,0,Math.PI*2);
            this.ctx.fillStyle=g;
            this.ctx.fill();
        });
    }

    animate(){
        this.ctx.fillStyle='#dfdad3';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.attractors.forEach(a=>a.move(this.canvas));
        this.nodes.forEach(n=>{
            this.applyAttractorForces(n);
            this.applyMouseForces(n);
            this.applyRepulsionForces(n);
            n.updatePosition(this.canvas);
            this.drawTriangle(n);
        });
        this.createConnections();
        this.updateAndDrawRipples();

        requestAnimationFrame(()=>this.animate());
    }
}

window.addEventListener('DOMContentLoaded',()=>{
    new RadialRippleSystem('canvas4');
});
