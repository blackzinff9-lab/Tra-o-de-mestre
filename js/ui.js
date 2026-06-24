const _todosPopups=['popup-desenho','popup-pinceis-wrap','popup-vista','popup-projeto'];
function fecharTodosPopups() { _todosPopups.forEach(id=>{const el=document.getElementById(id); if(el)el.classList.remove('aberto');}); document.getElementById('popup-overlay').classList.remove('ativo'); }
function togglePopup(id) { const el=document.getElementById(id); if(!el)return; const jaAberto=el.classList.contains('aberto'); fecharTodosPopups(); if(!jaAberto){el.classList.add('aberto'); document.getElementById('popup-overlay').classList.add('ativo');} }
document.getElementById('popup-overlay').addEventListener('touchstart',(e)=>{e.stopPropagation(); fecharTodosPopups();},{passive:true});

function mostrarNotificacao(msg) {
    const el=document.getElementById('notificacao');
    if(!el)return;
    el.classList.remove('saindo');
    el.style.display='block'; el.style.opacity='1'; el.textContent=msg;
    clearTimeout(el._tmTimer);
    el._tmTimer=setTimeout(()=>{ el.classList.add('saindo'); setTimeout(()=>{el.style.display='none';el.classList.remove('saindo');},320); },2300);
}
function abrirModalSalvar(){ document.getElementById('modal-salvar').classList.add('aberto'); }
function fecharModalSalvar(){ document.getElementById('modal-salvar').classList.remove('aberto'); document.getElementById('lista-projetos').style.display='none'; }
function togglePainel(){ painelAberto=!painelAberto; document.getElementById('painel-camadas').classList.toggle('aberto',painelAberto); if(painelAberto) renderizarPainel(); }
function toggleHistorico(){ painelHistoricoAberto=!painelHistoricoAberto; document.getElementById('painel-historico').classList.toggle('aberto',painelHistoricoAberto); if(painelHistoricoAberto) atualizarListaHistorico(); }

function renderizarTelaInicial() {
    const lista=JSON.parse(localStorage.getItem('tm_projetos')||'[]');
    const el=document.getElementById('projetos-lista-inicial');
    if(lista.length===0){ el.innerHTML='<div class="proj-sem">Nenhum projeto salvo ainda.<br>Crie um novo! ✏️</div>'; return; }
    el.innerHTML=[...lista].reverse().map((p,i)=>{ const idxReal=lista.length-1-i; return `<div class="proj-item-inicial" onclick="carregarProjetoInicial(${idxReal})"><div style="font-size:24px">📁</div><div class="proj-info"><div class="proj-nome">${p.nome}</div><div class="proj-data">${p.data}</div></div><button class="proj-del" onclick="event.stopPropagation();deletarProjetoInicial(${idxReal})">✕</button></div>`; }).join('');
}

