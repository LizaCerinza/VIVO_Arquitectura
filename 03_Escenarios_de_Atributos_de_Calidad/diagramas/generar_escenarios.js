// Genera los diagramas de escenarios de atributos de calidad con la estructura de la figura vista en clase
// (Bass, Clements & Kazman, Software Architecture in Practice): Fuente -> Estímulo -> Artefacto (Ambiente) -> Respuesta -> Medida,
// con un color por parte y las partes numeradas 1-6 como en la diapositiva.
// Uso: node generar_escenarios.js
const fs = require('fs');
const path = require('path');

const FONT = "font-family='Segoe UI, Arial, Helvetica, sans-serif'";
const INK = '#1E2A36';
const C = {
  fuente: { main: '#4A5D73', soft: '#EEF2F6' },
  estimulo: { main: '#D9731A', soft: '#FDF1E5' },
  artefacto: { main: '#1F6FB8', soft: '#E8F1FB' },
  ambiente: { main: '#6B7B8C', soft: '#F3F5F7' },
  respuesta: { main: '#2E8B57', soft: '#E9F6EE' },
  medida: { main: '#7A4FB0', soft: '#F2ECF9' },
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text, max) {
  const out = [];
  for (const para of text.split('\n')) {
    const words = para.split(' '); let cur = ''; const first = out.length;
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur += ' ' + w;
    }
    if (cur.trim()) out.push(cur.trim());
    out[first] = { t: out[first], start: true };
    for (let i = first + 1; i < out.length; i++) if (typeof out[i] === 'string') out[i] = { t: out[i] };
    out.push(null);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}
// Bloque de texto; si bullets=true, cada párrafo lleva un punto de color
function block(x, y, text, max, color, bullets) {
  const ls = wrap(text, max).filter(Boolean); const lh = 22; let s = ''; let gap = 0;
  ls.forEach((l, i) => {
    if (bullets && l.start && i > 0) gap += 8;   // pequeño espacio entre viñetas
    const yy = y + i * lh + gap;
    if (bullets && l.start) s += `<circle cx='${x + 5}' cy='${yy - 5}' r='4' fill='${color}'/>`;
    s += `<text x='${x + (bullets ? 16 : 0)}' y='${yy}' ${FONT} font-size='16' fill='${INK}'>${esc(l.t)}</text>`;
  });
  return { svg: s, h: ls.length * lh + gap };
}
const badge = (cx, cy, n, color) => `<circle cx='${cx}' cy='${cy}' r='15' fill='${color}'/><text x='${cx}' y='${cy + 6}' text-anchor='middle' ${FONT} font-size='17' font-weight='700' fill='#FFFFFF'>${n}</text>`;
const label = (x, y, t, color, size = 19, anchor = 'middle') => `<text x='${x}' y='${y}' text-anchor='${anchor}' ${FONT} font-size='${size}' font-weight='700' fill='${color}'>${esc(t)}</text>`;

