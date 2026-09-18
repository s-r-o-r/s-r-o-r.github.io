/* ═══════════════════════════════════════════════════════════
   APP CHECKLIST · FASE 2 — lógica de la página
   1) reveal-on-scroll   2) contadores del hero   3) vista previa PDF
   ═══════════════════════════════════════════════════════════ */

"use strict";

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

/* ── 1. Reveal on scroll ─────────────────────────────────────── */

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

/* ── 2. Contadores del hero ──────────────────────────────────── */

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

/* ── 3. Vista previa de la cotización en PDF (modal + descarga) ── */

(function pdfPreview() {
    const btn = document.getElementById("btnExportPdf");
    const btnRequest = document.getElementById("btnViewRequest");
    const modal = document.getElementById("pdfModal");
    const backdrop = document.getElementById("pdfModalBackdrop");
    const frame = document.getElementById("pdfFrame");
    const title = document.getElementById("pdfModalTitle");
    const btnClose = document.getElementById("btnClosePdf");
    const btnDownload = document.getElementById("btnDownloadPdf");
    if (!modal || !frame) return;

    const QUOTE_FILE_NAME = "cotizacion-app-checklist-fase2.pdf";
    const REQUEST_FILE = "doc.pdf";
    const REQUEST_FILE_NAME = "solicitud-app-checklist-fase2.pdf";

    const INK = "#1a1a1a";
    const MUTED = "#666666";
    const ACCENT = [8, 145, 178];
    const LINE = "#cccccc";
    const FILL = "#f2f3f5";

    // Construye el PDF completo y devuelve el documento jsPDF (sin guardarlo todavía).
    function buildPdfDoc() {
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
                text("SERVISOFTS · App Checklist — Fase 2", marginX, y);
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

        // Bloque de código monoespaciado (para comparar consultas SQL antes/después)
        function codeBlock(label, code) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(MUTED);
            addPageIfNeeded(6);
            text(label.toUpperCase(), marginX, y);
            y += 5;

            doc.setFont("courier", "normal");
            doc.setFontSize(7.6);
            const lines = doc.splitTextToSize(code, contentW - 10);
            const h = lines.length * 3.8 + 6;
            addPageIfNeeded(h);
            doc.setFillColor(FILL);
            doc.setDrawColor(LINE);
            doc.setLineWidth(0.2);
            doc.rect(marginX, y, contentW, h, "FD");
            doc.setTextColor("#333333");
            text(lines, marginX + 4, y + 5);
            y += h + 6;
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
        text("Ref. APP-CHECKLIST-FASE2", pageW - marginX, y + 1.5, { align: "right" });
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
        text("App Checklist — Fase 2", marginX, y);

        y += 8;
        doc.setFontSize(10.5);
        doc.setFont("helvetica", "normal");
        text("Para:", marginX, y);
        doc.setFont("helvetica", "bold");
        text("ROR Logístico", marginX + 11, y);
        y += 8;

        // ══════════════════ DESCRIPCIÓN ══════════════════
        heading("Descripción del proyecto");
        paragraph(
            "Desarrollo de las mejoras y nuevas funcionalidades del módulo de Checklist de la " +
            "aplicación (Fase 2), según el documento de especificaciones “App GPS Fase 2 v2”, " +
            "incluyendo la gestión de preguntas por vehículo, el envío automático de correos ante " +
            "hallazgos críticos y la nueva grid visual de revisiones."
        );

        // ══════════════════ ALCANCE ══════════════════
        heading("Alcance del trabajo");

        sectionLabel("1. Entrada de checklist para gestores");
        [
            "Desplegable para elegir la campa/zona desde donde se realiza la revisión.",
            "Ampliación de tbldestinatarios para indicar cuáles son las campas o almacenes propios.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("2. Gestión de preguntas");
        [
            "Selector de chófer / gestor / otros roles futuros para definir quién puede responder cada pregunta (selección múltiple).",
            "Selector múltiple de emails por pregunta para casos de criticidad, filtrado a usuarios con ID Usuario Sigestran.",
            "Reordenamiento de preguntas en el grid (arrastre o botones subir/bajar), actualizando el número de orden.",
            "Alta de preguntas con selección de varios tipos de vehículo, replicando la pregunta en cada uno.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("3. Envío de correos automáticos");
        [
            "Envío automático al finalizar una revisión, a los destinatarios configurados por pregunta crítica.",
            "Agrupación de preguntas críticas en un único correo por destinatario, con plantilla de asunto y cuerpo (fecha, vehículo, usuario, listado de incidencias y enlace a la revisión).",
        ].forEach(bullet);
        y += 3;

        sectionLabel("4. Funcionalidades adicionales");
        [
            "Duplicar el set completo de preguntas de un vehículo hacia otro vehículo.",
            "Eliminar en bloque (anular) todas o varias preguntas de un vehículo, mediante selección con checks.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("5. Grid de revisiones");
        [
            "Nueva grid con selector previo de vehículo y rango de fechas (carga bajo demanda).",
            "Visualización con codificación de colores para preguntas críticas; las fotos no se muestran en el grid, se acceden con un botón.",
            "Exportación a Excel de la información visualizada en el grid.",
            "Comparativa entre revisiones del mismo vehículo, para detectar críticos no resueltos de revisiones anteriores.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("6. Cambio de origen del tipo de vehículo");
        [
            "En la v1, el tipo de vehículo se obtenía en una sola consulta, uniendo tblvehiculos con tbltipos_vehiculos directamente por tipo_vehiculo_id.",
            "En la v2, el tipo de vehículo se resuelve con dos JOIN adicionales: contra tbltipos_vehiculo_v1 (usando COALESCE entre el id de vehículo y el de tipo) y contra tblgrupos_vehiculo para obtener el grupo.",
            "Este cambio de origen de datos afecta a todo el desarrollo previo de la app (selección de vehículo, iconografía por tipo, asignación de preguntas por tipo, etc.), por lo que requiere revisar y ajustar cada punto donde se lee el tipo de vehículo.",
        ].forEach(bullet);
        y += 2;

        codeBlock(
            "Antes · v1",
            "SELECT\n" +
            "    REPLACE(LOWER(v.sMatricula), '-', '') AS matricula_busqueda,\n" +
            "    v.*,\n" +
            "    tv.*\n" +
            "FROM tblvehiculos v\n" +
            "LEFT JOIN tbltipos_vehiculos tv\n" +
            "    ON tv.lTipoVehiculoV1_id = v.tipo_vehiculo_id\n" +
            "WHERE REPLACE(LOWER(v.sMatricula), '-', '')\n" +
            "    LIKE CONCAT('%%', REPLACE(LOWER(%s), '-', ''), '%%')"
        );
        codeBlock(
            "Ahora · v2",
            "SELECT\n" +
            "    v.*,\n" +
            "    tv.*,\n" +
            "    tv1.*,\n" +
            "    gr.*\n" +
            "FROM tblvehiculos v\n" +
            "LEFT JOIN tbltipos_vehiculos tv\n" +
            "    ON tv.lTipoVehiculo_id = v.tipo_vehiculo_id\n" +
            "LEFT JOIN tbltipos_vehiculo_v1 tv1\n" +
            "    ON tv1.lTipoVehiculoV1_id = COALESCE(v.lTipoVehiculoV1_id, tv.lTipoVehiculoV1_id)\n" +
            "LEFT JOIN tblgrupos_vehiculo gr\n" +
            "    ON tv1.lGrupoVehiculo_id = gr.lGrupoVehiculo_id\n" +
            "WHERE v.sMatricula = '5524-MVW';"
        );
        paragraph(
            "Tarea de mayor complejidad del alcance: al cambiar la fuente del tipo de vehículo, " +
            "hay que revisar y ajustar todo el desarrollo anterior que dependía de la consulta " +
            "original (Fase 1 y Fase 2), no solo agregar los nuevos JOIN.",
            { size: 8.6, color: MUTED, gap: 8 }
        );

        // ══════════════════ PRECIO ══════════════════
        heading("Inversión y plazo");
        row("Concepto", "Importe", { fill: true, bold: true });
        row("Desarrollo App Checklist — Fase 2 (alcance descrito arriba)", "USD 2.000");
        row("Total", "USD 2.000", { bold: true, fill: true });
        y += 8;

        sectionLabel("Forma de pago");
        row("Anticipo — al iniciar el desarrollo (50%)", "USD 1.000");
        row("Contra entrega (50%)", "USD 1.000");
        y += 8;

        sectionLabel("Plazo de entrega");
        row("Desarrollo", "4 semanas");
        row("Total estimado", "4 semanas", { bold: true, fill: true });
        y += 8;

        // ══════════════════ CONDICIONES ══════════════════
        heading("Condiciones");
        [
            "Forma de pago: 50% como anticipo para iniciar el desarrollo y 50% contra entrega.",
            "El plazo de 4 semanas se cuenta a partir de la confirmación del anticipo.",
            "Incluye ambiente de pruebas y una ronda de ajustes menores post-entrega.",
        ].forEach(bullet);

        // ══════════════════ NUMERACIÓN DE PÁGINAS ══════════════════
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(MUTED);
            doc.text(`Página ${i} de ${totalPages}`, pageW - marginX, pageH - 10, { align: "right" });
        }

        return doc;
    }

    let currentDoc = null;
    let currentUrl = null;
    let currentMode = null; // "quote" | "request"

    function showModal() {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function openQuotePreview() {
        if (!window.jspdf) {
            alert("No se pudo cargar el generador de PDF. Revisa tu conexión e inténtalo de nuevo.");
            return;
        }
        currentMode = "quote";
        currentDoc = buildPdfDoc();
        currentUrl = currentDoc.output("bloburl");
        if (title) title.textContent = "Cotización · App Checklist — Fase 2";
        frame.src = currentUrl;
        showModal();
    }

    function openRequestPreview() {
        currentMode = "request";
        if (title) title.textContent = "Solicitud · App GPS Fase 2 (Checklist)";
        frame.src = REQUEST_FILE;
        showModal();
    }

    function closePreview() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        frame.src = "about:blank";
        if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
            currentUrl = null;
        }
        currentDoc = null;
        currentMode = null;
    }

    function downloadRequest() {
        const a = document.createElement("a");
        a.href = REQUEST_FILE;
        a.download = REQUEST_FILE_NAME;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    if (btn) btn.addEventListener("click", openQuotePreview);
    if (btnRequest) btnRequest.addEventListener("click", openRequestPreview);
    if (btnClose) btnClose.addEventListener("click", closePreview);
    if (backdrop) backdrop.addEventListener("click", closePreview);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("open")) closePreview();
    });
    if (btnDownload) {
        btnDownload.addEventListener("click", () => {
            if (currentMode === "quote" && currentDoc) currentDoc.save(QUOTE_FILE_NAME);
            else if (currentMode === "request") downloadRequest();
        });
    }
})();
