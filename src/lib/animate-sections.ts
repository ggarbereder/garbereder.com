import { OpacityObserver } from "./index";

document.querySelectorAll<HTMLElement>('[data-animate-section]').forEach(section => {
  new OpacityObserver("opacity-100").observe(section, '.opacity-0.animate');
});
