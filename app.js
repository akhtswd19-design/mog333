// المتغيرات العامة للنظام
let currentUser = null;
let currentQuizCategory = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let userScore = 0;
let currentQuizWrongAnswers = [];
let userMistakesHistory = JSON.parse(localStorage.getItem('al3agl_mistakes')) || [];
let registeredUsersList = JSON.parse(localStorage.getItem('al3agl_registered_users')) || [];

const ADMIN_TELEGRAM_ID = "1056007305"; // آيدي أدمن التليجرام الخاص بك

// تهيئة النظام عند التحميل
document.addEventListener('DOMContentLoaded', () => {
  updateQuestionsCountUI();
  checkSavedUserSession();
  renderMistakesHistoryUI();
});

// تحديث عدد الأسئلة بالأقسام
function updateQuestionsCountUI() {
  document.getElementById('count-national').textContent = `${questionsData.national.length} سؤال متوفر بالكامل`;
  document.getElementById('count-islamic').textContent = `${questionsData.islamic.length} سؤال متوفر بالكامل`;
  document.getElementById('count-geo').textContent = `${questionsData.geo.length} سؤال متوفر بالكامل`;
}

// التحكم بالسلاسة والتنقل بين الصفحات
function switchPage(pageId, navElement) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  if (navElement) {
    navElement.classList.add('active');
  }

  if (pageId === 'page-history') {
    renderMistakesHistoryUI();
  } else if (pageId === 'page-admin') {
    updateAdminDashboardUI();
  }
}

// محاكاة وتسجيل الدخول عبر التليجرام
function simulateTelegramLogin() {
  const fakeTelegramUser = {
    id: "782910" + Math.floor(1000 + Math.random() * 9000),
    first_name: "مستخدم تليجرام",
    username: "tg_user"
  };

  currentUser = fakeTelegramUser;
  localStorage.setItem('al3agl_user_session', JSON.stringify(currentUser));

  // حفظ في قائمة المستخدمين
  if (!registeredUsersList.some(u => u.id === currentUser.id)) {
    registeredUsersList.push({
      ...currentUser,
      registeredAt: new Date().toLocaleDateString('ar-SA'),
      quizzesCompleted: 0
    });
    localStorage.setItem('al3agl_registered_users', JSON.stringify(registeredUsersList));
  }

  applyUserSessionUI();
}

function checkSavedUserSession() {
  const saved = localStorage.getItem('al3agl_user_session');
  if (saved) {
    currentUser = JSON.parse(saved);
    applyUserSessionUI();
  }
}

function applyUserSessionUI() {
  if (currentUser) {
    document.getElementById('auth-box').classList.add('hidden');
    document.getElementById('user-profile-box').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.first_name;
    document.getElementById('user-id-badge').textContent = `ID: ${currentUser.id}`;
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('al3agl_user_session');
  document.getElementById('auth-box').classList.remove('hidden');
  document.getElementById('user-profile-box').classList.add('hidden');
}

// بدء الاختبار
function startQuiz(categoryKey) {
  currentQuizCategory = categoryKey;
  let rawQuestions = [];

  if (categoryKey === 'mistakes') {
    if (userMistakesHistory.length === 0) {
      alert("لا توجد أخطاء مسجلة حالياً لبدء الاختبار!");
      return;
    }
    rawQuestions = [...userMistakesHistory];
    document.getElementById('quiz-category-title').textContent = "اختبار الأخطاء السابقة";
  } else {
    rawQuestions = questionsData[categoryKey];
    const titles = {
      national: "تاريخ المملكة ومناصبها",
      islamic: "الدين الإسلامي",
      geo: "الجغرافيا والدول"
    };
    document.getElementById('quiz-category-title').textContent = titles[categoryKey] || "الاختبار";
  }

  // استخدام جميع الأسئلة بالكامل وإجراء ترتيب عشوائي لها
  currentQuestions = shuffleArray([...rawQuestions]);
  currentQuestionIndex = 0;
  userScore = 0;
  currentQuizWrongAnswers = [];

  document.querySelector('.categories-grid').classList.add('hidden');
  document.getElementById('quiz-container').classList.remove('hidden');
  document.getElementById('result-container').classList.add('hidden');

  renderCurrentQuestion();
}

// عرض السؤال الحالي مع تنويع مكان الخيارات الخاطئة والصحيحة
function renderCurrentQuestion() {
  const qData = currentQuestions[currentQuestionIndex];
  
  // تحديث شريط التقدم
  const progressPercent = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('quiz-progress').textContent = `سؤال ${currentQuestionIndex + 1} من ${currentQuestions.length}`;

  document.getElementById('quiz-question').textContent = qData.q;

  // توفير خيارات إلهاء مقتبسة لتكون الخيارات متساوية الشكل والتفصيل
  const wrongPool = getWrongOptionsPool(currentQuizCategory, qData.a);
  const selectedWrong = shuffleArray(wrongPool).slice(0, 3);

  // الخيارات الأربعة
  let allOptions = [
    { text: qData.a, isCorrect: true },
    { text: selectedWrong[0], isCorrect: false },
    { text: selectedWrong[1], isCorrect: false },
    { text: selectedWrong[2], isCorrect: false }
  ];

  // خلط الخيارات لضمان تنويع الإجابة الصحيحة في أ، ب، ج، د
  allOptions = shuffleArray(allOptions);

  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';

  allOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.onclick = () => handleAnswer(opt.isCorrect, qData, btn, optionsContainer);
    optionsContainer.appendChild(btn);
  });
}

