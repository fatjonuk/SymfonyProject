/*
 * ScrollTourController — binds the tour position to the page scroll.
 *
 * The stage is pinned (GSAP ScrollTrigger) and one paused timeline tweens the
 * tour position p from 0 to the number of legs. `scrub` keeps the camera on
 * the scroll (forwards and backwards), and a soft snap settles on the closest
 * stop once the visitor stops scrolling. Native scrolling is never hijacked.
 */

export class ScrollTour {
    constructor({ section, stage, director, reduced }) {
        this.section = section;
        this.stage = stage;
        this.director = director;
        this.reduced = reduced;
        this.T = { p: 0 };
        this.listeners = [];
    }

    /** Scroll distance for one unit of leg duration. */
    unit() {
        const h = window.innerHeight;
        return window.innerWidth < 768 ? h * 0.42 : h * 0.5;
    }

    init() {
        const { gsap, ScrollTrigger, ScrollToPlugin } = window;
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        ScrollTrigger.config({ ignoreMobileResize: true });
        const tl = gsap.timeline({ paused: true });
        let t = 0;
        this.director.legs.forEach((leg, i) => {
            tl.to(this.T, { p: i + 1, duration: leg.duration, ease: 'none' }, t);
            if (leg.type === 'hold') tl.addLabel('stop-' + leg.stop, t + leg.duration / 2);
            t += leg.duration;
        });
        this.total = t;
        this.timeline = tl;
        this.trigger = ScrollTrigger.create({
            trigger: this.section,
            pin: this.stage,
            start: 'top top',
            end: () => '+=' + Math.round(this.total * this.unit()),
            scrub: this.reduced ? true : 0.8,
            animation: tl,
            anticipatePin: 1,
            // Soft stabilisation: only when the visitor stops close to a stop.
            // Elsewhere the camera stays where the scroll left it, so slow
            // scrolling (or short swipes on a phone) always moves forward.
            snap: new URLSearchParams(window.location.search).get('snap') === '0' ? false : {
                snapTo: (value) => this.softSnap(value),
                duration: { min: 0.3, max: 0.9 },
                delay: 0.2,
                ease: 'power1.inOut',
                inertia: false,
            },
        });
        return this;
    }

    /** Progress (0-1) of the closest stop if it is near enough, otherwise the value itself. */
    softSnap(value) {
        const st = this.trigger;
        const tl = this.timeline;
        if (!st || !tl) return value;
        const distance = st.end - st.start;
        const reach = window.innerHeight * 0.32;
        let best = value;
        let bestGap = Infinity;
        for (const label of Object.values(tl.labels)) {
            const progress = label / this.total;
            const gap = Math.abs(progress - value) * distance;
            if (gap < bestGap) {
                bestGap = gap;
                best = progress;
            }
        }
        return bestGap <= reach ? best : value;
    }

    get p() {
        return this.T.p;
    }

    /** Scrolls the page so the camera reaches stop k (0 = intro, last = conclusion). */
    goToStop(k) {
        const { gsap } = window;
        const st = this.trigger;
        if (!st) return;
        const y = st.labelToScroll('stop-' + k);
        const distance = Math.abs(y - window.scrollY) / Math.max(1, st.end - st.start);
        gsap.to(window, {
            scrollTo: { y, autoKill: true },
            duration: this.reduced ? 0 : Math.min(4, 0.8 + distance * 9),
            ease: 'power2.inOut',
            overwrite: true,
        });
    }
}
