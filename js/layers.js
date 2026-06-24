function criarCamada(nome) {
    return { id:idCounter++, nome:nome||`Camada ${idCounter-1}`, opacidade:1, visivel:true, caminhos:[], livreHTML:'' };
}
function getCaminhos() { return camadas[camadaAtiva].caminhos; }

let _renderRAF = null;
function renderizarTodos() {
    if(_renderRAF) return;
    _renderRAF = requestAnimationFrame(() => { _renderRAF=null; _renderizarTodosImediato(); });
}
function _renderizarCamadaDesenho(cam) {
    if(!cam.visivel) return;
    if(cam.livreHTML) {
        const tmpSVG=document.createElementNS(NS,'svg');
        tmpSVG.innerHTML=cam.livreHTML;
        const g=document.createElementNS(NS,'g');
        g.style.opacity=cam.opacidade;
        [...tmpSVG.children].forEach(child => {
            if(child.tagName.toLowerCase()==='defs') livreLayer.appendChild(child.cloneNode(true));
            else g.appendChild(child.cloneNode(true));
        });
        livreLayer.appendChild(g);
    }
    cam.caminhos.forEach((c,ci) => {
        const globalIdx=camadas.indexOf(cam);
        const isAtivo=(globalIdx===camadaAtiva && ci===caminhoAtivo);
        if(isAtivo) return;
        const d=buildPathD(c.pontos, c.fechado);
        if(!d) return;
        const opExtra=caminhoAtivo>=0?0.25:cam.opacidade;
        const g=renderizarPathComPincel(d,c,opExtra);
        drawLayer.appendChild(g);
    });
}
function _renderizarTodosImediato() {
    drawLayer.innerHTML=''; livreLayer.innerHTML='';
    const totalCamadas=camadas.length;
    const fotoPos=(fotoOrdem<0||fotoOrdem>=totalCamadas)?totalCamadas:fotoOrdem;
    for(let i=totalCamadas-1;i>=fotoPos;i--) _renderizarCamadaDesenho(camadas[i]);
    svgArea.style.opacity=camadaFoto.visivel?camadaFoto.opacidade:0;
    _reposicionarSvgArea(fotoPos,totalCamadas);
    for(let i=fotoPos-1;i>=0;i--) _renderizarCamadaDesenho(camadas[i]);
}
function _reposicionarSvgArea(fotoPos,totalCamadas) {
    const ws=workSurface, drawL=document.getElementById('draw-layer'), livreL=document.getElementById('livre-layer');
    const textoL=document.getElementById('texto-layer');
    if(fotoPos>=totalCamadas) {
        if(svgArea.nextSibling!==drawL) ws.insertBefore(svgArea,drawL);
    } else if(fotoPos===0) {
        if(svgArea.nextSibling!==textoL && textoL) ws.insertBefore(svgArea,textoL);
        else if(!textoL && svgArea!==ws.lastElementChild) ws.appendChild(svgArea);
    } else {
        if(svgArea.nextSibling!==livreL) ws.insertBefore(svgArea,livreL);
    }
}

