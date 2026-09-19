/* ═══════════════════════════════════════════════════════════
   CHAT · CONTROL TOWER — lógica de la página
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

/* ── 3. Vista previa de la propuesta en PDF (modal + descarga) ── */

(function pdfPreview() {
    const btn = document.getElementById("btnExportPdf");
    const modal = document.getElementById("pdfModal");
    const backdrop = document.getElementById("pdfModalBackdrop");
    const frame = document.getElementById("pdfFrame");
    const btnClose = document.getElementById("btnClosePdf");
    const btnDownload = document.getElementById("btnDownloadPdf");
    if (!btn || !modal || !frame) return;

    const FILE_NAME = "propuesta-chat-control-tower.pdf";

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
                text("SERVISOFTS · Chat Control Tower", marginX, y);
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
        text("PROPUESTA COMERCIAL · BORRADOR", pageW - marginX, y - 3, { align: "right" });
        text("Ref. CHAT-CONTROL-TOWER", pageW - marginX, y + 1.5, { align: "right" });
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
        text("Chat Control Tower", marginX, y);

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
            "La Control Tower ya tiene una app para choferes -donde cada uno ingresa con su DNI " +
            "y accede a distintas opciones- y una web con distintos usuarios internos. El " +
            "objetivo es crear una base de datos y un microservicio aparte para registrar los " +
            "chats entre choferes y usuarios de la Control Tower, tanto desde la app como desde " +
            "la web, con soporte para mensajes, imágenes, documentos, audios y grupos."
        );

        // ══════════════════ ALCANCE ══════════════════
        heading("Alcance propuesto");
        paragraph(
            "Alcance ya ajustado con lo definido en la reunión (ver sección siguiente): un chat " +
            "básico — texto, foto, documento, audio y grupos — vinculado al DNI del chofer.",
            { size: 8.6, color: MUTED, gap: 6 }
        );

        sectionLabel("1. Arquitectura: microservicio y base de datos dedicados");
        [
            "Nuevo microservicio exclusivo para el chat, separado del resto de servicios de la Control Tower.",
            "Base de datos propia para conversaciones, mensajes, grupos y adjuntos.",
            "Comunicación en tiempo real vía socket (WebSocket), para que los mensajes lleguen sin necesidad de refrescar.",
            "Definición de cómo la app del chofer y la web de la Control Tower consumen este servicio (API del chat).",
        ].forEach(bullet);
        y += 3;

        sectionLabel("2. Identificación de choferes y usuarios");
        [
            "El chofer se identifica en el chat con su DNI — ya existe en la base de datos, no requiere alta adicional.",
            "Cada chat queda vinculado al DNI, no a la matrícula del vehículo: si el chofer cambia de matrícula, conserva su historial de conversación.",
            "Los usuarios de la Control Tower (gestores, etc.) se identifican con su propio usuario de Control Tower / Sigestrán — no se les pide DNI aparte, para no complicar el alta.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("3. Mensajería de texto");
        [
            "Conversación 1 a 1 con historial de mensajes ordenado por fecha.",
            "Estado básico del mensaje (enviado / recibido) y aviso de mensajes nuevos.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("4. Envío de imágenes");
        [
            "Adjuntar y visualizar imágenes dentro de la conversación, desde la app y desde la web.",
            "Miniatura en el chat y vista ampliada al abrir la imagen.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("5. Envío de documentos");
        [
            "Adjuntar documentos (PDF, Excel, Word, etc.) en la conversación.",
            "Descarga del documento desde la app y desde la web.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("6. Mensajes de audio");
        [
            "Grabar y enviar notas de voz desde la app del chofer.",
            "Reproducir el audio recibido, tanto en la app como en la Control Tower.",
        ].forEach(bullet);
        paragraph(
            "A validar: la grabación y reproducción de audio suele ser el punto de mayor " +
            "complejidad técnica de un chat multimedia — conviene confirmar formatos y duración " +
            "máxima antes de cerrar el alcance.",
            { size: 8.6, color: MUTED, gap: 6 }
        );
        paragraph(
            "Según lo hablado en la reunión: el audio fue una propuesta de Servisofts (no un " +
            "pedido explícito), y quedó acordado incluirlo sin costo adicional.",
            { size: 8.6, color: "#15803d", gap: 6 }
        );

        sectionLabel("7. Chats grupales");
        [
            "Crear grupos con varios choferes y/o usuarios de la Control Tower.",
            "Administración básica del grupo: nombre, participantes, agregar o quitar miembros.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("8. Integración en la app y en la Control Tower");
        [
            "Pantalla de chat dentro de la app del chofer, junto a sus opciones actuales.",
            "Bandeja de conversaciones dentro de la Control Tower (web), para que los usuarios internos gestionen sus chats.",
        ].forEach(bullet);
        y += 4;

        // ══════════════════ DEFINICIONES DE LA REUNIÓN ══════════════════
        heading("Definiciones de la reunión");

        sectionLabel("Resuelto");
        [
            "Identificación: el chofer por DNI (ya está en la base de datos); los usuarios de la Control Tower con su propio usuario de Control Tower / Sigestrán, sin pedirles DNI aparte.",
            "Historial propio y separado de WhatsApp — se descartó sincronizar por número de teléfono.",
            "Notificación push de mensajes nuevos, igual que WhatsApp, tanto en la app como en la Control Tower.",
            "Mensajería en tiempo real vía socket (WebSocket), sin necesidad de refrescar la conversación.",
            "Alcance mínimo: texto, foto, documento y audio — el audio es clave porque escriben conductores.",
            "Los grupos sí entran en el alcance (ya usan grupos de WhatsApp para organizarse, por ejemplo por gestor).",
            "La Control Tower (web) necesita la misma función de chat que la app.",
        ].forEach(bullet);
        y += 3;

        sectionLabel("Pendiente de definir");
        [
            "Estado de lectura y \"en línea\": si hace falta marcar mensajes como leídos/no leídos, o mostrar cuándo el chofer está en línea.",
            "Almacenamiento y límites de adjuntos: dónde se guardan fotos, documentos y audios, y si hay límite de tamaño o duración.",
            "Quién puede crear grupos: cualquier usuario o solo los de la Control Tower.",
            "Búsqueda dentro del historial de conversaciones.",
            "Volumen esperado de choferes y usuarios de Control Tower en simultáneo.",
        ].forEach(bullet);
        y += 4;

        // ══════════════════ PRECIO ══════════════════
        heading("Inversión y plazo");
        paragraph(
            "EN REVISIÓN: esta es una primera estimación, todavía sujeta a ajuste mientras se " +
            "cierran los últimos puntos pendientes de la reunión (ver sección anterior).",
            { size: 9, color: "#b45309", bold: true, gap: 6 }
        );
        row("Concepto", "Importe", { fill: true, bold: true });
        row("Desarrollo Chat Control Tower (alcance descrito arriba)", "USD 3.500");
        row("Total", "USD 3.500", { bold: true, fill: true });
        y += 8;

        sectionLabel("Forma de pago");
        row("Anticipo — al iniciar el desarrollo (50%)", "USD 1.750");
        row("Contra entrega (50%)", "USD 1.750");
        y += 8;

        sectionLabel("Plazo de entrega");
        row("Desarrollo", "5 semanas");
        row("QA", "2 semanas");
        row("Total estimado", "7 semanas", { bold: true, fill: true });
        y += 8;

        sectionLabel("Cómo se compone el estimado (esfuerzo de desarrollo)");
        row("1. Arquitectura: microservicio, BD y socket (WebSocket)", "6 días");
        row("2. Identificación de choferes y usuarios", "2-3 días");
        row("3. Mensajería de texto", "3-4 días");
        row("4. Envío de imágenes", "2-3 días");
        row("5. Envío de documentos", "1-2 días");
        row("6. Mensajes de audio", "4 días");
        row("7. Chats grupales", "3-4 días");
        row("8. Integración en app y Control Tower", "5 días");
        y += 4;
        paragraph(
            "Sobre el audio: fue una propuesta de Servisofts, no un pedido explícito de ROR, así " +
            "que quedó acordado incluirlo sin costo adicional — ya está contemplado dentro del " +
            "estimado de arriba, no se resta ni se factura aparte.",
            { size: 8.6, color: "#15803d", gap: 8 }
        );

        // ══════════════════ CONDICIONES ══════════════════
        heading("Condiciones habituales");
        [
            "Forma de pago: 50% como anticipo para iniciar el desarrollo y 50% contra entrega.",
            "El plazo de 7 semanas se cuenta a partir de la confirmación del anticipo.",
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

    function openPreview() {
        if (!window.jspdf) {
            alert("No se pudo cargar el generador de PDF. Revisa tu conexión e inténtalo de nuevo.");
            return;
        }
        currentDoc = buildPdfDoc();
        currentUrl = currentDoc.output("bloburl");
        frame.src = currentUrl;
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
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
    }

    btn.addEventListener("click", openPreview);
    if (btnClose) btnClose.addEventListener("click", closePreview);
    if (backdrop) backdrop.addEventListener("click", closePreview);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("open")) closePreview();
    });
    if (btnDownload) {
        btnDownload.addEventListener("click", () => {
            if (currentDoc) currentDoc.save(FILE_NAME);
        });
    }
})();
