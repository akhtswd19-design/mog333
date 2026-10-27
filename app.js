// الحالة العامة للتطبيق
let currentUser = JSON.parse(localStorage.getItem('military_user')) || null;
let currentActivePage = 'home';
let testHistory = JSON.parse(localStorage.getItem('military_history')) || [];
let forumPosts = JSON.parse(localStorage.getItem('military_forum')) || [
    { id: 1, user: "سلطان العتيبي", q: "هل المقابلة الشخصية تركز بشكل أكبر على الأسئلة الدينية أم الوطنية؟", replies: ["تركز على الاثنين معاً، كن ملمّاً بتاريخ المملكة وأركان الصلاة."] },
    { id: 2, user: "فيصل الحربي", q: "كيف كانت تجربتكم في الكشف الطبي المبدئي؟", replies: ["سهل بإذن الله، حافظ على لياقتك وسلامة نظرك."] }
];
let supportChat = JSON.parse(localStorage.getItem('military_support')) || [
    { sender: 'support', text: 'أهلاً بك في الدعم الفني لمنصة العسكرية. كيف يمكننا مساعدتك اليوم؟', time: 'الآن' }
];
let adminTickets = JSON.parse(localStorage.getItem('military_tickets')) || [
    { id: 101, user: "متدرب (تيليجرام #8821)", msg: "هل هناك اختبارات تجريبية شاملة للقدرات؟", status: "مفتوح" }
];

// تهيئة النظام عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    updateUserState();
    switchPage('home');
});

// مدير الانتقال بين الصفحات بنعومة تامة
function switchPage(pageId) {
    currentActivePage = pageId;
    
    // تحديث الأزرار النشطة في الناف بار
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-amber-400');
        btn.classList.add('text-zinc-500');
    });
    const activeNav = document.getElementById(`nav-${pageId}`);
    if(activeNav) {
        activeNav.classList.remove('text-zinc-500');
        activeNav.classList.add('text-amber-400');
    }

    const mainContainer = document.getElementById('main-content');
    mainContainer.innerHTML = '';
    
    // بناء الصفحة المطلوبة
    let html = `<div class="page-fade">`;
    if (pageId === 'home') html += renderHomePage();
    else if (pageId === 'history') html += renderHistoryPage();
    else if (pageId === 'forum') html += renderForumPage();
    else if (pageId === 'profile') html += renderProfilePage();
    else if (pageId === 'admin') html += renderAdminPage();
    html += `</div>`;

    mainContainer.innerHTML = html;
}

