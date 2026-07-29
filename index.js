/* ═══════════════════════════════════════════════════════════
   ROR CONTROL TOWER — Servisofts
   Diagrama interactivo de arquitectura + contenido dinámico
   ═══════════════════════════════════════════════════════════ */

"use strict";

/* ──────────────────────────────────────────────────────────
   1. DATOS — nodos del ecosistema
   ────────────────────────────────────────────────────────── */

const NODES = [
    /* ---- FUENTES EXTERNAS ---- */
    {
        id: "sigestran", type: "source", icon: "◈",
        label: "SIGESTRAN", sub: "Core C# · MySQL",
        x: 40, y: 90, w: 200, h: 58,
        typeName: "FUENTE · CORE DEL CLIENTE",
        desc: "El sistema de negocio de ROR Logístico: choferes, tractoras, remolques, matrículas, expediciones y dietas viven aquí, sobre MySQL. <b>Nunca lo modificamos</b>: solo lo leemos a través de <b>server-sigestran</b> para no interferir con su operación."
    },
    {
        id: "gesinflot", type: "source", icon: "◈",
        label: "GESINFLOT", sub: "Telemetría GPS flota",
        x: 40, y: 230, w: 200, h: 58,
        typeName: "FUENTE · TELEMETRÍA",
        desc: "Plataforma de rastreo en tiempo real de los camiones: posición, datos del vehículo y tiempos de conducción del chofer. Tres hilos la consumen constantemente: <b>rastreo</b>, <b>chofer</b> y <b>control de matrículas</b>."
    },
    {
        id: "here", type: "source", icon: "◈",
        label: "HERE", sub: "Rutas de camión · Europa",
        x: 40, y: 370, w: 200, h: 58,
        typeName: "FUENTE · RUTAS",
        desc: "API de rutas especializadas para camiones en Europa. <b>hilo_here</b> le pide la ruta de cada expedición del día y la guarda en Postgres para pintarla en el mapa del Control Tower."
    },
    {
        id: "app", type: "source", icon: "◈",
        label: "APP CHOFERES", sub: "GPS + checklists",
        x: 40, y: 560, w: 200, h: 58,
        typeName: "FUENTE · APP MÓVIL PROPIA",
        desc: "No todas las tractoras tienen Gesinflot. Para ellas desarrollamos una app que <b>rastrea la ubicación en background</b> y la guarda en <b>background_location</b> — así los hilos de paradas, ETA y dietas funcionan igual. Además, los choferes llenan sus <b>checklists con fotos</b> desde la misma app."
    },
    {
        id: "canales", type: "source", icon: "◈",
        label: "LLAMADA · WA · EMAIL", sub: "Choferes subcontratados",
        x: 40, y: 720, w: 200, h: 58,
        typeName: "FUENTE · CANALES DE CONTACTO",
        desc: "Muchos choferes son externos y no usan la app. El <b>CRM con IA</b> los contacta por llamada, WhatsApp y email para preguntar dónde están y registrar sus entradas y salidas de carga y descarga."
    },

    /* ---- HILOS ---- */
    {
        id: "h_rastreo", type: "hilo", icon: "⟳",
        label: "hilo_rastreo_gesinflot", sub: "posición de tractoras",
        x: 350, y: 80, w: 225, h: 50,
        typeName: "HILO · WORKER 24/7",
        desc: "Loop que rastrea cada tractora conectada a Gesinflot y guarda su posición: la última en <b>background_location</b> y todo el recorrido en <b>background_location_history</b>. Es la base del mapa en tiempo real y del replay de ruta."
    },
    {
        id: "h_chofer", type: "hilo", icon: "⟳",
        label: "hilo_chofer_gesinflot", sub: "tiempo de conducción",
        x: 350, y: 165, w: 225, h: 50,
        typeName: "HILO · WORKER 24/7",
        desc: "Sigue al chofer asignado a cada tractora y obtiene de Gesinflot su <b>tiempo de conducción</b>, para mostrarlo en el Control Tower y alimentar el cálculo de dietas."
    },
    {
        id: "h_matriculas", type: "hilo", icon: "⟳",
        label: "hilo_control_matriculas", sub: "Sigestran vs Gesinflot",
        x: 350, y: 250, w: 225, h: 50,
        typeName: "HILO · WORKER 24/7",
        desc: "Auditor automático: consume <b>ambos sistemas</b> y verifica que los datos de Sigestran coincidan con los de Gesinflot (matrículas, asignaciones). Si algo no cuadra, queda registrado para revisión."
    },
    {
        id: "h_here", type: "hilo", icon: "⟳",
        label: "hilo_here", sub: "rutas de expediciones",
        x: 350, y: 335, w: 225, h: 50,
        typeName: "HILO · WORKER 24/7",
        desc: "Revisa las <b>expediciones del día</b> en Postgres, pide a HERE la ruta de camión correspondiente y la guarda. Con la ruta + el histórico de posiciones, el mapa muestra por dónde debía ir y por dónde fue realmente."
    },
    {
        id: "h_parada", type: "hilo", icon: "⟳",
        label: "hilo_punto_parada", sub: "radiales · carga/descarga",
        x: 350, y: 420, w: 225, h: 50,
        typeName: "HILO · WORKER 24/7",
        desc: "Cada parada de la ruta se parametriza con un <b>radial</b>. Este hilo detecta cuándo la tractora entra o sale del radio y marca automáticamente: <b>hora ingreso carga, salida carga, ingreso descarga y salida descarga</b>."
    },
    {
        id: "h_eta", type: "hilo", icon: "⟳",
        label: "hilo_eta", sub: "tiempo estimado de llegada",
        x: 350, y: 505, w: 225, h: 50,
        typeName: "HILO · WORKER 24/7",
        desc: "Combina la <b>posición actual</b> de la tractora con su <b>ruta</b> para calcular cuánto falta para llegar a destino. El ETA vive en la pizarra de expediciones y se recalcula constantemente."
    },
    {
        id: "h_dietas", type: "hilo", icon: "⟳",
        label: "hilo_dietas", sub: "viáticos automáticos",
        x: 350, y: 590, w: 225, h: 50,
        typeName: "HILO · WORKER 24/7",
        desc: "Reconstruye por dónde estuvo cada chofer <b>el día anterior</b>: en qué delegación, en qué provincia y si salió del país. Con eso + sus horas de conducción, calcula y registra la <b>dieta o viático</b> que le corresponde por día. Adiós al cálculo manual."
    },
    {
        id: "h_crm", type: "hilo", icon: "⟳",
        label: "hilo_crm", sub: "CRM con IA · contacto",
        x: 350, y: 720, w: 225, h: 50,
        typeName: "HILO · WORKER 24/7 · IA",
        desc: "El más conversador: un CRM con IA que <b>llama, manda WhatsApp y escribe emails</b> a los choferes subcontratados para preguntarles dónde están cuando se acerca la carga o la descarga — y registra las respuestas como estados de la expedición."
    },

    /* ---- BASE DE DATOS ---- */
    {
        id: "db", type: "db", icon: "◍",
        label: "POSTGRESQL", sub: "",
        x: 655, y: 300, w: 190, h: 300,
        tables: [
            "usuarios · roles · permisos",
            "expediciones · estados",
            "background_location",
            "background_location_history",
            "rutas HERE",
            "paradas · tiempos C/D",
            "dietas por chofer/día",
            "checklists · fotos",
            "conversaciones CRM"
        ],
        typeName: "BASE DE DATOS PROPIA",
        desc: "El corazón del ecosistema. Una base <b>independiente del MySQL de producción</b> donde los hilos escriben todo lo que capturan y de donde los servers leen para alimentar el frontend. Si algo falla aquí, Sigestran ni se entera."
    },

    /* ---- SERVERS ---- */
    {
        id: "s_sigestran", type: "server", icon: "⇄",
        label: "server-sigestran", sub: "puente MySQL ⇄ Postgres",
        x: 935, y: 130, w: 215, h: 56,
        typeName: "SERVER · FASTAPI",
        desc: "El puente con el mundo del cliente: se conecta en <b>solo lectura</b> al MySQL de Sigestran y a nuestra Postgres. Sincroniza las expediciones y sirve al frontend el dashboard y la pizarra sin tocar la operación del core."
    },
    {
        id: "s_user", type: "server", icon: "⇄",
        label: "server-user", sub: "usuarios · roles · permisos",
        x: 935, y: 260, w: 215, h: 56,
        typeName: "SERVER · FASTAPI",
        desc: "Gestiona la identidad de todo el sistema: <b>usuarios, roles y permisos</b>. Define qué ve un admin, qué opera un operador y qué consulta un cliente. Separado a propósito para mantener la seguridad aislada."
    },
    {
        id: "s_dietas", type: "server", icon: "⇄",
        label: "server_dietas", sub: "consulta de viáticos",
        x: 935, y: 390, w: 215, h: 56,
        typeName: "SERVER · FASTAPI",
        desc: "Expone al frontend las <b>dietas calculadas por hilo_dietas</b>: por chofer, por día, por delegación o provincia, con el detalle de si salió del país y sus horas de conducción."
    },
    {
        id: "s_checklist", type: "server", icon: "⇄",
        label: "server_checklist", sub: "encuestas · validación",
        x: 935, y: 520, w: 215, h: 56,
        typeName: "SERVER · FASTAPI",
        desc: "Permite crear <b>encuestas y checks</b> para que los choferes reporten con fotos el estado de cada tractora y remolque asignado — y que los operadores <b>revisen y validen</b> desde el Control Tower."
    },
    {
        id: "s_crm", type: "server", icon: "⇄",
        label: "server_crm", sub: "API del CRM con IA",
        x: 935, y: 650, w: 215, h: 56,
        typeName: "SERVER · FASTAPI",
        desc: "La cara visible del CRM: sirve al frontend las <b>conversaciones, contactos y estados</b> que la IA fue registrando al hablar con los choferes externos."
    },

    /* ---- FRONTEND Y ROLES ---- */
    {
        id: "front", type: "front", icon: "▣",
        label: "CONTROL TOWER", sub: "React · web",
        x: 1240, y: 330, w: 175, h: 110,
        typeName: "FRONTEND · REACT",
        desc: "Todo converge aquí: <b>dashboard de expediciones</b>, <b>pizarra de estados</b>, <b>perfil de expedición</b> y el <b>mapa</b> con la ruta pintada, el recorrido real y un scroll para hacer replay del viaje en el tiempo. Cada usuario ve exactamente lo que su rol le permite."
    },
    { id: "u_admin", type: "user", icon: "●", label: "ADMIN", sub: "", x: 1240, y: 560, w: 175, h: 42,
      typeName: "ROL", desc: "Acceso total: configuración, usuarios, validaciones y toda la operación." },
    { id: "u_oper", type: "user", icon: "●", label: "OPERADORES", sub: "", x: 1240, y: 630, w: 175, h: 42,
      typeName: "ROL", desc: "Gestionan la operación diaria: pizarra, expediciones, checklists y seguimiento de la flota." },
    { id: "u_cli", type: "user", icon: "●", label: "CLIENTES", sub: "", x: 1240, y: 700, w: 175, h: 42,
      typeName: "ROL", desc: "Ven el estado de <b>sus</b> expediciones en tiempo real. Nada más, nada menos." }
];

