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

document.addEventListener("DOMContentLoaded", initReveal);
document.addEventListener("DOMContentLoaded", initMobileNav);
