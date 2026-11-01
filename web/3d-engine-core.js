// ============================================================
// 3D Engine Core — math, Camera, Triangle, WebGL renderer
// Geometry classes (Cube, Flower, ...) register via E3.register()
// ============================================================
window.Engine3D = (function() {
'use strict';

// ===== Math Functions =====
function createRotationX(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [[1, 0, 0], [0, c, -s], [0, s, c]];
}
function createRotationY(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
}
function createRotationZ(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}
function matMul(A, B) {
    const R = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i=0; i<3; i++)
        for (let j=0; j<3; j++)
            for (let k=0; k<3; k++)
                R[i][j] += A[i][k] * B[k][j];
    return R;
}
function matVec(M, v) {
    return [
        M[0][0]*v[0] + M[0][1]*v[1] + M[0][2]*v[2],
        M[1][0]*v[0] + M[1][1]*v[1] + M[1][2]*v[2],
        M[2][0]*v[0] + M[2][1]*v[1] + M[2][2]*v[2]
    ];
}
function matTranspose(M) {
    return [
        [M[0][0], M[1][0], M[2][0]],
        [M[0][1], M[1][1], M[2][1]],
        [M[0][2], M[1][2], M[2][2]]
    ];
}
function vecSub(a, b) {
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}
// Apply Euler angles [rx,ry,rz] to a point (ZYX order)
function rotatePoint(point, angles) {
    const rx = createRotationX(angles[0]);
    const ry = createRotationY(angles[1]);
    const rz = createRotationZ(angles[2]);
    return matVec(rz, matVec(ry, matVec(rx, point)));
}

// ===== Camera Class =====
class Camera {
    constructor() {
        this.position = [63.6, 7.0, -77.4];
        this.rotation_matrix = [[1,0,0],[0,1,0],[0,0,1]];
        this.euler_angles = [0.0, -0.5, 0.0];
        this.forward = [0.0, 0.0, 1.0];
        this.right = [1.0, 0.0, 0.0];
        this.up = [0.0, 1.0, 0.0];
        this.world_up = [0.0, 1.0, 0.0];
    }
    update(phi, theta, xm, ym, zm, gamemode) {
        this.euler_angles[1] += phi;
        this.euler_angles[0] += theta;
        this.euler_angles[0] = Math.max(-Math.PI/2+0.01, Math.min(Math.PI/2-0.01, this.euler_angles[0]));
        const rx = createRotationX(this.euler_angles[0]);
        const ry = createRotationY(this.euler_angles[1]);
        const rz = createRotationZ(this.euler_angles[2]);
        this.rotation_matrix = matMul(ry, matMul(rx, rz));
        if (gamemode) {
            const hf = [this.rotation_matrix[0][2], 0.0, this.rotation_matrix[2][2]];
            const nf = Math.sqrt(hf[0]**2 + hf[1]**2 + hf[2]**2);
            this.forward = nf > 0 ? [hf[0]/nf, hf[1]/nf, hf[2]/nf] : hf;
            const hr = [this.rotation_matrix[0][0], 0.0, this.rotation_matrix[2][0]];
            const nr = Math.sqrt(hr[0]**2 + hr[1]**2 + hr[2]**2);
            this.right = nr > 0 ? [hr[0]/nr, hr[1]/nr, hr[2]/nr] : hr;
        } else {
            this.forward = matVec(this.rotation_matrix, [0,0,1]);
            this.right = matVec(this.rotation_matrix, [1,0,0]);
        }
        this.up = matVec(this.rotation_matrix, [0,1,0]);
        if (gamemode) {
            this.position[0] += xm*this.right[0] + ym*this.world_up[0] + zm*this.forward[0];
            this.position[1] += xm*this.right[1] + ym*this.world_up[1] + zm*this.forward[1];
            this.position[2] += xm*this.right[2] + ym*this.world_up[2] + zm*this.forward[2];
        } else {
            this.position[0] += xm*this.right[0] + ym*this.up[0] + zm*this.forward[0];
            this.position[1] += xm*this.right[1] + ym*this.up[1] + zm*this.forward[1];
            this.position[2] += xm*this.right[2] + ym*this.up[2] + zm*this.forward[2];
        }
    }
}

// ===== Triangle Class =====
class Triangle {
    constructor(p1, p2, p3, color) {
        this.points = [p1, p2, p3];
        this.color = color;  // [r,g,b,a] 0-255 range
        this.center_z = (p1[2]+p2[2]+p3[2])/3;
        this.transformed_points = [];
    }
    transform(camera) {
        this.transformed_points = [];
        const rotT = matTranspose(camera.rotation_matrix);
        for (const pt of this.points)
            this.transformed_points.push(matVec(rotT, vecSub(pt, camera.position)));
        this.center_z = (this.transformed_points[0][2] + this.transformed_points[1][2] + this.transformed_points[2][2]) / 3;
    }
    projectedVertices(screenWidth, screenHeight, fov, farClip) {
        const out = [];
        const FC = farClip === undefined ? 15000 : farClip;
        const scale = screenHeight / (2 * Math.tan((fov / 2) * Math.PI / 180));
        for (const pt of this.transformed_points) {
            if (pt[2] < 0.1 || pt[2] >= FC) return null;
            const s = scale / pt[2];
            const x = pt[0] * s + screenWidth / 2;
            const y = screenHeight / 2 - pt[1] * s;
            if (!isFinite(x) || !isFinite(y)) return null;
            out.push([x, y]);
        }
        return out.length === 3 ? out : null;
    }
    isVisible(fov, farClip) {
        const FC = farClip === undefined ? 15000 : farClip;
        const th = Math.tan((fov * Math.PI / 180) / 2)*1.2;
        for (const pt of this.transformed_points) {
            if (pt[2] <= 0.1 || pt[2] >= FC) continue;
            if (Math.abs(pt[0]/pt[2]) > th && Math.abs(pt[1]/pt[2]) > th) continue;
            return true;
        }
        return false;
    }
}

// ===== WebGL Renderer =====
function initWebGL(canvas, width, height) {
    const gl = canvas.getContext('webgl', {alpha: false, premultipliedAlpha: false});
    if (!gl) throw new Error('WebGL not supported');

    const hw = width / 2, hh = height / 2;

    const vs = `
        attribute vec2 a_position;
        attribute vec4 a_color;
        uniform vec2 u_half;
        varying vec4 v_color;
        void main() {
            gl_Position = vec4(
                a_position.x / u_half.x - 1.0,
                1.0 - a_position.y / u_half.y,
                0.0, 1.0
            );
            v_color = a_color;
        }`;
    const fs = `
        precision mediump float;
        varying vec4 v_color;
        void main() {
            gl_FragColor = v_color;
        }`;

    function compileShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
            throw new Error('Shader error: ' + gl.getShaderInfoLog(s));
        return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.uniform2f(gl.getUniformLocation(prog, 'u_half'), hw, hh);

    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);

    const FLOAT = 4, STRIDE = 6 * FLOAT;
    const posLoc = gl.getAttribLocation(prog, 'a_position');
    const colLoc = gl.getAttribLocation(prog, 'a_color');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(colLoc);
    gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, STRIDE, 2 * FLOAT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return { gl, program: prog, vertexBuffer: vbuf };
}