function handIcon(cx, cy, col) {
  return `<circle cx='${cx}' cy='${cy}' r='62' fill='${col.soft}' stroke='${col.main}' stroke-width='2.5'/>
  <g transform='translate(${cx - 4},${cy + 6})' stroke='${INK}' stroke-width='3.5' stroke-linejoin='round' stroke-linecap='round'>
  <circle cx='22' cy='-30' r='22' fill='#FFFFFF' stroke='${col.main}'/><circle cx='22' cy='-30' r='12' fill='${col.main}' stroke='none'/>
  <path d='M14,-22 L-22,14 M-22,14 C-40,-2 -58,8 -44,24 L-28,40 C-20,52 -6,60 8,54 L30,32 C38,24 34,14 26,14 C30,6 24,-2 16,0 C18,-8 10,-14 2,-10 L22,-30' fill='#FFFFFF'/>
  </g>`;
}
function gaugeIcon(cx, cy, col, r = 62) {
  let s = `<circle cx='${cx}' cy='${cy}' r='${r}' fill='${col.soft}' stroke='${col.main}' stroke-width='3'/>`;
  s += `<g fill='none' stroke='${col.main}' stroke-width='3'>`;
  s += `<path d='M${cx - 8},${cy - r + 1} Q${cx - 32},${cy} ${cx - 8},${cy + r - 1}'/>`;
  s += `<line x1='${cx - 4}' y1='${cy - 20}' x2='${cx + r - 6}' y2='${cy - 20}' stroke-width='1.8'/>`;
  s += `<polyline points='${cx},${cy - 32} ${cx + 9},${cy - 44} ${cx + 16},${cy - 28} ${cx + 25},${cy - 46} ${cx + 34},${cy - 29} ${cx + 43},${cy - 42} ${cx + 52},${cy - 31}' stroke-width='2.4'/>`;
  s += `<line x1='${cx + 12}' y1='${cy - 6}' x2='${cx + 44}' y2='${cy - 6}' stroke-width='2.4'/><path d='M${cx + 36},${cy - 11} L${cx + 46},${cy - 6} L${cx + 36},${cy - 1}' stroke-width='2.4'/>`;
  s += `<line x1='${cx + 12}' y1='${cy + 7}' x2='${cx + 44}' y2='${cy + 7}' stroke-width='2.4'/><path d='M${cx + 20},${cy + 2} L${cx + 10},${cy + 7} L${cx + 20},${cy + 12}' stroke-width='2.4'/>`;
  s += `<line x1='${cx - 4}' y1='${cy + 20}' x2='${cx + r - 6}' y2='${cy + 20}' stroke-width='1.8'/>`;
  for (let i = 0; i < 8; i++) { const bx = cx + 6 + i * 6; const bh = [16, 9, 20, 12, 22, 10, 18, 14][i]; s += `<line x1='${bx}' y1='${cy + 26}' x2='${bx}' y2='${cy + 26 + bh}' stroke-width='3'/>`; }
  s += `</g>`;
  ['1', '2', '3', '4'].forEach((n, i) => { s += `<text x='${cx - 46 + [4, 0, 0, 4][i]}' y='${cy - 22 + i * 19}' ${FONT} font-size='16' font-weight='700' fill='${col.main}'>${n}</text>`; });
  return s;
}
function arrow(x1, x2, y, color) {
  return `<line x1='${x1}' y1='${y}' x2='${x2 - 16}' y2='${y}' stroke='${color}' stroke-width='4' stroke-linecap='round'/><path d='M${x2 - 20},${y - 11} L${x2},${y} L${x2 - 20},${y + 11} z' fill='${color}'/>`;
}

