/*
 * TourUI — panels, intro and conclusion, step rail and counter, progress,
 * screen-reader announcements, information sheet and step actions.
 * The texts come from the HTML rendered by Twig (house_tour.yml).
 */
import * as THREE from 'three';

const ss = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

export class TourUI {
    constructor(root, config) {
        this.root = root;
        this.config = config;
        this.stage = root.querySelector('[data-tour-stage]');
        this.intro = root.querySelector('[data-intro]');
        this.final = root.querySelector('[data-final]');
        this.panels = [...root.querySelectorAll('[data-panel]')];
        this.railItems = [...root.querySelectorAll('[data-goto]')];
        this.counter = root.querySelector('[data-counter]');
        this.progress = root.querySelector('[data-progress]');
        this.announce = root.querySelector('[data-announce]');
        this.sheet = root.querySelector('[data-sheet]');
        this.sheetBody = root.querySelector('[data-sheet-body]');
        this.veil = root.querySelector('[data-veil]');
        this.activePanel = -1;
        this.current = -1;
        this.selectedHotspot = null;
        this.selectedHotspotPosition = null;
        this.focusCircuit = null;
        this.opener = null;
        this.handlers = {};
        this.chargeTimer = null;

        root.querySelector('[data-sheet-close]').addEventListener('click', () => this.closeSheet());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.sheet.hidden) this.closeSheet();
        });
        this.railItems.forEach((btn) => btn.addEventListener('click', () => this.emit('goto', Number(btn.dataset.goto))));
        root.addEventListener('click', (e) => {
            const el = e.target.closest('[data-action]');
            if (!el || el.tagName === 'INPUT') return;
            this.action(el.dataset.action, el);
        });
        root.addEventListener('input', (e) => {
            if (e.target.matches('[data-action="lights-dim"]')) this.emit('lights-dim', Number(e.target.value) / 100);
        });
    }

    on(name, fn) {
        this.handlers[name] = fn;
    }

    emit(name, value) {
        if (this.handlers[name]) this.handlers[name](value);
    }

    /** Rectangle of the visible panel, used to keep hotspots clear of the text. */
    panelRect() {
        const el = this.activePanel > 0 ? this.panels[this.activePanel - 1] : null;
        if (!el || window.innerWidth < 1024) return null;
        return el.getBoundingClientRect();
    }

    /**
     * @param p      tour position
     * @param stop   index of the stop the visitor is closest to (0 = intro, steps 1..n, n+1 = final)
     * @param panel  step number whose panel is shown (0 = none)
     */
    update(p, stop, panel, total, legs) {
        const steps = this.config.steps.length;
        // intro copy fades while the camera starts moving
        const introK = 1 - ss(1.0, 1.35, p);
        this.intro.style.opacity = introK.toFixed(3);
        this.intro.style.transform = window.innerWidth >= 1024 ? `translateY(calc(-46% - ${((1 - introK) * 30).toFixed(1)}px))` : `translateY(${(-(1 - introK) * 20).toFixed(1)}px)`;
        this.intro.style.visibility = introK < 0.01 ? 'hidden' : 'visible';

        this.stage.classList.toggle('is-intro', p < 1.15);
        if (panel !== this.activePanel) {
            this.panels.forEach((el, i) => {
                el.classList.toggle('is-active', i + 1 === panel);
                if (i + 1 === panel) el.scrollTop = 0;
            });
            this.activePanel = panel;
            if (panel > 0) {
                const step = this.config.steps[panel - 1];
                this.announce.textContent = `Étape ${panel} sur ${steps} : ${step.title}`;
            }
        }
        const finalOn = stop === steps + 1 && p > legs - 1.2;
        this.final.classList.toggle('is-active', finalOn);

        if (stop !== this.current) {
            this.current = stop;
            const step = Math.min(steps, Math.max(0, stop));
            this.counter.textContent = String(step).padStart(2, '0');
            this.railItems.forEach((btn, i) => {
                const n = i + 1;
                if (n === stop) btn.setAttribute('aria-current', 'step');
                else btn.removeAttribute('aria-current');
                btn.classList.toggle('is-done', n < stop);
            });
            if (stop === steps + 1) this.announce.textContent = this.final.querySelector('h2').textContent;
            this.closeSheet(true);
        }
        this.progress.style.transform = `scaleX(${(p / legs).toFixed(4)})`;
    }

    /* ---------- information sheet ---------- */

    openSheet(html, opener) {
        this.sheetBody.innerHTML = '';
        if (typeof html === 'string') this.sheetBody.innerHTML = html;
        else this.sheetBody.appendChild(html);
        this.sheet.hidden = false;
        this.stage.classList.add('has-sheet');
        this.opener = opener || null;
        const close = this.sheet.querySelector('[data-sheet-close]');
        close.focus({ preventScroll: true });
    }

    closeSheet(silent) {
        if (this.sheet.hidden) return;
        this.sheet.hidden = true;
        this.stage.classList.remove('has-sheet');
        this.selectedHotspot = null;
        this.selectedHotspotPosition = null;
        this.focusCircuit = null;
        this.emit('sheet-closed');
        clearInterval(this.chargeTimer);
        if (!silent && this.opener && document.contains(this.opener)) this.opener.focus({ preventScroll: true });
        this.opener = null;
    }

    showHotspot(item) {
        const h = item.data;
        this.selectedHotspot = h.id;
        this.selectedHotspotPosition = new THREE.Vector3(...h.position);
        this.focusCircuit = h.circuit || null;
        const tag = this.config.steps[item.step - 1].nav;
        const wrap = document.createElement('div');
        wrap.innerHTML = `<p class="tour-sheet__tag"></p><h3 id="tour-sheet-title"></h3><p></p>`;
        wrap.querySelector('.tour-sheet__tag').textContent = tag;
        wrap.querySelector('h3').textContent = h.label;
        wrap.querySelectorAll('p')[1].textContent = h.text;
        this.openSheet(wrap, item.el);
        this.emit('hotspot', item);
    }

    moreContent(stepId) {
        const tpl = this.root.querySelector(`template[data-more="${stepId}"]`);
        const frag = document.createElement('div');
        if (tpl) frag.appendChild(tpl.content.cloneNode(true));
        const h3 = frag.querySelector('h3');
        if (h3) h3.id = 'tour-sheet-title';
        return frag;
    }

    action(name, el) {
        const stepId = el.dataset.stepId;
        switch (name) {
            case 'more':
                this.openSheet(this.moreContent(stepId), el);
                break;
            case 'solar':
                this.openSheet(this.moreContent(stepId), el);
                this.emit('solar', true);
                break;
            case 'charge': {
                const content = this.moreContent(stepId);
                const meter = document.createElement('div');
                meter.className = 'charge-meter';
                meter.innerHTML = '<div class="charge-meter__row"><span>Recharge en cours</span><span data-charge-value>20 %</span></div><div class="charge-meter__bar"><span data-charge-bar></span></div><p class="charge-meter__note">Indicateur purement illustratif.</p>';
                content.insertBefore(meter, content.children[1] || null);
                this.openSheet(content, el);
                let level = 20;
                const bar = meter.querySelector('[data-charge-bar]');
                const value = meter.querySelector('[data-charge-value]');
                const tick = () => {
                    level = level >= 100 ? 20 : level + 1;
                    bar.style.width = level + '%';
                    value.textContent = level + ' %';
                };
                tick();
                this.chargeTimer = setInterval(tick, 160);
                this.emit('charge', true);
                break;
            }
            case 'lights-toggle': {
                const on = el.getAttribute('aria-pressed') !== 'true';
                el.setAttribute('aria-pressed', on ? 'true' : 'false');
                el.querySelector('[data-label]').textContent = on ? 'Éteindre' : 'Allumer';
                const slider = this.root.querySelector('[data-action="lights-dim"]');
                if (slider && on && Number(slider.value) === 0) slider.value = 100;
                this.emit('lights-dim', on ? Number(slider ? slider.value : 100) / 100 : 0);
                break;
            }
            case 'details': {
                // compact screens: full description and key points of the step
                const panel = el.closest('[data-panel]');
                const wrap = document.createElement('div');
                const tag = document.createElement('p');
                tag.className = 'tour-sheet__tag';
                tag.textContent = this.config.steps[Number(panel.dataset.panel) - 1].nav;
                const title = document.createElement('h3');
                title.id = 'tour-sheet-title';
                title.textContent = panel.querySelector('.tour-panel__title').textContent;
                const desc = document.createElement('p');
                desc.textContent = panel.querySelector('.tour-panel__desc').textContent;
                const list = panel.querySelector('.tour-panel__details').cloneNode(true);
                wrap.append(tag, title, desc, list);
                this.openSheet(wrap, el);
                break;
            }
            case 'restart':
                this.emit('goto', 0);
                break;
        }
    }

    syncLightsButton(level) {
        const btn = this.root.querySelector('[data-action="lights-toggle"]');
        if (!btn) return;
        const on = level > 0.001;
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.querySelector('[data-label]').textContent = on ? 'Éteindre' : 'Allumer';
    }

    flash() {
        // short fade used for the cuts between views when motion is reduced
        this.veil.style.transition = 'none';
        this.veil.style.opacity = '1';
        requestAnimationFrame(() => {
            this.veil.style.transition = 'opacity 0.35s ease';
            this.veil.style.opacity = '0';
        });
    }
}
