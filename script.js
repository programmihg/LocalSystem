// ==========================================
// 1. ГЛОБАЛНИ ПОМОЩНИ ФУНКЦИИ
// ==========================================
let hiddenStack = [];
let resetClicks = 0;
let resetTimer;

function smartNav(id, singleAction, doubleAction) {
    const el = document.getElementById(id);
    if (!el) return;
    let clicks = 0;
    let timer;
    el.onclick = (e) => {
        e.preventDefault();
        clicks++;
        if (clicks === 1) {
            timer = setTimeout(() => { singleAction(); clicks = 0; }, 300);
        } else {
            clearTimeout(timer); doubleAction(); clicks = 0;
        }
    };
}

function toggleCard(btn, step) {
    const card = btn.closest('.flashcard');
    if (card) {
        card.classList.toggle(`step-${step}`);
        btn.style.transform = card.classList.contains(`step-${step}`) ? 'rotate(90deg)' : 'rotate(0deg)';
    }
}

function updateProgressBar() {
    const allCards = document.querySelectorAll('.flashcard');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    if (allCards.length > 0 && progressBar) {
        const learned = document.querySelectorAll('.flashcard.hidden-card').length;
        const percentage = Math.round((learned / allCards.length) * 100);
        progressBar.style.height = percentage + '%';
        if (progressText) progressText.innerText = percentage + '%';
        localStorage.setItem('progress_' + window.location.pathname, percentage);
    }
}

function markAsLearned(btn) {
    const card = btn.closest('.flashcard');
    if (card) {
        card.classList.add('hidden-card');
        hiddenStack.push(card);
        updateProgressBar();
    }
}