function diagram(sc) {
  const W = 1600, AY = 220;
  let s = '';
  // Encabezado
  s += `<rect x='0' y='0' width='${W}' height='96' fill='#0F2A44'/>`;
  s += `<rect x='0' y='96' width='${W}' height='5' fill='${sc.color}'/>`;
  s += `<rect x='30' y='26' width='96' height='44' rx='22' fill='${sc.color}'/>`;
  s += label(78, 56, sc.id, '#FFFFFF', 20);
  s += label(146, 50, sc.titulo, '#FFFFFF', 25, 'start');
  s += `<text x='146' y='79' ${FONT} font-size='15.5' fill='#B9C7D6'>${esc(sc.subtitulo)}</text>`;

  // Figura
  s += handIcon(125, AY, C.fuente);
  s += badge(60, AY - 72, 1, C.fuente.main);
  s += label(125, AY + 92, 'Fuente', C.fuente.main);

  s += badge(330, AY - 34, 2, C.estimulo.main);
  s += label(408, AY - 28, 'Estímulo', C.estimulo.main, 19, 'middle');

  // Ambiente (marco) que contiene al artefacto
  s += `<rect x='604' y='${AY - 112}' width='416' height='236' rx='18' fill='${C.ambiente.soft}' stroke='${C.ambiente.main}' stroke-width='2' stroke-dasharray='9 6'/>`;
  s += `<rect x='630' y='${AY - 88}' width='364' height='160' rx='14' fill='#FFFFFF' stroke='${C.artefacto.main}' stroke-width='3.5'/>`;
  s += `<rect x='630' y='${AY - 88}' width='364' height='40' rx='14' fill='${C.artefacto.main}'/><rect x='630' y='${AY - 62}' width='364' height='14' fill='${C.artefacto.main}'/>`;
  s += badge(658, AY - 68, 3, '#0F4A80');
  s += label(812, AY - 61, 'Artefacto', '#FFFFFF');
  s += block(652, AY - 18, sc.artefacto, 36, C.artefacto.main, false).svg.replace(/x='652'/g, "x='812' text-anchor='middle'");
  s += badge(742, AY + 100, 4, C.ambiente.main);
  s += label(812, AY + 106, 'Ambiente', C.ambiente.main);

  s += arrow(195, 630, AY, C.estimulo.main);       // se dibuja después del marco para que la punta llegue al artefacto
  s += arrow(994, 1350, AY, C.respuesta.main);
  s += badge(1110, AY - 34, 5, C.respuesta.main);
  s += label(1190, AY - 28, 'Respuesta', C.respuesta.main);

  s += gaugeIcon(1440, AY, C.medida);
  s += badge(1520, AY - 60, 6, C.medida.main);
  s += label(1440, AY + 92, 'Medida de la respuesta', C.medida.main);

  // Tarjetas de texto por parte (debajo, como en la figura de clase)
  const TY = AY + 136;
  const cols = [
    { k: 'fuente', n: 1, t: 'Fuente', x: 30, w: 220, max: 21, txt: sc.fuente, b: false },
    { k: 'estimulo', n: 2, t: 'Estímulo', x: 266, w: 300, max: 30, txt: sc.estimulo, b: false },
    { k: 'ambiente', n: 4, t: 'Ambiente', x: 582, w: 300, max: 30, txt: sc.ambiente, b: false },
    { k: 'respuesta', n: 5, t: 'Respuesta', x: 898, w: 380, max: 36, txt: sc.respuesta, b: true },
    { k: 'medida', n: 6, t: 'Medida de la respuesta', x: 1294, w: 276, max: 25, txt: sc.medida, b: true },
  ];
  const bodies = cols.map(c => block(c.x + 16, TY + 66, c.txt, c.max, C[c.k].main, c.b));
  const CH = Math.max(...bodies.map(b => b.h)) + 90;
  cols.forEach((c, i) => {
    const col = C[c.k];
    s += `<rect x='${c.x}' y='${TY}' width='${c.w}' height='${CH}' rx='12' fill='${col.soft}' stroke='${col.main}' stroke-opacity='0.35' stroke-width='1.5'/>`;
    s += `<rect x='${c.x}' y='${TY}' width='${c.w}' height='6' rx='3' fill='${col.main}'/>`;
    s += badge(c.x + 28, TY + 34, c.n, col.main);
    s += label(c.x + 52, TY + 40, c.t, col.main, 17, 'start');
    s += bodies[i].svg;
  });
  const H = TY + CH + 48;
  s += `<text x='30' y='${H - 18}' ${FONT} font-size='13.5' fill='#7A8794'>${esc(sc.pie)}</text>`;
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'><rect width='100%' height='100%' fill='#FFFFFF'/>${s}</svg>`;
}