/* ──────────────────────────────────────────────────────────
   2. DATOS — flujos entre nodos
   dir: "->" un sentido (default) · "<->" ambos sentidos
   ────────────────────────────────────────────────────────── */

const EDGES = [
    /* fuentes → hilos */
    { from: "gesinflot", to: "h_rastreo",    color: "amber" },
    { from: "gesinflot", to: "h_chofer",     color: "amber" },
    { from: "gesinflot", to: "h_matriculas", color: "amber" },
    { from: "sigestran", to: "h_matriculas", color: "amber" },
    { from: "here",      to: "h_here",       color: "amber" },
    { from: "canales",   to: "h_crm",        color: "amber", dir: "<->" },

    /* fuentes → otros destinos (curvas personalizadas) */
    { from: "sigestran", to: "s_sigestran", color: "amber",
      c1: [560, 52], c2: [800, 52] },
    { from: "app", to: "db", color: "amber", toY: 585 },
    { from: "app", to: "s_checklist", color: "amber", dir: "<->",
      c1: [520, 690], c2: [770, 672] },

    /* hilos ⇄ postgres */
    { from: "h_rastreo",    to: "db", color: "cyan", toY: 322 },
    { from: "h_chofer",     to: "db", color: "cyan", toY: 352 },
    { from: "h_matriculas", to: "db", color: "cyan", toY: 382 },
    { from: "h_here",       to: "db", color: "cyan", toY: 412, dir: "<->" },
    { from: "h_parada",     to: "db", color: "cyan", toY: 445, dir: "<->" },
    { from: "h_eta",        to: "db", color: "cyan", toY: 478, dir: "<->" },
    { from: "h_dietas",     to: "db", color: "cyan", toY: 511, dir: "<->" },
    { from: "h_crm",        to: "db", color: "cyan", toY: 548, dir: "<->" },

    /* postgres ⇄ servers */
    { from: "db", to: "s_sigestran", color: "green", fromY: 335, dir: "<->" },
    { from: "db", to: "s_user",      color: "green", fromY: 385, dir: "<->" },
    { from: "db", to: "s_dietas",    color: "green", fromY: 435 },
    { from: "db", to: "s_checklist", color: "green", fromY: 490, dir: "<->" },
    { from: "db", to: "s_crm",       color: "green", fromY: 545, dir: "<->" },

    /* servers → frontend */
    { from: "s_sigestran", to: "front", color: "green" },
    { from: "s_user",      to: "front", color: "green" },
    { from: "s_dietas",    to: "front", color: "green" },
    { from: "s_checklist", to: "front", color: "green" },
    { from: "s_crm",       to: "front", color: "green" },

    /* frontend → roles */
    { from: "front", to: "u_admin", color: "pink",
      fromSide: "bottom", toSide: "top", c1: [1327, 490], c2: [1327, 525] },
    { from: "front", to: "u_oper", color: "pink",
      fromSide: "bottom", toSide: "left", c1: [1300, 510], c2: [1195, 651] },
    { from: "front", to: "u_cli", color: "pink",
      fromSide: "bottom", toSide: "left", c1: [1280, 540], c2: [1180, 721] }
];

