// ====== UI.JS – PARTE 1 ======
// Popups, notificações, modais, tela inicial, novo projeto,
// manual, perfil (até aplicarConfig).

// ====== POPUPS ======
const _todosPopups = ['popup-desenho','popup-pinceis-wrap','popup-vista','popup-projeto'];
function fecharTodosPopups() {
    _todosPopups.forEach(id => {
        var el = document.getElementById(id);
        if (el) el.classList.remove('aberto');
    });
    document.getElementById('popup-overlay').classList.remove('ativo');
}
function togglePopup(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var jaAberto = el.classList.contains('aberto');
    fecharTodosPopups();
    if (!jaAberto) {
        el.classList.add('aberto');
        document.getElementById('popup-overlay').classList.add('ativo');
    }
}
document.getElementById('popup-overlay').addEventListener('touchstart', function(e) {
    e.stopPropagation();
    fecharTodosPopups();
}, {passive:true});

// ====== NOTIFICAÇÃO ======
function mostrarNotificacao(msg) {
    var el = document.getElementById('notificacao');
    if (!el) return;
    el.classList.remove('saindo');
    el.style.display = 'block';
    el.style.opacity = '1';
    el.textContent = msg;
    clearTimeout(el._tmTimer);
    el._tmTimer = setTimeout(function() {
        el.classList.add('saindo');
        setTimeout(function() {
            el.style.display = 'none';
            el.classList.remove('saindo');
        }, 320);
    }, 2300);
}

// ====== MODAIS ======
function abrirModalSalvar() { document.getElementById('modal-salvar').classList.add('aberto'); }
function fecharModalSalvar() { document.getElementById('modal-salvar').classList.remove('aberto'); document.getElementById('lista-projetos').style.display = 'none'; }

function togglePainel() {
    painelAberto = !painelAberto;
    document.getElementById('painel-camadas').classList.toggle('aberto', painelAberto);
    if (painelAberto) renderizarPainel();
}
function toggleHistorico() {
    painelHistoricoAberto = !painelHistoricoAberto;
    document.getElementById('painel-historico').classList.toggle('aberto', painelHistoricoAberto);
    if (painelHistoricoAberto) atualizarListaHistorico();
}

// ====== TELA INICIAL (CORRIGIDA) ======
function mostrarTelaInicial() {
    var telaLogin = document.getElementById('tela-login');
    var telaInicial = document.getElementById('tela-inicial');
    if (telaLogin) telaLogin.style.display = 'none';
    if (telaInicial) {
        telaInicial.style.display = 'flex';
        telaInicial.style.opacity = '1';
    }
    if (typeof aplicarConfig === 'function') aplicarConfig();
    if (typeof renderizarTelaInicial === 'function') renderizarTelaInicial();
}

function renderizarTelaInicial() {
    var lista = JSON.parse(localStorage.getItem('tm_projetos') || '[]');
    var el = document.getElementById('projetos-lista-inicial');
    if (!el) return;
    if (lista.length === 0) {
        el.innerHTML = '<div class="proj-sem">Nenhum projeto salvo ainda.<br>Crie um novo! ✏️</div>';
        return;
    }
    el.innerHTML = lista.map(function(p, i) {
        return '<div class="proj-item-inicial" onclick="carregarProjetoInicial(' + i + ')">' +
            '<div style="font-size:24px;">📁</div>' +
            '<div class="proj-info">' +
            '<div class="proj-nome">' + p.nome + '</div>' +
            '<div class="proj-data">' + p.data + '</div>' +
            '</div>' +
            '<button class="proj-del" onclick="event.stopPropagation();deletarProjetoInicial(' + i + ')">✕</button>' +
            '</div>';
    }).join('');
}

// ====== NOVO PROJETO ======
function abrirModalNovoProjeto() {
    tipoNovoProjeto = 'finito';
    gradeAtiva = false;
    gradeTamanho = 20;
    document.getElementById('card-finito').classList.add('ativo');
    document.getElementById('card-infinito').classList.remove('ativo');
    document.getElementById('chk-grade').checked = false;
    document.getElementById('grade-size-wrap').style.display = 'none';
    ['20','40','80','100'].forEach(function(s) {
        document.getElementById('gs-'+s).classList.toggle('ativo', s==='20');
    });
    document.getElementById('modal-novo-projeto').classList.add('aberto');
}

