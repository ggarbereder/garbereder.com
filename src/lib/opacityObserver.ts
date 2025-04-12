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

    observe(element: Element, selector: string) {
        element
            .querySelectorAll(selector)
            .forEach(e => this.observer.observe(e))
    }
}
