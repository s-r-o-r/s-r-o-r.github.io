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

/* ── 4. Simulador de códigos de dieta ────────────────────────── */

(function simulator() {
    const root = document.getElementById("simulador");
    if (!root) return;

    const fieldHora = document.getElementById("fieldHora");
    const fieldHoras = document.getElementById("fieldHoras");
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
        fieldHora.classList.toggle("sim-hidden", situacion !== "sale_plaza");
        fieldHoras.classList.toggle("sim-hidden", situacion !== "en_plaza");
    }

    function compute() {
        const ambito = getActive("ambito");
        const dia = getActive("dia");
        const situacion = getActive("situacion");
        updateFieldVisibility(situacion);

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