function novoProjeto(tipo) {
    tipo = tipo || 'finito';
    modoInfinito = (tipo === 'infinito');
    camadas = [criarCamada('Camada 1')];
    camadaAtiva = 0;
    caminhoAtivo = -1;
    pontosPen = [];
    pathFechado = false;
    penLayer.innerHTML = '';
    drawLayer.innerHTML = '';
    svgArea.innerHTML = '';
    livreLayer.innerHTML = '';
    document.getElementById('texto-layer').innerHTML = '';
    camadaFoto = { opacidade:1, visivel:true, svgHTML:'' };
    fotoOrdem = -1;
    historico = [];
    historicoFuturo = [];
    modoPen = false;
    modoEditar = false;
    modoLivre = false;
    modoBorracha = false;
    _esconderBolinhasDegrade();
    _esconderBolinhasTxtDg();
    modoDegrade = false;
    degradeStart = null;
    _dgPrevReset();
    document.getElementById('btnDegrade').style.background = '#e74c3c';
    document.getElementById('degrade-preview-layer').innerHTML = '';
    var bFerr = document.getElementById('btnFerramentas');
    var bEdit = document.getElementById('btnEditar');
    var bFech = document.getElementById('btnFechar');
    if (bFerr) { bFerr.textContent = '🖊 PEN ▾'; bFerr.style.background = '#ff00ff'; }
    if (bEdit) bEdit.style.background = '#333';
    if (bFech) bFech.style.background = '#333';
    aplicarModoInfinito(modoInfinito);
    renderizarGrade();
    abrirEditor();
}

function abrirEditor() {
    _editorAberto = true;
    centralizarFolha();
    var tela = document.getElementById('tela-inicial');
    tela.style.opacity = '0';
    tela.style.transition = 'opacity 0.4s';
    setTimeout(function() {
        tela.style.display = 'none';
        centralizarFolha();
    }, 450);
}

function voltarInicio() {
    _editorAberto = false;
    camadas = [criarCamada('Camada 1')];
    camadaAtiva = 0;
    caminhoAtivo = -1;
    pontosPen = [];
    pathFechado = false;
    penLayer.innerHTML = '';
    drawLayer.innerHTML = '';
    livreLayer.innerHTML = '';
    document.getElementById('texto-layer').innerHTML = '';
    svgArea.innerHTML = '';
    camadaFoto = { opacidade:1, visivel:true, svgHTML:'' };
    fotoOrdem = -1;
    historico = [];
    historicoFuturo = [];
    modoPen = false;
    modoEditar = false;
    modoLivre = false;
    modoBorracha = false;
    _esconderBolinhasDegrade();
    _esconderBolinhasTxtDg();
    modoDegrade = false;
    degradeStart = null;
    _dgPrevReset();
    document.getElementById('btnDegrade').style.background = '#e74c3c';
    document.getElementById('degrade-preview-layer').innerHTML = '';
    var bFerr = document.getElementById('btnFerramentas');
    var bEdit = document.getElementById('btnEditar');
    var bFech = document.getElementById('btnFechar');
    if (bFerr) { bFerr.textContent = '🖊 PEN ▾'; bFerr.style.background = '#ff00ff'; }
    if (bEdit) bEdit.style.background = '#333';
    if (bFech) bFech.style.background = '#333';
    var tela = document.getElementById('tela-inicial');
    tela.style.display = 'flex';
    tela.style.opacity = '0';
    setTimeout(function() {
        tela.style.transition = 'opacity 0.4s';
        tela.style.opacity = '1';
    }, 10);
    renderizarTelaInicial();
}

