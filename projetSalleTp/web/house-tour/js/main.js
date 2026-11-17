/*
 * Entry point of the 3D house tour.
 *
 *   config (Twig JSON) ─┬─ CameraDirector (camera keyframes → path)
 *                       ├─ ScrollTour     (page scroll → tour position p)
 *                       ├─ TourEffects    (p → door, lights, circuits, roof…)
 *                       ├─ Hotspots       (3D anchored buttons)
 *                       └─ TourUI         (panels, rail, sheet)
 *
 * Without WebGL (or if anything fails while building the scene) the page
 * falls back to the static version: the same panels as an illustrated list.
 */
import * as THREE from 'three';
import { createStage } from './stage.js';
import { createMaterials } from './scene/materials.js';
import { buildHouse } from './scene/house.js';
import { buildInterior } from './scene/interior.js';
import { buildDevices } from './scene/devices.js';
import { buildCircuits } from './scene/circuits.js';
import { buildExterior } from './scene/exterior.js';
import { CameraDirector } from './director.js';
import { TourEffects } from './effects.js';
import { ScrollTour } from './scroll-tour.js';
import { Hotspots } from './hotspots.js';
import { TourUI } from './ui.js';
import { PerformanceManager, detectQuality } from './performance.js';

const root = document.querySelector('[data-tour]');

function hasWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) {
        return false;
    }
}