// 1. الصفحة الرئيسية (تسجيل الدخول والأقسام)
function renderHomePage() {
    let loginBoxHtml = '';
    if (!currentUser) {
        loginBoxHtml = `
            <div class="glass-card p-6 rounded-3xl mb-8 border-amber-500/30 text-center relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <h2 class="text-xl font-bold text-amber-300 mb-2">تسجيل الدخول عبر Telegram</h2>
                <p class="text-xs text-zinc-400 mb-4">سجل دخولك الآن عبر بوت التيليجرام لحفظ تقدمك ومتابعة اختباراتك</p>
                <button onclick="simulateTelegramLogin()" class="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center mx-auto space-x-2 space-x-reverse">
                    <i class="fa-brands fa-telegram text-xl ml-2"></i>
                    <span>تسجيل الدخول عبر Telegram</span>
                </button>
            </div>
        `;
    }

    return `
        ${loginBoxHtml}
        <div class="text-center mb-8">
            <h2 class="text-2xl font-black text-white mb-2">أقسام اختبارات المقابلات العسكرية</h2>
            <p class="text-sm text-zinc-400">اختر القسم لبدء الاختبار التفاعلي الشامل بكافة الأسئلة والإجابات النموذجية</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-card p-6 rounded-3xl flex flex-col justify-between border-amber-500/20 hover:border-amber-500/50 transition-all group">
                <div>
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-all">
                        <i class="fa-solid fa-landmark text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-amber-300 mb-2">تاريخ المملكة والمناصب</h3>
                    <p class="text-xs text-zinc-400 mb-6">يشمل تاريخ التأسيس، ملوك الدولة، المناطق الإدارية، والقيادات العسكرية.</p>
                </div>
                <button onclick="startQuiz('national')" class="w-full bg-zinc-900 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-400 font-bold py-3 rounded-2xl transition-all flex items-center justify-center space-x-2 space-x-reverse">
                    <span>بدء الاختبار (${questionBanks.national.length} سؤال)</span>
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
            </div>

            <div class="glass-card p-6 rounded-3xl flex flex-col justify-between border-amber-500/20 hover:border-amber-500/50 transition-all group">
                <div>
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-all">
                        <i class="fa-solid fa-globe text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-amber-300 mb-2">الجغرافيا والدول</h3>
                    <p class="text-xs text-zinc-400 mb-6">دول الخليج، العواصم العالمية، القارات، وعواصم الدول العربية والعالمية.</p>
                </div>
                <button onclick="startQuiz('geography')" class="w-full bg-zinc-900 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-400 font-bold py-3 rounded-2xl transition-all flex items-center justify-center space-x-2 space-x-reverse">
                    <span>بدء الاختبار (${questionBanks.geography.length} سؤال)</span>
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
            </div>

            <div class="glass-card p-6 rounded-3xl flex flex-col justify-between border-amber-500/20 hover:border-amber-500/50 transition-all group">
                <div>
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-all">
                        <i class="fa-solid fa-mosque text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-amber-300 mb-2">الدين الإسلامي والسيرة</h3>
                    <p class="text-xs text-zinc-400 mb-6">أركان الإسلام، السيرة النبوية العطرة، الخلفاء الراشدون، والغزوات.</p>
                </div>
                <button onclick="startQuiz('religious')" class="w-full bg-zinc-900 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-400 font-bold py-3 rounded-2xl transition-all flex items-center justify-center space-x-2 space-x-reverse">
                    <span>بدء الاختبار (${questionBanks.religious.length} سؤال)</span>
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
            </div>
        </div>
    `;
}

// محاكاة تسجيل الدخول بالتليجرام
function simulateTelegramLogin() {
    currentUser = { name: "الممتدرب العسكري", id: "TG_105600" };
    localStorage.setItem('military_user', JSON.stringify(currentUser));
    updateUserState();
    switchPage('home');
}

function updateUserState() {
    const badge = document.getElementById('user-badge');
    const usernameSpan = document.getElementById('logged-username');
    if (currentUser) {
        badge.classList.remove('hidden');
        badge.classList.add('flex');
        usernameSpan.textContent = currentUser.name;
    } else {
        badge.classList.add('hidden');
    }
}

// محرك الاختبارات والأخطاء
let activeQuizData = [];
let currentQIndex = 0;
let userMistakes = [];

function startQuiz(categoryKey) {
    activeQuizData = [...questionBanks[categoryKey]];
    currentQIndex = 0;
    userMistakes = [];
    openQuizModal();
    renderQuizQuestion();
}

function openQuizModal() {
    document.getElementById('quiz-modal').classList.remove('hidden');
}

function closeQuiz() {
    document.getElementById('quiz-modal').classList.add('hidden');
}