const LAYERS = [
    { x: 40,   text: "FUENTES" },
    { x: 350,  text: "HILOS · 24/7" },
    { x: 655,  text: "DATOS" },
    { x: 935,  text: "APIS FASTAPI" },
    { x: 1240, text: "USUARIOS" }
];

/* ──────────────────────────────────────────────────────────
   3. RENDER DEL DIAGRAMA
   ────────────────────────────────────────────────────────── */

const SVG_NS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("diagramSvg");
const nodeById = Object.fromEntries(NODES.map(n => [n.id, n]));
let selectedId = null;

function el(name, attrs, parent) {
    const e = document.createElementNS(SVG_NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
}

/* punto de anclaje de un nodo según el lado */
function anchor(node, side, yOverride) {
    const cx = node.x + node.w / 2, cy = node.y + node.h / 2;
    switch (side) {
        case "left":   return [node.x, yOverride ?? cy];
        case "right":  return [node.x + node.w, yOverride ?? cy];
        case "top":    return [cx, node.y];
        case "bottom": return [cx, node.y + node.h];
        default:       return [cx, cy];
    }
}

function edgePath(e) {
    const a = nodeById[e.from], b = nodeById[e.to];
    const [x1, y1] = anchor(a, e.fromSide || "right", e.fromY);
    const [x2, y2] = anchor(b, e.toSide || "left", e.toY);
    let c1 = e.c1, c2 = e.c2;
    if (!c1 || !c2) {
        const dx = Math.max(46, (x2 - x1) / 2.1);
        c1 = [x1 + dx, y1];
        c2 = [x2 - dx, y2];
    }
    return `M ${x1} ${y1} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x2} ${y2}`;
}

function buildDefs() {
    const defs = el("defs", {}, svg);
    const colors = { amber: "#fbbf24", cyan: "#22d3ee", violet: "#a78bfa", green: "#34d399", pink: "#f472b6" };
    for (const [name, hex] of Object.entries(colors)) {
        const m = el("marker", {
            id: `arrow-${name}`, viewBox: "0 0 10 10",
            refX: 9, refY: 5, markerWidth: 6.5, markerHeight: 6.5,
            orient: "auto-start-reverse"
        }, defs);
        el("path", { d: "M 0 1 L 9 5 L 0 9 z", fill: hex, opacity: 0.85 }, m);
    }
}

function buildLayers() {
    for (const l of LAYERS) {
        el("text", { x: l.x, y: 42, class: "layer-label" }, svg).textContent = l.text;
    }
}

const edgeEls = []; // { base, flow, from, to }

function buildEdges() {
    const g = el("g", { class: "edges" }, svg);
    for (const e of EDGES) {
        const d = edgePath(e);
        const base = el("path", { d, class: "edge edge-base" }, g);
        base.setAttribute("marker-end", `url(#arrow-${e.color})`);
        if (e.dir === "<->") base.setAttribute("marker-start", `url(#arrow-${e.color})`);
        const flow = el("path", { d, class: `edge edge-flow c-${e.color}` }, g);
        edgeEls.push({ base, flow, from: e.from, to: e.to });
    }
}

function buildNodes() {
    const g = el("g", { class: "nodes" }, svg);
    for (const n of NODES) {
        const gn = el("g", { class: `node type-${n.type}`, "data-id": n.id, tabindex: 0, role: "button" }, g);
        el("rect", { x: n.x, y: n.y, width: n.w, height: n.h, rx: n.type === "user" ? 21 : 12 }, gn);

        if (n.type === "db") {
            /* nodo especial: base de datos con sus tablas */
            el("text", { x: n.x + n.w / 2, y: n.y + 30, "text-anchor": "middle",
                         class: "node-label" }, gn).textContent = "◍ " + n.label;
            el("line", { x1: n.x + 16, y1: n.y + 44, x2: n.x + n.w - 16, y2: n.y + 44,
                         stroke: "rgba(167,139,250,.35)", "stroke-width": 1 }, gn);
            n.tables.forEach((t, i) => {
                el("text", { x: n.x + n.w / 2, y: n.y + 68 + i * 26,
                             "text-anchor": "middle", class: "node-sub" }, gn).textContent = t;
            });
        } else if (n.type === "user") {
            el("text", { x: n.x + n.w / 2, y: n.y + n.h / 2 + 5,
                         "text-anchor": "middle", class: "node-label" }, gn).textContent = n.label;
        } else {
            const cy = n.y + n.h / 2;
            el("text", { x: n.x + 14, y: cy + 5, class: "node-icon",
                         "font-size": 14 }, gn).textContent = n.icon;
            el("text", { x: n.x + 36, y: n.sub ? cy - 3 : cy + 5,
                         class: "node-label" }, gn).textContent = n.label;
            if (n.sub) {
                el("text", { x: n.x + 36, y: cy + 14, class: "node-sub" }, gn).textContent = n.sub;
            }
        }

        gn.addEventListener("mouseenter", () => focusNode(n.id));
        gn.addEventListener("mouseleave", () => { selectedId ? focusNode(selectedId) : clearFocus(); });
        gn.addEventListener("click", () => selectNode(n.id));
        gn.addEventListener("keydown", ev => {
            if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selectNode(n.id); }
        });
    }
}

