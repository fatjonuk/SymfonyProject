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
            snap: new URLSearchParams(window.location.search).get('snap') === '0' ? false : {
                snapTo: 'labels',
                duration: { min: 0.35, max: 1.2 },
                delay: 0.15,
                ease: 'power1.inOut',
            },
        });
        return this;
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
