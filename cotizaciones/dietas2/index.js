/* ═══════════════════════════════════════════════════════════
   DIETAS · ETAPA 2 — lógica de la página
   1) reloj decorativo del hero   2) reveal-on-scroll
   3) contadores del hero         4) simulador de códigos de dieta
   ═══════════════════════════════════════════════════════════ */

"use strict";

/* ── 1. Reloj decorativo del hero (resalta 08:00 / 12:00 / 20:00) ── */

(function buildDial() {
    const NS = "http://www.w3.org/2000/svg";
    const group = document.getElementById("dialTicks");
    if (!group) return;
    const cx = 190, cy = 190, rOuter = 150;
    const strongHours = [8, 12, 20];

    for (let h = 0; h < 24; h++) {
        const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
        const strong = strongHours.includes(h);
        const rInner = strong ? 122 : 138;

        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", cx + rInner * Math.cos(angle));
        line.setAttribute("y1", cy + rInner * Math.sin(angle));
        line.setAttribute("x2", cx + rOuter * Math.cos(angle));
        line.setAttribute("y2", cy + rOuter * Math.sin(angle));
        line.setAttribute("class", strong ? "dial-tick strong" : "dial-tick");
        group.appendChild(line);

        if (strong) {
            const lr = 168;
            const text = document.createElementNS(NS, "text");
            text.setAttribute("x", cx + lr * Math.cos(angle));
            text.setAttribute("y", cy + lr * Math.sin(angle));
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("class", "dial-label strong");
            text.textContent = String(h).padStart(2, "0") + ":00";
            group.appendChild(text);
        }
    }
})();

/* ── Menu móvil ──────────────────────────────────────────────── */

(function mobileNav() {
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

    links.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
})();

/* ── 2. Reveal on scroll ─────────────────────────────────────── */

(function revealOnScroll() {
    const targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !targets.length) {
        targets.forEach((el) => el.classList.add("in"));
        return;
    }
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    targets.forEach((el) => io.observe(el));
})();

/* ── 3. Contadores del hero ──────────────────────────────────── */