/* ── foco / selección ── */

function neighborsOf(id) {
    const ids = new Set([id]);
    for (const e of EDGES) {
        if (e.from === id) ids.add(e.to);
        if (e.to === id) ids.add(e.from);
    }
    return ids;
}

function focusNode(id) {
    const lit = neighborsOf(id);
    svg.classList.add("has-focus");
    svg.querySelectorAll(".node").forEach(n =>
        n.classList.toggle("lit", lit.has(n.dataset.id)));
    edgeEls.forEach(({ base, flow, from, to }) => {
        const on = from === id || to === id;
        base.classList.toggle("active", on);
        flow.classList.toggle("active", on);
    });
}

function focusType(type) {
    const lit = new Set(NODES.filter(n => n.type === type).map(n => n.id));
    svg.classList.add("has-focus");
    svg.querySelectorAll(".node").forEach(n =>
        n.classList.toggle("lit", lit.has(n.dataset.id)));
    edgeEls.forEach(({ base, flow, from, to }) => {
        const on = lit.has(from) || lit.has(to);
        base.classList.toggle("active", on);
        flow.classList.toggle("active", on);
    });
}

function clearFocus() {
    svg.classList.remove("has-focus");
    svg.querySelectorAll(".node.lit").forEach(n => n.classList.remove("lit"));
    edgeEls.forEach(({ base, flow }) => {
        base.classList.remove("active");
        flow.classList.remove("active");
    });
}