function abrirModalNovoProjeto() {
    tipoNovoProjeto='finito'; gradeAtiva=false; gradeTamanho=20;
    document.getElementById('card-finito').classList.add('ativo');
    document.getElementById('card-infinito').classList.remove('ativo');
    document.getElementById('chk-grade').checked=false;
    document.getElementById('grade-size-wrap').style.display='none';
    ['20','40','80','100'].forEach(s=>document.getElementById('gs-'+s).classList.toggle('ativo',s==='20'));
    document.getElementById('modal-novo-projeto').classList.add('aberto');
}
function novoProjeto(tipo='finito') {
    modoInfinito=(tipo==='infinito');
    camadas=[criarCamada('Camada 1')]; camadaAtiva=0; caminhoAtivo=-1;
    pontosPen=[]; pathFechado=false; penLayer.innerHTML=''; drawLayer.innerHTML='';
    svgArea.innerHTML=''; livreLayer.innerHTML=''; document.getElementById('texto-layer').innerHTML='';
    camadaFoto={opacidade:1,visivel:true,svgHTML:''}; fotoOrdem=-1;
    historico=[]; historicoFuturo=[]; modoPen=false; modoEditar=false; modoLivre=false; modoBorracha=false;
    _esconderBolinhasDegrade(); _esconderBolinhasTxtDg(); modoDegrade=false; degradeStart=null; _dgPrevReset();
    document.getElementById('btnDegrade').style.background='#e74c3c';
    document.getElementById('degrade-preview-layer').innerHTML='';
    const bFerr=document.getElementById('btnFerramentas'), bEdit=document.getElementById('btnEditar'), bFech=document.getElementById('btnFechar');
    if(bFerr){bFerr.textContent='🖊 PEN ▾';bFerr.style.background='#ff00ff';}
    if(bEdit)bEdit.style.background='#333';
    if(bFech)bFech.style.background='#333';
    aplicarModoInfinito(modoInfinito);
    renderizarGrade();
    abrirEditor();
}
function abrirEditor(){ _editorAberto=true; centralizarFolha(); const tela=document.getElementById('tela-inicial'); tela.style.opacity='0'; tela.style.transition='opacity 0.4s'; setTimeout(()=>{tela.style.display='none'; centralizarFolha();},450); }
function voltarInicio(){ _editorAberto=false; camadas=[criarCamada('Camada 1')]; camadaAtiva=0; caminhoAtivo=-1; pontosPen=[]; pathFechado=false; penLayer.innerHTML=''; drawLayer.innerHTML=''; livreLayer.innerHTML=''; document.getElementById('texto-layer').innerHTML=''; svgArea.innerHTML=''; camadaFoto={opacidade:1,visivel:true,svgHTML:''}; fotoOrdem=-1; historico=[]; historicoFuturo=[]; modoPen=false; modoEditar=false; modoLivre=false; modoBorracha=false; _esconderBolinhasDegrade(); _esconderBolinhasTxtDg(); modoDegrade=false; degradeStart=null; _dgPrevReset(); document.getElementById('btnDegrade').style.background='#e74c3c'; document.getElementById('degrade-preview-layer').innerHTML=''; const bFerr=document.getElementById('btnFerramentas'); const bEdit=document.getElementById('btnEditar'); const bFech=document.getElementById('btnFechar'); if(bFerr){bFerr.textContent='🖊 PEN ▾';bFerr.style.background='#ff00ff';} if(bEdit)bEdit.style.background='#333'; if(bFech)bFech.style.background='#333'; const tela=document.getElementById('tela-inicial'); tela.style.display='flex'; tela.style.opacity='0'; setTimeout(()=>{tela.style.transition='opacity 0.4s';tela.style.opacity='1';},10); renderizarTelaInicial(); }

function abrirManual(){ document.getElementById('modal-manual').style.display='block'; irSecao(0); }
function fecharManual(){ document.getElementById('modal-manual').style.display='none'; }
function irSecao(idx){ const total=6; for(let i=0;i<total;i++){const sec=document.getElementById('msec-'+i); if(sec)sec.style.display=i===idx?'block':'none';} document.querySelectorAll('.manual-nav-btn').forEach((btn,i)=>{btn.classList.toggle('ativa',i===idx);}); document.getElementById('modal-manual').scrollTo({top:0,behavior:'smooth'}); }

function abrirPerfil(){ /* preenche e abre */ }
function fecharPerfil(){ document.getElementById('modal-perfil').classList.remove('aberto'); }
function setTema(t,salvar=true){ configUsuario.tema=t; ['escuro','claro'].forEach(id=>{const el=document.getElementById('tema-'+id); if(el)el.classList.toggle('ativo',id===t);}); if(salvar)aplicarConfig(); }