// ====== MANUAL ======
function abrirManual() { document.getElementById('modal-manual').style.display = 'block'; irSecao(0); }
function fecharManual() { document.getElementById('modal-manual').style.display = 'none'; }
function irSecao(idx) {
    var total = 6;
    for (var i = 0; i < total; i++) {
        var sec = document.getElementById('msec-' + i);
        if (sec) sec.style.display = (i === idx) ? 'block' : 'none';
    }
    var btns = document.querySelectorAll('.manual-nav-btn');
    btns.forEach(function(btn, i) {
        btn.classList.toggle('ativa', i === idx);
    });
    document.getElementById('modal-manual').scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== PERFIL ======
function abrirPerfil() {
    document.getElementById('cfg-nome').value = configUsuario.nome || '';
    document.getElementById('cfg-foto').value = configUsuario.foto || '';
    document.getElementById('cfg-accent').value = configUsuario.accent || '#03dac6';
    document.getElementById('cfg-folha').value = configUsuario.folha || '800x1000';
    document.getElementById('cfg-idioma').value = configUsuario.idioma || 'pt';
    setTema(configUsuario.tema || 'escuro', false);
    aplicarConfig();
    document.getElementById('modal-perfil').classList.add('aberto');
}
function fecharPerfil() { document.getElementById('modal-perfil').classList.remove('aberto'); }
function setTema(t, salvar) {
    configUsuario.tema = t;
    ['escuro','claro'].forEach(function(id) {
        var el = document.getElementById('tema-'+id);
        if (el) el.classList.toggle('ativo', id === t);
    });
    if (salvar !== false) aplicarConfig();
}
function aplicarConfig() {
    var c = configUsuario;
    document.documentElement.style.setProperty('--accent', c.accent || '#03dac6');
    var accentEls = document.querySelectorAll('.aba-pincel.ativa, #btn-nova-camada');
    accentEls.forEach(function(el) {
        el.style.background = c.accent || '#03dac6';
    });
    if (c.tema === 'claro') {
        document.body.style.background = '#f0f0f0';
        document.body.style.color = '#111';
        document.querySelectorAll('.bar').forEach(function(el) { el.style.background = '#ddd'; });
    } else {
        document.body.style.background = '#121212';
        document.body.style.color = 'white';
        document.querySelectorAll('.bar').forEach(function(el) { el.style.background = '#1e1e1e'; });
    }
    var avatarSrc = c.foto || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'40\' r=\'22\' fill=\'%23888\'/%3E%3Ccircle cx=\'50\' cy=\'90\' r=\'35\' fill=\'%23888\'/%3E%3C/svg%3E';
    ['avatar-inicial','avatar-editor','perfil-avatar-img'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.src = avatarSrc;
    });
    var nome = c.nome || 'Usuário';
    var elN = document.getElementById('perfil-nome-display');
    if (elN) elN.textContent = nome;
    var elE = document.getElementById('perfil-email-display');
    if (elE) elE.textContent = '—';
}

// ====== FIM DA PARTE 1 ======
// ====== UI.JS – PARTE 2 ======
// Régua, conta-gotas, espelho, outline, snap, mover,
// ferramentas, texto, grid infinito.