const escenarios = [
  {
    archivo: 'EC-01_Disponibilidad.svg', id: 'EC-01', color: '#E0A526',
    titulo: 'Disponibilidad ante falla del RNDC',
    subtitulo: 'Driver 1 · MN-01 (recepción 24/7), RF-07 · Intermitencias del RNDC en 2026 [F3, F4]',
    fuente: 'Externa: RNDC, servicio web oficial del Ministerio de Transporte',
    estimulo: 'Falla por omisión: el RNDC no responde (tiempo límite agotado o errores consecutivos) durante 30 minutos',
    artefacto: 'Procesamiento de trámites: proceso que envía las solicitudes al RNDC y su conexión',
    ambiente: 'Operación normal en hora pico (5:00–9:00 a. m.), con operadores enviando solicitudes por WhatsApp',
    respuesta: 'Seguir recibiendo y guardando solicitudes sin esperar al RNDC\nDejarlas «Pendiente de envío» y avisar al operador\nDejar de llamar temporalmente al RNDC y alertar al administrador\nReanudar solo cuando el RNDC vuelve, sin repetir lo ya procesado',
    medida: '0 solicitudes perdidas\nRecepción ≤ 3 s (p95) durante la falla\nRecepción disponible ≥ 99,5 % mensual\nPendientes reanudados ≤ 15 min tras la recuperación\nAlerta ≤ 5 min',
    pie: 'VIVO · Punto 3 · Estructura de escenario de atributo de calidad (Bass, Clements & Kazman)',
  },
  {
    archivo: 'EC-02_Integridad_de_los_Datos.svg', id: 'EC-02', color: '#E0A526',
    titulo: 'Integridad de los datos ante respuesta incierta del RNDC',
    subtitulo: 'Driver 2 · MN-04 (nunca «emitido» sin confirmación), RF-04, RF-06, RF-07',
    fuente: 'Externa: RNDC y la red entre VIVO y el RNDC',
    estimulo: 'Respuesta incorrecta en el tiempo: la respuesta a una expedición ya enviada se pierde o llega tarde; no se sabe si el RNDC la registró',
    artefacto: 'Registro de estados de la solicitud y procesamiento de trámites',
    ambiente: 'Operación normal con el RNDC respondiendo lento; la solicitud ya tiene identificador interno',
    respuesta: 'Marcar «Pendiente de conciliación» sin reenviar la creación\nConsultar el estado en el RNDC\nSi existe: «Emitida» con número oficial\nSi no existe: un reintento con el mismo id; si no se resuelve, revisión manual\nAvisar al operador «en verificación»',
    medida: '0 manifiestos duplicados\n0 «Emitida» sin número oficial\n100 % de respuestas inciertas conciliadas o en revisión ≤ 30 min\n100 % de intentos registrados',
    pie: 'VIVO · Punto 3 · Por validar: mecanismo de consulta de estado en el RNDC (RT-01, SP-02)',
  },
  {
    archivo: 'EC-03_Seguridad.svg', id: 'EC-03', color: '#E0A526',
    titulo: 'Seguridad: acceso cruzado entre empresas',
    subtitulo: 'Driver 3 · MN-03, RF-01, RT-03 (Ley 1581 de 2012) · Varias empresas comparten VIVO',
    fuente: 'Interna: operador autenticado de la empresa A',
    estimulo: 'Intento de acceso no autorizado: consultar o tramitar una solicitud de la empresa B',
    artefacto: 'Identidad y autorización, consulta de solicitudes y datos de las empresas',
    ambiente: 'Operación normal, en línea, con varias empresas activas',
    respuesta: 'Verificar usuario-empresa en la operación misma\nRechazar con mensaje genérico, sin confirmar si la solicitud existe\nRegistrar el intento en auditoría\nSi se repite: alertar y bloquear temporalmente',
    medida: '100 % de accesos cruzados bloqueados\n0 datos de la empresa B expuestos\n100 % de intentos registrados\nAlerta ≤ 5 min tras 3 intentos',
    pie: 'VIVO · Punto 3 · Estructura de escenario de atributo de calidad (Bass, Clements & Kazman)',
  },
];

for (const sc of escenarios) fs.writeFileSync(path.join(__dirname, sc.archivo), diagram(sc), 'utf8');
console.log('Generados:', escenarios.map(e => e.archivo).join(', '));
