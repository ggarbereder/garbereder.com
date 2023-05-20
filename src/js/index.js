const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if(e.isIntersecting) {
            e.target.classList.add('opacity-100')
        }
    })
});

document
    .querySelectorAll('.opacity-0.animate')
    .forEach(e => obs.observe(e))
