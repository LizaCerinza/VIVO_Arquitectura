// Genera los diagramas explicativos de tácticas y patrones por escenario (Punto 4).
// Cada diagrama muestra el flujo de VIVO y, sobre cada elemento, las tácticas (T) y patrones (P) que se aplican allí.
// Uso: node generar_tacticas.js
const fs = require('fs');
const path = require('path');

const FONT = "font-family='Segoe UI, Arial, Helvetica, sans-serif'";
const INK = '#1E2A36';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text, max) {
  const out = []; let cur = '';
  for (const w of text.split(' ')) { if ((cur + ' ' + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const KIND = {
  person: { fill: '#2F3E4F', stroke: '#1E2A36', text: '#FFFFFF', sub: '#C9D3DD' },
  ext: { fill: '#8C96A0', stroke: '#6B7580', text: '#FFFFFF', sub: '#EEF1F4' },
  vivo: { fill: '#1F6FB8', stroke: '#16568F', text: '#FFFFFF', sub: '#DCEBFA' },
  store: { fill: '#5B9BD5', stroke: '#3F7DB5', text: '#FFFFFF', sub: '#EAF3FC' },
};

function node(n) {
  const k = KIND[n.kind]; let s = '';
  if (n.shape === 'db') {
    s += `<path d='M${n.x},${n.y + 12} a${n.w / 2},12 0 0,0 ${n.w},0 v${n.h - 24} a${n.w / 2},12 0 0,1 ${-n.w},0 z' fill='${k.fill}' stroke='${k.stroke}' stroke-width='2'/>`;
    s += `<ellipse cx='${n.x + n.w / 2}' cy='${n.y + 12}' rx='${n.w / 2}' ry='12' fill='${k.fill}' stroke='${k.stroke}' stroke-width='2'/>`;
  } else if (n.shape === 'queue') {
    s += `<rect x='${n.x}' y='${n.y}' width='${n.w}' height='${n.h}' rx='${n.h / 2.4}' fill='${k.fill}' stroke='${k.stroke}' stroke-width='2'/>`;
    for (let i = 1; i <= 3; i++) s += `<line x1='${n.x + n.w - 18 - i * 12}' y1='${n.y + n.h - 26}' x2='${n.x + n.w - 18 - i * 12}' y2='${n.y + n.h - 12}' stroke='${k.sub}' stroke-width='3'/>`;
  } else {
    s += `<rect x='${n.x}' y='${n.y}' width='${n.w}' height='${n.h}' rx='${n.kind === 'person' ? 26 : 10}' fill='${k.fill}' stroke='${k.stroke}' stroke-width='2'/>`;
  }
  const cx = n.x + n.w / 2; const top = n.y + (n.shape === 'db' ? 42 : 32);
  wrap(n.title, Math.floor(n.w / 10.5)).forEach((l, i) => { s += `<text x='${cx}' y='${top + i * 21}' text-anchor='middle' ${FONT} font-size='17' font-weight='700' fill='${k.text}'>${esc(l)}</text>`; });
  const nt = wrap(n.title, Math.floor(n.w / 10.5)).length;
  wrap(n.sub || '', Math.floor(n.w / 7.6)).forEach((l, i) => { s += `<text x='${cx}' y='${top + nt * 21 + 2 + i * 17}' text-anchor='middle' ${FONT} font-size='13.5' fill='${k.sub}'>${esc(l)}</text>`; });
  return s;
}
function edge(e, N) {
  const a = N[e.from], b = N[e.to];
  let pts = e.pts;
  if (!pts) {
    if (Math.abs((a.y + a.h / 2) - (b.y + b.h / 2)) < 15) pts = [[a.x + a.w, a.y + a.h / 2], [b.x, a.y + a.h / 2]];
    else if (b.y > a.y) pts = [[a.x + a.w / 2, a.y + a.h], [b.x + b.w / 2, b.y]];
    else pts = [[a.x + a.w / 2, a.y], [b.x + b.w / 2, b.y + b.h]];
  }
  const d = 'M' + pts.map(p => p.join(',')).join(' L');
  const color = e.color || '#5A6B7D';
  let s = `<path d='${d}' fill='none' stroke='${color}' stroke-width='2.4' ${e.dash ? "stroke-dasharray='7 5'" : ''} marker-end='url(#arr)'/>`;
  if (e.label) {
    const [p, q] = [pts[pts.length - 2], pts[pts.length - 1]];
    const [lx, ly] = e.at || [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 10];
    const w = e.label.length * 7.2 + 12;
    s += `<rect x='${lx - w / 2}' y='${ly - 14}' width='${w}' height='20' rx='4' fill='#FFFFFF' fill-opacity='0.92'/>`;
    s += `<text x='${lx}' y='${ly + 1}' text-anchor='middle' ${FONT} font-size='13' font-style='italic' fill='#44546A'>${esc(e.label)}</text>`;
  }
  return s;
}
// Etiqueta de táctica/patrón
function chip(x, y, w, cat, id, text) {
  const lines = wrap(text, Math.floor((w - 50) / 7.1));
  const h = 12 + lines.length * 17;
  let s = `<rect x='${x}' y='${y}' width='${w}' height='${h}' rx='8' fill='${cat.soft}' stroke='${cat.color}' stroke-width='1.6'/>`;
  s += `<rect x='${x}' y='${y}' width='38' height='${h}' rx='8' fill='${cat.color}'/><rect x='${x + 30}' y='${y}' width='8' height='${h}' fill='${cat.color}'/>`;
  s += `<text x='${x + 19}' y='${y + h / 2 + 5}' text-anchor='middle' ${FONT} font-size='13.5' font-weight='700' fill='#FFFFFF'>${id}</text>`;
  lines.forEach((l, i) => { s += `<text x='${x + 46}' y='${y + 20 + i * 17}' ${FONT} font-size='13.5' fill='${INK}'>${esc(l)}</text>`; });
  return { s, h };
}

function diagram(cfg) {
  const { W, H } = cfg; const N = {}; cfg.nodes.forEach(n => N[n.id] = n);
  let s = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>
<defs><marker id='arr' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='8' markerHeight='8' orient='auto-start-reverse'><path d='M0,0 L10,5 L0,10 z' fill='#5A6B7D'/></marker></defs>
<rect width='100%' height='100%' fill='#FFFFFF'/>`;
  s += `<rect x='0' y='0' width='${W}' height='92' fill='#0F2A44'/><rect x='0' y='92' width='${W}' height='5' fill='#E0A526'/>`;
  s += `<rect x='30' y='24' width='96' height='44' rx='22' fill='#E0A526'/><text x='78' y='53' text-anchor='middle' ${FONT} font-size='20' font-weight='700' fill='#FFFFFF'>${cfg.id}</text>`;
  s += `<text x='146' y='48' ${FONT} font-size='24' font-weight='700' fill='#FFFFFF'>${esc(cfg.titulo)}</text>`;
  s += `<text x='146' y='76' ${FONT} font-size='15' fill='#B9C7D6'>${esc(cfg.subtitulo)}</text>`;
  if (cfg.zone) s += `<rect x='${cfg.zone.x}' y='${cfg.zone.y}' width='${cfg.zone.w}' height='${cfg.zone.h}' rx='14' fill='#F5F9FD' stroke='#8FB3D9' stroke-width='1.8' stroke-dasharray='9 6'/><text x='${cfg.zone.x + 14}' y='${cfg.zone.y + 22}' ${FONT} font-size='14' font-weight='700' fill='#4F7BA8'>${esc(cfg.zone.label)}</text>`;
  cfg.edges.forEach(e => { s += edge(e, N); });
  cfg.nodes.forEach(n => { s += node(n); });
  // Etiquetas apiladas bajo (o junto a) cada elemento
  for (const g of cfg.chips) {
    const n = N[g.node]; let y = g.y !== undefined ? g.y : n.y + n.h + 14; const x = g.x !== undefined ? g.x : n.x + (n.w - g.w) / 2;
    for (const [cat, id, text] of g.items) { const c = chip(x, y, g.w, cfg.cats[cat], id, text); s += c.s; y += c.h + 8; }
  }
  // Leyenda
  let lx = 30; const ly = H - 34;
  s += `<text x='${lx}' y='${ly + 13}' ${FONT} font-size='14' font-weight='700' fill='#44546A'>Leyenda:</text>`; lx += 80;
  for (const [name, c] of Object.entries(cfg.cats)) {
    s += `<rect x='${lx}' y='${ly}' width='18' height='18' rx='4' fill='${c.color}'/><text x='${lx + 25}' y='${ly + 14}' ${FONT} font-size='14' fill='#44546A'>${esc(c.label)}</text>`;
    lx += 40 + c.label.length * 7.4;
  }
  s += `<text x='${W - 30}' y='${ly + 14}' text-anchor='end' ${FONT} font-size='13' fill='#7A8794'>${esc(cfg.pie)}</text>`;
  return s + '</svg>';
}

const CAT = {
  detectar: { color: '#D9731A', soft: '#FDF1E5', label: 'Táctica · Detectar' },
  resistir: { color: '#1F6FB8', soft: '#E8F1FB', label: 'Táctica · Resistir' },
  prevenir: { color: '#1F6FB8', soft: '#E8F1FB', label: 'Táctica · Prevenir' },
  reaccionar: { color: '#C0392B', soft: '#FBEAE8', label: 'Táctica · Reaccionar' },
  recuperar: { color: '#2E8B57', soft: '#E9F6EE', label: 'Táctica · Recuperar' },
  patron: { color: '#7A4FB0', soft: '#F2ECF9', label: 'Patrón' },
};
const pick = (...k) => Object.fromEntries(k.map(x => [x, CAT[x]]));

// ---------------- EC-01 Disponibilidad ----------------
const ec01 = {
  archivo: 'T_EC-01_Disponibilidad.svg', id: 'EC-01', W: 1800, H: 720,
  titulo: 'Tácticas y patrones · Disponibilidad ante falla del RNDC',
  subtitulo: 'Dónde se aplica cada táctica (T) y patrón (P) en el flujo de VIVO · Tácticas de Bass, Clements & Kazman (diapositivas de clase)',
  cats: pick('detectar', 'recuperar', 'prevenir', 'patron'),
  zone: { x: 395, y: 128, w: 1165, h: 512, label: 'VIVO' },
  nodes: [
    { id: 'op', kind: 'person', x: 20, y: 170, w: 150, h: 110, title: 'Operador', sub: 'Empresa de transporte' },
    { id: 'wa', kind: 'ext', x: 205, y: 170, w: 160, h: 110, title: 'WhatsApp', sub: 'Canal externo' },
    { id: 'api', kind: 'vivo', x: 420, y: 170, w: 210, h: 110, title: 'API de Recepción', sub: 'Responde sin esperar al RNDC' },
    { id: 'bd', kind: 'store', shape: 'db', x: 665, y: 165, w: 190, h: 120, title: 'Base de datos', sub: 'Solicitud + tarea' },
    { id: 'cola', kind: 'store', shape: 'queue', x: 890, y: 170, w: 180, h: 110, title: 'Cola durable', sub: 'Tareas pendientes' },
    { id: 'proc', kind: 'vivo', x: 1105, y: 170, w: 190, h: 110, title: 'Procesador RNDC', sub: 'Trabajo de fondo' },
    { id: 'ctl', kind: 'vivo', x: 1330, y: 170, w: 210, h: 110, title: 'Control de llamadas', sub: 'Adaptador RNDC' },
    { id: 'rndc', kind: 'ext', x: 1590, y: 170, w: 190, h: 110, title: 'RNDC', sub: 'Falla 30 min' },
    { id: 'mon', kind: 'vivo', x: 1330, y: 520, w: 210, h: 100, title: 'Monitor', sub: 'Salud del RNDC y pendientes' },
    { id: 'adm', kind: 'person', x: 1590, y: 520, w: 190, h: 100, title: 'Administrador', sub: 'Recibe alertas' },
  ],
  edges: [
    { from: 'op', to: 'wa' }, { from: 'wa', to: 'api' }, { from: 'api', to: 'bd' }, { from: 'bd', to: 'cola' },
    { from: 'cola', to: 'proc' }, { from: 'proc', to: 'ctl' },
    { from: 'ctl', to: 'rndc', color: '#C0392B', dash: true, label: 'sin respuesta', at: [1565, 160] },
    { from: 'ctl', to: 'mon', dash: true, pts: [[1435, 280], [1435, 520]], label: 'métricas', at: [1478, 500] },
    { from: 'mon', to: 'adm', label: 'alerta', at: [1565, 560] },
    { from: 'mon', to: 'rndc', dash: true, pts: [[1540, 545], [1685, 410], [1685, 280]], label: 'sonda', at: [1720, 400] },
  ],
  chips: [
    { node: 'api', w: 230, items: [['recuperar', 'T5', 'Degradación controlada: sigue recibiendo y registrando'], ['patron', 'P3', 'Repuesto redundante: 2 instancias activas']] },
    { node: 'bd', w: 210, items: [['prevenir', 'T7', 'Transacciones: solicitud y tarea se guardan juntas']] },
    { node: 'cola', w: 200, items: [['patron', 'P2', 'Cola de nivelación de carga']] },
    { node: 'proc', w: 200, items: [['recuperar', 'T6', 'Manejo de excepciones: estado «Pendiente de envío»'], ['recuperar', 'T4', 'Reintento con espera creciente']] },
    { node: 'ctl', w: 220, items: [['detectar', 'T1', 'Detección de excepciones: tiempo límite y errores'], ['patron', 'P1', 'Circuit Breaker: deja de llamar al RNDC']] },
    { node: 'mon', x: 1045, y: 512, w: 270, items: [['detectar', 'T2', 'Monitoreo de condiciones: errores y edad de pendientes'], ['detectar', 'T3', 'Ping/eco: sonda para saber cuándo vuelve el RNDC']] },
  ],
  pie: 'VIVO · Punto 4',
};

// ---------------- EC-02 Integridad de los datos ----------------
const ec02 = {
  archivo: 'T_EC-02_Integridad_de_los_Datos.svg', id: 'EC-02', W: 1800, H: 720,
  titulo: 'Tácticas y patrones · Integridad ante respuesta incierta del RNDC',
  subtitulo: 'Atributo sin diapositiva propia: tácticas de prevención/detección de Bass + patrones de integración (Hohpe & Woolf, Richardson, Microsoft)',
  cats: pick('prevenir', 'detectar', 'recuperar', 'patron'),
  zone: { x: 190, y: 128, w: 1370, h: 512, label: 'VIVO' },
  nodes: [
    { id: 'wa', kind: 'ext', x: 20, y: 170, w: 150, h: 110, title: 'WhatsApp', sub: 'Puede repetir eventos' },
    { id: 'api', kind: 'vivo', x: 215, y: 170, w: 200, h: 110, title: 'API de Recepción', sub: 'Asigna id interno' },
    { id: 'bd', kind: 'store', shape: 'db', x: 450, y: 165, w: 210, h: 120, title: 'Base de datos', sub: 'Solicitud, outbox y bitácora' },
    { id: 'cola', kind: 'store', shape: 'queue', x: 695, y: 170, w: 170, h: 110, title: 'Cola durable', sub: 'Entrega al menos una vez' },
    { id: 'orq', kind: 'vivo', x: 900, y: 170, w: 210, h: 110, title: 'Orquestador', sub: 'Máquina de estados' },
    { id: 'ad', kind: 'vivo', x: 1145, y: 170, w: 200, h: 110, title: 'Adaptador RNDC', sub: 'Envía con id interno' },
    { id: 'rndc', kind: 'ext', x: 1590, y: 170, w: 190, h: 110, title: 'RNDC', sub: 'Respuesta perdida' },
    { id: 'con', kind: 'vivo', x: 1145, y: 520, w: 200, h: 100, title: 'Conciliador', sub: 'Resuelve estados inciertos' },
    { id: 'adm', kind: 'person', x: 1590, y: 520, w: 190, h: 100, title: 'Revisión manual', sub: 'Administrador' },
  ],
  edges: [
    { from: 'wa', to: 'api' }, { from: 'api', to: 'bd' }, { from: 'bd', to: 'cola' }, { from: 'cola', to: 'orq' },
    { from: 'orq', to: 'ad' }, { from: 'ad', to: 'rndc', color: '#C0392B', dash: true, label: '¿registrado?', at: [1468, 160] },
    { from: 'ad', to: 'con', dash: true, pts: [[1245, 280], [1245, 520]], label: 'resultado incierto', at: [1310, 500] },
    { from: 'con', to: 'rndc', pts: [[1345, 545], [1685, 380], [1685, 280]], label: 'consulta estado', at: [1610, 380] },
    { from: 'con', to: 'adm', label: 'no resuelto', at: [1468, 590] },
  ],
  chips: [
    { node: 'api', w: 220, items: [['patron', 'P1', 'Receptor idempotente: descarta mensajes repetidos']] },
    { node: 'bd', w: 230, items: [['patron', 'P2', 'Transactional Outbox'], ['prevenir', 'T2', 'Transacciones'], ['recuperar', 'T6', 'Bitácora inmutable de estados e intentos']] },
    { node: 'cola', w: 190, items: [['patron', 'P1', 'Consumidor idempotente']] },
    { node: 'orq', w: 220, items: [['detectar', 'T3', 'Verificación de transiciones (sanity checking)'], ['detectar', 'T4', 'Marca de tiempo: respuestas fuera de orden']] },
    { node: 'ad', w: 210, items: [['prevenir', 'T1', 'Llave de idempotencia: mismo id en cada intento']] },
    { node: 'con', x: 850, y: 512, w: 280, items: [['recuperar', 'T5', 'Consultar antes de reintentar'], ['patron', 'P3', 'Scheduler Agent Supervisor']] },
  ],
  pie: 'VIVO · Punto 4',
};

// ---------------- EC-03 Seguridad ----------------
const ec03 = {
  archivo: 'T_EC-03_Seguridad.svg', id: 'EC-03', W: 1800, H: 740,
  titulo: 'Tácticas y patrones · Seguridad ante acceso cruzado entre empresas',
  subtitulo: 'Tácticas de seguridad de Bass (Detectar, Resistir, Reaccionar, Recuperar) y patrones de las diapositivas de clase',
  cats: pick('detectar', 'resistir', 'reaccionar', 'recuperar', 'patron'),
  zone: { x: 400, y: 128, w: 1125, h: 532, label: 'VIVO' },
  nodes: [
    { id: 'op', kind: 'person', x: 20, y: 170, w: 160, h: 110, title: 'Operador empresa A', sub: 'Pide datos de la empresa B' },
    { id: 'wa', kind: 'ext', x: 215, y: 170, w: 160, h: 110, title: 'WhatsApp', sub: 'Webhook firmado' },
    { id: 'gw', kind: 'vivo', x: 425, y: 170, w: 230, h: 110, title: 'Security Gateway', sub: 'Único punto de entrada' },
    { id: 'api', kind: 'vivo', x: 700, y: 170, w: 250, h: 110, title: 'Identidad y Autorización', sub: 'En cada operación' },
    { id: 'rep', kind: 'vivo', x: 995, y: 170, w: 230, h: 110, title: 'Consulta de solicitudes', sub: 'Filtra por empresa' },
    { id: 'bd', kind: 'store', shape: 'db', x: 1270, y: 165, w: 200, h: 120, title: 'Base de datos', sub: 'Datos por empresa' },
    { id: 'aud', kind: 'vivo', x: 995, y: 540, w: 230, h: 100, title: 'Auditoría', sub: 'Registro de intentos' },
    { id: 'adm', kind: 'person', x: 1570, y: 570, w: 200, h: 100, title: 'Administrador', sub: 'Recibe alertas' },
  ],
  edges: [
    { from: 'op', to: 'wa' }, { from: 'wa', to: 'gw' }, { from: 'gw', to: 'api' },
    { from: 'api', to: 'rep', color: '#C0392B', dash: true, label: 'denegado', at: [972, 160] },
    { from: 'rep', to: 'bd' },
    { from: 'api', to: 'aud', pts: [[825, 280], [825, 590], [995, 590]], label: 'registra intento', at: [900, 578] },
    { from: 'aud', to: 'adm', pts: [[1225, 620], [1560, 620]], label: 'alerta tras 3 intentos', at: [1390, 606] },
  ],
  chips: [
    { node: 'gw', w: 240, items: [['patron', 'P1', 'Security Gateway'], ['patron', 'P2', 'Intercepting Validator'], ['detectar', 'T1', 'Verificar integridad del mensaje (firma)'], ['resistir', 'T8', 'Validar entrada']] },
    { node: 'api', w: 250, items: [['resistir', 'T3', 'Identificar actores'], ['resistir', 'T4', 'Autenticar actores'], ['resistir', 'T5', 'Autorizar actores por empresa y operación'], ['resistir', 'T7', 'Limitar exposición: respuesta genérica']] },
    { node: 'rep', w: 240, items: [['resistir', 'T6', 'Separar entidades: filtro por empresa'], ['detectar', 'T2', 'Detectar intrusión: accesos cruzados repetidos']] },
    { node: 'bd', w: 220, items: [['resistir', 'T9', 'Cifrar datos']] },
    { node: 'aud', x: 1245, y: 400, w: 265, items: [['recuperar', 'T12', 'Auditoría'], ['recuperar', 'T13', 'No repudio'], ['reaccionar', 'T10', 'Restringir inicio de sesión: bloqueo temporal'], ['reaccionar', 'T11', 'Informar a los actores: alerta']] },
  ],
  pie: 'VIVO · Punto 4',
};

for (const d of [ec01, ec02, ec03]) fs.writeFileSync(path.join(__dirname, d.archivo), diagram(d), 'utf8');
console.log('Generados');
