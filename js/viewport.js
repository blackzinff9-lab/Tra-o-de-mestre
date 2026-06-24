const vp = document.getElementById('viewport');
const workSurface = document.getElementById('work-surface');

function update() {
    workSurface.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotacao}deg)`;
    if (_dgAjuste) _atualizarBolinhasDegrade();
}
function clientParaCanvas(cx, cy) {
    const rad = rotacao * Math.PI / 180;
    const cos = Math.cos(-rad), sin = Math.sin(-rad);
    const dx = cx - posX, dy = cy - posY;
    return { x: (dx*cos - dy*sin)/scale, y: (dx*sin + dy*cos)/scale };
}
function canvasParaClient(cx, cy) {
    const rad = rotacao * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const rx = cx*scale, ry = cy*scale;
    return { x: posX + rx*cos - ry*sin, y: posY + rx*sin + ry*cos };
}
function _clampPos() {
    const cW = workSurface.offsetWidth, cH = workSurface.offsetHeight;
    const rad = rotacao * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const cantos = [{x:0,y:0},{x:cW,y:0},{x:cW,y:cH},{x:0,y:cH}];
    const tela = cantos.map(p => ({
        x: posX + (p.x*scale)*cos - (p.y*scale)*sin,
        y: posY + (p.x*scale)*sin + (p.y*scale)*cos
    }));
    const minX=Math.min(...tela.map(p=>p.x)), maxX=Math.max(...tela.map(p=>p.x));
    const minY=Math.min(...tela.map(p=>p.y)), maxY=Math.max(...tela.map(p=>p.y));
    const sw=window.innerWidth, sh=window.innerHeight, margem=120;
    if(maxX < margem) posX += margem - maxX;
    if(minX > sw - margem) posX -= minX - (sw - margem);
    if(maxY < margem) posY += margem - maxY;
    if(minY > sh - margem) posY -= minY - (sh - margem);
}
function resetView() { scale=0.8; posX=20; posY=80; rotacao=0; update(); _atualizarIndicadorRotacao(); }
function centralizarFolha() {
    scale=0.8;
    if(modoInfinito) {
        scale=1.0;
        posX=window.innerWidth/2 - 2000*scale;
        posY=window.innerHeight/2 - 2000*scale;
    } else {
        const wsW=workSurface.offsetWidth||800, wsH=workSurface.offsetHeight||1000;
        posX=window.innerWidth/2 - (wsW/2)*scale;
        posY=window.innerHeight/2 - (wsH/2)*scale;
    }
    update();
}
function _atualizarIndicadorRotacao() {
    const el=document.getElementById('indicador-rotacao');
    if(!el) return;
    const graus=((Math.round(rotacao)%360)+360)%360;
    el.textContent=`↻ ${graus}°`;
    el.style.display='block';
    if(_indicadorRotTimer) clearTimeout(_indicadorRotTimer);
    _indicadorRotTimer=setTimeout(()=>{ el.style.display='none'; },1500);
}
let _indicadorRotTimer=null;

// Handlers de touch (pinch e pan) – integrados no app.js via addEventListener
// O código original usava vp.addEventListener('touchstart', ...) etc.
// Estes serão movidos para app.js, mas expomos as funções auxiliares aqui.