function selectNode(id) {
    selectedId = id;
    svg.querySelectorAll(".node.selected").forEach(n => n.classList.remove("selected"));
    const gn = svg.querySelector(`.node[data-id="${id}"]`);
    if (gn) gn.classList.add("selected");
    focusNode(id);
    renderDetail(id);
}

/* ── panel de detalle ── */

function renderDetail(id) {
    const n = nodeById[id];
    const typeEl = document.getElementById("detailType");
    typeEl.textContent = n.typeName || n.type.toUpperCase();
    typeEl.className = `detail-type t-${n.type}`;
    document.getElementById("detailTitle").textContent = n.label;
    document.getElementById("detailDesc").innerHTML = n.desc;

    const links = document.getElementById("detailLinks");
    links.innerHTML = "";
    const seen = new Set();
    for (const e of EDGES) {
        let other = null, arrow = "";
        if (e.from === id) { other = e.to;   arrow = e.dir === "<->" ? "⇄" : "→"; }
        else if (e.to === id) { other = e.from; arrow = e.dir === "<->" ? "⇄" : "←"; }
        if (!other || seen.has(other)) continue;
        seen.add(other);
        const chip = document.createElement("span");
        chip.textContent = `${arrow} ${nodeById[other].label}`;
        chip.addEventListener("click", () => selectNode(other));
        links.appendChild(chip);
    }
}

