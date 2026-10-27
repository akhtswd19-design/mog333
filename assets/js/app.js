/* Main Application Router, Quiz Engine, Telegram Login & UI Manager */

// State Management
let currentCategory = null;
let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let currentUser = JSON.parse(localStorage.getItem('al_aaqil_user')) || null;
let testHistory = JSON.parse(localStorage.getItem('al_aaqil_history')) || [];

// Starry Background Animation
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
let stars = [];

function initStars() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            alpha: Math.random() * 0.7 + 0.3
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd700';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${star.alpha})`;
        ctx.fill();
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
    });
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initStars);
initStars();
animateStars();

// Router System with smooth transitions
const router = {
    navigate: function(pageId) {
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const targetPage = document.getElementById('page-' + pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const activeNavBtn = document.querySelector(`.nav-btn[data-target="${pageId}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        }

        // Specific page initializers
        if (pageId === 'bank') {
            renderQuestionBank(allQuestions.islamic.concat(allQuestions.history, allQuestions.geography));
        } else if (pageId === 'history') {
            renderTestHistory();
        } else if (pageId === 'profile') {
            renderProfilePage();
        }
    }
};

// Update header username display
function updateHeaderUser() {
    const usernameEl = document.getElementById('header-username');
    if (currentUser) {
        usernameEl.textContent = currentUser.first_name || currentUser.username || 'مستخدم العاقل';
    } else {
        usernameEl.textContent = 'تسجيل تيليجرام';
    }
}
updateHeaderUser();

// Quiz Functions
function startCategoryQuiz(catKey) {
    currentCategory = catKey;
    currentQuizQuestions = [...allQuestions[catKey]];
    // Shuffle questions for variety
    currentQuizQuestions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    userAnswers = {};

    const catNames = {
        islamic: 'أسئلة الدين الإسلامي (200 سؤال)',
        history: 'أسئلة تاريخ والمناصب السعودية (150 سؤال)',
        geography: 'أسئلة الجغرافيا والعلوم (300 سؤال)'
    };

    document.getElementById('quiz-cat-name').textContent = catNames[catKey];
    document.getElementById('total-q-num').textContent = currentQuizQuestions.length;
    
    router.navigate('quiz');
    loadQuestion();
}

function loadQuestion() {
    const q = currentQuizQuestions[currentQuestionIndex];
    document.getElementById('current-q-num').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = q.q;

    // Progress bar
    const progressPercent = ((currentQuestionIndex + 1) / currentQuizQuestions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = progressPercent + '%';

    // Render options
    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';

    // Shuffle options to prevent positional bias while keeping track of correct index
    let optionsWithIndex = q.options.map((opt, idx) => ({ text: opt, originalIdx: idx }));
    optionsWithIndex.sort(() => Math.random() - 0.5);

    optionsWithIndex.forEach((optObj) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (userAnswers[currentQuestionIndex] === optObj.originalIdx) {
            btn.classList.add('selected');
        }
        btn.innerHTML = `<span>${optObj.text}</span> <i class="fa-regular fa-circle"></i>`;
        btn.onclick = () => selectOption(optObj.originalIdx, btn);
        optionsGrid.appendChild(btn);
    });

    document.getElementById('prev-q-btn').disabled = currentQuestionIndex === 0;
    const nextBtn = document.getElementById('next-q-btn');
    if (currentQuestionIndex === currentQuizQuestions.length - 1) {
        nextBtn.innerHTML = 'إنهاء الاختبار وعرض النتيجة <i class="fa-solid fa-check"></i>';
    } else {
        nextBtn.innerHTML = 'التالية <i class="fa-solid fa-arrow-left"></i>';
    }
    nextBtn.disabled = userAnswers[currentQuestionIndex] === undefined;
}

function selectOption(originalIdx, btnElement) {
    document.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected');
        b.querySelector('i').className = 'fa-regular fa-circle';
    });
    btnElement.classList.add('selected');
    btnElement.querySelector('i').className = 'fa-solid fa-circle-check';

    userAnswers[currentQuestionIndex] = originalIdx;
    document.getElementById('next-q-btn').disabled = false;
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuizQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function quitQuiz() {
    if (confirm('هل أنت متأكد من إنهاء الاختبار؟ لن يتم حفظ النتيجة الحالية.')) {
        router.navigate('categories');
    }
}

function finishQuiz() {
    let correctCount = 0;
    let wrongQuestions = [];

    currentQuizQuestions.forEach((q, idx) => {
        const userAns = userAnswers[idx];
        if (userAns === q.correct) {
            correctCount++;
        } else {
            wrongQuestions.push({
                question: q.q,
                userAnswerText: userAns !== undefined ? q.options[userAns] : 'لم يُجب',
                correctAnswerText: q.options[q.correct]
            });
        }
    });

    const total = currentQuizQuestions.length;
    const wrongCount = total - correctCount;
    const scorePercent = Math.round((correctCount / total) * 100);

    // Update UI Result
    document.getElementById('res-total').textContent = total;
    document.getElementById('res-correct').textContent = correctCount;
    document.getElementById('res-wrong').textContent = wrongCount;
    document.getElementById('res-score').textContent = scorePercent + '%';

    const catNamesMap = {
        islamic: 'الدين الإسلامي',
        history: 'تاريخ والمناصب السعودية',
        geography: 'الجغرافيا والعلوم'
    };

    // Save to History
    const testRecord = {
        id: Date.now(),
        category: catNamesMap[currentCategory] || currentCategory,
        date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        total: total,
        correct: correctCount,
        score: scorePercent,
        wrongQuestions: wrongQuestions
    };

    testHistory.unshift(testRecord);
    localStorage.setItem('al_aaqil_history', JSON.stringify(testHistory));

    router.navigate('result');
}

// Question Bank Rendering & Filtering
function renderQuestionBank(questionsArray) {
    const container = document.getElementById('bank-list-container');
    container.innerHTML = '';

    questionsArray.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'bank-question-card';
        card.dataset.text = q.q.toLowerCase();
        
        let optionsHtml = '';
        q.options.forEach((opt, optIdx) => {
            const isCorrect = optIdx === q.correct;
            optionsHtml += `<div class="bq-opt ${isCorrect ? 'is-correct' : ''}">${optIdx + 1}. ${opt} ${isCorrect ? '<i class="fa-solid fa-check"></i>' : ''}</div>`;
        });

        card.innerHTML = `
            <div class="bq-header">
                <span class="bq-badge">سؤال رقم ${idx + 1}</span>
                <span class="bq-num">معرف: ${q.id}</span>
            </div>
            <div class="bq-text">${q.q}</div>
            <div class="bq-options">${optionsHtml}</div>
        `;
        container.appendChild(card);
    });
}

function setBankFilter(catKey, btnElement) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btnElement.classList.add('active');

    if (catKey === 'all') {
        renderQuestionBank(allQuestions.islamic.concat(allQuestions.history, allQuestions.geography));
    } else {
        renderQuestionBank(allQuestions[catKey]);
    }
}

function filterQuestionBank() {
    const query = document.getElementById('bank-search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.bank-question-card');
    cards.forEach(card => {
        const text = card.dataset.text;
        if (text.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Render Test History & Wrong Answers
function renderTestHistory() {
    const container = document.getElementById('history-container');
    container.innerHTML = '';

    if (testHistory.length === 0) {
        container.innerHTML = `
            <div class="result-card" style="padding: 2.5rem;">
                <i class="fa-solid fa-clock-rotate-left" style="font-size: 3rem; color: var(--gold); margin-bottom: 1rem;"></i>
                <h3>لا توجد اختبارات سابقة حتى الآن</h3>
                <p>قم ببدء اختبار في أحد الأقسام وسيتم حفظ النتائج والأسئلة التي أخطأت فيها هنا تلقائياً.</p>
                <button class="btn-primary" onclick="router.navigate('categories')">ابدأ اختبارك الأول</button>
            </div>
        `;
        return;
    }

    testHistory.forEach(record => {
        let wrongHtml = '';
        if (record.wrongQuestions && record.wrongQuestions.length > 0) {
            record.wrongQuestions.forEach(wq => {
                wrongHtml += `
                    <div class="wrong-q-item">
                        <div class="wq-text">❓ ${wq.question}</div>
                        <div class="wq-answer-info">
                            <span class="text-danger">إجابتك: ${wq.userAnswerText}</span>
                            <span class="text-success">الإجابة الصحيحة: ${wq.correctAnswerText}</span>
                        </div>
                    </div>
                `;
            });
        } else {
            wrongHtml = `<p class="text-success" style="font-weight: 600;"><i class="fa-solid fa-check-circle"></i> ممتاز! لم تقم بأي خطأ في هذا الاختبار.</p>`;
        }

        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="hc-header">
                <div class="hc-title">${record.category} (النتيجة: ${record.score}%)</div>
                <div class="hc-date">${record.date}</div>
            </div>
            <div class="cat-meta" style="margin-bottom: 1rem;">
                <span><i class="fa-solid fa-circle-question"></i> الإجمالي: ${record.total}</span>
                <span class="text-success"><i class="fa-solid fa-check"></i> الصحيح: ${record.correct}</span>
                <span class="text-danger"><i class="fa-solid fa-xmark"></i> الخطأ: ${record.total - record.correct}</span>
            </div>
            <h4 style="margin-bottom: 0.75rem; font-size: 1.05rem;">مراجعة الأسئلة الخاطئة في هذا الاختبار:</h4>
            <div class="wrong-questions-list">
                ${wrongHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

// Telegram Login & Profile Management
function renderProfilePage() {
    const container = document.getElementById('profile-view-container');
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="login-card">
                <div class="result-icon-badge"><i class="fa-brands fa-telegram"></i></div>
                <h2>تسجيل الدخول عبر تيليجرام</h2>
                <p>قم بربط حسابك عبر تيليجرام لحفظ نتائج اختباراتك السابقة، وسجل تقدمك التعليمي بشكل دائم بين أجهزتك.</p>
                
                <div style="background: rgba(36, 161, 222, 0.05); border: 1px solid rgba(36, 161, 222, 0.2); border-radius: 14px; padding: 1.2rem; margin: 1.5rem 0; font-size: 0.95rem; text-align: right; line-height: 1.6;">
                    <strong>💡 ربط تسجيل الدخول الحقيقي:</strong><br>
                    قم بتعديل يوزر بوتك في الكود أدناه (استبدل <code>AL3agl_bot</code> بيوزر بوتك الخاص) ليظهر زر التيليجرام الرسمي وتعمل المصادقة الفورية.
                </div>

                <div id="telegram-login-container" style="margin-top: 20px; display: flex; justify-content: center;"></div>
            </div>
        `;

        // حقن زر تيليجرام الرسمي الحقيقي تلقائياً
        const script = document.createElement('script');
        script.async = true;
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-login', 'AL3agl_bot'); // استبدل هذا بيوزر بوتك الفعلي بدون علامة @
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-userpic', 'true');
        script.setAttribute('data-auth-url', 'https://your-website.com/auth-callback'); // رابط استقبال بيانات السيرفر أو يمكنك توجيهه لصفحة المعالجة
        script.setAttribute('data-request-access', 'write');
        
        // دالة استقبال الرد مباشرة في الواجهة (في حال لم تستخدم سيرفر خلفي وتريد التقاط بيانات الـ Callback)
        window.onTelegramAuth = function(user) {
            currentUser = user;
            localStorage.setItem('al_aaqil_user', JSON.stringify(currentUser));
            updateHeaderUser();
            renderProfilePage();
        };
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');

        const tgContainer = document.getElementById('telegram-login-container');
        if (tgContainer) {
            tgContainer.appendChild(script);
        }
    } else {
        container.innerHTML = `
            <div class="user-profile-card">
                <div class="user-avatar-lg">
                    ${currentUser.photo_url ? `<img src="${currentUser.photo_url}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" alt="Avatar">` : '<i class="fa-solid fa-user-astronaut"></i>'}
                </div>
                <h2>${currentUser.first_name || currentUser.username}</h2>
                <p class="text-gold" style="margin-bottom: 0.5rem;">@${currentUser.username || 'al_aaqil_user'}</p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">حساب مسجل ومحفوظ عبر تيليجرام بنجاح</p>
                
                <div style="display: flex; justify-content: center; gap: 1rem; margin: 1.5rem 0;">
                    <button class="btn-outline" onclick="logoutTelegram()"><i class="fa-solid fa-right-from-bracket"></i> تسخيل خروج</button>
                </div>

                <div class="important-links-box">
                    <h3><i class="fa-solid fa-star"></i> روابط مهمة لمنصة العاقل والمتجر</h3>
                    <div class="links-grid">
                        <a href="https://t.me/Al3agl_bot" target="_blank" class="external-link-card">
                            <span><i class="fa-solid fa-store"></i> رابط المتجر الرسمي</span>
                            <i class="fa-solid fa-arrow-left"></i>
                        </a>
                        <a href="https://t.me/Al_3agle" target="_blank" class="external-link-card">
                            <span><i class="fa-brands fa-telegram"></i> قروب التليجرام العام</span>
                            <i class="fa-solid fa-arrow-left"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

function logoutTelegram() {
    if (confirm('هل تريد تسجيل الخروج من حساب تيليجرام؟')) {
        currentUser = null;
        localStorage.removeItem('al_aaqil_user');
        updateHeaderUser();
        renderProfilePage();
    }
}