// ====== RÉGUA ======
function toggleRegua() {
    reguaAtiva = !reguaAtiva;
    document.getElementById('btnRegua').style.background = reguaAtiva ? '#03dac6' : '#333';
    document.getElementById('regua-h').style.display = reguaAtiva ? 'block' : 'none';
    document.getElementById('regua-v').style.display = reguaAtiva ? 'block' : 'none';
    document.getElementById('guias-layer').style.display = reguaAtiva ? 'block' : 'none';
    if (reguaAtiva) update();
    if (reguaAtiva) { desenharReguas(); mostrarNotificacao('📐 Arraste das réguas para criar guias'); }
}
function desenharReguas() {
    var rh = document.getElementById('regua-h');
    var rv = document.getElementById('regua-v');
    rh.innerHTML = '';
    var step = Math.max(20, Math.round(40 / scale));
    var canvasLeft = -posX / scale;
    var W = window.innerWidth / scale;
    for (var x = Math.floor(canvasLeft / step) * step; x < canvasLeft + W; x += step) {
        var screenX = (x - canvasLeft) * scale;
        var d = document.createElement('span');
        d.style.cssText = 'position:absolute;left:' + screenX + 'px;top:1px;font-size:7px;color:#888;white-space:nowrap;';
        d.textContent = Math.round(x);
        rh.appendChild(d);
        var tick = document.createElement('div');
        tick.style.cssText = 'position:absolute;left:' + screenX + 'px;bottom:0;width:1px;height:5px;background:#555;';
        rh.appendChild(tick);
    }
    rv.innerHTML = '';
    var canvasTop = -posY / scale;
    var H = window.innerHeight / scale;
    for (var y = Math.floor(canvasTop / step) * step; y < canvasTop + H; y += step) {
        var screenY = (y - canvasTop) * scale;
        var d = document.createElement('span');
        d.style.cssText = 'position:absolute;top:' + screenY + 'px;left:0;font-size:7px;color:#888;writing-mode:vertical-lr;white-space:nowrap;';
        d.textContent = Math.round(y);
        rv.appendChild(d);
    }
    renderizarGuias();
}
function renderizarGuias() {
    var gl = document.getElementById('guias-layer');
    gl.innerHTML = '';
    guias.forEach(function(g) {
        var div = document.createElement('div');
        div.className = g.tipo === 'h' ? 'guia-h' : 'guia-v';
        if (g.tipo === 'h') div.style.top = g.pos + 'px';
        else div.style.left = g.pos + 'px';
        gl.appendChild(div);
    });
}
document.getElementById('regua-h').addEventListener('touchstart', function(e) {
    if (!reguaAtiva) return;
    var p = clientParaCanvas(e.touches[0].clientX, e.touches[0].clientY);
    guias.push({ tipo: 'h', pos: Math.max(0, p.y) });
    renderizarGuias();
}, {passive:true});
document.getElementById('regua-v').addEventListener('touchstart', function(e) {
    if (!reguaAtiva) return;
    var p = clientParaCanvas(e.touches[0].clientX, e.touches[0].clientY);
    guias.push({ tipo: 'v', pos: Math.max(0, p.x) });
    renderizarGuias();
}, {passive:true});

// ====== CONTA-GOTAS ======
function toggleContaGotas() {
    modoContaGotas = !modoContaGotas;
    document.getElementById('btnContaGotas').style.background = modoContaGotas ? '#f39c12' : '#333';
    document.getElementById('conta-gotas-cursor').style.display = modoContaGotas ? 'block' : 'none';
    if (modoContaGotas) {
        modoPen = false;
        modoLivre = false;
        modoBorracha = false;
        mostrarNotificacao('💧 Toque em qualquer cor para capturá-la');
    }
}
function capturarCor(clientX, clientY) {
    var p = clientParaCanvas(clientX, clientY);
    var W = workSurface.offsetWidth, H = workSurface.offsetHeight;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    ctx.fillStyle = modoInfinito ? '#1a1a1a' : 'white';
    ctx.fillRect(0, 0, W, H);
    var svgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">' +
        drawLayer.innerHTML + livreLayer.innerHTML +
        document.getElementById('texto-layer').innerHTML +
        '</svg>';
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src);
        var d = ctx.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data;
        var hex = '#' + [d[0], d[1], d[2]].map(function(v) { return v.toString(16).padStart(2, '0'); }).join('');
        document.getElementById('col-main').value = hex;
        document.getElementById('conta-gotas-cursor').style.background = hex;
        modoContaGotas = false;
        document.getElementById('btnContaGotas').style.background = '#333';
        document.getElementById('conta-gotas-cursor').style.display = 'none';
        mostrarNotificacao('💧 Cor capturada: ' + hex);
    };
    img.onerror = function() { URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml' }));
}

// ====== ESPELHO ======
function toggleEspelho() {
    modoEspelho = !modoEspelho;
    document.getElementById('btnEspelho').style.background = modoEspelho ? '#9b59b6' : '#333';
    document.getElementById('espelho-line').style.display = modoEspelho ? 'block' : 'none';
    if (modoEspelho) mostrarNotificacao('⟺ Espelho ativo');
}
function aplicarEspelho(grupo) {
    if (!modoEspelho || !grupo) return;
    var eixoX = (-posX + window.innerWidth / 2) / scale;
    var mirror = grupo.cloneNode(true);
    mirror.setAttribute('transform', 'translate(' + (eixoX * 2) + ',0) scale(-1,1)');
    livreLayer.appendChild(mirror);
}

