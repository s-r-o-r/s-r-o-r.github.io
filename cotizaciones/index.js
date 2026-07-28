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

document.addEventListener("DOMContentLoaded", initReveal);
