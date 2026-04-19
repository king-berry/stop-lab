const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:1337/api'
    : 'https://popular-activity-03995522d7.strapiapp.com/api';

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
}

// ── Homepage ──────────────────────────────────────────────
async function loadHomepage() {
    try {
        const { data } = await fetchJSON(`${API}/homepage?populate=heroImages`);
        if (!data) return;

        const d = data;
        setText('about-headline', d.aboutHeadline);
        setText('about-description', d.aboutDescription);
        setText('about-stat', d.aboutStat);
        setText('portal-title', d.portalTitle);
        setText('portal-subtitle', d.portalSubtitle);
        setText('contact-title', d.contactTitle);
        setText('contact-description', d.contactDescription);
        setText('contact-email', d.contactEmail);
        setText('contact-phone', d.contactPhone);
        setText('footer-tagline', d.footerTagline);
        setHTML('footer-address', (d.footerAddress || '').replace(/\n/g, '<br>'));

        // Hero image — dùng ảnh đầu tiên nếu có
        const images = d.heroImages;
        if (images && images.length > 0) {
            const imgUrl = images[0].url;
            document.getElementById('hero-img').src = imgUrl.startsWith('http')
                ? imgUrl
                : `${API.replace('/api', '')}${imgUrl}`;
        }
    } catch (e) {
        console.warn('Homepage load failed:', e.message);
    }
}

// ── Regions ───────────────────────────────────────────────
async function loadRegions() {
    try {
        const { data } = await fetchJSON(`${API}/regions`);
        const container = document.getElementById('region-tags');
        if (!container || !data) return;
        container.innerHTML = data.map(r =>
            `<span>${r.name.toUpperCase()}</span>`
        ).join('');
    } catch (e) {
        console.warn('Regions load failed:', e.message);
    }
}

// ── Statistics ────────────────────────────────────────────
async function loadStatistics() {
    try {
        const { data } = await fetchJSON(`${API}/statistics?sort=order:asc`);
        const container = document.getElementById('stats-section');
        if (!container || !data) return;
        container.innerHTML = data.map(s => `
            <div class="stat-card">
                <div class="stat-arrow">↗</div>
                <div class="stat-number">${s.number}<span class="stat-unit">${s.unit || ''}</span></div>
                <p>${s.description}</p>
            </div>
        `).join('');
    } catch (e) {
        console.warn('Statistics load failed:', e.message);
    }
}

// ── Properties ────────────────────────────────────────────
async function loadProperties() {
    try {
        const { data } = await fetchJSON(`${API}/properties?populate=image`);
        const container = document.getElementById('properties-section');
        const thirdContainer = document.getElementById('property-third');
        if (!container || !data) return;

        const first2 = data.slice(0, 2);
        const third = data[2];

        container.innerHTML = first2.map(p => {
            const imgUrl = p.image?.url
                ? (p.image.url.startsWith('http') ? p.image.url : `${API.replace('/api', '')}${p.image.url}`)
                : 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80';
            return `
                <div class="property-card">
                    <div class="property-img-wrap">
                        <img src="${imgUrl}" alt="${p.name}">
                    </div>
                    <div class="property-meta">
                        <span>${p.category}</span>
                        <span>${p.size || ''}</span>
                    </div>
                    <div class="property-name">${p.name}</div>
                </div>
            `;
        }).join('');

        if (third && thirdContainer) {
            const imgUrl = third.image?.url
                ? (third.image.url.startsWith('http') ? third.image.url : `${API.replace('/api', '')}${third.image.url}`)
                : 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80';
            thirdContainer.innerHTML = `
                <div class="property-img-wrap">
                    <img src="${imgUrl}" alt="${third.name}">
                </div>
                <div class="property-meta">
                    <span>${third.category}</span>
                    <span>${third.size || ''}</span>
                </div>
                <div class="property-name">${third.name}</div>
            `;
        }
    } catch (e) {
        console.warn('Properties load failed:', e.message);
    }
}

// ── Testimonials ──────────────────────────────────────────
async function loadTestimonials() {
    try {
        const { data } = await fetchJSON(`${API}/testimonials?populate=avatar`);
        const container = document.getElementById('testimonials-grid');
        if (!container || !data) return;
        container.innerHTML = data.map(t => {
            const avatarUrl = t.avatar?.url
                ? (t.avatar.url.startsWith('http') ? t.avatar.url : `${API.replace('/api', '')}${t.avatar.url}`)
                : `https://i.pravatar.cc/40?u=${t.authorName}`;
            return `
                <div class="testimonial-card">
                    <p>"${t.quote}"</p>
                    <div class="testimonial-author">
                        <img src="${avatarUrl}" alt="${t.authorName}">
                        <div>
                            <div class="author-name">${t.authorName}</div>
                            <div class="author-title">${t.authorTitle || ''}${t.authorCompany ? ', ' + t.authorCompany.toUpperCase() : ''}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.warn('Testimonials load failed:', e.message);
    }
}

// ── Helpers ───────────────────────────────────────────────
function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
}

function setHTML(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.innerHTML = value;
}

// ── Init ──────────────────────────────────────────────────
Promise.all([
    loadHomepage(),
    loadRegions(),
    loadStatistics(),
    loadProperties(),
    loadTestimonials(),
]);

// ── Scroll animations ─────────────────────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ── Scroll blur on property images ────────────────────────
function initScrollBlur() {
    const handleScroll = () => {
        document.querySelectorAll('.property-img-wrap img').forEach(img => {
            const rect = img.getBoundingClientRect();
            const viewH = window.innerHeight;
            // khoảng cách từ tâm ảnh đến tâm màn hình
            const imgCenter = rect.top + rect.height / 2;
            const screenCenter = viewH / 2;
            const distance = Math.abs(imgCenter - screenCenter);
            const maxDist = viewH / 2;
            // blur tối đa 8px khi ảnh ở rìa, 0 khi ở giữa
            const blur = Math.min(4, (distance / maxDist) * 4);
            img.style.filter = `blur(${blur}px)`;
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initScrollBlur();
});

// ── Contact Form ──────────────────────────────────────────
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxiRf-SrWQmnw1LOXXLKFOPH0IWBcLC4y6lyoaGYRgjwLRj1xpVh9-QJ-Q1Xy4dydpFQw/exec';

document.querySelector('.submit-btn').addEventListener('click', async () => {
    const firstName = document.querySelector('.form-row .form-group:first-child input').value.trim();
    const lastName  = document.querySelector('.form-row .form-group:last-child input').value.trim();
    const email     = document.querySelector('input[type="email"]').value.trim();
    const area      = document.querySelector('select').value;
    const message   = document.querySelector('textarea').value.trim();
    const agreed    = document.getElementById('terms').checked;

    if (!firstName || !email) {
        alert('Please fill in First Name and Email.');
        return;
    }
    if (!agreed) {
        alert('Please agree to the Terms & Privacy Policy.');
        return;
    }

    const btn = document.querySelector('.submit-btn');
    btn.textContent = 'SENDING...';
    btn.disabled = true;

    fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, areaOfInterest: area, message })
    });

    // no-cors luôn trả opaque response, không đọc được status
    // nhưng dữ liệu vẫn được gửi — coi như thành công
    btn.textContent = 'SENT ✓';
    document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea').forEach(el => el.value = '');
    document.getElementById('terms').checked = false;
});
