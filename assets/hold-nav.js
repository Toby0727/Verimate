/* Verimate Hold: shared slim top bar. Put <div id="hold-nav"></div> at the top of <body> and load this file
 * (defer or at the end of body). Anything already inside #hold-nav (e.g. a "Test money" tag or presenter
 * controls) is kept and moved to the right end of the bar. Marks the current page from location.pathname.
 * Styles are injected here so the bar looks the same even before hold.css loads. */
(function () {
  'use strict';
  // Links resolve against the site root (the folder above assets/), so the bar also works from a sub-folder.
  var SCRIPT = document.currentScript;
  var ROOT = SCRIPT && SCRIPT.src ? new URL('../', SCRIPT.src).href : '';
  var LINKS = [
    { href: 'hold.html', label: 'Live demo' },
    { href: 'book.html', label: 'Renter' },
    { href: 'lister.html', label: 'Lister' },
    { href: 'model.html', label: 'Business model' }
  ];
  var CSS = [
    '.hn{--hn-h:60px;position:relative;z-index:40;background:#fff;border-bottom:1px solid var(--line,#E9E9E9);font-family:var(--font-ui,"Inter",ui-sans-serif,system-ui,sans-serif);color:var(--ink,#111)}',
    '.hn-in{display:flex;align-items:center;gap:36px;height:var(--hn-h);padding:0 28px;max-width:var(--hn-max,none);margin:0 auto;box-sizing:border-box;min-width:0}',
    '.hn-logo{display:inline-flex;align-items:center;gap:10px;flex:none;text-decoration:none;border-radius:8px}',
    '.hn-mark{width:32px;height:32px;border-radius:50%;background:var(--brand,#D81E28);display:grid;place-items:center;color:#fff;flex:none}',
    '.hn-word{font-family:var(--font-display,"Inter Tight","Inter",sans-serif);font-weight:700;font-size:21px;letter-spacing:-.04em;color:var(--brand,#D81E28);white-space:nowrap}',
    '.hn-word span{color:var(--faint,#A8A8A8);font-weight:600;margin-left:.08em}',
    '.hn-links{display:flex;align-items:center;gap:26px;min-width:0;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
    '.hn-links::-webkit-scrollbar{display:none}',
    '.hn-link{flex:none;color:var(--ink,#111);text-decoration:none;font-size:15px;font-weight:600;padding:7px 0 5px;border-bottom:2px solid transparent;white-space:nowrap;border-radius:2px}',
    '.hn-link:hover{color:var(--brand,#D81E28)}',
    '.hn-link[aria-current="page"]{border-bottom-color:var(--brand,#D81E28)}',
    '.hn-extra{margin-left:auto;display:flex;align-items:center;gap:12px;flex:none}',
    '.hn-extra:empty{display:none}',
    '.hn a:focus-visible{outline:2px solid var(--brand,#D81E28);outline-offset:3px}',
    '@media (max-width:760px){',
    ' .hn-in{flex-wrap:wrap;height:auto;gap:0 16px;padding:10px 16px 0}',
    ' .hn-logo{height:40px}',
    ' .hn-word{font-size:19px}.hn-mark{width:28px;height:28px}',
    ' .hn-extra{height:40px}',
    ' .hn-links{order:3;flex:1 0 100%;gap:22px;margin:0 -16px;padding:0 16px;height:42px}',
    ' .hn-links.is-more{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 32px),transparent)}',
    ' .hn-link{font-size:14.5px;padding:10px 0 9px}',
    '}'
  ].join('\n');

  var MARK = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="m8.5 14 2.5 2.5 4.5-5"/></svg>';

  function current() {
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    return file;
  }

  function build() {
    var host = document.getElementById('hold-nav');
    if (!host || host.dataset.built) return;
    host.dataset.built = '1';
    if (!document.getElementById('hold-nav-css')) {
      var st = document.createElement('style');
      st.id = 'hold-nav-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var extras = Array.prototype.slice.call(host.childNodes);
    var here = current();
    var nav = document.createElement('header');
    nav.className = 'hn';
    nav.innerHTML =
      '<div class="hn-in">' +
        '<a class="hn-logo" href="' + ROOT + 'index.html?desktop" aria-label="Verimate Syracuse, home">' +
          '<span class="hn-mark">' + MARK + '</span>' +
          '<span class="hn-word">Verimate <span>Syracuse</span></span>' +
        '</a>' +
        '<nav class="hn-links" aria-label="Verimate Hold">' +
          LINKS.map(function (l) {
            return '<a class="hn-link" href="' + ROOT + l.href + '"' + (l.href === here ? ' aria-current="page"' : '') + '>' + l.label + '</a>';
          }).join('') +
        '</nav>' +
        '<div class="hn-extra"></div>' +
      '</div>';
    var slot = nav.querySelector('.hn-extra');
    extras.forEach(function (n) { if (n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())) slot.appendChild(n); });
    host.textContent = '';
    host.appendChild(nav);
    // Keep the current link visible when the bar scrolls sideways on a phone.
    var on = nav.querySelector('[aria-current="page"]');
    var rail = nav.querySelector('.hn-links');
    if (on && rail.scrollWidth > rail.clientWidth) rail.scrollLeft = Math.max(0, on.offsetLeft - rail.offsetLeft - 16);
    // Fade the right edge only while more links hide past it.
    function edge() { rail.classList.toggle('is-more', rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2); }
    rail.addEventListener('scroll', edge, { passive: true });
    addEventListener('resize', edge);
    edge();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
