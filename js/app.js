// app.js – Versão estável com modo demo
window.addEventListener('load', function() {

    // ====== CORREÇÃO: força modo demo imediatamente ======
    if (!firebaseOk) {
        setTimeout(function() {
            if (typeof mostrarTelaInicial === 'function') {
                mostrarTelaInicial();
            } else {
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
    if (typeof centralizarFolha === 'function') centralizarFolha();
    if (typeof renderizarTelaInicial === 'function') renderizarTelaInicial();
    if (camadas.length === 0) {
        camadas.push(criarCamada('Camada 1'));
        camadaAtiva = 0;
    }
    if (typeof renderizarTodos === 'function') renderizarTodos();

    // ====== EVENTOS DA BARRA ======
    document.getElementById('btn-nova-camada').addEventListener('click', function() {
        if (typeof novaCamada === 'function') novaCamada();
    });
    document.getElementById('btn-fechar-painel').addEventListener('click', function() {
        if (typeof togglePainel === 'function') togglePainel();
    });

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
    }, { passive: true });

    document.getElementById('btn-inserir-texto').addEventListener('touchend', function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (typeof inserirTexto === 'function') inserirTexto();
    }, { passive: false });
    document.getElementById('btn-inserir-texto').addEventListener('click', function(e) {
        e.stopPropagation();
        if (typeof inserirTexto === 'function') inserirTexto();
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
        if (typeof mostrarNotificacao === 'function') mostrarNotificacao('Fonte "' + nome + '" aplicada!');
    }, { passive: true });

    document.getElementById('txt-bold').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        textoBold = !textoBold;
        var el = document.getElementById('txt-bold');
        el.style.color = textoBold ? '#03dac6' : '#aaa';
        el.style.borderColor = textoBold ? '#03dac6' : '#333';
    }, { passive: true });

    document.getElementById('txt-italic').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        textoItalic = !textoItalic;
        var el = document.getElementById('txt-italic');
        el.style.color = textoItalic ? '#03dac6' : '#aaa';
        el.style.borderColor = textoItalic ? '#03dac6' : '#333';
    }, { passive: true });

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
    }, { passive: true });

    document.getElementById('txt-deg-radial').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        txtDegradeTipo = 'radial';
        document.getElementById('txt-deg-radial').style.cssText = 'flex:1;padding:6px;border-radius:8px;border:2px solid #03dac6;background:#1e2e2e;color:#03dac6;font-size:10px;font-weight:bold;text-align:center;';
        document.getElementById('txt-deg-linear').style.cssText = 'flex:1;padding:6px;border-radius:8px;border:1px solid #333;background:#2a2a2a;color:#888;font-size:10px;font-weight:bold;text-align:center;';
    }, { passive: true });

    // ====== NOVO PROJETO (eventos com onclick já no HTML) ======
    // Mantemos apenas os eventos que não estão no HTML
    document.getElementById('chk-grade').addEventListener('change', function(e) {
        gradeAtiva = e.target.checked;
        document.getElementById('grade-size-wrap').style.display = gradeAtiva ? 'block' : 'none';
    });

    // ====== BOTÃO CONFIRMAR PEN ======
    var btnConfirmarPen = document.getElementById('btn-confirmar-pen');
    if (btnConfirmarPen) {
        btnConfirmarPen.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (typeof confirmarPen === 'function') confirmarPen();
        }, { passive: false });
    }

    // ====== CARREGA CONFIGURAÇÕES LOCAIS ======
    function carregarConfigLocal() {
        var cfg = localStorage.getItem('tm_config');
        if (cfg) {
            try {
                var parsed = JSON.parse(cfg);
                configUsuario = { ...configUsuario, ...parsed };
            } catch (e) {}
        }
        if (typeof aplicarConfig === 'function') aplicarConfig();
    }

    // ====== FUNÇÃO DE AUTENTICAÇÃO CORRIGIDA (MODO DEMO) ======
    window.iniciarAuth = function() {
        console.log('🔓 Modo DEMO – autenticação desativada');
        setTimeout(function() {
            if (typeof mostrarTelaInicial === 'function') {
                mostrarTelaInicial();
            } else {
                setTimeout(function() {
                    if (typeof mostrarTelaInicial === 'function') mostrarTelaInicial();
                }, 200);
            }
        }, 100);
    };

    // ====== INICIALIZA ======
    carregarConfigLocal();
    if (typeof iniciarAuth === 'function') {
        iniciarAuth();
    } else {
        setTimeout(function() {
            if (typeof mostrarTelaInicial === 'function') mostrarTelaInicial();
        }, 50);
    }

    // ====== RENDERIZAÇÃO FINAL ======
    if (typeof renderizarTodos === 'function') renderizarTodos();

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
                            return { ...p, pontos: p.pontos.map(function(pt) { return { x: pt.x, y: pt.y, tipo: pt.tipo }; }) };
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
        } catch (e) { /* silencioso */ }
    }, 10000);

    // ====== CARREGA RASCUNHO ======
    try {
        var raw = localStorage.getItem('tm_rascunho');
        if (raw) {
            var r = JSON.parse(raw);
            if (r.camadas) {
                camadas = r.camadas;
                camadaFoto = r.camadaFoto || { opacidade: 1, visivel: true, svgHTML: '' };
                if (r.fotoOrdem !== undefined) fotoOrdem = r.fotoOrdem;
                if (r.textoHTML) document.getElementById('texto-layer').innerHTML = r.textoHTML;
                if (r.workW) workSurface.style.width = r.workW + 'px';
                if (r.workH) workSurface.style.height = r.workH + 'px';
                if (r.modoInfinito !== undefined) modoInfinito = r.modoInfinito;
                if (r.gradeAtiva !== undefined) gradeAtiva = r.gradeAtiva;
                if (r.gradeTamanho !== undefined) gradeTamanho = r.gradeTamanho;
                if (r.rotacao !== undefined) rotacao = r.rotacao;
                if (r.camadaAtivaIdx !== undefined) camadaAtiva = r.camadaAtivaIdx;
                if (typeof aplicarModoInfinito === 'function') aplicarModoInfinito(modoInfinito);
                if (typeof renderizarGrade === 'function') renderizarGrade();
                if (typeof renderizarTodos === 'function') renderizarTodos();
                if (painelAberto && typeof renderizarPainel === 'function') renderizarPainel();
                if (r.workW || r.workH && typeof centralizarFolha === 'function') centralizarFolha();
            }
        }
    } catch (e) {}

    // ====== SINCroniza cor da barra ======
    var colMain = document.getElementById('col-main');
    var corBar = document.getElementById('cor-preview-bar');
    if (colMain && corBar) {
        colMain.addEventListener('input', function() {
            corBar.style.background = colMain.value;
        });
        corBar.style.background = colMain.value;
    }

    console.log('TraceMaster inicializado em modo DEMO.');
});