(function animateCounters() {
    const stats = document.querySelectorAll(".stat b[data-count]");
    stats.forEach((el) => {
        const target = parseInt(el.dataset.count, 10) || 0;
        const duration = 900;
        const start = performance.now();
        function step(now) {
            const p = Math.min(1, (now - start) / duration);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
})();

/* ── 3b. Minutos importantes del video ───────────────────────── */

(function videoMoments() {
    const video = document.getElementById("dietaVideo");
    const buttons = document.querySelectorAll(".video-moment");
    if (!video) return;

    video.addEventListener("loadedmetadata", () => {
        video.currentTime = 11 * 60 + 45;
    }, { once: true });

    if (!buttons.length) return;
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const [min, sec] = btn.dataset.time.split(":").map(Number);
            video.currentTime = min * 60 + sec;
            video.play();
            video.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
})();

/* ── 3c. Exportar cotización a PDF ────────────────────────────── */

(function exportQuotePdf() {
    const btn = document.getElementById("btnExportPdf");
    if (!btn) return;

    const INK = "#1a1a1a";
    const MUTED = "#666666";
    const ACCENT = [8, 145, 178];
    const ACCENT_HEX = "#0891b2";
    const LINE = "#cccccc";
    const FILL = "#f2f3f5";

    // Series de códigos, tal como se documentan en el README de Etapa 2
    const NAC_LABORABLE = [
        { code: "1N", when: "Trabaja a partir de las 20:00.", covers: "Cena." },
        { code: "2N", when: "Sale de plaza a partir de las 08:00.", covers: "Almuerzo y cena." },
        { code: "3N", when: "Sale de plaza antes de las 08:00.", covers: "Desayuno, almuerzo y cena." },
    ];
    const INT_LABORABLE = [
        { code: "4N", when: "Trabaja internacional a partir de las 20:00.", covers: "Cena." },
        { code: "5N", when: "Trabaja internacional a partir de las 08:00.", covers: "Almuerzo y cena." },
        { code: "6N", when: "Trabaja internacional antes de las 08:00.", covers: "Desayuno, almuerzo y cena." },
    ];
    const NAC_FESTIVO = [
        { code: "1F", when: "Trabaja en festivo/domingo a partir de las 20:00.", covers: "Cena." },
        { code: "2F", when: "Trabaja en festivo/domingo a partir de las 12:00.", covers: "Almuerzo y cena." },
        { code: "3F", when: "Trabaja en festivo/domingo antes de las 12:00.", covers: "Desayuno, almuerzo y cena." },
    ];
    const INT_FESTIVO = [
        { code: "4F", when: "Internacional en festivo/domingo a partir de las 20:00.", covers: "Cena." },
        { code: "5F", when: "Internacional en festivo/domingo a partir de las 12:00.", covers: "Almuerzo y cena." },
        { code: "6F", when: "Internacional en festivo/domingo antes de las 12:00.", covers: "Desayuno, almuerzo y cena." },
    ];
    const AUSENCIAS = [
        { code: "ST-P", when: "Solicitud de pausa.", covers: "tblendalia_absenteeism_requests" },
        { code: "ST-B", when: "Solicitud de baja.", covers: "tblendalia_absenteeism_requests" },
        { code: "ST-V", when: "Solicitud de vacaciones.", covers: "tblendalia_absenteeism_requests" },
    ];
    const DESCANSO = [
        { code: "FSN", when: "Fuera de plaza, tarjeta en descanso, sin conducción en el día — territorio nacional.", covers: "—" },
        { code: "FSI", when: "Fuera de plaza, tarjeta en descanso, sin conducción en el día — territorio internacional.", covers: "—" },
    ];

    btn.addEventListener("click", () => {
        if (!window.jspdf) {
            alert("No se pudo cargar el generador de PDF. Revisa tu conexión e inténtalo de nuevo.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const marginX = 20;
        const contentW = pageW - marginX * 2;
        const bottomLimit = pageH - 18;
        let y = 22;

        function text(str, x, yy, opts) { doc.text(str, x, yy, opts); }

        function addPageIfNeeded(neededHeight) {
            if (y + neededHeight > bottomLimit) {
                doc.addPage();
                y = 20;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8.5);
                doc.setTextColor(MUTED);
                text("SERVISOFTS · Motor de cálculo de dietas — Etapa 2", marginX, y);
                doc.setDrawColor(LINE);
                doc.setLineWidth(0.2);
                doc.line(marginX, y + 2.5, pageW - marginX, y + 2.5);
                y += 11;
            }
        }

        // keepWith reserva espacio para el inicio del contenido que sigue, para que un
        // título nunca quede solo al final de una página sin al menos parte de su detalle.
        function heading(str, keepWith = 16) {
            addPageIfNeeded(12 + keepWith);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12.5);
            doc.setTextColor(INK);
            text(str, marginX, y);
            y += 8;
        }

        function sectionLabel(label, keepWith = 12) {
            addPageIfNeeded(7 + keepWith);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(MUTED);
            text(label.toUpperCase(), marginX, y);
            y += 5;
        }

        function paragraph(str, opts = {}) {
            doc.setFont("helvetica", opts.bold ? "bold" : "normal");
            doc.setFontSize(opts.size || 9.5);
            doc.setTextColor(opts.color || "#333333");
            const lines = doc.splitTextToSize(str, contentW - (opts.indent || 0));
            addPageIfNeeded(lines.length * 4.6);
            text(lines, marginX + (opts.indent || 0), y);
            y += lines.length * 4.6 + (opts.gap ?? 5);
        }

        function bullet(str) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.setTextColor("#333333");
            const lines = doc.splitTextToSize(str, contentW - 6);
            addPageIfNeeded(lines.length * 4.6 + 2);
            text("•", marginX, y);
            text(lines, marginX + 4, y);
            y += lines.length * 4.6 + 2;
        }

        function row(label, value, opts = {}) {
            const h = 9;
            addPageIfNeeded(h);
            if (opts.fill) {
                doc.setFillColor(FILL);
                doc.rect(marginX, y, contentW, h, "F");
            }
            doc.setDrawColor(LINE);
            doc.setLineWidth(0.2);
            doc.rect(marginX, y, contentW, h);
            doc.setFont("helvetica", opts.bold ? "bold" : "normal");
            doc.setFontSize(9.5);
            doc.setTextColor(INK);
            text(label, marginX + 3, y + 6);
            text(value, marginX + contentW - 3, y + 6, { align: "right" });
            y += h;
        }

        // Tabla de 3 columnas: código · cuándo aplica · qué cubre
        function codeTable(rows) {
            const colCode = 16;
            const colWhen = contentW * 0.6;
            const colCovers = contentW - colCode - colWhen;
            rows.forEach((r) => {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.4);
                const whenLines = doc.splitTextToSize(r.when, colWhen - 6);
                const coverLines = doc.splitTextToSize(r.covers, colCovers - 6);
                const h = Math.max(whenLines.length, coverLines.length, 1) * 4 + 4.5;
                addPageIfNeeded(h);

                doc.setDrawColor(LINE);
                doc.setLineWidth(0.2);
                doc.rect(marginX, y, contentW, h);
                doc.line(marginX + colCode, y, marginX + colCode, y + h);
                doc.line(marginX + colCode + colWhen, y, marginX + colCode + colWhen, y + h);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(9.5);
                doc.setTextColor(ACCENT_HEX);
                text(r.code, marginX + 3, y + 5.5);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.4);
                doc.setTextColor(INK);
                text(whenLines, marginX + colCode + 3, y + 5.5);

                doc.setTextColor(MUTED);
                text(coverLines, marginX + colCode + colWhen + 3, y + 5.5);

                y += h;
            });
        }

        // ══════════════════ ENCABEZADO ══════════════════
        doc.setFillColor(...ACCENT);
        doc.circle(marginX + 1.3, y - 1.3, 1.3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(INK);
        text("SERVISOFTS", marginX + 6, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(MUTED);
        text("servisofts.com", marginX + 6, y + 4.5);

        doc.setFontSize(8);
        text("PROPUESTA COMERCIAL", pageW - marginX, y - 3, { align: "right" });
        text("Ref. DIETAS-ETAPA2", pageW - marginX, y + 1.5, { align: "right" });
        const fecha = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
        text(fecha, pageW - marginX, y + 6, { align: "right" });

        y += 10;
        doc.setDrawColor(INK);
        doc.setLineWidth(0.6);
        doc.line(marginX, y, pageW - marginX, y);

        // ══════════════════ TÍTULO Y CLIENTE ══════════════════
        y += 12;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(17);
        doc.setTextColor(INK);
        text("Motor de cálculo de dietas — Etapa 2", marginX, y);

        y += 8;
        doc.setFontSize(10.5);
        doc.setFont("helvetica", "normal");
        text("Para:", marginX, y);
        doc.setFont("helvetica", "bold");
        text("ROR Logístico", marginX + 11, y);
        y += 8;

        // ══════════════════ CONTEXTO ══════════════════
        heading("Contexto");
        paragraph(
            "La Etapa 1 del sistema de dietas quedó cerrada. La Etapa 2 traduce el criterio de " +
            "negocio de dietas nacionales, internacionales, festivos y domingos, plazas y horas " +
            "extra en reglas parametrizables — con horas de corte configurables: 08:00 y 20:00 " +
            "entre semana, 12:00 y 20:00 en fin de semana y festivos — de forma que el sistema " +
            "resuelva automáticamente qué código de dieta corresponde a cada jornada de cada " +
            "conductor, sin intervención manual."
        );

        sectionLabel("Alcance del desarrollo");
        [
            "Reglas de dieta nacional e internacional: 12 códigos, día laborable y festivo/domingo.",
            "Cálculo de plazas y horas extra dentro y fuera de la sucursal del conductor.",
            "Casos especiales: pausas, bajas y vacaciones (ST-P / ST-B / ST-V), mega camión y tarjeta en descanso.",
            "Simulador interactivo para validar cada caso con el criterio de negocio.",
        ].forEach(bullet);
        y += 4;

        // ══════════════════ REGLAS · NACIONAL ══════════════════
        heading("Reglas de dieta — Nacional, día laborable");
        codeTable(NAC_LABORABLE);
        y += 4;
        paragraph(
            "Excepción: si el chofer inicia el día ya fuera de su plaza, el código es siempre " +
            "3N, sin importar la hora de salida.",
            { size: 8.4, color: MUTED, gap: 6 }
        );

        // ══════════════════ REGLAS · INTERNACIONAL ══════════════════
        heading("Reglas de dieta — Internacional, día laborable");
        codeTable(INT_LABORABLE);
        y += 8;

        // ══════════════════ REGLAS · FESTIVO NACIONAL ══════════════════
        heading("Reglas de dieta — Nacional, festivo o domingo");
        codeTable(NAC_FESTIVO);
        y += 4;
        paragraph(
            "Excepción: si el chofer inicia el día ya fuera de su plaza —aunque arranque a las " +
            "17:00— el código es siempre 3F, sin importar la hora.",
            { size: 8.4, color: MUTED, gap: 6 }
        );

        // ══════════════════ REGLAS · FESTIVO INTERNACIONAL ══════════════════
        heading("Reglas de dieta — Internacional, festivo o domingo");
        codeTable(INT_FESTIVO);
        y += 8;

        // ══════════════════ PLAZAS Y HORAS EXTRA ══════════════════
        heading("Plazas y horas extra");
        paragraph(
            "Las plazas son las sucursales (Zaragoza, Barcelona y León). Se consulta en BD si " +
            "el conductor está haciendo base en su plaza ese día. Si está fuera de plaza, se le " +
            "asigna dieta y aplican los criterios N/F anteriores."
        );
        paragraph(
            "Si el conductor permanece en su plaza todo el día, hasta 10 horas no genera ni " +
            "dieta ni horas extra. Por encima de las 10 horas, se anotan las horas extra " +
            "siempre redondeando hacia abajo, en pasos de 0.5 (0.5, 1, 1.5…)."
        );

        // ══════════════════ CASOS ESPECIALES ══════════════════
        heading("Casos especiales");

        sectionLabel("Pausas, bajas y vacaciones");
        codeTable(AUSENCIAS);
        y += 4;

        sectionLabel("Mega camión");
        paragraph(
            "La tabla de expediciones incluye un campo que indica si la tarifa aplicada " +
            "corresponde a mega camión (mega trunk), a tener en cuenta en el cálculo final de " +
            "la dieta."
        );

        sectionLabel("Tarjeta en descanso");
        codeTable(DESCANSO);
        y += 4;
        paragraph(
            "Si el conductor está en su plaza y su tarjeta está en descanso, no se asigna nada.",
            { size: 8.4, color: MUTED, gap: 6 }
        );

        // ══════════════════ RRHH ══════════════════
        heading("RRHH (cálculo aparte)");
        paragraph(
            "Recursos Humanos controla la asistencia día a día en un cálculo independiente del " +
            "de dietas: el día solo cuenta como trabajado si el conductor empieza antes de las " +
            "12:00. Si empieza después, no cuenta como día trabajado, aunque se registra en " +
            "otra tabla si hubo actividad, para el resumen mensual de días trabajados."
        );

        // ══════════════════ PENDIENTE ══════════════════
        heading("Pendiente de definición");
        paragraph(
            "Caso abierto — cruce de frontera intradía: ¿qué pasa si el chofer sale como " +
            "internacional a las 05:00 pero a las 10:00 ya entró a España? No se puede asignar " +
            "dos dietas el mismo día, pero el desayuno debería pagarse como internacional y el " +
            "resto del día como nacional. Falta decidir con negocio si el sistema debe partir " +
            "la dieta, quedarse con el código de mayor cobertura, o priorizar un ámbito fijo."
        );

        // ══════════════════ PRECIO ══════════════════
        heading("Precio");
        row("Concepto", "Importe", { fill: true, bold: true });
        row("Desarrollo del motor de cálculo de dietas — Etapa 2", "3.000,00 €");
        row("Total", "3.000,00 €", { bold: true, fill: true });
        y += 8;

        sectionLabel("Forma de pago");
        row("1er pago — al iniciar el proyecto", "1.500,00 €");
        row("2º pago — al finalizar el proyecto", "1.500,00 €");
        y += 8;

        sectionLabel("Plazo de entrega");
        row("Desarrollo", "4 semanas");
        row("QA", "2 semanas");
        row("Total estimado", "6 semanas", { bold: true, fill: true });

        // ══════════════════ NUMERACIÓN DE PÁGINAS ══════════════════
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(MUTED);
            doc.text(`Página ${i} de ${totalPages}`, pageW - marginX, pageH - 10, { align: "right" });
        }

        doc.save("cotizacion-dietas-etapa2.pdf");
    });
})();

/* ── 4. Simulador de códigos de dieta ────────────────────────── */

(function simulator() {
    const root = document.getElementById("simulador");
    if (!root) return;

    const fieldAmbito = document.getElementById("fieldAmbito");
    const fieldDia = document.getElementById("fieldDia");
    const fieldAusencia = document.getElementById("fieldAusencia");
    const fieldHora = document.getElementById("fieldHora");
    const fieldHoras = document.getElementById("fieldHoras");
    const fieldExtras = document.getElementById("fieldExtras");
    const inputHora = document.getElementById("inputHora");
    const inputHoras = document.getElementById("inputHoras");
    const chkDescanso = document.getElementById("chkDescanso");
    const chkCruce = document.getElementById("chkCruce");

    const simCode = document.getElementById("simCode");
    const simMeaning = document.getElementById("simMeaning");
    const simBadges = document.getElementById("simBadges");
    const simAlert = document.getElementById("simAlert");

    const CODES = {
        nacional:      { laborable: { 1: "1N", 2: "2N", 3: "3N" }, festivo: { 1: "1F", 2: "2F", 3: "3F" } },
        internacional: { laborable: { 1: "4N", 2: "5N", 3: "6N" }, festivo: { 1: "4F", 2: "5F", 3: "6F" } },
    };
    const MEANING = {
        1: "Cubre <b>cena</b>.",
        2: "Cubre <b>almuerzo y cena</b>.",
        3: "Cubre <b>desayuno, almuerzo y cena</b>.",
    };

    function getActive(group) {
        const active = root.querySelector(`.pill-group[data-group="${group}"] .pill.active`);
        return active ? active.dataset.value : null;
    }

    function bandFromHora(hhmm, corte) {
        const [h, m] = hhmm.split(":").map(Number);
        const minutes = h * 60 + m;
        const start20 = 20 * 60;
        const corteMin = corte === "12:00" ? 12 * 60 : 8 * 60;
        if (minutes >= start20) return 1;
        if (minutes >= corteMin) return 2;
        return 3;
    }

    function setBadges(list) {
        simBadges.innerHTML = "";
        list.forEach((b) => {
            const span = document.createElement("span");
            span.className = "sim-badge";
            span.textContent = b;
            simBadges.appendChild(span);
        });
    }

    function render(code, meaningHtml, badges, level, alertHtml) {
        simCode.textContent = code;
        simCode.classList.remove("is-warn", "is-none");
        if (level === "warn") simCode.classList.add("is-warn");
        if (level === "none") simCode.classList.add("is-none");
        simMeaning.innerHTML = meaningHtml;
        setBadges(badges);
        if (alertHtml) {
            simAlert.innerHTML = alertHtml;
            simAlert.classList.remove("sim-hidden");
        } else {
            simAlert.classList.add("sim-hidden");
            simAlert.innerHTML = "";
        }
    }

    function updateFieldVisibility(situacion) {
        const ausente = situacion === "ausente";
        fieldAusencia.classList.toggle("sim-hidden", !ausente);
        fieldAmbito.classList.toggle("sim-hidden", ausente);
        fieldDia.classList.toggle("sim-hidden", ausente);
        fieldExtras.classList.toggle("sim-hidden", ausente);
        fieldHora.classList.toggle("sim-hidden", ausente || situacion !== "sale_plaza");
        fieldHoras.classList.toggle("sim-hidden", ausente || situacion !== "en_plaza");
    }

    function compute() {
        const ambito = getActive("ambito");
        const dia = getActive("dia");
        const situacion = getActive("situacion");
        updateFieldVisibility(situacion);

        if (situacion === "ausente") {
            const AUSENCIA = {
                pausa:      { code: "ST-P", label: "pausa" },
                baja:       { code: "ST-B", label: "baja" },
                vacaciones: { code: "ST-V", label: "vacaciones" },
            };
            const tipo = AUSENCIA[getActive("ausencia")] || AUSENCIA.pausa;
            render(
                tipo.code,
                `Solicitud de <b>${tipo.label}</b> registrada en <b>tblendalia_absenteeism_requests</b>. No aplica cálculo de dieta ni horas extra.`,
                ["AUSENCIA"],
                "normal",
                ""
            );
            return;
        }

        const descanso = chkDescanso.checked;
        const cruce = chkCruce.checked;
        let alertHtml = "";

        if (situacion === "en_plaza") {
            const horas = parseFloat(inputHoras.value) || 0;
            if (descanso) {
                render("—", "En plaza y tarjeta en descanso: <b>no se asigna nada</b>.", ["EN PLAZA", "TARJETA EN DESCANSO"], "none", cruce ? crossAlert() : "");
            } else if (horas <= 10) {
                render("—", "Sin dieta. <b>0 horas extra</b> — jornada de hasta 10h dentro de plaza.", ["EN PLAZA"], "none", cruce ? crossAlert() : "");
            } else {
                const extra = Math.floor((horas - 10) * 2) / 2;
                render(extra + "h", `Sin dieta de viaje. Horas extra registradas: <b>${extra}h</b> (redondeo siempre hacia abajo, pasos de 0.5).`, ["EN PLAZA", "HORAS EXTRA"], "normal", cruce ? crossAlert() : "");
            }
            return;
        }

        // fuera de plaza: "sale_plaza" o "inicia_fuera"
        const badges = ["FUERA DE PLAZA", dia === "festivo" ? "FESTIVO / DOMINGO" : "LABORABLE"];

        if (descanso) {
            const code = ambito === "internacional" ? "FSI" : "FSN";
            render(code, `Tarjeta en descanso, <b>sin conducción</b> en el día — territorio ${ambito}.`, [...badges, "TARJETA EN DESCANSO"], "normal", cruce ? crossAlert() : "");
            return;
        }

        let band, forced = false;
        if (situacion === "inicia_fuera") {
            band = 3;
            forced = true;
        } else {
            band = bandFromHora(inputHora.value, dia === "festivo" ? "12:00" : "08:00");
        }

        const code = CODES[ambito][dia][band];

        if (forced) {
            badges.push("REGLA FORZADA");
            alertHtml += `<b>Regla aplicada:</b> el chofer ya estaba fuera de su plaza al iniciar el día, así que el código es siempre el de cobertura completa (banda 3), sin importar la hora.`;
            if (ambito === "internacional") {
                alertHtml += ` El README solo documenta esta excepción de forma explícita para 3N/3F; extenderla a ${code} es <b>una convención por analogía</b> — conviene confirmarla con negocio.`;
            }
        }

        if (cruce) alertHtml += (alertHtml ? "<br><br>" : "") + crossAlert();

        render(code, MEANING[band], badges, (forced && ambito === "internacional") || cruce ? "warn" : "normal", alertHtml);
    }

    function crossAlert() {
        return `<b>Caso pendiente:</b> este día cruza de territorio nacional/internacional. Hoy el sistema no divide la dieta entre ámbitos — falta decidir si se parte por tramos, se prioriza el ámbito de mayor cobertura, o se fija una regla única. Ver sección "Pendiente de definición".`;
    }

    root.querySelectorAll(".pill-group").forEach((group) => {
        group.addEventListener("click", (e) => {
            const pill = e.target.closest(".pill");
            if (!pill) return;
            group.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            compute();
        });
    });
    inputHora.addEventListener("input", compute);
    inputHoras.addEventListener("input", compute);
    chkDescanso.addEventListener("change", compute);
    chkCruce.addEventListener("change", compute);

    compute();
})();