function aplicarConfig(){ /* aplica tema, accent, avatar */ }
const INF_SIZE=50000;
function aplicarModoInfinito(ativo){ const vp=document.getElementById('viewport'); const ws=workSurface; const ind=document.getElementById('indicador-infinito'); if(ativo){ws.style.width=INF_SIZE+'px';ws.style.height=INF_SIZE+'px';ws.style.background='white';ws.style.boxShadow='none';vp.classList.add('infinito');ind.style.display='block';scale=0.8;posX=20;posY=80;}else{ws.style.background='white';ws.style.boxShadow='0 0 20px rgba(0,0,0,0.5)';vp.classList.remove('infinito');ind.style.display='none';const folha=(configUsuario?.folha||'800x1000').split('x');ws.style.width=folha[0]+'px';ws.style.height=folha[1]+'px';scale=0.8;posX=20;posY=80;}update(); }
function renderizarGrade(){ const layer=document.getElementById('grade-layer'); layer.innerHTML=''; if(!gradeAtiva)return; const W=workSurface.offsetWidth||800,H=workSurface.offsetHeight||1000,tam=gradeTamanho,cor='rgba(0,0,0,0.08)',corForte='rgba(0,0,0,0.15)'; const defs=document.createElementNS(NS,'defs'); const pat=document.createElementNS(NS,'pattern'); pat.setAttribute('id','grade-pat'); pat.setAttribute('width',tam);pat.setAttribute('height',tam);pat.setAttribute('patternUnits','userSpaceOnUse'); const l1=document.createElementNS(NS,'path'); l1.setAttribute('d',`M ${tam} 0 L 0 0 0 ${tam}`); l1.setAttribute('fill','none');l1.setAttribute('stroke',cor);l1.setAttribute('stroke-width','0.5'); pat.appendChild(l1); defs.appendChild(pat); layer.appendChild(defs); const rect=document.createElementNS(NS,'rect'); rect.setAttribute('width','100%');rect.setAttribute('height','100%');rect.setAttribute('fill','url(#grade-pat)'); layer.appendChild(rect); const patG=document.createElementNS(NS,'pattern'); patG.setAttribute('id','grade-pat-grande'); patG.setAttribute('width',tam*5);patG.setAttribute('height',tam*5);patG.setAttribute('patternUnits','userSpaceOnUse'); const l2=document.createElementNS(NS,'path'); l2.setAttribute('d',`M ${tam*5} 0 L 0 0 0 ${tam*5}`); l2.setAttribute('fill','none');l2.setAttribute('stroke',corForte);l2.setAttribute('stroke-width','0.8'); patG.appendChild(l2); defs.appendChild(patG); const rectG=document.createElementNS(NS,'rect'); rectG.setAttribute('width','100%');rectG.setAttribute('height','100%');rectG.setAttribute('fill','url(#grade-pat-grande)'); layer.appendChild(rectG); }

function toggleRegua(){ reguaAtiva=!reguaAtiva; document.getElementById('btnRegua').style.background=reguaAtiva?'#03dac6':'#333'; document.getElementById('regua-h').style.display=reguaAtiva?'block':'none'; document.getElementById('regua-v').style.display=reguaAtiva?'block':'none'; document.getElementById('guias-layer').style.display=reguaAtiva?'block':'none'; if(reguaAtiva)update(); if(reguaAtiva){desenharReguas();mostrarNotificacao('📐 Arraste das réguas para criar guias');} }
function desenharReguas(){ /* código da régua */ }
function toggleContaGotas(){ modoContaGotas=!modoContaGotas; document.getElementById('btnContaGotas').style.background=modoContaGotas?'#f39c12':'#333'; document.getElementById('conta-gotas-cursor').style.display=modoContaGotas?'block':'none'; if(modoContaGotas){modoPen=false;modoLivre=false;modoBorracha=false;mostrarNotificacao('💧 Toque em qualquer cor para capturá-la');} }
function toggleEspelho(){ modoEspelho=!modoEspelho; document.getElementById('btnEspelho').style.background=modoEspelho?'#9b59b6':'#333'; document.getElementById('espelho-line').style.display=modoEspelho?'block':'none'; if(modoEspelho)mostrarNotificacao('⟺ Espelho ativo'); }
function toggleOutline(){ modoOutline=!modoOutline; document.getElementById('btnOutline').style.background=modoOutline?'#03dac6':'#333'; document.getElementById('outline-overlay').style.display=modoOutline?'block':'none'; if(modoOutline)renderizarOutline(); }
function toggleSnap(){ snapAtivo=!snapAtivo; document.getElementById('btnSnap').style.background=snapAtivo?'#ff9800':'#333'; }
function toggleMover(){ folhaTravada=!folhaTravada; document.getElementById('btnMover').textContent=folhaTravada?'🔒 MOVER':'🔓 MOVER'; document.getElementById('btnMover').style.background=folhaTravada?'#ff6600':'#333'; }
function toggleSelecao(){ modoSelecao=!modoSelecao; document.getElementById('btnSelecao').style.background=modoSelecao?'#03dac6':'#333'; if(!modoSelecao)limparSelecao(); if(modoSelecao){modoPen=false;modoLivre=false;modoBorracha=false;modoEditar=false;} }
function ativarModoTexto(){ const btn=document.getElementById('btnTexto'); const ativo=btn.style.background==='rgb(3, 218, 198)'; btn.style.background=ativo?'#333':'#03dac6'; btn.style.color=ativo?'white':'#000'; if(!ativo)mostrarNotificacao('T Toque na tela onde quer inserir o texto'); }
function abrirModalTexto(){ document.getElementById('modal-texto').classList.add('aberto'); document.getElementById('fonte-preview').style.fontFamily=document.getElementById('fonte-select').value; setTimeout(()=>document.getElementById('texto-input').focus(),100); }