// التفاعل مع اختيار الإجابة
function handleAnswer(isCorrect, qData, clickedBtn, container) {
  // تعطيل كل الخيارات لمنع الضغط المكرر
  const buttons = container.querySelectorAll('.option-btn');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  if (isCorrect) {
    clickedBtn.classList.add('correct');
    userScore++;
  } else {
    clickedBtn.classList.add('wrong');
    // إبراز الخيار الصحيح
    buttons.forEach(b => {
      if (b.textContent === qData.a) b.classList.add('correct');
    });

    currentQuizWrongAnswers.push(qData);
    saveMistakeToHistory(qData);
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
      renderCurrentQuestion();
    } else {
      finishQuiz();
    }
  }, 1200);
}

// إنهاء الاختبار وعرض النتائج
function finishQuiz() {
  document.getElementById('quiz-container').classList.add('hidden');
  document.getElementById('result-container').classList.remove('hidden');

  const total = currentQuestions.length;
  const percentage = Math.round((userScore / total) * 100);

  document.getElementById('result-score').textContent = `${percentage}%`;
  document.getElementById('result-summary').textContent = `إجابات صحيحة: ${userScore} من إجمالي ${total} سؤال`;

  const wrongReviewBox = document.getElementById('wrong-answers-review');
  wrongReviewBox.innerHTML = '';

  if (currentQuizWrongAnswers.length > 0) {
    wrongReviewBox.innerHTML = '<h4>الأسئلة التي أخطأت فيها في هذا الاختبار:</h4>';
    currentQuizWrongAnswers.forEach(item => {
      const div = document.createElement('div');
      div.className = 'review-item';
      div.innerHTML = `<strong>س: ${item.q}</strong><br><span style="color:#ffcf40">الإجابة الصحيحة: ${item.a}</span>`;
      wrongReviewBox.appendChild(div);
    });
  } else {
    wrongReviewBox.innerHTML = '<p style="color:#4caf50; text-align:center;">ممتاز! لم تخطئ في أي سؤال. 👏</p>';
  }

  // إحصائيات الأدمن
  if (currentUser) {
    let uList = JSON.parse(localStorage.getItem('al3agl_registered_users')) || [];
    let idx = uList.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      uList[idx].quizzesCompleted = (uList[idx].quizzesCompleted || 0) + 1;
      localStorage.setItem('al3agl_registered_users', JSON.stringify(uList));
    }
  }
}

function quitQuiz() {
  if (confirm("هل أنت تأكد من إلغاء الاختبار؟")) {
    backToHome();
  }
}

function backToHome() {
  document.getElementById('quiz-container').classList.add('hidden');
  document.getElementById('result-container').classList.add('hidden');
  document.querySelector('.categories-grid').classList.remove('hidden');
}

// حفظ الخطأ في السجل
function saveMistakeToHistory(qData) {
  if (!userMistakesHistory.some(m => m.q === qData.q)) {
    userMistakesHistory.push(qData);
    localStorage.setItem('al3agl_mistakes', JSON.stringify(userMistakesHistory));
  }
}

// عرض الأخطاء السابقة
function renderMistakesHistoryUI() {
  document.getElementById('total-mistakes-count').textContent = userMistakesHistory.length;
  const container = document.getElementById('all-mistakes-list');
  container.innerHTML = '';

  if (userMistakesHistory.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary); text-align:center;">لا توجد أخطاء محفوظة لديك حتى الآن.</p>';
    document.getElementById('btn-start-mistakes-quiz').style.display = 'none';
    return;
  }

  document.getElementById('btn-start-mistakes-quiz').style.display = 'block';

  userMistakesHistory.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `
      <strong>${index + 1}. ${item.q}</strong><br>
      <span style="color:var(--accent-gold)">الإجابة: ${item.a}</span>
    `;
    container.appendChild(div);
  });
}

function startMistakesQuiz() {
  switchPage('page-home', document.querySelectorAll('.nav-item')[0]);
  startQuiz('mistakes');
}

// لوحة تحكم الأدمن
function checkAdminAuth() {
  const inputId = document.getElementById('admin-id-input').value.trim();
  if (inputId === ADMIN_TELEGRAM_ID) {
    document.getElementById('admin-login-lock').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    updateAdminDashboardUI();
  } else {
    alert("آيدي الأدمن غير صحيح!");
  }
}

function updateAdminDashboardUI() {
  const users = JSON.parse(localStorage.getItem('al3agl_registered_users')) || [];
  document.getElementById('admin-total-users').textContent = users.length;

  let totalQuizzes = 0;
  users.forEach(u => totalQuizzes += (u.quizzesCompleted || 0));
  document.getElementById('admin-total-quizzes').textContent = totalQuizzes;

  const tableBody = document.getElementById('admin-users-table');
  tableBody.innerHTML = '';

  if (users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا يوجد مستخدمين مسجلين بعد</td></tr>';
    return;
  }

  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.first_name}</td>
      <td>${u.id}</td>
      <td>${u.registeredAt || 'اليوم'}</td>
      <td>${u.quizzesCompleted || 0}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// دالة مساعدة لتوليد إجابات خاطئة متناسقة
function getWrongOptionsPool(catKey, correctAns) {
  let pool = [];
  let source = (catKey === 'mistakes' || !questionsData[catKey]) ? 
    [...questionsData.national, ...questionsData.islamic, ...questionsData.geo] : questionsData[catKey];

  source.forEach(item => {
    if (item.a !== correctAns && !pool.includes(item.a)) {
      pool.push(item.a);
    }
  });

  return pool;
}

// دالة العشوائية (Shuffle)
function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}