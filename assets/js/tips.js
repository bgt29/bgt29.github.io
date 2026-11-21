(function () {
'use strict';
if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
var tip = null, cur = null, timer = 0;
function take(el) {
var t = el.getAttribute('title');
if (t == null) return;
el.setAttribute('data-tip', t);
el.removeAttribute('title');
if (t && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', t);
}
function hide() {
clearTimeout(timer);
if (tip) tip.classList.remove('is-on');
cur = null;
}
function show(el) {
var text = el.getAttribute('data-tip');
if (!text || !document.contains(el)) return;
if (!tip) {
tip = document.createElement('div');
tip.className = 'tip';
tip.setAttribute('role', 'tooltip');
tip.setAttribute('aria-hidden', 'true');
document.body.appendChild(tip);
}
tip.textContent = text;
tip.classList.remove('is-on');
tip.style.left = '0px'; tip.style.top = '0px';
var r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, gap = 8;
var below = r.top - th - gap < 8;
var x = Math.min(Math.max(8, r.left + r.width / 2 - tw / 2), window.innerWidth - tw - 8);
tip.style.left = Math.round(x) + 'px';
tip.style.top = Math.round(below ? r.bottom + gap : r.top - th - gap) + 'px';
tip.classList.toggle('is-below', below);
requestAnimationFrame(function () { if (cur === el) tip.classList.add('is-on'); });
}
function enter(el, delay) {
take(el);
if (el === cur) return;
hide();
cur = el;
timer = setTimeout(function () { if (cur === el) show(el); }, delay);
}
function over(e) {
var el = e.target.closest && e.target.closest('[title], [data-tip]');
if (el) enter(el, 300);
}
document.addEventListener('mouseover', over);
document.addEventListener('mousemove', over, { passive: true });
document.addEventListener('mouseout', function (e) {
if (cur && !(e.relatedTarget && cur.contains(e.relatedTarget))) hide();
});
document.addEventListener('focusin', function (e) {
var el = e.target.closest && e.target.closest('[title], [data-tip]');
if (el && el.matches(':focus-visible')) enter(el, 0);
});
document.addEventListener('focusout', hide);
document.addEventListener('pointerdown', hide, true);
window.addEventListener('scroll', hide, true);
window.addEventListener('blur', hide);
})();