function renderQuizQuestion() {
    const container = document.getElementById('quiz-content');
    if (currentQIndex >= activeQuizData.length) {
        // انتهى الاختبار
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    <i class="fa-solid fa-award"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">أتممت الاختبار بنجاح!</h3>
                <p class="text-sm text-zinc-400 mb-6">تم تسجيل الأخطاء (إن وجدت) في سجل مراجعتك الخاص.</p>
                <button onclick="closeQuiz()" class="bg-amber-500 text-black font-bold px-8 py-3 rounded-xl">إنهاء ومراجعة</button>
            </div>
        `;
        if (userMistakes.length > 0) {
            testHistory.push({ date: new Date().toLocaleDateString('ar-SA'), mistakes: userMistakes });
            localStorage.setItem('military_history', JSON.stringify(testHistory));
        }
        return;
    }

    const q = activeQuizData[currentQIndex];
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center text-xs text-zinc-400">
            <span>السؤال ${currentQIndex + 1} من ${activeQuizData.length}</span>
            <span class="text-amber-400">قسم المقابلات العسكرية</span>
        </div>
        <h3 class="text-lg font-bold text-white mb-4 leading-relaxed">${q.q}</h3>
        <div class="glass-card p-4 rounded-2xl mb-6 border-amber-500/20">
            <p class="text-xs text-zinc-400 mb-1 font-bold">الإجابة النموذجية المعتمدة:</p>
            <p class="text-sm text-amber-200 leading-relaxed">${q.a}</p>
        </div>
        <div class="flex space-x-3 space-x-reverse">
            <button onclick="answerResult(false)" class="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                <i class="fa-solid fa-xmark ml-2"></i> لم أكن أعرفها (حفظ بالأخطاء)
            </button>
            <button onclick="answerResult(true)" class="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                <i class="fa-solid fa-check ml-2"></i> أجبت بشكل صحيح
            </button>
        </div>
    `;
}

function answerResult(isCorrect) {
    if (!isCorrect) {
        userMistakes.push(activeQuizData[currentQIndex]);
    }
    currentQIndex++;
    renderQuizQuestion();
}

// 2. صفحة الأخطاء والمراجعة
function renderHistoryPage() {
    let historyHtml = '';
    if (testHistory.length === 0) {
        historyHtml = `<p class="text-center text-zinc-500 py-10">لا يوجد سجل أخطاء سابقة. اختبر الآن لتظهر أخطائك هنا لمراجعتها!</p>`;
    } else {
        testHistory.forEach((item, idx) => {
            historyHtml += `
                <div class="glass-card p-5 rounded-2xl mb-4 border-amber-500/20">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs text-amber-400">اختبار بتاريخ: ${item.date}</span>
                        <span class="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full">${item.mistakes.length} أخطاء مسجلة</span>
                    </div>
                    <div class="space-y-2">
                        ${item.mistakes.map(m => `
                            <div class="bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <p class="text-xs font-bold text-white mb-1">س: ${m.q}</p>
                                <p class="text-xs text-amber-300/80">ج: ${m.a}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    }

    return `
        <div class="mb-6">
            <h2 class="text-xl font-bold text-amber-400 mb-1">سجل الأخطاء ومراجعة المتدرب</h2>
            <p class="text-xs text-zinc-400">راجع الأسئلة التي واجهتك صعوبة فيها لضمان اجتياز المقابلة بنجاح.</p>
        </div>
        ${historyHtml}
    `;
}

// 3. صفحة أسئلة الناس ومنتدى النقاشات
function renderForumPage() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-xl font-bold text-amber-400 mb-1">منتدى أسئلة المقابلات</h2>
                <p class="text-xs text-zinc-400">تجارب واستفسارات المتقدمين والردود عليها</p>
            </div>
            <button onclick="openNewPostModal()" class="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-xs hover:bg-yellow-400">
                <i class="fa-solid fa-plus ml-1"></i> طرح سؤال
            </button>
        </div>
        <div class="space-y-4" id="forum-list">
            ${forumPosts.map(p => `
                <div class="glass-card p-5 rounded-2xl border-amber-500/20">
                    <div class="flex items-center space-x-2 space-x-reverse mb-2">
                        <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                            ${p.user.charAt(0)}
                        </div>
                        <div>
                            <span class="text-xs font-bold text-white">${p.user}</span>
                            <span class="text-[10px] text-zinc-500 block">متقدم عسكري</span>
                        </div>
                    </div>
                    <p class="text-sm text-zinc-200 mb-3">${p.q}</p>
                    <div class="bg-black/50 p-3 rounded-xl border border-zinc-800 space-y-2">
                        <p class="text-xs text-amber-400 font-bold">الردود والنصائح:</p>
                        ${p.replies.map(r => `<p class="text-xs text-zinc-300 leading-relaxed">- ${r}</p>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function openNewPostModal() {
    const qText = prompt("اكتب سؤالك أو استفسارك حول المقابلات العسكرية:");
    if (qText) {
        forumPosts.unshift({ id: Date.now(), user: currentUser ? currentUser.name : "زائر", q: qText, replies: ["تم استلام سؤالك وسيتم الرد عليه قريباً من قبل المختصين."] });
        localStorage.setItem('military_forum', JSON.stringify(forumPosts));
        switchPage('forum');
    }
}

// 4. صفحة البروفايل والدعم الفني المباشر
function renderProfilePage() {
    return `
        <!-- روابط المتجر والقناة المطلوبة -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <a href="https://t.me/Al3agl_bot" target="_blank" class="glass-card p-5 rounded-2xl border-amber-500/30 flex items-center justify-between hover:border-amber-500 transition-all">
                <div class="flex items-center space-x-3 space-x-reverse">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <i class="fa-solid fa-store text-lg"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-white">رابط المتجر الرسمي</h4>
                        <p class="text-xs text-zinc-400">@Al3agl_bot</p>
                    </div>
                </div>
                <i class="fa-solid fa-arrow-up-left text-amber-400"></i>
            </a>

            <a href="https://t.me/Al_3agle" target="_blank" class="glass-card p-5 rounded-2xl border-amber-500/30 flex items-center justify-between hover:border-amber-500 transition-all">
                <div class="flex items-center space-x-3 space-x-reverse">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <i class="fa-solid fa-bullhorn text-lg"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-white">قناة التليجرام العامة</h4>
                        <p class="text-xs text-zinc-400">@Al_3agle</p>
                    </div>
                </div>
                <i class="fa-solid fa-arrow-up-left text-amber-400"></i>
            </a>
        </div>

        <!-- محادثة الدعم الفني المباشر -->
        <div class="glass-card rounded-3xl border-amber-500/20 overflow-hidden flex flex-col h-[400px]">
            <div class="bg-black/60 p-4 border-b border-amber-500/20 flex items-center space-x-3 space-x-reverse">
                <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 class="text-sm font-bold text-amber-300">التواصل مع الدعم الفني المباشر</h3>
            </div>
            <div id="support-chat-box" class="flex-1 p-4 overflow-y-auto space-y-3">
                ${supportChat.map(msg => `
                    <div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}">
                        <div class="max-w-[80%] p-3 rounded-2xl text-xs ${msg.sender === 'user' ? 'bg-amber-500 text-black font-semibold' : 'bg-zinc-900 border border-zinc-800 text-zinc-200'}">
                            ${msg.text}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="p-3 bg-black/80 border-t border-amber-500/20 flex space-x-2 space-x-reverse">
                <input type="text" id="support-input" placeholder="اكتب رسالتك للدعم الفني..." class="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
                <button onclick="sendSupportMessage()" class="bg-amber-500 text-black px-5 py-2 rounded-xl text-xs font-bold hover:bg-yellow-400">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
}

function sendSupportMessage() {
    const input = document.getElementById('support-input');
    if (!input.value.trim()) return;

    supportChat.push({ sender: 'user', text: input.value, time: 'الآن' });
    adminTickets.push({ id: Date.now(), user: currentUser ? currentUser.name : "متدرب زائر", msg: input.value, status: "مفتوح" });
    
    localStorage.setItem('military_support', JSON.stringify(supportChat));
    localStorage.setItem('military_tickets', JSON.stringify(adminTickets));
    
    input.value = '';
    renderProfilePage();
    
    // التمرير لأسفل المحادثة
    const chatBox = document.getElementById('support-chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 5. صفحة الأدمن (لوحة التحكم المحمية)
let isAdminAuthenticated = false;

function renderAdminPage() {
    if (!isAdminAuthenticated) {
        return `
            <div class="glass-card p-8 rounded-3xl max-w-md mx-auto text-center border-amber-500/30 mt-10">
                <div class="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">لوحة تحكم الأدمن</h3>
                <p class="text-xs text-zinc-400 mb-6">هذه الصفحة مخصصة للمشرفين فقط. أدخل كلمة المرور للمتابعة.</p>
                <input type="password" id="admin-pass" placeholder="كلمة المرور (admin123)" class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white text-center mb-4 focus:outline-none focus:border-amber-500">
                <button onclick="verifyAdmin()" class="w-full bg-amber-500 text-black font-bold py-3 rounded-xl text-xs hover:bg-yellow-400">دخول اللوحة</button>
            </div>
        `;
    }

    return `
        <div class="mb-6">
            <h2 class="text-xl font-bold text-amber-400 mb-1">لوحة تحكم المشرف العام</h2>
            <p class="text-xs text-zinc-400">إحصائيات المنصة والتيكيتات الواردة من المتدربين</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="glass-card p-5 rounded-2xl border-amber-500/20 text-center">
                <i class="fa-brands fa-telegram text-2xl text-amber-400 mb-2"></i>
                <h4 class="text-xs text-zinc-400 mb-1">المسجلين عبر تيليجرام</h4>
                <p class="text-2xl font-bold text-white">1,428</p>
            </div>
            <div class="glass-card p-5 rounded-2xl border-amber-500/20 text-center">
                <i class="fa-solid fa-users text-2xl text-emerald-400 mb-2"></i>
                <h4 class="text-xs text-zinc-400 mb-1">المتصلون الآن</h4>
                <p class="text-2xl font-bold text-white">47</p>
            </div>
            <div class="glass-card p-5 rounded-2xl border-amber-500/20 text-center">
                <i class="fa-solid fa-headset text-2xl text-blue-400 mb-2"></i>
                <h4 class="text-xs text-zinc-400 mb-1">تيكيتات الدعم المفتوحة</h4>
                <p class="text-2xl font-bold text-white">${adminTickets.length}</p>
            </div>
        </div>
        <h3 class="text-lg font-bold text-white mb-4">استفسارات وتيكيتات المتدربين</h3>
        <div class="space-y-3">
            ${adminTickets.map(t => `
                <div class="glass-card p-4 rounded-2xl flex justify-between items-center border-amber-500/20">
                    <div>
                        <span class="text-[10px] text-amber-400 block mb-1">المستخدم: ${t.user}</span>
                        <p class="text-xs text-zinc-200">${t.msg}</p>
                    </div>
                    <button onclick="resolveTicket(${t.id})" class="bg-zinc-900 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs hover:bg-emerald-500 hover:text-black">
                        إغلاق / تم الرد
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function verifyAdmin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === 'admin123') {
        isAdminAuthenticated = true;
        switchPage('admin');
    } else {
        alert('كلمة المرور غير صحيحة! (الافتراضية: admin123)');
    }
}

function resolveTicket(id) {
    adminTickets = adminTickets.filter(t => t.id !== id);
    localStorage.setItem('military_tickets', JSON.stringify(adminTickets));
    switchPage('admin');
}

// رسم خلفية النجوم الذهبية المتحركة (سلو-موشن)
function initStars() {
    const canvas = document.getElementById('starsCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.2 + 0.05,
            alpha: Math.random()
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#d4af37';
        stars.forEach(s => {
            ctx.globalAlpha = Math.abs(Math.sin(Date.now() * 0.001 * s.speed + s.x));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            s.y -= s.speed;
            if (s.y < 0) s.y = height;
        });
        requestAnimationFrame(animate);
    }
    animate();
}