/* ── leyenda interactiva ── */

function initLegend() {
    const legend = document.getElementById("diagramLegend");
    legend.querySelectorAll("span[data-type]").forEach(item => {
        item.addEventListener("mouseenter", () => { item.classList.add("active"); focusType(item.dataset.type); });
        item.addEventListener("mouseleave", () => {
            item.classList.remove("active");
            selectedId ? focusNode(selectedId) : clearFocus();
        });
    });
}

/* ──────────────────────────────────────────────────────────
   4. TARJETAS DE MICROSERVICIOS
   ────────────────────────────────────────────────────────── */

const HILOS_CARDS = [
    ["hilo_rastreo_gesinflot", "Rastrea las tractoras conectadas a Gesinflot y guarda su posición: la última en <b>background_location</b> y el histórico completo en <b>background_location_history</b>."],
    ["hilo_here", "Ve las expediciones del día y pide a <b>HERE</b> la ruta de camión por Europa, guardándola en Postgres para pintarla en el mapa."],
    ["hilo_punto_parada", "Vigila los <b>radiales</b> parametrizados en cada parada: marca hora de ingreso/salida en carga y descarga automáticamente."],
    ["hilo_chofer_gesinflot", "Sigue al chofer de cada tractora y obtiene su <b>tiempo de conducción</b> según Gesinflot."],
    ["hilo_control_matriculas", "Cruza <b>Sigestran contra Gesinflot</b> y detecta si las matrículas o datos no coinciden entre sistemas."],
    ["hilo_eta", "Combina posición actual + ruta para calcular el <b>ETA</b>: cuánto falta para llegar a destino."],
    ["hilo_dietas", "Reconstruye por dónde estuvo cada chofer el día anterior (delegación, provincia, salida del país) y registra su <b>dieta diaria</b> según sus horas de conducción."],
    ["hilo_crm", "CRM con <b>IA</b> que llama, manda WhatsApp y emails a choferes externos para registrar estados de carga y descarga."]
];

const SERVERS_CARDS = [
    ["server-sigestran", "Puente de <b>solo lectura</b> con el MySQL de Sigestran; sincroniza expediciones a Postgres y sirve dashboard y pizarra al frontend."],
    ["server-user", "Usuarios, <b>roles y permisos</b>: define lo que ven admin, operadores y clientes."],
    ["server_dietas", "Expone al frontend las <b>dietas y viáticos</b> calculados por hilo_dietas."],
    ["server_checklist", "Encuestas y <b>checklists con fotos</b>: los choferes reportan el estado de tractoras y remolques; los operadores validan."],
    ["server_crm", "API del CRM: <b>conversaciones, contactos y estados</b> registrados por la IA."]
];

const EXTRAS_CARDS = [
    ["App de Choferes", "Para tractoras <b>sin Gesinflot</b>: rastrea ubicación en background y permite llenar checklists — alimenta las mismas tablas, así todos los hilos funcionan igual.", "APP MÓVIL"],
    ["Control Tower · React", "Dashboard, pizarra de expediciones, perfil de expedición y mapa con <b>replay de ruta</b> en tiempo real.", "FRONTEND"],
    ["PostgreSQL", "Base de datos propia y aislada: si el ecosistema crece o falla, el core del cliente <b>jamás se ve afectado</b>.", "DATOS"]
];

function renderMsCards(gridId, items, accent, tag) {
    const grid = document.getElementById(gridId);
    for (const it of items) {
        const card = document.createElement("article");
        card.className = "ms-card reveal";
        card.style.setProperty("--accent", accent);
        card.innerHTML = `<span class="ms-tag">${it[2] || tag}</span><h4>${it[0]}</h4><p>${it[1]}</p>`;
        grid.appendChild(card);
    }
}

/* ──────────────────────────────────────────────────────────
   5. TIMELINE DE EVOLUCIÓN
   ────────────────────────────────────────────────────────── */

