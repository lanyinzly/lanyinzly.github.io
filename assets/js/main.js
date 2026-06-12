/* ============================================================
   i18n — every translatable element carries BOTH languages
   inline (data-en / data-zh), so the two versions can never
   drift apart. Longer prose blocks use data-lang="en|zh".
   ============================================================ */

(function () {
    const LANG_KEY = 'site-lang';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function detectLang() {
        const urlLang = new URLSearchParams(location.search).get('lang');
        if (urlLang === 'zh' || urlLang === 'en') return urlLang;
        const saved = localStorage.getItem(LANG_KEY);
        if (saved === 'zh' || saved === 'en') return saved;
        return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    let currentLang = detectLang();

    function applyLang(lang) {
        currentLang = lang;
        localStorage.setItem(LANG_KEY, lang);
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

        document.querySelectorAll('[data-en][data-zh]').forEach(function (el) {
            el.innerHTML = el.getAttribute('data-' + lang);
        });

        document.querySelectorAll('[data-lang]').forEach(function (block) {
            block.hidden = block.getAttribute('data-lang') !== lang;
        });

        document.querySelectorAll('.lang-toggle').forEach(function (btn) {
            btn.querySelectorAll('span').forEach(function (s) {
                s.classList.toggle('lang-active', s.getAttribute('data-lang-opt') === lang);
            });
        });
    }

    function switchLang() {
        const next = currentLang === 'en' ? 'zh' : 'en';
        if (!reduceMotion && window.gsap) {
            gsap.to('#page', {
                opacity: 0,
                duration: 0.18,
                onComplete: function () {
                    applyLang(next);
                    gsap.to('#page', { opacity: 1, duration: 0.3 });
                }
            });
        } else {
            applyLang(next);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        applyLang(currentLang);
        document.querySelectorAll('.lang-toggle').forEach(function (btn) {
            btn.addEventListener('click', switchLang);
        });

        initFilters();
        if (!reduceMotion && window.gsap) initAnimations();
        initHeroCanvas(reduceMotion);
    });

    /* ---------- category filters (writings page) ---------- */

    function initFilters() {
        const btns = document.querySelectorAll('.cat-btn');
        if (!btns.length) return;
        const entries = document.querySelectorAll('.timeline-entry');
        const years = document.querySelectorAll('.timeline-year');

        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                btns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                const cat = btn.getAttribute('data-cat');

                entries.forEach(function (e) {
                    e.style.display = (cat === 'all' || e.getAttribute('data-cat') === cat) ? '' : 'none';
                });
                // hide year markers that have no visible entries beneath them
                years.forEach(function (y) {
                    let node = y.nextElementSibling;
                    let visible = false;
                    while (node && !node.classList.contains('timeline-year')) {
                        if (node.classList.contains('timeline-entry') && node.style.display !== 'none') {
                            visible = true;
                            break;
                        }
                        node = node.nextElementSibling;
                    }
                    y.style.display = visible ? '' : 'none';
                });
            });
        });
    }

    /* ---------- GSAP entrance + scroll animations ---------- */

    function initAnimations() {
        if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

        // hero: staggered line reveal out of overflow masks
        const heroLines = document.querySelectorAll('.hero-line');
        if (heroLines.length) {
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
            tl.from('.hero .eyebrow', { autoAlpha: 0, y: 12, duration: 0.7 })
              .from(heroLines, { yPercent: 115, duration: 1.05, stagger: 0.12 }, '-=0.35')
              .from('.hero-sub', { autoAlpha: 0, y: 18, duration: 0.8 }, '-=0.55')
              .from('.hero-cta', { autoAlpha: 0, y: 14, duration: 0.7 }, '-=0.5');
        }

        if (!window.ScrollTrigger) return;

        // section rules draw in from the left
        document.querySelectorAll('.section-rule').forEach(function (rule) {
            gsap.from(rule, {
                scaleX: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: { trigger: rule, start: 'top 88%' }
            });
        });

        // generic reveals; elements sharing a [data-reveal-group] stagger together
        document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
            const items = group.querySelectorAll('[data-reveal]');
            gsap.from(items, {
                autoAlpha: 0,
                y: 28,
                duration: 0.85,
                ease: 'power3.out',
                stagger: 0.1,
                scrollTrigger: { trigger: group, start: 'top 85%' }
            });
        });

        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            if (el.closest('[data-reveal-group]')) return;
            gsap.from(el, {
                autoAlpha: 0,
                y: 28,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%' }
            });
        });
    }

    /* ---------- hero canvas: a quiet network of agents ----------
       Ink-coloured nodes drift across the paper; edges appear when
       nodes come near — collaboration emerging from proximity.   */

    function initHeroCanvas(staticOnly) {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const hero = canvas.parentElement;
        let w, h, dpr, nodes;

        const INK = '29, 27, 22';
        const ACCENT = '192, 74, 23';
        const LINK_DIST = 140;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = hero.offsetWidth;
            h = hero.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function seed() {
            const count = Math.max(18, Math.min(46, Math.floor(w / 28)));
            nodes = [];
            for (let i = 0; i < count; i++) {
                nodes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    r: 1.2 + Math.random() * 1.6,
                    accent: Math.random() < 0.12
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < LINK_DIST) {
                        ctx.strokeStyle = 'rgba(' + INK + ',' + (0.16 * (1 - d / LINK_DIST)) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
            nodes.forEach(function (n) {
                ctx.fillStyle = n.accent
                    ? 'rgba(' + ACCENT + ', 0.55)'
                    : 'rgba(' + INK + ', 0.3)';
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        function step() {
            nodes.forEach(function (n) {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < -10) n.x = w + 10;
                if (n.x > w + 10) n.x = -10;
                if (n.y < -10) n.y = h + 10;
                if (n.y > h + 10) n.y = -10;
            });
            draw();
            requestAnimationFrame(step);
        }

        resize();
        seed();
        window.addEventListener('resize', function () { resize(); seed(); draw(); });

        if (staticOnly) {
            draw();
        } else {
            requestAnimationFrame(step);
        }
    }
})();
