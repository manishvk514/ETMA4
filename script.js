/* ========================================================================== 
   EVERYTHING MEDIA - MOTION SYSTEM
   Vanilla JS. No build step.
   ========================================================================== */

(() => {
    'use strict';

    document.documentElement.classList.add('js');

    const root = document.documentElement;
    const body = document.body;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const q = (selector, scope = document) => scope.querySelector(selector);
    const qa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const lerp = (a, b, t) => a + (b - a) * t;

    /* ---------- PRELOADER ---------- */

    const preloader = q('#preloader');
    const loaderCount = q('#loader-count');
    const loadStart = performance.now();
    let loadFinished = false;

    function setLoaderCount(value) {
        if (!loaderCount) return;
        loaderCount.textContent = String(value).padStart(3, '0');
    }

    function animateLoader() {
        if (loadFinished) return;
        const elapsed = performance.now() - loadStart;
        const progress = clamp(elapsed / 1250, 0, 0.96);
        setLoaderCount(Math.round(progress * 100));
        requestAnimationFrame(animateLoader);
    }

    function finishPreloader() {
        if (loadFinished) return;
        loadFinished = true;
        setLoaderCount(100);
        body.classList.add('is-loaded');
        if (preloader) {
            preloader.classList.add('is-hidden');
            window.setTimeout(() => preloader.remove(), 1100);
        }
        updateScrollState();
    }

    requestAnimationFrame(animateLoader);

    window.addEventListener('load', () => {
        const elapsed = performance.now() - loadStart;
        const remaining = Math.max(0, 1400 - elapsed);
        window.setTimeout(finishPreloader, remaining);
    }, { once: true });

    window.setTimeout(finishPreloader, 4200);

    /* ---------- CURSOR + SPOTLIGHT ---------- */

    const cursor = q('#cursor');

    if (!coarsePointer && !reducedMotion && cursor) {
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let cx = mx;
        let cy = my;

        window.addEventListener('pointermove', (event) => {
            mx = event.clientX;
            my = event.clientY;
            root.style.setProperty('--mouse-x', `${mx}px`);
            root.style.setProperty('--mouse-y', `${my}px`);
        }, { passive: true });

        function renderCursor() {
            cx = lerp(cx, mx, 0.22);
            cy = lerp(cy, my, 0.22);
            cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
            requestAnimationFrame(renderCursor);
        }

        requestAnimationFrame(renderCursor);

        const hoverTargets = qa('a, button, input, textarea, select, [data-tilt]');
        hoverTargets.forEach((target) => {
            target.addEventListener('pointerenter', () => cursor.classList.add('is-hovering'));
            target.addEventListener('pointerleave', () => cursor.classList.remove('is-hovering'));
        });

        document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursor.style.opacity = ''; });
    } else if (cursor) {
        cursor.remove();
    }

    /* ---------- CANVAS PARTICLE FIELD ---------- */

    function initParticleField() {
        const canvas = q('#particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let particles = [];
        const maxDistance = 150;

        function particleCount() {
            if (window.innerWidth < 700) return 34;
            if (window.innerWidth < 1100) return 52;
            return 74;
        }

        function createParticle() {
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.24,
                vy: (Math.random() - 0.5) * 0.24,
                r: Math.random() * 1.6 + 0.4,
                a: Math.random() * 0.6 + 0.15
            };
        }

        function resize() {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            particles = Array.from({ length: particleCount() }, createParticle);
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                if (!reducedMotion) {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < -20) p.x = width + 20;
                    if (p.x > width + 20) p.x = -20;
                    if (p.y < -20) p.y = height + 20;
                    if (p.y > height + 20) p.y = -20;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(245,240,232,${p.a})`;
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.11;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(197,107,79,${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            if (!reducedMotion) requestAnimationFrame(draw);
        }

        resize();
        draw();
        window.addEventListener('resize', resize, { passive: true });
    }

    initParticleField();

    /* ---------- HERO STILLS ---------- */

    function initHeroStills() {
        const stills = qa('.hero-still');
        const meta = q('#hero-meta');
        if (!stills.length) return;

        let index = 0;

        function setActive(next) {
            stills.forEach((still, i) => {
                still.classList.toggle('active', i === next);
            });
            if (meta) meta.textContent = stills[next].dataset.meta || '';
        }

        setActive(0);

        if (!reducedMotion && stills.length > 1) {
            window.setInterval(() => {
                index = (index + 1) % stills.length;
                setActive(index);
            }, 4300);
        }
    }

    initHeroStills();

    /* ---------- HERO 3D PARALLAX ---------- */

    function initHeroParallax() {
        const hero = q('.hero');
        const lens = q('.lens-object');
        if (!hero || !lens || coarsePointer || reducedMotion) return;

        hero.addEventListener('pointermove', (event) => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            lens.style.setProperty('--tilt-y', `${x * 16}deg`);
            lens.style.setProperty('--tilt-x', `${-y * 12}deg`);

            qa('[data-depth]', hero).forEach((el) => {
                const depth = Number(el.dataset.depth || 0.2);
                el.style.translate = `${x * depth * 70}px ${y * depth * 70}px`;
            });
        });

        hero.addEventListener('pointerleave', () => {
            lens.style.setProperty('--tilt-y', '0deg');
            lens.style.setProperty('--tilt-x', '0deg');
            qa('[data-depth]', hero).forEach((el) => { el.style.translate = '0 0'; });
        });
    }

    initHeroParallax();

    /* ---------- REVEAL OBSERVER ---------- */

    function initReveals() {
        const revealItems = qa('[data-reveal], .bento-card, .method-card, .work-card, .lab-stage, .contact-form, .conviction-inner');
        if (!revealItems.length) return;

        if (!('IntersectionObserver' in window)) {
            revealItems.forEach((item) => item.classList.add('is-inview'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-inview');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.13,
            rootMargin: '0px 0px -8% 0px'
        });

        revealItems.forEach((item) => observer.observe(item));
    }

    initReveals();

    /* ---------- 3D TILT CARDS ---------- */

    function initTilt() {
        if (coarsePointer || reducedMotion) return;

        qa('[data-tilt]').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const px = (event.clientX - rect.left) / rect.width;
                const py = (event.clientY - rect.top) / rect.height;
                const rx = (0.5 - py) * 7;
                const ry = (px - 0.5) * 8;

                card.style.setProperty('--rx', `${rx}deg`);
                card.style.setProperty('--ry', `${ry}deg`);
                card.style.setProperty('--mx', `${px * 100}%`);
                card.style.setProperty('--my', `${py * 100}%`);
            });

            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
                card.style.setProperty('--mx', '50%');
                card.style.setProperty('--my', '50%');
            });
        });
    }

    initTilt();

    /* ---------- MAGNETIC BUTTONS ---------- */

    function initMagnetic() {
        if (coarsePointer || reducedMotion) return;

        qa('[data-magnetic]').forEach((el) => {
            el.addEventListener('pointermove', (event) => {
                const rect = el.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px)`;
            });

            el.addEventListener('pointerleave', () => {
                el.style.transform = '';
            });
        });
    }

    initMagnetic();

    /* ---------- SCROLL STATE, TIMECODE, HORIZONTAL REEL ---------- */

    const scrollProgress = q('#scroll-progress');
    const nav = q('#site-nav');
    const navScene = q('#nav-scene');
    const navTime = q('#nav-time');
    const scenes = qa('[data-scene]');
    const reelSection = q('[data-reel]');
    const reelTrack = q('#reel-track');
    let scrollTicking = false;

    function formatTimecode(progress) {
        const total = Math.round(progress * 9000);
        const h = String(Math.floor(total / 3600)).padStart(2, '0');
        const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
        const s = String(total % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function updateActiveScene(scrollY) {
        if (!navScene || !scenes.length) return;
        let active = scenes[0].dataset.scene || '01';
        scenes.forEach((section) => {
            const top = section.offsetTop - window.innerHeight * 0.38;
            if (scrollY >= top) active = section.dataset.scene || active;
        });
        navScene.textContent = `scn ${String(active).padStart(2, '0')}`;
    }

    function updateReel() {
        if (!reelSection || !reelTrack) return;

        if (window.innerWidth <= 920) {
            reelTrack.style.transform = '';
            return;
        }

        const rect = reelSection.getBoundingClientRect();
        const available = reelSection.offsetHeight - window.innerHeight;
        const progress = available > 0 ? clamp(-rect.top / available, 0, 1) : 0;
        const distance = Math.max(0, reelTrack.scrollWidth - window.innerWidth + 32);
        reelTrack.style.transform = `translate3d(${-distance * progress}px, 0, 0)`;
    }

    function updateScrollState() {
        const scrollY = window.scrollY || window.pageYOffset;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = clamp(scrollY / max, 0, 1);

        root.style.setProperty('--page-progress', progress.toFixed(4));
        if (scrollProgress) scrollProgress.style.transform = `scaleY(${progress})`;
        if (navTime) navTime.textContent = formatTimecode(progress);
        if (nav) {
            nav.classList.toggle('is-scrolled', scrollY > 24);
            nav.classList.toggle('is-visible', scrollY > 20 || body.classList.contains('is-loaded'));
        }

        updateActiveScene(scrollY);
        updateReel();
        scrollTicking = false;
    }

    function onScroll() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(updateScrollState);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(updateScrollState), { passive: true });
    updateScrollState();

    /* ---------- MOBILE MENU ---------- */

    const navToggle = q('#nav-toggle');
    const mobileMenu = q('#mobile-menu');
    const mobileClose = q('#mobile-close');
    const mobileLinks = qa('.mobile-link');

    function setMenu(open) {
        if (!navToggle || !mobileMenu) return;
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
        mobileMenu.classList.toggle('is-open', open);
        root.classList.toggle('is-menu-open', open);
    }

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            setMenu(!isOpen);
        });
    }

    if (mobileClose) mobileClose.addEventListener('click', () => setMenu(false));
    mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenu(false);
    });

    /* ---------- FORM ---------- */

    function initForm() {
        const form = q('#contact-form');
        if (!form) return;

        const status = q('#form-status', form) || q('#form-status');
        const fields = qa('input, textarea, select', form);

        function updateField(field) {
            const parent = field.closest('.form-field');
            if (!parent) return;
            parent.classList.toggle('has-value', String(field.value || '').trim() !== '');
        }

        fields.forEach((field) => {
            updateField(field);
            field.addEventListener('input', () => updateField(field));
            field.addEventListener('change', () => updateField(field));
        });

        function setStatus(message, type) {
            if (!status) return;
            status.textContent = message;
            status.classList.remove('is-success', 'is-error');
            if (type) status.classList.add(`is-${type}`);
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const data = {
                name: form.elements.name.value.trim(),
                company: form.elements.company.value.trim(),
                email: form.elements.email.value.trim(),
                type: form.elements.type.value,
                message: form.elements.message.value.trim()
            };

            if (!data.name || !data.email || !data.type || !data.message) {
                setStatus('fill the required fields.', 'error');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                setStatus('that email does not look right.', 'error');
                return;
            }

            const subject = `New project - ${data.company || data.name}`;
            const bodyLines = [
                `Name: ${data.name}`,
                `Company / project: ${data.company || '-'}`,
                `Email: ${data.email}`,
                `Type: ${data.type}`,
                '',
                'What it should feel like:',
                data.message
            ];

            const href = `mailto:hello@everythingmedia.co.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
            setStatus('opening your email client...', null);
            window.location.href = href;
            window.setTimeout(() => setStatus('brief ready in your email client.', 'success'), 400);
        });
    }

    initForm();

    /* ---------- SMOOTH ANCHORS ---------- */

    qa('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const target = q(href);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
    });
})();