const TIMELINE = [
    ["FASE 01", "Control Tower base",
     "Base PostgreSQL propia, puente de lectura con Sigestran y frontend React: <b>dashboard, pizarra de expediciones, perfil de expedición</b> y acceso con roles para admin, operadores y clientes.",
     ["server-sigestran", "server-user", "React"]],
    ["FASE 02", "Rastreo en tiempo real",
     "Conexión con <b>Gesinflot</b> (posición de tractoras) y <b>HERE</b> (rutas de camión por Europa). El mapa pinta la ruta planificada y el recorrido real, con un scroll para hacer <b>replay</b> del viaje.",
     ["hilo_rastreo_gesinflot", "hilo_here"]],
    ["FASE 03", "Paradas inteligentes",
     "Cada parada se parametriza con un <b>radial</b>: al entrar o salir del radio se marcan automáticamente las horas de ingreso y salida en carga y descarga.",
     ["hilo_punto_parada"]],
    ["FASE 04", "Control operativo y ETA",
     "Tiempo de conducción de cada chofer, verificación cruzada de <b>matrículas entre Sigestran y Gesinflot</b>, y cálculo continuo del <b>ETA</b> de cada expedición.",
     ["hilo_chofer_gesinflot", "hilo_control_matriculas", "hilo_eta"]],
    ["FASE 05", "Dietas automáticas",
     "El sistema reconstruye el día anterior de cada chofer — delegación, provincia, salida del país — y registra su <b>viático diario</b> según sus horas de conducción. Sin planillas manuales.",
     ["hilo_dietas", "server_dietas"]],
    ["FASE 06", "Checklists con evidencia",
     "Encuestas configurables para que los choferes documenten con <b>fotos</b> el estado de tractoras y remolques, con revisión y validación desde el Control Tower.",
     ["server_checklist"]],
    ["FASE 07", "App de choferes",
     "Para las tractoras <b>sin Gesinflot</b>: una app propia que rastrea en background y alimenta las mismas tablas — paradas, ETA y dietas funcionan igual para toda la flota. Y los checklists se llenan desde el móvil.",
     ["App móvil"]],
    ["FASE 08", "CRM con IA",
     "Para los choferes <b>subcontratados sin app</b>: una IA que llama, escribe por WhatsApp y manda emails preguntando dónde están — y registra las horas de carga y descarga conversando.",
     ["hilo_crm", "server_crm"]]
];

function renderTimeline() {
    const tl = document.getElementById("timeline");
    for (const [phase, title, desc, tags] of TIMELINE) {
        const item = document.createElement("div");
        item.className = "tl-item reveal";
        item.innerHTML =
            `<h3><span class="tl-phase">${phase}</span>${title}</h3>` +
            `<p>${desc}</p>` +
            tags.map(t => `<span class="tl-ms">${t}</span>`).join("");
        tl.appendChild(item);
    }
}

/* ──────────────────────────────────────────────────────────
   6. ANIMACIONES — reveal on scroll + contadores
   ────────────────────────────────────────────────────────── */

function initReveal() {
    const io = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                e.target.style.transitionDelay = `${(i % 6) * 70}ms`;
                e.target.classList.add("in");
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(n => io.observe(n));
}

function initCounters() {
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const elc = entry.target;
            const target = +elc.dataset.count;
            const dur = 1300;
            let start = null;
            const tick = ts => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                elc.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.unobserve(elc);
        });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(n => io.observe(n));
}

function initMobileNav() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    const close = () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
    });

    links.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
}

/* ──────────────────────────────────────────────────────────
   7. ARRANQUE
   ────────────────────────────────────────────────────────── */

buildDefs();
buildLayers();
buildEdges();
buildNodes();
initLegend();

renderMsCards("hilosGrid", HILOS_CARDS, "var(--cyan)", "HILO");
renderMsCards("serversGrid", SERVERS_CARDS, "var(--green)", "FASTAPI");
renderMsCards("extrasGrid", EXTRAS_CARDS, "var(--pink)", "");

renderTimeline();
initReveal();
initCounters();
initMobileNav();

/* clic fuera de un nodo → deseleccionar */
svg.addEventListener("click", ev => {
    if (!ev.target.closest(".node")) {
        selectedId = null;
        svg.querySelectorAll(".node.selected").forEach(n => n.classList.remove("selected"));
        clearFocus();
    }
});
