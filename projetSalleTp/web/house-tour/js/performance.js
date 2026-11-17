/*
 * PerformanceManager — picks the rendering quality, downgrades it when the
 * frame rate is too low, and pauses rendering when the tour is off screen or
 * the tab is hidden.
 */
export function detectQuality() {
    const forced = new URLSearchParams(window.location.search).get('q');
    if (forced === 'high' || forced === 'low') return forced;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory || 8;
    if ((coarse && small) || cores <= 4 || memory <= 4) return 'low';
    return 'high';
}

export class PerformanceManager {
    constructor({ section, onDowngrade }) {
        this.onDowngrade = onDowngrade;
        this.visible = true;
        this.samples = [];
        this.last = 0;
        this.checking = true;
        this.forced = !!new URLSearchParams(window.location.search).get('q');
        const io = new IntersectionObserver(([entry]) => {
            this.visible = entry.isIntersecting;
        });
        io.observe(section);
    }

    get running() {
        return this.visible && !document.hidden;
    }

    /** Called once per rendered frame with the high resolution timestamp. */
    frame(now) {
        if (!this.checking || this.forced) return;
        if (this.last) {
            const dt = now - this.last;
            if (dt < 250) this.samples.push(dt);
        }
        this.last = now;
        if (this.samples.length >= 90) {
            const sorted = [...this.samples].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            this.checking = false;
            if (median > 30) this.onDowngrade(median);
        }
    }

    resetTiming() {
        this.last = 0;
    }
}