// objects: array of anything with .triangles
// farClip: max view distance (default 15000; gravity scene passes 1e7)
function renderFrame(gl, vbuf, camera, objects, width, height, fov, farClip) {
    const visible = [];
    for (const obj of objects) {
        for (const tri of obj.triangles) {
            tri.transform(camera);
            if (tri.isVisible(fov, farClip))
                visible.push(tri);
        }
    }
    visible.sort((a, b) => b.center_z - a.center_z);  // far → near

    const count = visible.length * 3;
    const buf = new Float32Array(count * 6);
    let idx = 0;
    for (const tri of visible) {
        const pts = tri.projectedVertices(width, height, fov, farClip);
        if (!pts) continue;
        const [r, g, b, a] = tri.color;
        const rf = r/255, gf = g/255, bf = b/255, af = a/255;
        for (const [x, y] of pts) {
            buf[idx++] = x; buf[idx++] = y;
            buf[idx++] = rf; buf[idx++] = gf; buf[idx++] = bf; buf[idx++] = af;
        }
    }
    const totalVerts = idx / 6;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (totalVerts > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
        gl.bufferData(gl.ARRAY_BUFFER, buf.subarray(0, idx), gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, totalVerts);
    }

    return { triangles: visible.length, vertices: totalVerts };
}

// ===== Namespace =====
const E3 = {
    // Math
    createRotationX, createRotationY, createRotationZ,
    matMul, matVec, matTranspose, vecSub, rotatePoint,
    // Built-in classes
    Camera, Triangle,
    // Renderer
    initWebGL, renderFrame,
    // Registration API for geometry files (Cube, Flower, ...)
    register(name, cls) { E3[name] = cls; }
};

return E3;

})();
