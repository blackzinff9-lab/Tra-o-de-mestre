function salvarHistorico() {
    if(camadas[camadaAtiva]) camadas[camadaAtiva].livreHTML=livreLayer.innerHTML;
    historico.push(JSON.stringify({
        camadas: camadas.map(c=>({...c, caminhos:c.caminhos.map(p=>({...p, pontos:[...p.pontos]}))})),
        camadaAtivaIdx: camadaAtiva,
        fotoOrdem: fotoOrdem,
        texto: document.getElementById('texto-layer').innerHTML
    }));
    historicoFuturo=[];
    if(historico.length>30) historico.shift();
}
function desfazerPen() {
    if(modoBorracha&&pontosBorracha.length>0){ pontosBorracha.pop(); renderizarBorracha(); return; }
    if((modoPen||modoEditar)&&pontosPen.length>0){ historicoFuturo.push(JSON.stringify({pontos:[...pontosPen.map(p=>({...p}))], fechado:pathFechado})); pontosPen.pop(); if(pathFechado){pathFechado=false;document.getElementById('btnFechar').style.background='#333';} renderizarPen(); return; }
    if(historico.length===0) return;
    if(camadas[camadaAtiva]) camadas[camadaAtiva].livreHTML=livreLayer.innerHTML;
    historicoFuturo.push(JSON.stringify({
        camadas: camadas.map(c=>({...c, caminhos:c.caminhos.map(p=>({...p, pontos:[...p.pontos]}))})),
        camadaAtivaIdx: camadaAtiva,
        texto: document.getElementById('texto-layer').innerHTML
    }));
    const snap=JSON.parse(historico.pop());
    camadas=snap.camadas!==undefined?snap.camadas:snap;
    if(snap.camadaAtivaIdx!==undefined) camadaAtiva=snap.camadaAtivaIdx;
    if(snap.fotoOrdem!==undefined) fotoOrdem=snap.fotoOrdem;
    if(snap.texto!==undefined) document.getElementById('texto-layer').innerHTML=snap.texto;
    if(snap.livre!==undefined&&camadas[camadaAtiva]) camadas[camadaAtiva].livreHTML=snap.livre;
    caminhoAtivo=-1; pontosPen=[]; pathFechado=false; penLayer.innerHTML='';
    document.getElementById('btnFechar').style.background='#333';
    document.getElementById('btn-confirmar-pen').style.display='none';
    renderizarTodos(); if(painelAberto) renderizarPainel();
}
function refazerPen() {
    if(historicoFuturo.length===0) return;
    const snapshot=JSON.parse(historicoFuturo.pop());
    if(snapshot.pontos!==undefined) {
        pontosPen=snapshot.pontos; pathFechado=snapshot.fechado;
        document.getElementById('btnFechar').style.background=pathFechado?'#03dac6':'#333';
        renderizarPen();
    } else {
        if(camadas[camadaAtiva]) camadas[camadaAtiva].livreHTML=livreLayer.innerHTML;
        historico.push(JSON.stringify({
            camadas: camadas.map(c=>({...c, caminhos:c.caminhos.map(p=>({...p, pontos:[...p.pontos]}))})),
            camadaAtivaIdx: camadaAtiva,
            texto: document.getElementById('texto-layer').innerHTML
        }));
        camadas=snapshot.camadas!==undefined?snapshot.camadas:snapshot;
        if(snapshot.camadaAtivaIdx!==undefined) camadaAtiva=snapshot.camadaAtivaIdx;
        if(snapshot.fotoOrdem!==undefined) fotoOrdem=snapshot.fotoOrdem;
        if(snapshot.texto!==undefined) document.getElementById('texto-layer').innerHTML=snapshot.texto;
        if(snapshot.livre!==undefined&&camadas[camadaAtiva]) camadas[camadaAtiva].livreHTML=snapshot.livre;
        caminhoAtivo=-1; pontosPen=[]; pathFechado=false; penLayer.innerHTML='';
        document.getElementById('btnFechar').style.background='#333';
        document.getElementById('btn-confirmar-pen').style.display='none';
        renderizarTodos(); if(painelAberto) renderizarPainel();
    }
}
function atualizarListaHistorico() {
    const lista=document.getElementById('hist-lista');
    lista.innerHTML='';
    if(historico.length===0){ lista.innerHTML='<div style="color:#555;font-size:11px;text-align:center;padding:20px;">Nenhuma ação ainda</div>'; return; }
    const cur=document.createElement('div'); cur.className='hist-item atual'; cur.textContent='● Estado atual'; lista.appendChild(cur);
    [...historico].reverse().forEach((snap,i)=>{
        const div=document.createElement('div');
        div.className='hist-item';
        div.textContent=`Ação ${historico.length-i}`;
        div.addEventListener('touchstart',(e)=>{ e.stopPropagation(); const snapObj=JSON.parse(snap); if(snapObj.camadas!==undefined) camadas=snapObj.camadas; else camadas=snapObj; caminhoAtivo=-1; pontosPen=[]; pathFechado=false; penLayer.innerHTML=''; document.getElementById('btn-confirmar-pen').style.display='none'; renderizarTodos(); if(painelAberto) renderizarPainel(); atualizarListaHistorico(); },{passive:true});
        lista.appendChild(div);
    });
}
