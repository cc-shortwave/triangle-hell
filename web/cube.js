// ============================================================
// Cube geometry — registers on Engine3D
// ============================================================
(function() {
'use strict';

const E3 = window.Engine3D;
const { createRotationX, createRotationY, createRotationZ,
        matMul, matVec,
        Triangle } = E3;

class Cube {
    constructor(px, py, pz, sx, sy, sz, rx, ry, rz, res) {
        this.position = [px, py, pz];
        this.size = [sx, sy, sz];
        this.rotation_angles = [rx, ry, rz];
        this.resolution = res || [1, 1];
        this.triangles = this._createTriangles();
    }

    _createTriangles() {
        const hx = this.size[0]/2, hy = this.size[1]/2, hz = this.size[2]/2;
        const [rx, ry, rz] = this.rotation_angles;
        const rotMat = matMul(createRotationZ(rz), matMul(createRotationY(ry), createRotationX(rx)));
        const faces = [
            [2, -hz, 0, [-hx, hx], 1, [-hy, hy], [160, 82, 45, 128]],
            [2,  hz, 0, [-hx, hx], 1, [-hy, hy], [160, 82, 45, 128]],
            [0, -hx, 1, [-hy, hy], 2, [-hz, hz], [160, 82, 45, 128]],
            [0,  hx, 1, [-hy, hy], 2, [-hz, hz], [160, 82, 45, 128]],
            [1,  hy, 0, [-hx, hx], 2, [-hz, hz], [0, 255, 0, 128]],
            [1, -hy, 0, [-hx, hx], 2, [-hz, hz], [160, 82, 45, 128]],
        ];
        const tris = [];
        const n = this.resolution[0], m = this.resolution[1];
        for (const face of faces) {
            const fa = face[0], fv = face[1];
            const a1 = face[2], a1r = face[3];
            const a2 = face[4], a2r = face[5];
            const col = face[6];
            const a1s = [], a2s = [];
            for (let i = 0; i <= m; i++) a1s.push(a1r[0] + (a1r[1]-a1r[0]) * i/m);
            for (let j = 0; j <= n; j++) a2s.push(a2r[0] + (a2r[1]-a2r[0]) * j/n);
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    const u1 = a1s[i], u2 = a1s[i+1], v1 = a2s[j], v2 = a2s[j+1];
                    function lc(u, v) { const c = [0,0,0]; c[fa] = fv; c[a1] = u; c[a2] = v; return c; }
                    const tp = (lp) => {
                        const r = matVec(rotMat, lp);
                        return [r[0]+this.position[0], r[1]+this.position[1], r[2]+this.position[2]];
                    };
                    const p1 = tp(lc(u1, v1)), p2 = tp(lc(u2, v1));
                    const p3 = tp(lc(u2, v2)), p4 = tp(lc(u1, v2));
                    tris.push(new Triangle(p1, p2, p3, col));
                    tris.push(new Triangle(p1, p3, p4, col));
                }
            }
        }
        return tris;
    }

    update_rotation(dx, dy, dz) {
        this.rotation_angles[0] += dx;
        this.rotation_angles[1] += dy;
        this.rotation_angles[2] += dz;
        this.triangles = this._createTriangles();
    }
}

E3.register('Cube', Cube);

})();
