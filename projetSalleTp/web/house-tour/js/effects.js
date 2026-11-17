/*
 * Scene animations driven by the tour position p (and therefore by the scroll):
 * front door, interior exposure, panel highlight, circuits, living-room
 * lighting, kitchen LEDs, towel radiator, solar flow, charging, roof exit.
 * Everything is a pure function of p, so scrolling back plays it in reverse.
 */
import * as THREE from 'three';
import { ROOF_LIFT } from './scene/house.js';
import { CIRCUIT_MAX } from './scene/circuits.js';

const clamp = (x) => Math.min(1, Math.max(0, x));
const ss = (a, b, x) => {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

const BASE = 0.55; // resting level of the interior lights

const flowVert = /* glsl */ `
    attribute float aDist;
    varying float vDist;
    void main() { vDist = aDist; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const flowFrag = /* glsl */ `
    uniform vec3 uColor; uniform float uTime; uniform float uOpacity; uniform float uSpeed;
    varying float vDist;
    void main() {
        float pulse = smoothstep(0.7, 1.0, fract((vDist - uTime * uSpeed) / 1.4));
        gl_FragColor = vec4(uColor * (1.1 + pulse * 2.2), uOpacity * (0.45 + 0.55 * pulse));
    }
`;

function flowLine(points, color, radius, xray) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.08);
    const len = curve.getLength();
    const geo = new THREE.TubeGeometry(curve, Math.ceil(len * 8) + 16, radius, 8, false);
    const uv = geo.attributes.uv;
    const d = new Float32Array(uv.count);
    for (let i = 0; i < uv.count; i++) d[i] = uv.getX(i) * len;
    geo.setAttribute('aDist', new THREE.BufferAttribute(d, 1));
    const mat = new THREE.ShaderMaterial({
        vertexShader: flowVert,
        fragmentShader: flowFrag,
        uniforms: { uColor: { value: new THREE.Color(color) }, uTime: { value: 0 }, uOpacity: { value: 0 }, uSpeed: { value: 2.4 } },
        transparent: true,
        depthWrite: false,
        depthTest: !xray,
        toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 25;
    mesh.frustumCulled = false;
    return mesh;
}

export class TourEffects {
    constructor({ director, stage, reg, levels, circuits, ui }) {
        this.director = director;
        this.stage = stage;
        this.reg = reg;
        this.levels = levels;
        this.circuits = circuits;
        this.ui = ui;
        this.user = { salon: 1, charging: false, solar: false };

        // index of the hold leg of each stop, by id
        this.hold = {};
        director.legs.forEach((leg, i) => {
            if (leg.type === 'hold') this.hold[director.stops[leg.stop].id] = i;
        });

        // solar flow: sun -> panels (light), panels -> inverter (direct current)
        const panels = [2.3, 7.05, -1.9];
        const sunDir = new THREE.Vector3(-0.6, 0.55, 0.45).normalize().multiplyScalar(26);
        const sunPoint = [panels[0] + sunDir.x, panels[1] + sunDir.y, panels[2] + sunDir.z];
        const group = new THREE.Group();
        group.name = 'solar_flow';
        this.solarLines = [
            flowLine([sunPoint, [(sunPoint[0] + panels[0]) / 2, (sunPoint[1] + panels[1]) / 2, (sunPoint[2] + panels[2]) / 2], panels], '#F2B705', 0.05, false),
            flowLine([panels, [-3.0, 6.9, -1.9], [-7.15, 6.7, -1.9], [-7.15, 4.0, -1.9], [-7.15, 2.1, -1.0], [-7.15, 2.1, 1.0], [-6.3, 1.85, 1.3]], '#FF8A3D', 0.03, true),
        ];
        group.add(...this.solarLines);
        levels.house.add(group);

        this.interiorLights = reg.lights.filter((l) => l.room !== 'exterieur');
        this.salonOrder = new Map();
        let n = 0;
        for (const l of reg.lights) if (l.room === 'salon') this.salonOrder.set(l, n++);
        this.salonCount = n;
    }

    /** 0 → 1 → 0 weight of a stop: 1 while holding, ramps at the end / start of the moves around it. */
    weight(id, p) {
        const h = this.hold[id];
        if (h === undefined) return 0;
        if (p >= h && p <= h + 1) return 1;
        if (p >= h - 1 && p < h) return ss(0.55, 1, p - (h - 1));
        if (p > h + 1 && p <= h + 2) return 1 - ss(0, 0.45, p - (h + 1));
        return 0;
    }

    /** Local progress inside the leg `offset` relative to the hold of `id` (-1 = incoming move). */
    phase(id, p, offset) {
        const start = this.hold[id] + offset;
        return clamp(p - start);
    }

    update(p, time, reduced) {
        const { reg, stage } = this;
        const w = (id) => this.weight(id, p);
        const wPanel = w('tableau');
        const wPrises = w('prises');
        const wLum = w('lumieres');
        const wKitchen = w('cuisine');
        const wSeche = w('seche-serviettes');
        const wSolar = w('solaire');
        const wBorne = w('borne');
        const pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(time * 2.4);

        // front door opens while the camera walks up the path
        const doorF = this.phase('tableau', p, -1);
        const doorOpen = p >= this.hold.tableau ? 1 : ss(0.22, 0.48, doorF);
        if (reg.door) reg.door.rotation.y = 1.56 * doorOpen;

        // exposure adapts when entering, and when leaving through the roof
        const inside = ss(0.55, 0.85, doorF) * (1 - ss(0.32, 0.6, this.phase('solaire', p, -1)));
        stage.renderer.toneMappingExposure = lerp(1.0, 1.2, p >= this.hold.solaire ? 0 : inside);

        // roof lifts while the camera rises out of the bathroom, then settles back
        const roofF = this.phase('solaire', p, -1);
        const roofK = p > this.hold.solaire ? 0 : ss(0.02, 0.22, roofF) * (1 - ss(0.6, 0.88, roofF));
        this.levels.roof.position.y = ROOF_LIFT * roofK;

        // distribution board: halo, opening door, accent on the RCDs
        reg.panel.haloMat.opacity = 0.42 * wPanel * pulse;
        reg.panel.accent.emissiveIntensity = 1.2 * wPanel;
        reg.panel.door.rotation.y = -1.95 * ss(0.25, 1, wPanel);

        // circuits: drawn from the board during step 1, highlighted on steps 2-4, faded upstairs
        const c = this.circuits.state;
        const tableauHold = this.phase('tableau', p, 0);
        c.reveal = p < this.hold.tableau ? 0 : p > this.hold.tableau + 1 ? CIRCUIT_MAX : CIRCUIT_MAX * ss(0.02, 0.8, tableauHold);
        c.opacity = 1 - ss(0.12, 0.4, this.phase('seche-serviettes', p, -1));
        if (p > this.hold['seche-serviettes']) c.opacity = 0;
        c.packets = reduced ? 0 : 1;
        const sel = this.ui.focusCircuit;
        if (sel) {
            c.focus.a = this.circuits.groupIndex(sel);
            c.focus.b = -1;
            c.focus.amt = 1;
        } else if (wPrises >= wLum) {
            c.focus.a = this.circuits.groupIndex('prises-salon');
            c.focus.b = -1;
            c.focus.amt = wPrises * 0.92;
        } else {
            c.focus.a = this.circuits.groupIndex('salon-eclairage');
            c.focus.b = -1;
            c.focus.amt = wLum * 0.9;
        }
        c.vis.light = 1 - 0.75 * wKitchen;
        c.vis.outlet = 1 - 0.35 * wKitchen;
        c.vis.special = 1;
        this.circuits.update(time);

        // living room choreography: dims on arrival, then the lights come on one by one
        const hl = this.hold.lumieres;
        const salonLevel = (order) => {
            if (p < hl - 1) return BASE;
            if (p < hl) return lerp(BASE, 0.12, ss(0.3, 0.75, p - (hl - 1)));
            if (p <= hl + 1) {
                const o = order / Math.max(1, this.salonCount);
                return lerp(0.12, 1, ss(o * 0.42, o * 0.42 + 0.22, p - hl));
            }
            if (p <= hl + 2) return lerp(1, BASE, ss(0.5, 0.9, p - (hl + 1)));
            return BASE;
        };
        const userSalon = this.user.salon;
        const kitchenOn = ss(0.2, 1, wKitchen);
        let salonSum = 0;
        for (const l of reg.lights) {
            let level;
            if (l.room === 'salon') {
                level = salonLevel(this.salonOrder.get(l)) * userSalon;
                salonSum += level;
            } else if (l.room === 'cuisine') level = lerp(BASE, 0.95, kitchenOn);
            else if (l.room === 'sdb') level = lerp(BASE, 0.9, wSeche);
            else if (l.room === 'exterieur') level = l.id === 'carport' ? 0.7 * wBorne : 0;
            else level = BASE;
            l.material.emissiveIntensity = level * 3.6;
        }
        const salonAvg = salonSum / Math.max(1, this.salonCount);
        const living = reg.living;
        const indirect = (p >= hl ? ss(0.45, 0.75, p - hl) : 0) * (p > hl + 1 ? 1 - ss(0.5, 0.9, p - (hl + 1)) : 1);
        living.ledStrip.emissiveIntensity = Math.max(0.15, indirect * 3.2) * userSalon;
        living.lampShade.emissiveIntensity = salonLevel(this.salonCount) * 2.2 * userSalon;
        living.tvScreen.emissiveIntensity = 0.5 * Math.max(wPrises, wLum);
        living.tableLamp.emissiveIntensity = 1.6 * Math.max(ss(0.2, 1, wPrises), wLum * BASE);

        for (const light of stage.roomLights) {
            const room = light.userData.room;
            let level = BASE;
            if (room === 'salon') level = salonAvg;
            else if (room === 'cuisine') level = lerp(BASE, 1, kitchenOn);
            else if (room === 'sdb') level = lerp(BASE, 1, wSeche);
            else if (room === 'exterieur') level = wBorne;
            light.intensity = level * light.userData.max;
            light.visible = light.intensity > 0.01;
        }

        // kitchen
        reg.kitchen.counterLed.emissiveIntensity = 2.6 * kitchenOn;
        reg.kitchen.hoodLed.emissiveIntensity = 1.6 * kitchenOn;
        reg.kitchen.hobRing.emissiveIntensity = this.ui.selectedHotspot === 'hs-plaque' ? 1.4 * pulse : 0.25 * kitchenOn;

        // bathroom: towel radiator warms up
        reg.radiator.bars.emissiveIntensity = 0.32 * wSeche * pulse;
        reg.radiator.heat.uniforms.uAmount.value = reduced ? 0.6 * wSeche : wSeche;
        reg.radiator.heat.uniforms.uTime.value = time;
        reg.bathroom.mirrorLed.emissiveIntensity = lerp(0.4, 2.4, wSeche);

        // solar production flow and inverter
        const solarOn = Math.max(wSolar, this.user.solar ? 1 : 0);
        for (const line of this.solarLines) {
            line.material.uniforms.uOpacity.value = 0.85 * solarOn;
            line.material.uniforms.uTime.value = reduced ? 0 : time;
            line.visible = solarOn > 0.01;
        }
        reg.inverterLed.emissiveIntensity = 0.6 + 1.6 * solarOn;

        // charging
        const charging = this.user.charging ? 1 : 0;
        const chargeGlow = Math.max(wBorne * 0.6, charging);
        reg.charger.led.emissiveIntensity = 0.25 + chargeGlow * (reduced ? 2 : 1.4 + Math.sin(time * 3) * 0.9);
        reg.car.port.emissiveIntensity = 0.2 + chargeGlow * 1.6;
        reg.car.cableMat.emissiveIntensity = chargeGlow * (reduced ? 0.4 : 0.25 + 0.25 * Math.sin(time * 4));

        // focus halo on the selected hotspot
        const halo = reg.focusHalo;
        const hs = this.ui.selectedHotspotPosition;
        if (hs) {
            halo.position.copy(hs);
            halo.material.opacity = 0.75 * pulse;
            halo.visible = true;
        } else {
            halo.visible = false;
        }
    }
}