// ====== OUTLINE ======
function toggleOutline() {
    modoOutline = !modoOutline;
    document.getElementById('btnOutline').style.background = modoOutline ? '#03dac6' : '#333';
    document.getElementById('outline-overlay').style.display = modoOutline ? 'block' : 'none';
    if (modoOutline) renderizarOutline();
}
function renderizarOutline() {
    var overlay = document.getElementById('outline-overlay');
    if (!overlay) return;
    overlay.width = workSurface.offsetWidth;
    overlay.height = workSurface.offsetHeight;
    var ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (window.imgParaVetor) {
        ctx.globalAlpha = 0.35;
        ctx.drawImage(window.imgParaVetor, 0, 0, overlay.width, overlay.height);
        ctx.globalAlpha = 1;
    }
    var paths = drawLayer.querySelectorAll('path,ellipse,rect,polygon,line');
    paths.forEach(function(p) {
        ctx.strokeStyle = '#03dac6';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        try {
            var bb = p.getBBox();
            ctx.strokeRect(bb.x, bb.y, bb.width, bb.height);
        } catch(e) {}
    });
}

// ====== SNAP ======
function toggleSnap() {
    snapAtivo = !snapAtivo;
    document.getElementById('btnSnap').style.background = snapAtivo ? '#ff9800' : '#333';
}

// ====== MOVER ======
function toggleMover() {
    folhaTravada = !folhaTravada;
    document.getElementById('btnMover').textContent = folhaTravada ? '🔒 MOVER' : '🔓 MOVER';
    document.getElementById('btnMover').style.background = folhaTravada ? '#ff6600' : '#333';
}

// ====== FERRAMENTAS ======
var nomesFerr = { pen: '🖊 PEN ▾', livre: '✏️ LIVRE ▾', borracha: '🧹 BORR ▾' };
var coresFerr = { pen: '#ff00ff', livre: '#03dac6', borracha: '#ff6600' };
function selecionarFerramenta(f) {
    ferramentaAtiva = f;
    fecharTodosPopups();
    var _ficEl = document.getElementById('ferr-icon');
    var _flbEl = document.getElementById('ferr-label');
    if (_ficEl) _ficEl.textContent = nomesFerr[f] ? nomesFerr[f].split(' ')[0] : '🖊';
    if (_flbEl) _flbEl.textContent = { pen: 'PEN', livre: 'LIVRE', borracha: 'BORR' }[f] || 'DRAW';
    ['pen', 'livre', 'borracha'].forEach(function(n) {
        document.getElementById('fBtn-' + n).style.background = n === f ? coresFerr[f] : '#333';
    });
    modoPen = false;
    modoLivre = false;
    modoBorracha = false;
    penLayer.innerHTML = '';
    pontosBorracha = [];
    borrachaLayer.innerHTML = '';
    if (f === 'pen') {
        modoPen = true;
        encerrarEdicao();
        var caminhos = getCaminhos();
        caminhoAtivo = caminhos.length;
        caminhos.push({
            pontos: [],
            fechado: false,
            stroke: document.getElementById('col-main').value,
            width: document.getElementById('brush-size').value,
            opacity: document.getElementById('brush-opacity').value,
            tipo: document.getElementById('pincel-tipo').value,
            pincel: pincelAtual
        });
        pontosPen = caminhos[caminhoAtivo].pontos;
    } else if (f === 'livre') {
        modoLivre = true;
    } else if (f === 'borracha') {
        modoBorracha = true;
    }
}
function toggleLivre() {
    if (modoLivre) {
        modoLivre = false;
        ferramentaAtiva = '';
        document.getElementById('fBtn-livre').style.background = '#333';
        var ic = document.getElementById('ferr-icon');
        var lb = document.getElementById('ferr-label');
        if (ic) ic.textContent = '🖊';
        if (lb) lb.textContent = 'PEN';
    } else {
        selecionarFerramenta('livre');
    }
}
function toggleBorracha() {
    if (modoBorracha) {
        modoBorracha = false;
        ferramentaAtiva = '';
        pontosBorracha = [];
        borrachaLayer.innerHTML = '';
        document.getElementById('fBtn-borracha').style.background = '#333';
        var ic = document.getElementById('ferr-icon');
        var lb = document.getElementById('ferr-label');
        if (ic) ic.textContent = '🖊';
        if (lb) lb.textContent = 'PEN';
    } else {
        selecionarFerramenta('borracha');
    }
}
function toggleSelecao() {
    modoSelecao = !modoSelecao;
    document.getElementById('btnSelecao').style.background = modoSelecao ? '#03dac6' : '#333';
    if (!modoSelecao) limparSelecao();
    if (modoSelecao) {
        modoPen = false;
        modoLivre = false;
        modoBorracha = false;
        modoEditar = false;
    }
}