const nomesFerr={pen:'🖊 PEN ▾',livre:'✏️ LIVRE ▾',borracha:'🧹 BORR ▾'};
const coresFerr={pen:'#ff00ff',livre:'#03dac6',borracha:'#ff6600'};
function selecionarFerramenta(f){
    ferramentaAtiva=f; fecharTodosPopups();
    const _ficEl=document.getElementById('ferr-icon'), _flbEl=document.getElementById('ferr-label');
    if(_ficEl)_ficEl.textContent=nomesFerr[f]?nomesFerr[f].split(' ')[0]:'🖊';
    if(_flbEl)_flbEl.textContent={pen:'PEN',livre:'LIVRE',borracha:'BORR'}[f]||'DRAW';
    ['pen','livre','borracha'].forEach(n=>{document.getElementById('fBtn-'+n).style.background=n===f?coresFerr[f]:'#333';});
    modoPen=false;modoLivre=false;modoBorracha=false;penLayer.innerHTML='';pontosBorracha=[];borrachaLayer.innerHTML='';
    if(f==='pen'){modoPen=true; encerrarEdicao(); const caminhos=getCaminhos(); caminhoAtivo=caminhos.length; caminhos.push({pontos:[],fechado:false,stroke:document.getElementById('col-main').value,width:document.getElementById('brush-size').value,opacity:document.getElementById('brush-opacity').value,tipo:document.getElementById('pincel-tipo').value,pincel:pincelAtual}); pontosPen=caminhos[caminhoAtivo].pontos; }
    else if(f==='livre') modoLivre=true;
    else if(f==='borracha') modoBorracha=true;
}
function toggleLivre(){ if(modoLivre){modoLivre=false;ferramentaAtiva='';document.getElementById('fBtn-livre').style.background='#333'; const ic=document.getElementById('ferr-icon'),lb=document.getElementById('ferr-label'); if(ic)ic.textContent='🖊'; if(lb)lb.textContent='PEN';} else selecionarFerramenta('livre'); }
function toggleBorracha(){ if(modoBorracha){modoBorracha=false;ferramentaAtiva='';pontosBorracha=[];borrachaLayer.innerHTML='';document.getElementById('fBtn-borracha').style.background='#333'; const ic=document.getElementById('ferr-icon'),lb=document.getElementById('ferr-label'); if(ic)ic.textContent='🖊'; if(lb)lb.textContent='PEN';} else selecionarFerramenta('borracha'); }

function fecharCaminho(){ if(pontosPen.length<3)return; pathFechado=!pathFechado; document.getElementById('btnFechar').style.background=pathFechado?'#03dac6':'#333'; renderizarPen(); }
function mostrarDicaEditar(mostrar){ document.getElementById('dica-editar').style.display=mostrar?'block':'none'; }
function encerrarEdicao(){ salvarHistorico(); salvarCaminhoAtivo(); caminhoAtivo=-1;pontosPen=[];pathFechado=false;penLayer.innerHTML='';document.getElementById('btn-confirmar-pen').style.display='none';document.getElementById('btnFechar').style.background='#333';renderizarTodos(); }

