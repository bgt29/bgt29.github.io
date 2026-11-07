(function () {
'use strict';
var glow = document.querySelector('.glow');
if (!glow) return;
var canvas = document.createElement('canvas');
canvas.className = 'glow__canvas';
canvas.setAttribute('aria-hidden', 'true');
var gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false,
premultipliedAlpha: true, powerPreference: 'low-power' });
if (!gl) return;
glow.appendChild(canvas);
var VERT = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';
var FRAG = [
'precision mediump float;',
'uniform vec2 u_res; uniform float u_time; uniform float u_strength; uniform float u_rgb; uniform float u_shade;',
'uniform vec3 u_spot; uniform vec3 u_shadeCol;',
'vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
'vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
'vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }',
'vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }',
'float snoise(vec3 v) {',
'  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);',
'  vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);',
'  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;',
'  vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);',
'  vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;',
'  i = mod289(i);',
'  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))',
'         + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));',
'  float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx;',
'  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);',
'  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);',
'  vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);',
'  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);',
'  vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));',
'  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;',
'  vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);',
'  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));',
'  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;',
'  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0); m = m * m;',
'  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));',
'}',
'float fbm(vec3 p) {',
'  return 0.7 * snoise(p) + 0.3 * snoise(p * 2.03 + 11.0);',
'}',
'void main() {',
'  vec2 uv = gl_FragCoord.xy / u_res.y * 0.75;',
'  float t = u_time;',
'  vec2 q = vec2(fbm(vec3(uv * 0.7, t)), fbm(vec3(uv * 0.7 + vec2(5.2, 1.3), t)));',
'  float n = fbm(vec3(uv + 0.55 * q, t * 0.8));',
'  n = n * 0.5 + 0.5;',
'  float s = smoothstep(0.50, 0.68, n) * 0.7 + smoothstep(0.66, 0.84, n) * 0.3;',
'  float aShade = u_shade * (1.0 - s);',
'  float aSpot = u_strength * s;',
'  vec3 rgb = 0.5 + 0.5 * cos(6.2832 * (n * 1.5 + t * 0.6 + vec3(0.0, 0.33, 0.67)));',
'  vec3 spot = mix(u_spot, rgb, u_rgb);',
'  gl_FragColor = vec4(u_shadeCol * aShade + spot * aSpot, aShade + aSpot);',
'}'
].join('\n');
function shader(type, src) {
var s = gl.createShader(type);
gl.shaderSource(s, src);
gl.compileShader(s);
return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}
var vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
var prog = vs && fs && gl.createProgram();
if (!prog) { canvas.remove(); return; }
gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
gl.useProgram(prog);
var buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
var loc = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
var uRes = gl.getUniformLocation(prog, 'u_res');
var uTime = gl.getUniformLocation(prog, 'u_time');
var uStrength = gl.getUniformLocation(prog, 'u_strength');
var uRgb = gl.getUniformLocation(prog, 'u_rgb');
var uShade = gl.getUniformLocation(prog, 'u_shade');
var uSpot = gl.getUniformLocation(prog, 'u_spot');
var uShadeCol = gl.getUniformLocation(prog, 'u_shadeCol');
var SCALE = 0.4;
function resize() {
var w = Math.max(64, Math.round(innerWidth * SCALE));
var h = Math.max(64, Math.round(innerHeight * SCALE));
if (canvas.width !== w || canvas.height !== h) {
canvas.width = w; canvas.height = h;
gl.viewport(0, 0, w, h);
}
gl.uniform2f(uRes, w, h);
}
var probe = document.createElement('i');
probe.style.display = 'none';
glow.appendChild(probe);
function rgbOf(v) {
probe.style.color = 'var(' + v + ')';
var m = getComputedStyle(probe).color.match(/[\d.]+/g) || [0, 0, 0];
return [m[0] / 255, m[1] / 255, m[2] / 255];
}
function mixc(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
function palette() {
var bg = rgbOf('--bg'), text = rgbOf('--text'), acc = rgbOf('--accent');
var lum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];
var white = [1, 1, 1];
if (lum < 0.5) return { spot: mixc(text, white, 0.5), strength: 0.32, shade: 0, shadeCol: text };
var k = Math.max(0, Math.min(1, (lum - 0.82) / 0.1));
return { spot: mixc(acc, text, 0.45), strength: 0.34 + 0.1 * k, shade: 0, shadeCol: text };
}
var want = palette(), cur = palette();
new MutationObserver(function () { want = palette(); })
.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
function ease(k) {
cur.spot = mixc(cur.spot, want.spot, k);
cur.shadeCol = mixc(cur.shadeCol, want.shadeCol, k);
cur.strength += (want.strength - cur.strength) * k;
cur.shade += (want.shade - cur.shade) * k;
}
var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var start = performance.now() - Math.random() * 60000;
var last = 0;
function draw(now) {
resize();
gl.uniform1f(uTime, (now - start) / 1000 * 0.026);
gl.uniform1f(uStrength, cur.strength);
gl.uniform1f(uShade, cur.shade);
gl.uniform3fv(uSpot, cur.spot);
gl.uniform3fv(uShadeCol, cur.shadeCol);
gl.uniform1f(uRgb, document.documentElement.classList.contains('rgb') ? 1 : 0);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);
}
function loop(now) {
if (now - last >= 33) {
ease(Math.min(1, (now - last) / 160));
last = now;
draw(now);
}
requestAnimationFrame(loop);
}
if (still) {
draw(performance.now());
addEventListener('resize', function () { draw(performance.now()); });
new MutationObserver(function () { want = cur = palette(); draw(performance.now()); })
.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
} else {
requestAnimationFrame(loop);
}
})();
