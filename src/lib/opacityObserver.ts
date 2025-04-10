export class OpacityObserver {
    observer: IntersectionObserver;

    constructor (cls: string) {
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if(e.isIntersecting) {
                    e.target.classList.add(cls)
                }
            })
        });
    }

    observe(selector: string) {
        document
            .querySelectorAll(selector)
            .forEach(e => this.observer.observe(e))
    }
}
