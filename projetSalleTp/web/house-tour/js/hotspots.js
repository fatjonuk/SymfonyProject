/*
 * HotspotManager — HTML buttons anchored to 3D coordinates.
 * They follow the camera, hide when they are behind a wall (ray test against
 * the house geometry), too far, off-screen or under the active text panel,
 * and remain usable with the keyboard.
 */
import * as THREE from 'three';

const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

export class Hotspots {
    constructor({ layer, config, camera, occluders, onSelect }) {
        this.layer = layer;
        this.camera = camera;
        this.occluders = occluders;
        this.onSelect = onSelect;
        this.raycaster = new THREE.Raycaster();
        this.items = [];
        this.cursor = 0;
        this.avoid = null; // screen rectangle to keep clear (active panel)
        config.steps.forEach((step) => {
            (step.hotspots || []).forEach((h) => {
                const el = document.createElement('button');
                el.type = 'button';
                el.className = 'hotspot';
                el.tabIndex = -1;
                el.setAttribute('aria-expanded', 'false');
                el.setAttribute('aria-label', h.label + ' — en savoir plus');
                el.innerHTML = `<span class="hotspot__core">${PLUS}</span><span class="hotspot__label">${h.label}</span>`;
                el.addEventListener('click', () => this.onSelect(item));
                layer.appendChild(el);
                const item = {
                    data: h,
                    step: step.number,
                    el,
                    world: new THREE.Vector3(...h.position),
                    occluded: false,
                    visible: false,
                };
                this.items.push(item);
            });
        });
        this._v = new THREE.Vector3();
        this._dir = new THREE.Vector3();
    }

    setExpanded(item) {
        for (const it of this.items) it.el.setAttribute('aria-expanded', it === item ? 'true' : 'false');
    }

    /** Ray test from the camera; returns true when geometry hides the point. */
    occlusion(item) {
        const cam = this.camera.position;
        this._dir.copy(item.world).sub(cam);
        const dist = this._dir.length();
        this.raycaster.set(cam, this._dir.normalize());
        this.raycaster.far = dist - 0.12;
        this.raycaster.near = 0.05;
        const hits = this.raycaster.intersectObjects(this.occluders, false);
        return hits.length > 0;
    }

    update(activeStep, size) {
        // refresh one occlusion test per frame (round robin) to keep it cheap
        const active = this.items.filter((it) => it.step === activeStep);
        if (active.length) {
            const it = active[this.cursor++ % active.length];
            it.occluded = this.occlusion(it);
        }
        for (const it of this.items) {
            let show = false;
            if (it.step === activeStep) {
                const v = this._v.copy(it.world).project(this.camera);
                const x = (v.x * 0.5 + 0.5) * size.w;
                const y = (-v.y * 0.5 + 0.5) * size.h;
                const dist = this.camera.position.distanceTo(it.world);
                const onScreen = v.z < 1 && x > 24 && x < size.w - 24 && y > 70 && y < size.h - 24;
                const underPanel = this.avoid && x > this.avoid.left - 20 && x < this.avoid.right + 20 && y > this.avoid.top - 20 && y < this.avoid.bottom + 20;
                show = onScreen && !underPanel && !it.occluded && dist < 32;
                if (show) it.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
            }
            if (show !== it.visible) {
                it.visible = show;
                it.el.classList.toggle('is-visible', show);
                it.el.tabIndex = show ? 0 : -1;
            }
        }
    }
}
