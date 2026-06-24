// ====== VIEWPORT ======
let scale = 0.8, posX = 20, posY = 80, rotacao = 0;

// ====== CAMADAS ======
let camadas = [], camadaAtiva = 0;
let camadaFoto = { opacidade:1, visivel:true, svgHTML:'' };
let fotoOrdem = -1, idCounter = 1;

// ====== HISTÓRICO ======
let historico = [], historicoFuturo = [];

// ====== FERRAMENTAS ======
let ferramentaAtiva = 'pen';
let modoPen = false, modoEditar = false, modoLivre = false, modoBorracha = false;
let modoFormas = false, modoDegrade = false, modoSelecao = false, modoContaGotas = false;
let modoEspelho = false, modoOutline = false, modoInfinito = false;
let folhaTravada = false, snapAtivo = false, reguaAtiva = false;
let pincelAtual = 'normal';
let menuPinceisAberto = false;

// ====== PEN ======
let caminhoAtivo = -1, pontosPen = [], pathFechado = false;
let noArrastado = null, isNewPoint = false, hasMovedTap = false;
let _penPontosCriados = 0, _penUndoIdx = -1;

// ====== LIVRE ======
let pincelDesenhando = false, pincelUltX = null, pincelUltY = null;
let pincelGrupoAtual = null, pincelPathPrincipal = null, pincelPathD = '';
let pincelPontosAcum = [];

// ====== BORRACHA ======
let pontosBorracha = [];

// ====== FORMAS ======
let formaAtual = 'circulo', formaStart = null;

// ====== DEGRADÊ ======
let degradeStart = null, degradeNCores = 2, degradeTipo = 'linear', degradeFill = 'tela';
let degradeIdCnt = 0;
let _dgAjuste = null, _dgBolhaDrag = null, _txtDgAjuste = null;
let _dgPrevInited = false, _dgPrevGrad = null, _dgPrevRect = null;

// ====== SELEÇÃO ======
let selecaoEl = null, selecaoTipo = null, selecaoCaminhoInfo = null;
let selecaoOffX = 0, selecaoOffY = 0, selecaoTransX = 0, selecaoTransY = 0;
let _selResizing = false, _selResizeCorner = null, _selCurrentScale = 1;
let _selBBox = null, _selRealEl = null, _selHandlePositions = null;
let _selRotating = false, _selRotOrigAngle = 0, _selRotCurAngle = 0;

// ====== TEXTO ======
let textoFonte = 'sans-serif', textoBold = false, textoItalic = false;
let textoPosX = 400, textoPosY = 300;
let _textoEditando = null, _txtDrag = null;
let txtDegradeTipo = 'linear';

// ====== UI ======
let painelAberto = false, painelHistoricoAberto = false;
let usuarioAtual = null;
let configUsuario = { nome:'', foto:'', tema:'escuro', accent:'#03dac6', folha:'800x1000', idioma:'pt' };

// ====== VETORIZAÇÃO ======
window.imgParaVetor = null;
let nrCoresSelecionadas = 1;

// ====== INFINITO ======
let gradeAtiva = false, gradeTamanho = 20;

const NS = 'http://www.w3.org/2000/svg';
function mkEl(tag, attrs) { const el=document.createElementNS(NS,tag); for(const [k,v] of Object.entries(attrs)) el.setAttribute(k,v); return el; }