// ====== TEXTO ======
function ativarModoTexto() {
    var btn = document.getElementById('btnTexto');
    var ativo = btn.style.background === 'rgb(3, 218, 198)';
    btn.style.background = ativo ? '#333' : '#03dac6';
    btn.style.color = ativo ? 'white' : '#000';
    if (!ativo) mostrarNotificacao('T Toque na tela onde quer inserir o texto');
}
function abrirModalTexto() {
    document.getElementById('modal-texto').classList.add('aberto');
    document.getElementById('fonte-preview').style.fontFamily = document.getElementById('fonte-select').value;
    setTimeout(function() { document.getElementById('texto-input').focus(); }, 100);
}

// ====== GRID INFINITO ======
var INF_SIZE = 50000;
function aplicarModoInfinito(ativo) {
    var vp = document.getElementById('viewport');
    var ws = workSurface;
    var ind = document.getElementById('indicador-infinito');
    if (ativo) {
        ws.style.width = INF_SIZE + 'px';
        ws.style.height = INF_SIZE + 'px';
        ws.style.background = 'white';
        ws.style.boxShadow = 'none';
        vp.classList.add('infinito');
        ind.style.display = 'block';
        scale = 0.8;
        posX = 20;
        posY = 80;
    } else {
        ws.style.background = 'white';
        ws.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
        vp.classList.remove('infinito');
        ind.style.display = 'none';
        var folha = (configUsuario && configUsuario.folha) ? configUsuario.folha : '800x1000';
        var dims = folha.split('x');
        ws.style.width = dims[0] + 'px';
        ws.style.height = dims[1] + 'px';
        scale = 0.8;
        posX = 20;
        posY = 80;
    }
    update();
}
function renderizarGrade() {
    var layer = document.getElementById('grade-layer');
    layer.innerHTML = '';
    if (!gradeAtiva) return;
    var W = workSurface.offsetWidth || 800;
    var H = workSurface.offsetHeight || 1000;
    var tam = gradeTamanho;
    var cor = 'rgba(0,0,0,0.08)';
    var corForte = 'rgba(0,0,0,0.15)';
    var ns = 'http://www.w3.org/2000/svg';
    var defs = document.createElementNS(ns, 'defs');
    var pat = document.createElementNS(ns, 'pattern');
    pat.setAttribute('id', 'grade-pat');
    pat.setAttribute('width', tam);
    pat.setAttribute('height', tam);
    pat.setAttribute('patternUnits', 'userSpaceOnUse');
    var l1 = document.createElementNS(ns, 'path');
    l1.setAttribute('d', 'M ' + tam + ' 0 L 0 0 0 ' + tam);
    l1.setAttribute('fill', 'none');
    l1.setAttribute('stroke', cor);
    l1.setAttribute('stroke-width', '0.5');
    pat.appendChild(l1);
    defs.appendChild(pat);
    layer.appendChild(defs);
    var rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'url(#grade-pat)');
    layer.appendChild(rect);
    var patG = document.createElementNS(ns, 'pattern');
    patG.setAttribute('id', 'grade-pat-grande');
    patG.setAttribute('width', tam * 5);
    patG.setAttribute('height', tam * 5);
    patG.setAttribute('patternUnits', 'userSpaceOnUse');
    var l2 = document.createElementNS(ns, 'path');
    l2.setAttribute('d', 'M ' + (tam * 5) + ' 0 L 0 0 0 ' + (tam * 5));
    l2.setAttribute('fill', 'none');
    l2.setAttribute('stroke', corForte);
    l2.setAttribute('stroke-width', '0.8');
    patG.appendChild(l2);
    defs.appendChild(patG);
    var rectG = document.createElementNS(ns, 'rect');
    rectG.setAttribute('width', '100%');
    rectG.setAttribute('height', '100%');
    rectG.setAttribute('fill', 'url(#grade-pat-grande)');
    layer.appendChild(rectG);
}