function smartReset() {
    resetClicks++;
    if (resetClicks === 1) {
        resetTimer = setTimeout(() => {
            if (hiddenStack.length > 0) {
                const lastCard = hiddenStack.pop();
                lastCard.classList.remove('hidden-card', 'step-1', 'step-2');
                lastCard.querySelectorAll('.expand-btn').forEach(b => b.style.transform = 'rotate(0deg)');
            }
            updateProgressBar();
            resetClicks = 0;
        }, 300);
    } else {
        clearTimeout(resetTimer);
        document.querySelectorAll('.flashcard').forEach(c => {
            c.classList.remove('hidden-card', 'step-1', 'step-2');
            c.querySelectorAll('.expand-btn').forEach(b => b.style.transform = 'rotate(0deg)');
        });
        hiddenStack = [];
        updateProgressBar();
        resetClicks = 0;
    }
}

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ (DOM CONTENT LOADED)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const nav = document.getElementById('main-nav');
    const toggleBtn = document.getElementById('nav-toggle-move');

    const categories = [
        { id: 'home', folder: '', name: 'INDEX', totalLessons: 0 },
        { id: 'net', folder: 'net', name: 'NETWORK', totalLessons: 2 },
        { id: 'comp', folder: 'comp', name: 'COMPUTER', totalLessons: 4 },
        { id: 'os', folder: 'os', name: 'OS', totalLessons: 4 },
        { id: 'html', folder: 'html', name: 'HTML', totalLessons: 3 },
        { id: 'css', folder: 'css', name: 'CSS', totalLessons: 2 },
        { id: 'js', folder: 'js', name: 'JAVASCRIPT', totalLessons: 2 },
        { id: 'ai', folder: 'ai', name: 'AI', totalLessons: 2 }
    ];

    let currentCatIndex = categories.findIndex(c => {
        if (c.folder === '') return path === '/' || path === '/index.html';
        return path.includes('/' + c.folder + '/');
    });
    if (currentCatIndex === -1) currentCatIndex = 0;
    const currentCat = categories[currentCatIndex];

    // --- ФУНКЦИЯ ЗА ОБНОВЯВАНЕ НА ИКОНАТА И ПОЗИЦИЯТА ---
    function refreshNavVisuals() {
        if (!nav || !toggleBtn) return;
        
        const isTop = nav.classList.contains('top');
        const isCollapsed = nav.classList.contains('collapsed');
        const icon = toggleBtn.querySelector('.toggle-icon');

        // Клас за позицията на бутончето
        toggleBtn.className = isTop ? 'at-top' : 'at-bottom';

        if (icon) {
            if (isTop) {
                // Горе: Отворена = ▲ (нагоре), Скрита = ▼ (надолу)
                icon.textContent = isCollapsed ? '▼' : '▲';
            } else {
                // Долу: Отворена = ▼ (надолу), Скрита = ▲ (нагоре)
                icon.textContent = isCollapsed ? '▲' : '▼';
            }
        }
    }

    // --- НАСТРОЙКА НА МЕНЮТО ПРИ ЗАРЕЖДАНЕ ---
    if (nav && toggleBtn) {
        const savedPos = localStorage.getItem('navPos') || 'top';
        const savedCollapsed = localStorage.getItem('navCollapsed') === 'true';

        nav.classList.remove('top', 'bottom', 'collapsed');
        nav.classList.add(savedPos);
        if (savedCollapsed) nav.classList.add('collapsed');

        refreshNavVisuals();

        let navClicks = 0;
        let navTimer;

        toggleBtn.onclick = (e) => {
            e.preventDefault();
            navClicks++;
            if (navClicks === 1) {
                navTimer = setTimeout(() => {
                    nav.classList.toggle('collapsed');
                    localStorage.setItem('navCollapsed', nav.classList.contains('collapsed'));
                    refreshNavVisuals();
                    navClicks = 0;
                }, 250);
            } else {
                clearTimeout(navTimer);
                const isCurrentlyTop = nav.classList.contains('top');
                nav.classList.remove('top', 'bottom');
                const newPos = isCurrentlyTop ? 'bottom' : 'top';
                nav.classList.add(newPos);
                localStorage.setItem('navPos', newPos);
                refreshNavVisuals();
                navClicks = 0;
            }
        };
    }

    // --- НАВИГАЦИЯ (СТРЕЛКИ) - ОПТИМИЗИРАНА ВЕРСИЯ ---
    const lessonMatch = path.match(/lesson(\d+)\.html/);
    const currentLessonNum = lessonMatch ? parseInt(lessonMatch[1]) : 0;
    const isIndex = path.includes('index.html');
    const isReview = path.includes('review.html');

    smartNav('page-next', 
        () => {
            if (isIndex) {
                // От Index към Урок 1
                window.location.href = `/${currentCat.folder}/lessons/lesson1.html`;
            } else if (currentLessonNum > 0 && currentLessonNum < currentCat.totalLessons) {
                // От текущ урок към следващ
                window.location.href = `/${currentCat.folder}/lessons/lesson${currentLessonNum + 1}.html`;
            } else if (currentLessonNum === currentCat.totalLessons) {
                // От последен урок към Review
                window.location.href = `/${currentCat.folder}/review.html`;
            }
            // Ако сме в Review, бутонът спира да действа (правилно)
        },
        () => { window.location.href = `/${currentCat.folder}/review.html`; }
    );

    smartNav('page-prev', 
        () => {
            if (isReview) {
                // От Review към последен урок
                window.location.href = `/${currentCat.folder}/lessons/lesson${currentCat.totalLessons}.html`;
            } else if (currentLessonNum > 1) {
                // От текущ урок към предишен
                window.location.href = `/${currentCat.folder}/lessons/lesson${currentLessonNum - 1}.html`;
            } else if (currentLessonNum === 1) {
                // От Урок 1 към Index
                window.location.href = `/${currentCat.folder}/index.html`;
            }
            // Ако сме в Index, бутонът спира да действа (правилно)
        },
        () => { window.location.href = `/${currentCat.folder}/index.html`; }
    );

    smartNav('section-next', 
        () => {
            const nextIdx = (currentCatIndex + 1) % categories.length;
            window.location.href = categories[nextIdx].folder === '' ? '/index.html' : `/${categories[nextIdx].folder}/index.html`;
        },
        () => { window.location.href = '/ai/index.html'; }
    );

    smartNav('section-prev', 
        () => {
            const prevIdx = (currentCatIndex - 1 + categories.length) % categories.length;
            window.location.href = categories[prevIdx].folder === '' ? '/index.html' : `/${categories[prevIdx].folder}/index.html`;
        },
        () => { window.location.href = '/index.html'; }
    );

    // --- ЕТИКЕТИ ---
    const pageLabel = document.getElementById('page-num');
    const sectionTitle = document.getElementById('section-title');
    const h1Text = document.querySelector('h1')?.innerText || "";
    
    if (sectionTitle) sectionTitle.innerText = currentCat.name;
    if (pageLabel) {
        if (currentLessonNum > 0) {
            pageLabel.innerHTML = `${currentLessonNum}/${currentCat.totalLessons} <small style="opacity:0.6; font-size:0.75rem; margin-left:5px;">${h1Text}</small>`;
        } else {
            pageLabel.innerText = path.includes('review.html') ? "Review" : "Index";
        }
    }

    // --- ТЪРСЕНЕ (С ОЦВЕТЯВАНЕ / HIGHLIGHT) ---
    const searchInput = document.getElementById('site-search');
    const searchBtn = document.getElementById('search-mode-btn');
    const searchContainer = document.querySelector('.search-container');

    if (searchInput) {
        let currentSearchMode = 0; 

        searchInput.addEventListener('input', () => {
            const term = searchInput.value.trim();
            const lowerTerm = term.toLowerCase();
            const cards = document.querySelectorAll('.flashcard');

            cards.forEach(card => {
                // Вземаме оригиналния текст (премахваме предишни маркирания)
                // Използваме скрит контейнер или чист текст, за да не повредим HTML структурата
                const contentElements = card.querySelectorAll('p, h3, div'); 
                let matchFound = false;

                contentElements.forEach(el => {
                    // Изчистваме старите <mark> тагове чрез просто връщане на чист текст
                    const originalText = el.textContent;
                    
                    if (term !== "" && originalText.toLowerCase().includes(lowerTerm)) {
                        // Регулярен израз за намиране на всички срещания (case-insensitive)
                        const regex = new RegExp(`(${term})`, 'gi');
                        el.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
                        matchFound = true;
                    } else {
                        el.innerHTML = originalText;
                    }
                });

                card.style.display = (term === "" || matchFound) ? "block" : "none";
            });

            const sidebar = document.querySelector('.sidebar-right');
            if (sidebar) sidebar.style.opacity = term.length > 0 ? "0.2" : "1";
        });

        // Google търсене при Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const term = searchInput.value.trim();
                if (term !== "" && currentSearchMode > 0) {
                    const isSection = (currentSearchMode === 1);
                    const siteConstraint = isSection ? `site:127.0.0.1:5501/${currentCat.folder}/` : `site:127.0.0.1:5501/`;
                    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(term)}+${encodeURIComponent(siteConstraint)}`;
                    window.open(googleUrl, '_blank');
                }
            }
        });

        if (searchBtn && searchContainer) {
            const labels = ["Търси в страницата...", "Търси в раздела...", "Търси в сайта..."];
            const colors = ["#4CAF50", "#ff9800", "#2196f3"];
            searchBtn.onclick = (e) => {
                e.preventDefault();
                currentSearchMode = (currentSearchMode + 1) % 3;
                searchInput.placeholder = labels[currentSearchMode];
                searchContainer.style.borderColor = colors[currentSearchMode];
            };
        }
    }

    updateProgressBar();
});