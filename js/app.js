// app.js – Versão completa com modo demo forçado
window.addEventListener('load', function() {

    // ====== CORREÇÃO: força modo demo imediatamente ======
    if (!firebaseOk) {
        setTimeout(function() {
            if (typeof mostrarTelaInicial === 'function') {
                mostrarTelaInicial();
            } else {
                console.warn('mostrarTelaInicial não definida ainda, tentando novamente...');
                setTimeout(function() {
                    if (typeof mostrarTelaInicial === 'function') mostrarTelaInicial();
                }, 200);
            }
        }, 50);
    }

    // ====== CONFIGURAÇÕES INICIAIS ======
    const drawLayer = document.getElementById('draw-layer');
    const livreLayer = document.getElementById('livre-layer');
    const penLayer = document.getElementById('pen-layer');
    const svgArea = document.getElementById('svg-render-area');
    const hCanvas = document.getElementById('hidden-canvas');
    const hCtx = hCanvas.getContext('2d');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas?.getContext('2d');

    window.livreLayer = livreLayer;
    window.drawLayer = drawLayer;
    window.penLayer = penLayer;
    window.svgArea = svgArea;
    window.hCanvas = hCanvas;
    window.hCtx = hCtx;
    window.previewCanvas = previewCanvas;
    window.previewCtx = previewCtx;

    // ====== RENDERIZAÇÃO INICIAL ======
    centralizarFolha();
    renderizarTelaInicial();
    if (camadas.length === 0) {
        camadas.push(criarCamada('Camada 1'));
        camadaAtiva = 0;
    }
    renderizarTodos();

    // ====== EVENTOS DA BARRA ======
    document.getElementById('btn-nova-camada').addEventListener('click', novaCamada);
    document.getElementById('btn-fechar-painel').addEventListener('click', togglePainel);

    // ====== HANDLES DE SELEÇÃO (RESIZE E ROTAÇÃO) ======
    setTimeout(function() {
        ['tl','tr','bl','br'].forEach(function(cornerId) {
            var div = document.getElementById('sel-handle-'+cornerId);
            if (!div) return;
            div.addEventListener('touchstart', function(e) {
                e.stopPropagation(); e.preventDefault();
                if (!_selHandlePositions) return;
                var pos = _selHandlePositions;
                _selResizing = true;
                _selResizeCorner = cornerId;
                _selResizeStartScale = 1;
                _selCurrentScale = 1;
                if (selecaoCaminhoInfo) {
                    var cam = camadas[selecaoCaminhoInfo.camadaIdx];
                    var c = cam.caminhos[selecaoCaminhoInfo.caminhoIdx];
                    var xs = c.pontos.map(function(p){return p.x;});
                    var ys = c.pontos.map(function(p){return p.y;});
                    var mnX = Math.min.apply(null, xs);
                    var mxX = Math.max.apply(null, xs);
                    var mnY = Math.min.apply(null, ys);
                    var mxY = Math.max.apply(null, ys);
                    var pad = 6/scale;
                    _selBBox = {x:mnX-pad, y:mnY-pad, w:(mxX-mnX)+pad*2, h:(mxY-mnY)+pad*2};
                    c._origPontos = c.pontos.map(function(p){ return {x:p.x, y:p.y}; });
                } else {
                    _selBBox = {x:pos.x0, y:pos.y0, w:pos.x1-pos.x0, h:pos.y1-pos.y0};
                }
                var oppX = (cornerId==='tl'||cornerId==='bl') ? pos.x1 : pos.x0;
                var oppY = (cornerId==='tl'||cornerId==='tr') ? pos.y1 : pos.y0;
                _selResizeAnchorCX = oppX;
                _selResizeAnchorCY = oppY;
                var tcStart = clientParaCanvas(e.touches[0].clientX, e.touches[0].clientY);
                _selResizeStartDist = Math.max(10, Math.hypot(tcStart.x-oppX, tcStart.y-oppY));
            }, {passive:false});
            div.addEventListener('touchmove', function(e) {
                e.stopPropagation(); e.preventDefault();
                if (!_selResizing || !_selBBox) return;
                var tc = clientParaCanvas(e.touches[0].clientX, e.touches[0].clientY);
                var curDist = Math.max(5, Math.hypot(tc.x-_selResizeAnchorCX, tc.y-_selResizeAnchorCY));
                _aplicarResize(Math.max(0.05, _selResizeStartScale * (curDist / _selResizeStartDist)));
            }, {passive:false});
            div.addEventListener('touchend', function(e) {
                e.stopPropagation();
                if (!_selResizing) return;
                _selResizing = false;
                _selResizeCorner = null;
                if (selecaoCaminhoInfo) {
                    var cam = camadas[selecaoCaminhoInfo.camadaIdx];
                    var c = cam.caminhos[selecaoCaminhoInfo.caminhoIdx];
                    c._origPontos = c.pontos.map(function(p){ return {x:p.x, y:p.y}; });
                } else if (_selRealEl && _selBBox) {
                    var bx = _selBBox.x, by = _selBBox.y;
                    var bw = _selBBox.w, bh = _selBBox.h;
                    var cx2 = bx + bw/2 + selecaoTransX;
                    var cy2 = by + bh/2 + selecaoTransY;
                    var nw = bw * _selCurrentScale;
                    var nh = bh * _selCurrentScale;
                    _selBBox = {x:cx2 - nw/2, y:cy2 - nh/2, w:nw, h:nh, cx:cx2, cy:cy2};
                }
                _selResizeStartScale = 1;
                _selCurrentScale = 1;
                salvarHistorico();
                if (camadas[camadaAtiva]) camadas[camadaAtiva].livreHTML = livreLayer.innerHTML;
            }, {passive:false});
        });

        var divRot = document.getElementById('sel-handle-rot');
        if (divRot) {
            divRot.addEventListener('touchstart', function(e) {
                e.stopPropagation(); e.preventDefault();
                if (!_selHandlePositions) return;
                var pos = _selHandlePositions;
                _selRotating = true;
                _selRotCX = pos.rotCanvasCX;
                _selRotCY = pos.rotCanvasCY;
                var tc = clientParaCanvas(e.touches[0].clientX, e.touches[0].clientY);
                _selRotStartAngle = Math.atan2(tc.y - pos.rotCanvasCY, tc.x - pos.rotCanvasCX) * 180 / Math.PI;
                if (_selRealEl) {
                    var tr = _selRealEl.getAttribute('transform') || '';
                    var rm = tr.match(/rotate\(([-\d.]+)/);
                    _selRotOrigAngle = rm ? parseFloat(rm[1]) : 0;
                } else {
                    _selRotOrigAngle = 0;
                }
                _selRotCurAngle = _selRotOrigAngle;
            }, {passive:false});
            divRot.addEventListener('touchmove', function(e) {
                e.stopPropagation(); e.preventDefault();
                if (!_selRotating) return;
                var tc = clientParaCanvas(e.touches[0].clientX, e.touches[0].clientY);
                var curAngle = Math.atan2(tc.y - _selRotCY, tc.x - _selRotCX) * 180 / Math.PI;
                var delta = curAngle - _selRotStartAngle;
                var novoAngulo = _selRotOrigAngle + delta;
                var snap = Math.round(novoAngulo / 15) * 15;
                if (Math.abs(novoAngulo - snap) < 5) novoAngulo = snap;
                _selRotCurAngle = novoAngulo;
                _aplicarRotacao(novoAngulo);
            }, {passive:false});
            divRot.addEventListener('touchend', function(e) {
                e.stopPropagation();
                if (!_selRotating) return;
                _selRotating = false;
                if (selecaoCaminhoInfo) {
                    var cam = camadas[selecaoCaminhoInfo.camadaIdx];
                    var c = cam.caminhos[selecaoCaminhoInfo.caminhoIdx];
                    c._origPontos = c.pontos.map(function(p){ return {x:p.x, y:p.y}; });
                }
                _selRotOrigAngle = _selRotCurAngle;
                salvarHistorico();
                if (camadas[camadaAtiva]) camadas[camadaAtiva].livreHTML = livreLayer.innerHTML;
            }, {passive:false});
        }
    }, 0);

    // ====== AUTO-SAVE ======
    setInterval(function() {
        try {
            if (camadas[camadaAtiva]) camadas[camadaAtiva].livreHTML = livreLayer.innerHTML;
            var rascunho = {
                ts: Date.now(),
                camadas: camadas.map(function(c) {
                    return {
                        ...c,
                        caminhos: c.caminhos.map(function(p) {
                            return { ...p, pontos: p.pontos.map(function(pt) { return {x:pt.x, y:pt.y, tipo:pt.tipo}; }) };
                        })
                    };
                }),
                camadaFoto: camadaFoto,
                fotoOrdem: fotoOrdem,
                textoHTML: document.getElementById('texto-layer').innerHTML,
                workW: workSurface.offsetWidth,
                workH: workSurface.offsetHeight,
                modoInfinito: modoInfinito,
                gradeAtiva: gradeAtiva,
                gradeTamanho: gradeTamanho,
                rotacao: rotacao
            };
            localStorage.setItem('tm_rascunho', JSON.stringify(rascunho));
        } catch(e) { /* silencioso */ }
    }, 10000);

    // ====== CARREGA RASCUNHO ======
    try {
        var raw = localStorage.getItem('tm_rascunho');
        if (raw) {
            var r = JSON.parse(raw);
            if (r.camadas) {
                camadas = r.camadas;
                camadaFoto = r.camadaFoto || {opacidade:1, visivel:true, svgHTML:''};
                if (r.fotoOrdem !== undefined) fotoOrdem = r.fotoOrdem;
                if (r.textoHTML) document.getElementById('texto-layer').innerHTML = r.textoHTML;
                if (r.workW) workSurface.style.width = r.workW + 'px';
                if (r.workH) workSurface.style.height = r.workH + 'px';
                if (r.modoInfinito !== undefined) modoInfinito = r.modoInfinito;
                if (r.gradeAtiva !== undefined) gradeAtiva = r.gradeAtiva;
                if (r.gradeTamanho !== undefined) gradeTamanho = r.gradeTamanho;
                if (r.rotacao !== undefined) rotacao = r.rotacao;
                if (r.camadaAtivaIdx !== undefined) camadaAtiva = r.camadaAtivaIdx;
                aplicarModoInfinito(modoInfinito);
                renderizarGrade();
                renderizarTodos();
                if (painelAberto) renderizarPainel();
                if (r.workW || r.workH) centralizarFolha();
            }
        }
    } catch(e) {}

    // ====== SINCroniza cor da barra ======
    var colMain = document.getElementById('col-main');
    var corBar = document.getElementById('cor-preview-bar');
    if (colMain && corBar) {
        colMain.addEventListener('input', function() {
            corBar.style.background = colMain.value;
        });
        corBar.style.background = colMain.value;
    }

    // ====== EVENTOS DO MODAL DE TEXTO ======
    document.getElementById('btn-cancelar-texto').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        document.getElementById('modal-texto').classList.remove('aberto');
        if (_textoEditando && _textoEditando._substituir) _textoEditando._substituir = false;
        _textoEditando = null;
        document.getElementById('txt-degrade-ativo').checked = false;
        document.getElementById('txt-degrade-wrap').style.display = 'none';
        document.getElementById('txt-contorno-ativo').checked = false;
        document.getElementById('txt-contorno-wrap').style.display = 'none';
    }, {passive:true});

    document.getElementById('btn-inserir-texto').addEventListener('touchend', function(e) {
        e.stopPropagation(); e.preventDefault();
        inserirTexto();
    }, {passive:false});
    document.getElementById('btn-inserir-texto').addEventListener('click', function(e) {
        e.stopPropagation();
        inserirTexto();
    });

    // ====== FONTE PREVIEW ======
    var fonteSelectEl = document.getElementById('fonte-select');
    function onFonteChange() {
        textoFonte = fonteSelectEl.value;
        var prev = document.getElementById('fonte-preview');
        prev.style.fontFamily = textoFonte;
        prev.textContent = document.getElementById('texto-input').value || 'Abc 123';
    }
    fonteSelectEl.addEventListener('change', onFonteChange);
    fonteSelectEl.addEventListener('input', onFonteChange);

    document.getElementById('texto-input').addEventListener('input', function(e) {
        var prev = document.getElementById('fonte-preview');
        prev.textContent = e.target.value || 'Abc 123';
    });

    document.getElementById('btn-fonte-custom').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        var nome = document.getElementById('fonte-custom').value.trim();
        if (!nome) return;
        textoFonte = nome;
        var prev = document.getElementById('fonte-preview');
        prev.style.fontFamily = nome;
        mostrarNotificacao('Fonte "' + nome + '" aplicada!');
    }, {passive:true});

    document.getElementById('txt-bold').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        textoBold = !textoBold;
        var el = document.getElementById('txt-bold');
        el.style.color = textoBold ? '#03dac6' : '#aaa';
        el.style.borderColor = textoBold ? '#03dac6' : '#333';
    }, {passive:true});

    document.getElementById('txt-italic').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        textoItalic = !textoItalic;
        var el = document.getElementById('txt-italic');
        el.style.color = textoItalic ? '#03dac6' : '#aaa';
        el.style.borderColor = textoItalic ? '#03dac6' : '#333';
    }, {passive:true});

    document.getElementById('txt-degrade-ativo').addEventListener('change', function(e) {
        document.getElementById('txt-degrade-wrap').style.display = e.target.checked ? 'flex' : 'none';
    });

    document.getElementById('txt-contorno-ativo').addEventListener('change', function(e) {
        document.getElementById('txt-contorno-wrap').style.display = e.target.checked ? 'flex' : 'none';
    });

    document.getElementById('txt-contorno-esp').addEventListener('input', function(e) {
        document.getElementById('txt-contorno-esp-val').textContent = e.target.value + 'px';
    });

    document.getElementById('txt-deg-linear').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        txtDegradeTipo = 'linear';
        document.getElementById('txt-deg-linear').style.cssText = 'flex:1;padding:6px;border-radius:8px;border:2px solid #03dac6;background:#1e2e2e;color:#03dac6;font-size:10px;font-weight:bold;text-align:center;';
        document.getElementById('txt-deg-radial').style.cssText = 'flex:1;padding:6px;border-radius:8px;border:1px solid #333;background:#2a2a2a;color:#888;font-size:10px;font-weight:bold;text-align:center;';
    }, {passive:true});

    document.getElementById('txt-deg-radial').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        txtDegradeTipo = 'radial';
        document.getElementById('txt-deg-radial').style.cssText = 'flex:1;padding:6px;border-radius:8px;border:2px solid #03dac6;background:#1e2e2e;color:#03dac6;font-size:10px;font-weight:bold;text-align:center;';
        document.getElementById('txt-deg-linear').style.cssText = 'flex:1;padding:6px;border-radius:8px;border:1px solid #333;background:#2a2a2a;color:#888;font-size:10px;font-weight:bold;text-align:center;';
    }, {passive:true});

    // ====== NOVO PROJETO ======
    document.getElementById('chk-grade').addEventListener('change', function(e) {
        gradeAtiva = e.target.checked;
        document.getElementById('grade-size-wrap').style.display = gradeAtiva ? 'block' : 'none';
    });

    ['20','40','80','100'].forEach(function(s) {
        document.getElementById('gs-'+s).addEventListener('touchstart', function(e) {
            e.stopPropagation();
            gradeTamanho = parseInt(s);
            ['20','40','80','100'].forEach(function(x) {
                document.getElementById('gs-'+x).classList.toggle('ativo', x === s);
            });
        }, {passive:true});
    });

    document.getElementById('card-finito').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        tipoNovoProjeto = 'finito';
        document.getElementById('card-finito').classList.add('ativo');
        document.getElementById('card-infinito').classList.remove('ativo');
    }, {passive:true});

    document.getElementById('card-infinito').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        tipoNovoProjeto = 'infinito';
        document.getElementById('card-infinito').classList.add('ativo');
        document.getElementById('card-finito').classList.remove('ativo');
    }, {passive:true});

    document.getElementById('btn-confirmar-novo-proj').addEventListener('touchstart', function(e) {
        e.stopPropagation(); e.preventDefault();
        document.getElementById('modal-novo-projeto').classList.remove('aberto');
        novoProjeto(tipoNovoProjeto);
    }, {passive:false});

    document.getElementById('btn-cancelar-novo-proj').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        document.getElementById('modal-novo-projeto').classList.remove('aberto');
    }, {passive:true});

    // ====== BOTÃO CONFIRMAR PEN ======
    document.getElementById('btn-confirmar-pen').addEventListener('touchstart', function(e) {
        e.stopPropagation(); e.preventDefault();
        confirmarPen();
    }, {passive:false});

    // ====== CARREGA CONFIGURAÇÕES LOCAIS E INICIA ======
    function carregarConfigLocal() {
        var cfg = localStorage.getItem('tm_config');
        if (cfg) {
            try {
                var parsed = JSON.parse(cfg);
                configUsuario = { ...configUsuario, ...parsed };
            } catch(e) {}
        }
        aplicarConfig();
    }

    // ====== FUNÇÃO DE AUTENTICAÇÃO CORRIGIDA (MODO DEMO) ======
    window.iniciarAuth = function() {
        console.log('🔓 Modo DEMO – autenticação desativada');
        // Força a tela inicial
        setTimeout(function() {
            if (typeof mostrarTelaInicial === 'function') {
                mostrarTelaInicial();
            } else {
                console.warn('mostrarTelaInicial não encontrada, tentando novamente...');
                setTimeout(function() {
                    if (typeof mostrarTelaInicial === 'function') mostrarTelaInicial();
                }, 200);
            }
        }, 100);
    };

    // Inicia a aplicação
    carregarConfigLocal();
    if (typeof iniciarAuth === 'function') {
        iniciarAuth();
    } else {
        console.warn('iniciarAuth não definida, chamando mostrarTelaInicial diretamente');
        setTimeout(function() {
            if (typeof mostrarTelaInicial === 'function') mostrarTelaInicial();
        }, 50);
    }

    // ====== RENDERIZAÇÃO FINAL ======
    renderizarTodos();
});
