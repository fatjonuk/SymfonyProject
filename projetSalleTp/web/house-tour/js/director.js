/*
 * CameraDirector — turns the keyframes of app/config/house_tour.yml into a
 * continuous camera path.
 *
 * All camera positions (stops and via points) go through one centripetal
 * Catmull-Rom curve, and all look-at targets through a second one sharing the
 * same parameter. The tour is cut into "legs":
 *   - move legs: from one stop to the next, through its via points;
 *   - hold legs: the camera rests on a stop (or travels slowly when the stop
 *     defines a `travel` pose, e.g. along the kitchen worktop).
 * Within a move leg the curve is re-parameterised by arc length and eased,
 * so the camera accelerates and slows down smoothly into each stop.
 */
import * as THREE from 'three';

const HOLD = { intro: 0.7, step: 1.0, travel: 1.7, final: 1.3 };

const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const sine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

export class CameraDirector {
    constructor(config) {
        const stops = [
            { id: 'intro', camera: config.intro.camera, kind: 'intro' },
            ...config.steps.map((s) => ({ id: s.id, camera: s.camera, kind: 'step', step: s })),
            { id: 'final', camera: config.final.camera, kind: 'final' },
        ];
        const points = [];
        const targets = [];
        const fovs = [];
        this.stops = stops.map((stop, k) => {
            const cam = stop.camera;
            const prevFov = k > 0 ? stops[k - 1].camera.fov : cam.fov;
            (cam.via || []).forEach((v, i, all) => {
                points.push(new THREE.Vector3(...v.position));
                targets.push(new THREE.Vector3(...v.target));
                fovs.push(THREE.MathUtils.lerp(prevFov, cam.fov, (i + 1) / (all.length + 1)));
            });
            const index = points.length;
            points.push(new THREE.Vector3(...cam.position));
            targets.push(new THREE.Vector3(...cam.target));
            fovs.push(cam.fov);
            let end = index;
            if (cam.travel) {
                points.push(new THREE.Vector3(...cam.travel.position));
                targets.push(new THREE.Vector3(...cam.travel.target));
                fovs.push(cam.fov);
                end = index + 1;
            }
            return { ...stop, index, end, duration: cam.duration || 2 };
        });

        this.points = points;
        this.targets = targets;
        this.fovs = fovs;
        this.n = points.length;
        this.posCurve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
        this.lookCurve = new THREE.CatmullRomCurve3(targets, false, 'centripetal');

        // legs: hold(intro), move, hold, move, hold ... hold(final)
        this.legs = [];
        this.stops.forEach((stop, k) => {
            if (k > 0) {
                const prev = this.stops[k - 1];
                this.legs.push(this.makeLeg('move', prev.end, stop.index, stop.duration, k));
            }
            const holdDuration = stop.kind === 'intro' ? HOLD.intro : stop.kind === 'final' ? HOLD.final : stop.end !== stop.index ? HOLD.travel : HOLD.step;
            this.legs.push(this.makeLeg('hold', stop.index, stop.end, holdDuration, k));
        });

        this._p = new THREE.Vector3();
        this._t = new THREE.Vector3();
    }

    makeLeg(type, from, to, duration, stop) {
        const leg = { type, from, to, duration, stop, table: null };
        if (to !== from) {
            // arc-length table along the curve between the two point indices
            const N = 120;
            const u0 = from / (this.n - 1 || 1);
            const u1 = to / (this.n - 1 || 1);
            leg.u0 = u0;
            leg.u1 = u1;
            const lengths = [0];
            let prev = null;
            for (let i = 0; i <= N; i++) {
                const p = this.posCurve ? this.posCurve.getPoint(u0 + ((u1 - u0) * i) / N) : null;
                if (prev && p) lengths.push(lengths[lengths.length - 1] + p.distanceTo(prev));
                prev = p;
            }
            leg.table = lengths;
            leg.length = lengths[lengths.length - 1];
        }
        return leg;
    }

    /** Curve parameter for a fraction (0-1) of the arc length of a leg. */
    legU(leg, frac) {
        if (!leg.table || leg.length < 1e-6) return leg.from / (this.n - 1 || 1);
        const target = frac * leg.length;
        const t = leg.table;
        let lo = 0;
        let hi = t.length - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (t[mid] < target) lo = mid;
            else hi = mid;
        }
        const span = t[hi] - t[lo] || 1;
        const i = lo + (target - t[lo]) / span;
        return leg.u0 + ((leg.u1 - leg.u0) * i) / (t.length - 1);
    }

    /** Leg index and local progress (0-1) for a tour position p (0 = start, legs.length = end). */
    locate(p) {
        const legs = this.legs;
        const clamped = Math.min(Math.max(p, 0), legs.length - 1e-6);
        const i = Math.floor(clamped);
        return { leg: legs[i], index: i, f: clamped - i };
    }

    /**
     * Camera pose for the tour position p.
     * With `cut` (reduced motion) the camera jumps between stops instead of travelling.
     */
    pose(p, out, cut = false) {
        const { leg, f } = this.locate(p);
        let u;
        let fov;
        if (cut) {
            const idx = leg.type === 'hold' ? leg.from : f < 0.5 ? leg.from : leg.to;
            u = idx / (this.n - 1);
            fov = this.fovs[idx];
        } else if (leg.type === 'hold') {
            const e = sine(f);
            u = leg.to === leg.from ? leg.from / (this.n - 1) : this.legU(leg, e);
            fov = this.fovs[leg.from];
        } else {
            const e = smoother(f);
            u = this.legU(leg, e);
            fov = THREE.MathUtils.lerp(this.fovs[leg.from], this.fovs[leg.to], e);
        }
        this.posCurve.getPoint(u, out.position);
        this.lookCurve.getPoint(u, out.target);
        out.fov = fov;
        return out;
    }
}