// ====== FIM DA PARTE 2 ======
// ====== UI.JS – PARTE 3 ======
// Editar, formas, carregar projeto inicial.

// ====== EDITAR ======
function toggleEditarMode() {
    if (modoPen || modoLivre || modoBorracha) {
        modoPen = false;
        modoLivre = false;
        modoBorracha = false;
        var bFerr = document.getElementById('btnFerramentas');
        if (bFerr) { bFerr.textContent = '🖊 PEN ▾'; bFerr.style.background = '#ff00ff'; }
        if (pontosPen.length >= 2) salvarCaminhoAtivo();
        else if (caminhoAtivo >= 0) getCaminhos().splice(caminhoAtivo, 1);
        caminhoAtivo = -1;
        pontosPen = [];
        pathFechado = false;
        penLayer.innerHTML = '';
        renderizarTodos();
    }
    modoEditar = !modoEditar;
    document.getElementById('btnEditar').style.background = modoEditar ? '#ffaa00' : '#333';
    if (modoEditar) {
        var caminhos = getCaminhos();
        if (caminhos.length === 0) {
            mostrarNotificacao('⚠️ Nenhum caminho na camada ativa');
            modoEditar = false;
            document.getElementById('btnEditar').style.background = '#333';
            return;
        }
        if (caminhos.length === 1) _editarCaminho(0);
        else {
            mostrarDicaEditar(true);
            _renderizarTodosEditaveis();
        }
    } else {
        mostrarDicaEditar(false);
        encerrarEdicao();
    }
}
function _renderizarTodosEditaveis() {
    penLayer.innerHTML = '';
    var caminhos = getCaminhos();
    caminhos.forEach(function(cam, ci) {
        if (!cam.pontos || cam.pontos.length < 2) return;
        var d = buildPathD(cam.pontos, cam.fechado);
        var sel = document.createElementNS(NS, 'path');
        sel.setAttribute('d', d);
        sel.setAttribute('fill', 'none');
        sel.setAttribute('stroke', '#ffaa00');
        sel.setAttribute('stroke-width', 8 / scale);
        sel.setAttribute('stroke-opacity', '0.4');
        sel.setAttribute('stroke-linecap', 'round');
        penLayer.appendChild(sel);
        var xs = cam.pontos.map(function(p) { return p.x; });
        var ys = cam.pontos.map(function(p) { return p.y; });
        var cx = xs.reduce(function(a, b) { return a + b; }, 0) / xs.length;
        var cy = ys.reduce(function(a, b) { return a + b; }, 0) / ys.length;
        var dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', cx);
        dot.setAttribute('cy', cy);
        dot.setAttribute('r', 16 / scale);
        dot.setAttribute('fill', '#ffaa00');
        dot.setAttribute('stroke', 'white');
        dot.setAttribute('stroke-width', 2 / scale);
        penLayer.appendChild(dot);
        var txt = document.createElementNS(NS, 'text');
        txt.setAttribute('x', cx);
        txt.setAttribute('y', cy);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('dominant-baseline', 'middle');
        txt.setAttribute('fill', '#000');
        txt.setAttribute('font-size', 12 / scale);
        txt.setAttribute('font-weight', 'bold');
        txt.textContent = ci + 1;
        penLayer.appendChild(txt);
    });
}
function _editarCaminho(idx) {
    var caminhos = getCaminhos();
    var cam = caminhos[idx];
    if (!cam) return;
    mostrarDicaEditar(false);
    encerrarEdicao();
    caminhoAtivo = idx;
    pontosPen = cam.pontos.map(function(p) { return { x: p.x, y: p.y, tipo: p.tipo }; });
    pathFechado = cam.fechado;
    document.getElementById('col-main').value = cam.stroke || '#000000';
    document.getElementById('brush-size').value = cam.width || 2;
    document.getElementById('brush-opacity').value = cam.opacity || 1;
    if (document.getElementById('pincel-tipo')) document.getElementById('pincel-tipo').value = cam.tipo || 'normal';
    document.getElementById('btnFechar').style.background = pathFechado ? '#03dac6' : '#333';
    renderizarTodos();
    renderizarPen();
    mostrarNotificacao('✏️ Arraste os pontos para editar');
}
function fecharCaminho() {
    if (pontosPen.length < 3) return;
    pathFechado = !pathFechado;
    document.getElementById('btnFechar').style.background = pathFechado ? '#03dac6' : '#333';
    renderizarPen();
}
function mostrarDicaEditar(mostrar) {
    document.getElementById('dica-editar').style.display = mostrar ? 'block' : 'none';
}
function encerrarEdicao() {
    salvarHistorico();
    salvarCaminhoAtivo();
    caminhoAtivo = -1;
    pontosPen = [];
    pathFechado = false;
    penLayer.innerHTML = '';
    document.getElementById('btn-confirmar-pen').style.display = 'none';
    document.getElementById('btnFechar').style.background = '#333';
    renderizarTodos();
}

