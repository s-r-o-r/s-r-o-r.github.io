/* ═══════════════════════════════════════════════════════════
   AUDITORÍA 05/11/2026 — lógica de la página
   1) menú móvil   2) reveal-on-scroll   3) contadores   4) barras de caída
   ═══════════════════════════════════════════════════════════ */

"use strict";

/* ── 1. Menú móvil ───────────────────────────────────────────── */

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
    document.querySelectorAll(".stat b[data-count]").forEach((el) => {
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

/* ── 4. Barras de tiempo sin servicio ────────────────────────── */

(function downtimeBars() {
    const box = document.getElementById("downtimeBars");
    if (!box) return;
    const fills = box.querySelectorAll(".dt-fill");
    const max = Math.max(...[...fills].map((f) => +f.dataset.min || 0));
    const fill = () => fills.forEach((f) => { f.style.width = (100 * f.dataset.min / max) + "%"; });

    if (!("IntersectionObserver" in window)) return fill();
    const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { fill(); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(box);
})();