function toggleEditarMode(){
    if(modoPen||modoLivre||modoBorracha){modoPen=false;modoLivre=false;modoBorracha=false;const bFerr=document.getElementById('btnFerramentas');if(bFerr){bFerr.textContent='🖊 PEN ▾';bFerr.style.background='#ff00ff';} if(pontosPen.length>=2)salvarCaminhoAtivo(); else if(caminhoAtivo>=0)getCaminhos().splice(caminhoAtivo,1); caminhoAtivo=-1;pontosPen=[];pathFechado=false;penLayer.innerHTML='';renderizarTodos();}
    modoEditar=!modoEditar; document.getElementById('btnEditar').style.background=modoEditar?'#ffaa00':'#333';
    if(modoEditar){const caminhos=getCaminhos(); if(caminhos.length===0){mostrarNotificacao('⚠️ Nenhum caminho na camada ativa');modoEditar=false;document.getElementById('btnEditar').style.background='#333';return;} if(caminhos.length===1)_editarCaminho(0); else {mostrarDicaEditar(true); _renderizarTodosEditaveis();}} else {mostrarDicaEditar(false); encerrarEdicao();}
}
function _renderizarTodosEditaveis(){ penLayer.innerHTML=''; const caminhos=getCaminhos(); caminhos.forEach((cam,ci)=>{ if(!cam.pontos||cam.pontos.length<2)return; const d=buildPathD(cam.pontos,cam.fechado); const sel=document.createElementNS(NS,'path'); sel.setAttribute('d',d); sel.setAttribute('fill','none');sel.setAttribute('stroke','#ffaa00');sel.setAttribute('stroke-width',8/scale);sel.setAttribute('stroke-opacity','0.4');sel.setAttribute('stroke-linecap','round'); penLayer.appendChild(sel); const xs=cam.pontos.map(p=>p.x), ys=cam.pontos.map(p=>p.y); const cx=xs.reduce((a,b)=>a+b,0)/xs.length, cy=ys.reduce((a,b)=>a+b,0)/ys.length; const dot=document.createElementNS(NS,'circle'); dot.setAttribute('cx',cx);dot.setAttribute('cy',cy);dot.setAttribute('r',16/scale);dot.setAttribute('fill','#ffaa00');dot.setAttribute('stroke','white');dot.setAttribute('stroke-width',2/scale); penLayer.appendChild(dot); const txt=document.createElementNS(NS,'text'); txt.setAttribute('x',cx);txt.setAttribute('y',cy);txt.setAttribute('text-anchor','middle');txt.setAttribute('dominant-baseline','middle');txt.setAttribute('fill','#000');txt.setAttribute('font-size',12/scale);txt.setAttribute('font-weight','bold');txt.textContent=ci+1; penLayer.appendChild(txt); }); }
function _editarCaminho(idx){ const caminhos=getCaminhos(); const cam=caminhos[idx]; if(!cam)return; mostrarDicaEditar(false); encerrarEdicao(); caminhoAtivo=idx; pontosPen=cam.pontos.map(p=>({...p})); pathFechado=cam.fechado; document.getElementById('col-main').value=cam.stroke||'#000000'; document.getElementById('brush-size').value=cam.width||2; document.getElementById('brush-opacity').value=cam.opacity??1; if(document.getElementById('pincel-tipo'))document.getElementById('pincel-tipo').value=cam.tipo||'normal'; document.getElementById('btnFechar').style.background=pathFechado?'#03dac6':'#333'; renderizarTodos(); renderizarPen(); mostrarNotificacao('✏️ Arraste os pontos para editar'); }
function limparSelecao(){ selecaoEl=null; _selRealEl=null; _selResizing=false; _selResizeCorner=null; _selBBox=null; _selCurrentScale=1; _selHandlePositions=null; _selRotating=false; _selRotOrigAngle=0; _selRotCurAngle=0; document.getElementById('selecao-layer').innerHTML=''; _esconderHandlesHTML(); }