// ====== FORMAS ======
function toggleFormas() {
    var ativo = modoFormas;
    modoFormas = !ativo;
    if (modoFormas) {
        document.getElementById('btnFormas').style.background = '#aa00ff';
        document.getElementById('modal-formas').style.display = 'flex';
    } else {
        document.getElementById('btnFormas').style.background = '#333';
        document.getElementById('modal-formas').style.display = 'none';
    }
}
function fecharFormas() {
    modoFormas = false;
    document.getElementById('btnFormas').style.background = '#333';
    document.getElementById('modal-formas').style.display = 'none';
}
function selecionarForma(f) {
    formaAtual = f;
    ['circulo','retangulo','triangulo','linha'].forEach(function(n) {
        document.getElementById('fBtn-' + n).style.background = n === f ? '#03dac6' : '#333';
    });
}

// ====== CARREGAR PROJETO INICIAL ======
function carregarProjetoInicial(idx) {
    var lista = JSON.parse(localStorage.getItem('tm_projetos') || '[]');
    var p = lista[idx];
    if (!p) return;
    camadas = p.camadas;
    camadaFoto = p.camadaFoto || { opacidade:1, visivel:true, svgHTML:'' };
    fotoOrdem = (p.fotoOrdem !== undefined) ? p.fotoOrdem : -1;
    camadaAtiva = 0;
    caminhoAtivo = -1;
    pontosPen = [];
    pathFechado = false;
    penLayer.innerHTML = '';
    if (p.workW) workSurface.style.width = p.workW + 'px';
    if (p.workH) workSurface.style.height = p.workH + 'px';
    rotacao = p.rotacao || 0;
    svgArea.innerHTML = camadaFoto.svgHTML || '';
    document.getElementById('texto-layer').innerHTML = p.textoHTML || '';
    historico = [];
    historicoFuturo = [];
    modoInfinito = p.modoInfinito || false;
    gradeAtiva = p.gradeAtiva || false;
    gradeTamanho = p.gradeTamanho || 20;
    _esconderBolinhasDegrade();
    _esconderBolinhasTxtDg();
    modoDegrade = false;
    degradeStart = null;
    _dgPrevReset();
    document.getElementById('btnDegrade').style.background = '#e74c3c';
    document.getElementById('degrade-preview-layer').innerHTML = '';
    aplicarModoInfinito(modoInfinito);
    renderizarTodos();
    abrirEditor();
}
function deletarProjetoInicial(idx) {
    var lista = JSON.parse(localStorage.getItem('tm_projetos') || '[]');
    lista.splice(idx, 1);
    localStorage.setItem('tm_projetos', JSON.stringify(lista));
    renderizarTelaInicial();
}

// ====== FIM DA PARTE 3 ======
