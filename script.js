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
    const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
    // Базов път: Ако сме в GitHub, добавяме името на проекта
    const baseRoot = isLocal ? '' : '/LocalSystem';

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
        { id: 'py', folder: 'py', name: 'PYTHON', totalLessons: 2 },
        { id: 'php', folder: 'php', name: 'PHP', totalLessons: 2 },
        { id: 'sql', folder: 'sql', name: 'SQL', totalLessons: 2 },
        { id: 'ai', folder: 'ai', name: 'AI', totalLessons: 2 }
    ];

    // Коригирано намиране на категорията за GitHub и Local
    let currentCatIndex = categories.findIndex(c => {
        if (c.folder === '') {
            return path.endsWith(baseRoot + '/') || path.endsWith('/index.html');
        }
        return path.includes('/' + c.folder + '/');
    });
    
    if (currentCatIndex === -1) currentCatIndex = 0;
    const currentCat = categories[currentCatIndex];

    function refreshNavVisuals() {
        if (!nav || !toggleBtn) return;
        const isTop = nav.classList.contains('top');
        const isCollapsed = nav.classList.contains('collapsed');
        const icon = toggleBtn.querySelector('.toggle-icon');
        toggleBtn.className = isTop ? 'at-top' : 'at-bottom';
        if (icon) {
            if (isTop) {
                icon.textContent = isCollapsed ? '▼' : '▲';
            } else {
                icon.textContent = isCollapsed ? '▲' : '▼';
            }
        }
    }

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

    // --- НАВИГАЦИЯ (СТРЕЛКИ) С АДАПТИВНИ ПЪТИЩА ---
    const lessonMatch = path.match(/lesson(\d+)\.html/);
    const currentLessonNum = lessonMatch ? parseInt(lessonMatch[1]) : 0;
    const isIndex = path.includes('index.html') || path.endsWith(baseRoot + '/');
    const isReview = path.includes('review.html');

    smartNav('page-next', 
        () => {
            if (isIndex && currentCat.folder !== '') {
                window.location.href = `${baseRoot}/${currentCat.folder}/lessons/lesson1.html`;
            } else if (currentLessonNum > 0 && currentLessonNum < currentCat.totalLessons) {
                window.location.href = `${baseRoot}/${currentCat.folder}/lessons/lesson${currentLessonNum + 1}.html`;
            } else if (currentLessonNum === currentCat.totalLessons) {
                window.location.href = `${baseRoot}/${currentCat.folder}/review.html`;
            }
        },
        () => { if(currentCat.folder !== '') window.location.href = `${baseRoot}/${currentCat.folder}/review.html`; }
    );

    smartNav('page-prev', 
        () => {
            if (isReview) {
                window.location.href = `${baseRoot}/${currentCat.folder}/lessons/lesson${currentCat.totalLessons}.html`;
            } else if (currentLessonNum > 1) {
                window.location.href = `${baseRoot}/${currentCat.folder}/lessons/lesson${currentLessonNum - 1}.html`;
            } else if (currentLessonNum === 1) {
                window.location.href = `${baseRoot}/${currentCat.folder}/index.html`;
            }
        },
        () => { if(currentCat.folder !== '') window.location.href = `${baseRoot}/${currentCat.folder}/index.html`; }
    );

    smartNav('section-next', 
        () => {
            const nextIdx = (currentCatIndex + 1) % categories.length;
            const targetFolder = categories[nextIdx].folder;
            window.location.href = targetFolder === '' ? `${baseRoot}/index.html` : `${baseRoot}/${targetFolder}/index.html`;
        },
        () => { window.location.href = `${baseRoot}/ai/index.html`; }
    );

    smartNav('section-prev', 
        () => {
            const prevIdx = (currentCatIndex - 1 + categories.length) % categories.length;
            const targetFolder = categories[prevIdx].folder;
            window.location.href = targetFolder === '' ? `${baseRoot}/index.html` : `${baseRoot}/${targetFolder}/index.html`;
        },
        () => { window.location.href = `${baseRoot}/index.html`; }
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
            pageLabel.innerText = isReview ? "Review" : "Index";
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
                const contentElements = card.querySelectorAll('p, h3, div'); 
                let matchFound = false;

                contentElements.forEach(el => {
                    const originalText = el.textContent;
                    if (term !== "" && originalText.toLowerCase().includes(lowerTerm)) {
                        const regex = new RegExp(`(${term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
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

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const term = searchInput.value.trim();
                if (term !== "" && currentSearchMode > 0) {
                    const isSection = (currentSearchMode === 1);
                    // Динамичен домейн за Google търсене
                    const domain = isLocal ? '127.0.0.1:5501' : 'programmihg.github.io/LocalSystem';
                    const siteConstraint = isSection ? `site:${domain}/${currentCat.folder}/` : `site:${domain}/`;
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