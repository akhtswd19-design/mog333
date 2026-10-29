document.addEventListener('DOMContentLoaded', () => {
    // إعداد خلفية النجوم (سلوموشن)
    const canvas = document.getElementById('starsCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // إنشاء نجوم ذهبية بطيئة الحركة (سلوموشن)
    const starsCount = 70;
    const stars = [];
    for (let i = 0; i < starsCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.2 + 0.05, // حركة بطيئة جداً (سلوموشن)
            alpha: Math.random()
        });
    }

    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#d4af37';

        stars.forEach(star => {
            ctx.globalAlpha = star.alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();

            // تحريك النجمة للأعلى ببطء
            star.y -= star.speed;
            if (star.y < 0) {
                star.y = canvas.height;
                star.x = Math.random() * canvas.width;
            }
        });
        requestAnimationFrame(animateStars);
    }
    animateStars();

    // نظام عرض الأسئلة والبحث والتصفية
    const container = document.getElementById('questionsContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const questionCountElem = document.getElementById('questionCount');

    let currentFilter = 'all';

    function renderQuestions(filter = 'all', searchQuery = '') {
        container.style.opacity = '0'; // تلاشي ناعم للانتقال

        setTimeout(() => {
            container.innerHTML = '';

            const filtered = allQuestions.filter(item => {
                const matchesCategory = (filter === 'all' || item.category === filter);
                const query = searchQuery.trim().toLowerCase();
                const matchesSearch = query === '' || 
                    item.q.toLowerCase().includes(query) || 
                    item.a.toLowerCase().includes(query) || 
                    item.id.toString() === query;

                return matchesCategory && matchesSearch;
            });

            questionCountElem.textContent = filtered.length;

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #888; font-size: 16px;">
                        <i class="fa-solid fa-face-question" style="font-size: 40px; margin-bottom: 15px; color: var(--gold);"></i>
                        <p>عذراً، لم يتم العثور على نتائج مطابقة لبحثك.</p>
                    </div>
                `;
            } else {
                filtered.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.className = 'question-card';
                    card.style.animationDelay = `${index * 0.03}s`;
                    
                    card.innerHTML = `
                        <div class="q-header">
                            <span class="q-number">سؤال رقم ${item.id}</span>
                            <span class="q-category-badge">${item.catName}</span>
                        </div>
                        <div class="q-text">${item.q}</div>
                        <div class="a-text">${item.a}</div>
                    `;
                    container.appendChild(card);
                });
            }

            container.style.opacity = '1'; // إعادة ظهور انسيابي ناعم
        }, 200);
    }

    // الاستماع لأزرار التصفية
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.exports?.forEach?.(b => b.classList.remove('active'));
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderQuestions(currentFilter, searchInput.value);
        });
    });

    // الاستماع لحقل البحث الفوري
    searchInput.addEventListener('input', (e) => {
        renderQuestions(currentFilter, e.target.value);
    });

    // العرض الأولي
    renderQuestions('all', '');
});