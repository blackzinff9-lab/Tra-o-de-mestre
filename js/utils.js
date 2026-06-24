function hexToRgb(hex) {
    return { r:parseInt(hex.slice(1,3),16), g:parseInt(hex.slice(3,5),16), b:parseInt(hex.slice(5,7),16) };
}
function corMais(hex, d) {
    const {r,g,b}=hexToRgb(hex);
    const c=v=>Math.min(255,Math.max(0,v+d)).toString(16).padStart(2,'0');
    return '#'+c(r)+c(g)+c(b);
}
function hexMid(h1,h2,t) {
    const r1=parseInt(h1.slice(1,3),16), g1=parseInt(h1.slice(3,5),16), b1=parseInt(h1.slice(5,7),16);
    const r2=parseInt(h2.slice(1,3),16), g2=parseInt(h2.slice(3,5),16), b2=parseInt(h2.slice(5,7),16);
    const r=Math.round(r1+(r2-r1)*t), g=Math.round(g1+(g2-g1)*t), b=Math.round(b1+(b2-b1)*t);
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function debounce(fn, delay) { let t; return (...args) => { clearTimeout(t); t=setTimeout(()=>fn(...args), delay); }; }
function lerp(a,b,t) { return { x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t }; }
function clamp(v,min,max) { return Math.min(max,Math.max(min,v)); }
function dist(a,b) { return Math.hypot(a.x-b.x, a.y-b.y); }
function corDist(c1,c2) {
    return Math.sqrt((c1.r-c2.r)**2 + (c1.g-c2.g)**2 + (c1.b-c2.b)**2);
}
function parseFillRgb(fillStr) {
    if(!fillStr) return null;
    const m=fillStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if(m) return {r:+m[1],g:+m[2],b:+m[3]};
    if(fillStr.startsWith('#')&&fillStr.length===7) return hexToRgb(fillStr);
    return null;
}
function hex2rgb(hex) { return {...hexToRgb(hex), a:255}; }
function pontosParaPath(pts) {
    if(pts.length<2) return '';
    let d=`M${pts[0].x} ${pts[0].y}`;
    const n=pts.length;
    const step=n>200?Math.floor(n/150):1;
    for(let i=step;i<n;i+=(i<n-2?step:1)) {
        const prev=pts[Math.max(0,i-step)], curr=pts[i];
        if(i<=step) d+=` L${curr.x} ${curr.y}`;
        else {
            const prev2=pts[Math.max(0,i-step*2)];
            const next=pts[Math.min(n-1,i+step)];
            const cpx=prev.x+(curr.x-prev2.x)/6;
            const cpy=prev.y+(curr.y-prev2.y)/6;
            const cp2x=curr.x-(next.x-prev.x)/6;
            const cp2y=curr.y-(next.y-prev.y)/6;
            d+=` C${cpx} ${cpy} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
        }
    }
    const last=pts[n-1];
    if(n>1) d+=` L${last.x} ${last.y}`;
    return d;
}
function buildPathD(pts, fechado) {
    const n=pts.length;
    if(n===0) return '';
    let d=`M ${pts[0].x} ${pts[0].y}`;
    for(let i=0;i<n-1;i++) {
        const curr=pts[i], next=pts[i+1];
        if(curr.tipo==='curva'||next.tipo==='curva') {
            const prev=curr.tipo==='ancora'?next:(i>0?pts[i-1]:curr);
            const far=next.tipo==='ancora'?curr:(i+2<n?pts[i+2]:next);
            d+=' '+catmullRomSegmento(prev,curr,next,far);
        } else d+=` L ${next.x} ${next.y}`;
    }
    if(fechado&&n>=3) {
        const last=pts[n-1], first=pts[0];
        if(last.tipo==='curva'||first.tipo==='curva') {
            const prev=last.tipo==='ancora'?first:pts[n-2];
            const far=first.tipo==='ancora'?last:(pts[1]||first);
            d+=' '+catmullRomSegmento(prev,last,first,far);
        } else d+=' Z';
    }
    return d;
}
function catmullRomSegmento(p0,p1,p2,p3) {
    const cp1x=p1.x+(p2.x-p0.x)/3, cp1y=p1.y+(p2.y-p0.y)/3;
    const cp2x=p2.x-(p3.x-p1.x)/3, cp2y=p2.y-(p3.y-p1.y)/3;
    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
}
function svgLine(x1,y1,x2,y2,cor,w,op,lc,dash) {
    return mkEl('line',{x1,y1,x2,y2,stroke:cor,'stroke-width':w,'stroke-opacity':op||1,'stroke-linecap':lc||'round','stroke-dasharray':dash||'','fill':'none'});
}
function svgCircle(cx,cy,r,fill,op) {
    return mkEl('circle',{cx,cy,r,fill,opacity:op||1});
}
function svgPath(d,cor,w,op,lc,dash,lj) {
    return mkEl('path',{d,stroke:cor,'stroke-width':w,'stroke-opacity':op||1,'stroke-linecap':lc||'round','stroke-linejoin':lj||'round','stroke-dasharray':dash||'','fill':'none'});
          }