// Painel
function renderizarPainel() {
    const lista=document.getElementById('lista-camadas');
    lista.innerHTML='';
    const totalCamadas=camadas.length;
    const fotoPos=(fotoOrdem<0||fotoOrdem>=totalCamadas)?totalCamadas:fotoOrdem;
    const slots=[];
    for(let i=0;i<totalCamadas;i++) slots.push({tipo:'desenho', idx:i});
    slots.splice(fotoPos,0,{tipo:'foto'});
    slots.forEach((slot, slotIdx) => {
        if(slot.tipo==='foto') {
            const fotoDiv=document.createElement('div');
            fotoDiv.className='camada-item';
            fotoDiv.setAttribute('data-slot',slotIdx);
            fotoDiv.setAttribute('data-tipo','foto');
            fotoDiv.style.borderColor='#555';
            fotoDiv.style.opacity=camadaFoto.svgHTML?'1':'0.4';
            fotoDiv.innerHTML=`
                <div class="camada-row1">
                    <div style="font-size:20px;flex-shrink:0;">📷</div>
                    <span style="flex:1;font-size:11px;color:#aaa;">Foto vetorizada</span>
                    <span class="tag-foto-layer">FOTO</span>
                    <div class="camada-btns">
                        <button class="camada-btn foto-vis-btn" style="background:${camadaFoto.visivel?'#03dac6':'#444'}">${camadaFoto.visivel?'👁':'🚫'}</button>
                    </div>
                </div>
                <div class="camada-row2"><label>OPAC</label><input type="range" min="0" max="1" step="0.05" value="${camadaFoto.opacidade}" onclick="event.stopPropagation()"></div>`;
            fotoDiv.querySelector('.foto-vis-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleVisibilidadeFoto(e.currentTarget); });
            fotoDiv.querySelector('input[type=range]').addEventListener('input', (e) => { setOpacidadeFoto(e.target.value); });
            _adicionarDragCamada(fotoDiv, slotIdx, slots);
            lista.appendChild(fotoDiv);
        } else {
            const idx=slot.idx, cam=camadas[idx];
            const div=document.createElement('div');
            div.className='camada-item'+(idx===camadaAtiva?' ativa':'');
            const thumb=gerarThumbnail(cam);
            div.setAttribute('data-idx',idx);
            div.setAttribute('data-slot',slotIdx);
            div.innerHTML=`
                <div class="camada-row1">
                    <img class="camada-thumb" src="${thumb}">
                    <input class="camada-nome" value="${cam.nome}" onclick="event.stopPropagation()">
                    <div class="camada-btns">
                        <button class="camada-btn camada-btn-vis" style="background:${cam.visivel?'#03dac6':'#444'}">${cam.visivel?'👁':'🚫'}</button>
                        <button class="camada-btn camada-btn-dup" style="background:#555;">⧉</button>
                        <button class="camada-btn del camada-btn-del">✕</button>
                    </div>
                </div>
                <div class="camada-row2"><label>OPAC</label><input type="range" min="0" max="1" step="0.05" value="${cam.opacidade}" onclick="event.stopPropagation()"></div>`;
            const capturedIdx=idx;
            div.addEventListener('click', (e) => {
                if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON') return;
                if(caminhoAtivo>=0&&pontosPen.length>=2) salvarCaminhoAtivo();
                caminhoAtivo=-1; pontosPen=[]; pathFechado=false; penLayer.innerHTML='';
                document.getElementById('btn-confirmar-pen').style.display='none';
                camadaAtiva=capturedIdx;
                if(modoPen) { const caminhos=getCaminhos(); caminhoAtivo=caminhos.length; caminhos.push({pontos:[],fechado:false,stroke:document.getElementById('col-main').value,width:document.getElementById('brush-size').value,opacity:document.getElementById('brush-opacity').value,tipo:document.getElementById('pincel-tipo').value,pincel:pincelAtual}); pontosPen=caminhos[caminhoAtivo].pontos; }
                renderizarTodos(); renderizarPainel();
            });
            div.querySelector('.camada-btn-vis').addEventListener('click', (e) => { e.stopPropagation(); toggleVisibilidade(capturedIdx, e.currentTarget); });
            div.querySelector('.camada-btn-dup').addEventListener('click', (e) => { e.stopPropagation(); duplicarCamada(capturedIdx); });
            div.querySelector('.camada-btn-del').addEventListener('click', (e) => { e.stopPropagation(); deletarCamada(capturedIdx); });
            div.querySelector('.camada-nome').addEventListener('change', (e) => { renomearCamada(capturedIdx, e.target.value); });
            div.querySelector('input[type=range]').addEventListener('input', (e) => { setOpacidadeCamada(capturedIdx, e.target.value); });
            _adicionarDragCamada(div, slotIdx, slots);
            lista.appendChild(div);
        }
    });
}
function _adicionarDragCamada(div, slotIdx, slots) {
    let dragSlot=-1, dragStartY=0, dragAtivo=false;
    div.addEventListener('touchstart', (e) => {
        if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON') return;
        dragSlot=slotIdx; dragStartY=e.touches[0].clientY; dragAtivo=false;
    }, {passive:true});
    div.addEventListener('touchmove', (e) => {
        if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON') return;
        if(dragSlot<0) return;
        const dy=Math.abs(e.touches[0].clientY - dragStartY);
        if(dy>8) dragAtivo=true;
        if(!dragAtivo) return;
        e.stopPropagation(); e.preventDefault();
        div.classList.add('arrastando');
        const y=e.touches[0].clientY;
        document.querySelectorAll('.camada-item').forEach(el=>el.classList.remove('drag-over'));
        for(const el of [...document.querySelectorAll('.camada-item')]) {
            const r=el.getBoundingClientRect();
            if(y>=r.top && y<=r.bottom && el!==div) { el.classList.add('drag-over'); break; }
        }
    }, {passive:false});
    div.addEventListener('touchend', (e) => {
        if(!dragAtivo) { div.classList.remove('arrastando'); dragSlot=-1; return; }
        div.classList.remove('arrastando');
        const allDivs=[...document.querySelectorAll('.camada-item')];
        let targetSlot=-1;
        allDivs.forEach(el => { el.classList.remove('drag-over'); const ts=parseInt(el.getAttribute('data-slot')); const r=el.getBoundingClientRect(); const y=e.changedTouches[0].clientY; if(y>=r.top&&y<=r.bottom&&ts!==dragSlot) targetSlot=ts; });
        if(targetSlot>=0&&targetSlot!==dragSlot) _reordenarSlots(dragSlot,targetSlot,slots);
        dragSlot=-1; dragAtivo=false;
    }, {passive:true});
}
function _reordenarSlots(fromSlot,toSlot,slots) {
    const from=slots[fromSlot], to=slots[toSlot];
    if(from.tipo==='foto') {
        let newFotoOrdem=0;
        for(let i=0;i<toSlot&&i<slots.length;i++) if(slots[i].tipo==='desenho') newFotoOrdem++;
        fotoOrdem=newFotoOrdem;
    } else {
        const fromIdx=from.idx;
        let toIdx=to.idx!==undefined?to.idx:(to.tipo==='foto'?-1:0);
        if(to.tipo==='foto') { const totalCamadas=camadas.length; const fotoPos=(fotoOrdem<0||fotoOrdem>=totalCamadas)?totalCamadas:fotoOrdem; toIdx=fromSlot<toSlot?Math.min(fotoPos,totalCamadas-1):Math.max(0,fotoPos-1); }
        if(toIdx<0) toIdx=0; if(toIdx>=camadas.length) toIdx=camadas.length-1;
        if(fromIdx!==toIdx) {
            const item=camadas.splice(fromIdx,1)[0];
            camadas.splice(toIdx,0,item);
            if(camadaAtiva===fromIdx) camadaAtiva=toIdx;
            else if(camadaAtiva===toIdx) camadaAtiva=fromIdx;
            if(fotoOrdem>=0) {
                if(fromIdx<fotoOrdem&&toIdx>=fotoOrdem) fotoOrdem--;
                else if(fromIdx>fotoOrdem&&toIdx<=fotoOrdem) fotoOrdem++;
            }
        }
    }
    renderizarPainel(); renderizarTodos();
}
function novaCamada() { camadas.unshift(criarCamada(`Camada ${camadas.length+1}`)); camadaAtiva=0; renderizarPainel(); renderizarTodos(); }
function deletarCamada(idx) { if(camadas.length===1){alert('Precisa ter ao menos 1 camada.');return;} camadas.splice(idx,1); if(camadaAtiva>=camadas.length) camadaAtiva=camadas.length-1; caminhoAtivo=-1;pontosPen=[];penLayer.innerHTML=''; renderizarPainel();renderizarTodos(); }
function toggleVisibilidade(idx,btn){ camadas[idx].visivel=!camadas[idx].visivel; btn.style.background=camadas[idx].visivel?'#03dac6':'#444'; btn.textContent=camadas[idx].visivel?'👁':'🚫'; renderizarTodos(); }
function toggleVisibilidadeFoto(btn){ camadaFoto.visivel=!camadaFoto.visivel; btn.style.background=camadaFoto.visivel?'#03dac6':'#444'; btn.textContent=camadaFoto.visivel?'👁':'🚫'; renderizarTodos(); }
function setOpacidadeCamada(idx,val){ camadas[idx].opacidade=parseFloat(val); renderizarTodos(); }
function setOpacidadeFoto(val){ camadaFoto.opacidade=parseFloat(val); renderizarTodos(); }
function renomearCamada(idx,nome){ camadas[idx].nome=nome; }

let _duplicarSrcIdx=-1;
function duplicarCamada(idx) {
    _duplicarSrcIdx=idx;
    const cam=camadas[idx];
    if(!cam) return;
    const pincelAtualCam=cam.caminhos.length>0?(cam.caminhos[0].pincel||'normal'):'normal';
    document.querySelectorAll('.dup-pincel-btn').forEach(b=>b.classList.toggle('ativo',b.dataset.pincel===pincelAtualCam));
    document.getElementById('modal-duplicar').classList.add('aberto');
}
function confirmarDuplicar(trocarPincel) {
    document.getElementById('modal-duplicar').classList.remove('aberto');
    if(_duplicarSrcIdx<0) return;
    const src=camadas[_duplicarSrcIdx];
    if(!src) return;
    const novaCam=JSON.parse(JSON.stringify(src));
    novaCam.id=idCounter++; novaCam.nome=src.nome+' (cópia)';
    if(trocarPincel) { const btnAtivo=document.querySelector('.dup-pincel-btn.ativo'); const novoPincel=btnAtivo?btnAtivo.dataset.pincel:'normal'; novaCam.caminhos.forEach(c=>{c.pincel=novoPincel;}); }
    camadas.splice(_duplicarSrcIdx,0,novaCam);
    camadaAtiva=_duplicarSrcIdx; _duplicarSrcIdx=-1;
    salvarHistorico(); renderizarPainel(); renderizarTodos();
    mostrarNotificacao('⧉ Camada duplicada!');
}
function fecharModalDuplicar(){ document.getElementById('modal-duplicar').classList.remove('aberto'); _duplicarSrcIdx=-1; }
function selecionarPincelDup(pincel,el){ document.querySelectorAll('.dup-pincel-btn').forEach(b=>b.classList.remove('ativo')); el.classList.add('ativo'); }

function gerarThumbnail(cam) {
    const tc=document.getElementById('thumb-canvas');
    const ctx=tc.getContext('2d');
    ctx.clearRect(0,0,tc.width,tc.height);
    ctx.fillStyle='white'; ctx.fillRect(0,0,tc.width,tc.height);
    if(cam.caminhos.length===0) return tc.toDataURL();
    const W=workSurface.offsetWidth||800, H=workSurface.offsetHeight||1000;
    const sx=tc.width/W, sy=tc.height/H, s=Math.min(sx,sy);
    cam.caminhos.forEach(c=>{ if(c.pontos.length<2)return; ctx.beginPath(); ctx.strokeStyle=c.stroke||'#000'; ctx.lineWidth=Math.max(1,c.width*s); ctx.globalAlpha=parseFloat(c.opacity)??1; ctx.moveTo(c.pontos[0].x*s,c.pontos[0].y*s); c.pontos.forEach(p=>ctx.lineTo(p.x*s,p.y*s)); if(c.fechado)ctx.closePath(); ctx.stroke(); });
    ctx.globalAlpha=1;
    return tc.toDataURL();
              }