function staticMode(reason) {
    root.classList.add('tour--static');
    const loader = root.querySelector('[data-loader]');
    if (loader) loader.classList.add('is-done');
    if (reason) console.info('[visite 3D] version illustrée :', reason);
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

async function boot() {
    const config = JSON.parse(document.getElementById('tour-config').textContent);
    if (!hasWebGL()) return staticMode('WebGL indisponible');
    if (!window.gsap || !window.ScrollTrigger || !window.ScrollToPlugin) return staticMode('GSAP non chargé');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const quality = detectQuality();
    const canvas = root.querySelector('[data-tour-canvas]');
    const stageEl = root.querySelector('[data-tour-stage]');
    const loader = root.querySelector('[data-loader]');
    const bar = root.querySelector('[data-loader-bar]');
    const value = root.querySelector('[data-loader-value]');
    const setProgress = (k) => {
        const pct = Math.round(k * 100);
        bar.style.width = pct + '%';
        value.textContent = pct;
    };

    const stage = createStage(canvas, quality);
    stage.resize();
    const ctx = { M: null, reg: { occluders: [], lights: [] }, quality };
    let levels;
    let circuits;

    // real build steps: the percentage reflects the work actually done
    const tasks = [
        () => (ctx.M = createMaterials()),
        () => (levels = buildHouse(stage.scene, ctx)),
        () => buildInterior(levels, ctx),
        () => buildDevices(levels, ctx),
        () => (circuits = buildCircuits(levels)),
        () => buildExterior(stage.scene, ctx),
        () => (stage.renderer.compileAsync ? stage.renderer.compileAsync(stage.scene, stage.camera) : stage.renderer.compile(stage.scene, stage.camera)),
    ];
    for (let i = 0; i < tasks.length; i++) {
        await tasks[i]();
        setProgress((i + 1) / tasks.length);
        await nextFrame();
    }

    const director = new CameraDirector(config);
    const ui = new TourUI(root, config);
    const effects = new TourEffects({ director, stage, reg: ctx.reg, levels, circuits, ui });
    const tour = new ScrollTour({ section: root, stage: stageEl, director, reduced }).init();
    const hotspots = new Hotspots({
        layer: root.querySelector('[data-hotspots]'),
        config,
        camera: stage.camera,
        occluders: ctx.reg.occluders,
        onSelect: (item) => {
            ui.showHotspot(item);
            hotspots.setExpanded(item);
        },
    });
    const perf = new PerformanceManager({
        section: root,
        onDowngrade: (ms) => {
            stage.setQuality('low');
            console.info(`[visite 3D] qualité réduite (${ms.toFixed(0)} ms par image)`);
        },
    });

    ui.on('goto', (k) => tour.goToStop(k));
    ui.on('lights-dim', (v) => {
        effects.user.salon = v;
        ui.syncLightsButton(v);
    });
    ui.on('solar', (v) => (effects.user.solar = v));
    ui.on('charge', (v) => (effects.user.charging = v));
    ui.on('sheet-closed', () => {
        effects.user.solar = false;
        effects.user.charging = false;
        hotspots.setExpanded(null);
    });

    const camera = stage.camera;
    const pose = { position: new THREE.Vector3(), target: new THREE.Vector3(), fov: 40 };
    const offset = { x: 0, y: 0 };
    const reveal = { k: reduced ? 1 : 0 };
    const legsCount = director.legs.length;
    const stepsCount = config.steps.length;
    let lastCut = -1;
    let lastPanel = -1;

    window.addEventListener('resize', () => {
        stage.resize();
        lastPanel = -1;
    });

    function frame(now) {
        requestAnimationFrame(frame);
        if (!perf.running) {
            perf.resetTiming();
            return;
        }
        perf.frame(now);
        const t = now / 1000;
        const p = tour.p;
        const size = stage.size;

        director.pose(p, pose, reduced);
        if (reduced) {
            const { leg, f } = director.locate(p);
            const cut = leg.type === 'hold' ? leg.from : f < 0.5 ? leg.from : leg.to;
            if (lastCut !== -1 && cut !== lastCut) ui.flash();
            lastCut = cut;
        } else {
            // slow drift on the opening view, and the arrival dolly after loading
            const idle = Math.max(0, 1 - p);
            pose.position.x += Math.sin(t * 0.12) * 0.55 * idle;
            pose.position.y += Math.sin(t * 0.09) * 0.18 * idle;
            const back = 1 + 0.22 * (1 - reveal.k) * idle;
            pose.position.sub(pose.target).multiplyScalar(back).add(pose.target);
        }
        camera.position.copy(pose.position);
        camera.lookAt(pose.target);

        // which stop / panel
        const { leg, f } = director.locate(p);
        const stop = leg.type === 'hold' ? leg.stop : f < 0.5 ? leg.stop - 1 : leg.stop;
        let panel = 0;
        const arriving = leg.type === 'move' && f > (reduced ? 0.5 : 0.86);
        if ((leg.type === 'hold' || arriving) && leg.stop >= 1 && leg.stop <= stepsCount) panel = leg.stop;

        // field of view adapted to portrait screens, framing offset for the panels
        const aspect = size.w / size.h;
        camera.fov = aspect < 1.25 ? Math.min(76, pose.fov * Math.pow(1.25 / aspect, 0.6)) : pose.fov;
        const desktop = size.w >= 1024;
        const finalOn = stop === stepsCount + 1;
        const tx = desktop ? -0.13 * size.w : 0;
        const ty = desktop ? 0 : panel > 0 || finalOn ? 0.17 * size.h : p < 1.3 ? -0.1 * size.h : 0.08 * size.h;
        const k = reduced ? 1 : 0.08;
        offset.x += (tx - offset.x) * k;
        offset.y += (ty - offset.y) * k;
        camera.setViewOffset(size.w, size.h, offset.x, offset.y, size.w, size.h);
        camera.updateProjectionMatrix();

        effects.update(p, t, reduced);
        ui.update(p, stop, panel, stepsCount, legsCount);
        if (panel !== lastPanel) {
            lastPanel = panel;
            requestAnimationFrame(() => (hotspots.avoid = ui.panelRect()));
        }
        hotspots.update(panel, size);
        stage.render();
    }

    loader.classList.add('is-done');
    if (!reduced) {
        const veil = root.querySelector('[data-veil]');
        veil.style.opacity = '1';
        window.gsap.to(veil, { opacity: 0, duration: 1.4, ease: 'power2.out' });
        window.gsap.to(reveal, { k: 1, duration: 2.8, ease: 'power3.out' });
    }
    requestAnimationFrame(frame);

    // deep link from the services page: /visite-maison#etape-cuisine
    const match = window.location.hash.match(/^#etape-(.+)$/);
    if (match) {
        const step = config.steps.find((s) => s.id === match[1]);
        if (step) setTimeout(() => tour.goToStop(step.number), 400);
    }

    // debug and automated checks
    window.__tour = {
        THREE,
        stage,
        director,
        tour,
        effects,
        ui,
        hotspots,
        reg: ctx.reg,
        levels,
        /** Scroll position for a tour position p (0 … legs). */
        scrollFor(p) {
            const legs = director.legs;
            let time = 0;
            for (let i = 0; i < Math.floor(p) && i < legs.length; i++) time += legs[i].duration;
            if (p < legs.length) time += (p - Math.floor(p)) * legs[Math.floor(p)].duration;
            const st = tour.trigger;
            return st.start + (time / tour.total) * (st.end - st.start);
        },
    };
}

if (root) {
    boot().catch((error) => {
        console.error(error);
        staticMode('erreur pendant la construction de la scène');
    });
}
