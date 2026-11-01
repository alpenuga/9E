// === Глобальные переменные ===
let allBooks = [];
let allSubjects = [];
let allParagraphs = [];
let paragraphBm25 = new ParagraphBM25();
let currentSubjectFilter = 'all';
let currentLanguageFilter = 'all';
let currentDictTab = 'synonyms';
let currentDictLanguage = 'uz';

// === Инициализация приложения ===
document.addEventListener('DOMContentLoaded', async () => {
    initializeTheme();
    await loadData();
    setupEventListeners();
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('ServiceWorker зарегистрирован:', registration.scope))
                .catch(error => console.error('Ошибка регистрации ServiceWorker:', error));
        });
    }
});

// === Тема ===
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeButton(initialTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const button = document.getElementById('themeToggle');
    button.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// === Загрузка данных ===
async function loadData() {
    try {
        allBooks = await getAllBooks();
        allSubjects = await getAllSubjects();
        allParagraphs = await getAllParagraphs();

        paragraphBm25 = new ParagraphBM25();
        await paragraphBm25.loadDictionaries();
        allParagraphs.forEach(paragraph => paragraphBm25.addParagraph(paragraph));

        updateSubjectFilter();
        updateLanguageFilter();
        updateDictLanguageFilter();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Ошибка загрузки данных. Попробуйте перезагрузить страницу.');
    }
}

// === Настройка обработчиков ===
function setupEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Вкладки
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.getAttribute('data-tab')));
    });

    // Вкладки словарей
    document.querySelectorAll('.dictionary-tab').forEach(button => {
        button.addEventListener('click', () => switchDictTab(button.getAttribute('data-dict-tab')));
    });

    // Поиск
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchQuery').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Фильтры поиска
    document.getElementById('subjectFilter').addEventListener('change', (e) => {
        currentSubjectFilter = e.target.value;
    });
    document.getElementById('languageFilter').addEventListener('change', (e) => {
        currentLanguageFilter = e.target.value;
    });

    // Голосовой поиск
    document.getElementById('voiceSearchBtn').addEventListener('click', startVoiceSearch);

    // Загрузка файлов
    document.getElementById('loadFilesBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);

    // Экспорт/Импорт
    document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
    document.getElementById('importJsonBtn').addEventListener('click', () => {
        document.getElementById('importJsonInput').click();
    });
    document.getElementById('importJsonInput').addEventListener('change', handleJsonImport);

    // Учебники
    document.getElementById('booksSearchBtn').addEventListener('click', performBooksSearch);
    document.getElementById('booksSearchQuery').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performBooksSearch();
    });
    document.getElementById('booksSubjectFilter').addEventListener('change', performBooksSearch);

    // Словари
    document.getElementById('dictLanguageFilter').addEventListener('change', (e) => {
        currentDictLanguage = e.target.value;
        loadDictionaries();
    });
    document.getElementById('addDictEntryBtn').addEventListener('click', () => {
        openDictEntryModal('add');
    });
    document.getElementById('loadDictsFromGitHubBtn').addEventListener('click', loadDictsFromGitHub);

    // Модальные окна
    document.getElementById('cancelSubjectBtn').addEventListener('click', () => {
        document.getElementById('subjectModal').style.display = 'none';
    });
    document.getElementById('addSubjectBtn').addEventListener('click', addNewSubject);
    document.getElementById('cancelDictEntryBtn').addEventListener('click', () => {
        document.getElementById('dictEntryModal').style.display = 'none';
    });
    document.getElementById('saveDictEntryBtn').addEventListener('click', saveDictEntry);
}

// === Вкладки ===
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'books') displayBooks();
    else if (tabName === 'dictionaries') loadDictionaries();
}

function switchDictTab(tabName) {
    currentDictTab = tabName;
    document.querySelectorAll('.dictionary-tab').forEach(button => button.classList.remove('active'));
    document.querySelector(`[data-dict-tab="${tabName}"]`).classList.add('active');
    loadDictionaries();
}

// === Фильтры ===
function updateSubjectFilter() {
    const subjectFilter = document.getElementById('subjectFilter');
    const booksSubjectFilter = document.getElementById('booksSubjectFilter');
    subjectFilter.innerHTML = '<option value="all">Все предметы</option>';
    booksSubjectFilter.innerHTML = '<option value="all">Все предметы</option>';
    allSubjects.sort().forEach(subject => {
        const option1 = document.createElement('option');
        option1.value = subject;
        option1.textContent = subject;
        subjectFilter.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = subject;
        option2.textContent = subject;
        booksSubjectFilter.appendChild(option2);
    });
}

function updateLanguageFilter() {
    const languageFilter = document.getElementById('languageFilter');
    languageFilter.innerHTML = `
        <option value="all">Все языки</option>
        <option value="uz">Узбекский</option>
        <option value="en">Английский</option>
        <option value="ru">Русский</option>
    `;
}

function updateDictLanguageFilter() {
    const dictLanguageFilter = document.getElementById('dictLanguageFilter');
    dictLanguageFilter.innerHTML = `
        <option value="uz">Узбекский</option>
        <option value="en">Английский</option>
        <option value="ru">Русский</option>
    `;
    currentDictLanguage = dictLanguageFilter.value;
}

// === Поиск ===
async function performSearch() {
    const query = document.getElementById('searchQuery').value.trim();
    const resultsContainer = document.getElementById('results');

    if (!query) {
        showError('Введите запрос для поиска.');
        return;
    }

    resultsContainer.innerHTML = '<div class="loading">🔍 Идет поиск...</div>';

    try {
        let filteredParagraphs = allParagraphs;

        if (currentSubjectFilter !== 'all') {
            filteredParagraphs = filteredParagraphs.filter(p => p.subject === currentSubjectFilter);
        }

        if (currentLanguageFilter !== 'all') {
            filteredParagraphs = filteredParagraphs.filter(p => {
                const lang = paragraphBm25.detectLanguage(p.content);
                return lang === currentLanguageFilter;
            });
        }

        if (filteredParagraphs.length === 0) {
            resultsContainer.innerHTML = '<p class="placeholder">Нет параграфов по выбранным фильтрам.</p>';
            return;
        }

        const tempBm25 = new ParagraphBM25();
        await tempBm25.loadDictionaries();
        filteredParagraphs.forEach(para => tempBm25.addParagraph(para));

        const results = tempBm25.search(query, 20);
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="placeholder">Ничего не найдено.</p>';
            return;
        }

        displayParagraphResults(results);
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        showError('Ошибка при выполнении поиска.');
    }
}

function displayParagraphResults(results) {
    const resultsContainer = document.getElementById('results');
    let html = '';

    results.forEach(result => {
        const book = allBooks.find(b => b.id === result.bookId);
        const bookTitle = book ? book.title : 'Неизвестный учебник';
        const relevantFragment = paragraphBm25.getRelevantFragment(result, document.getElementById('searchQuery').value.trim());
        const language = paragraphBm25.detectLanguage(result.content);
        const languageName = getLanguageName(language);

        html += `
            <div class="paragraph-card" data-paragraph-id="${result.id}">
                <div class="paragraph-header">
                    <div class="paragraph-title">
                        <h3>${bookTitle}</h3>
                        <span class="subject-tag">${result.subject}</span>
                        <span class="language-tag">${languageName}</span>
                    </div>
                    <div class="paragraph-score">Рейтинг: ${result.score.toFixed(2)}</div>
                </div>
                <div class="paragraph-content">
                    <p>${highlightText(relevantFragment, document.getElementById('searchQuery').value.trim())}</p>
                </div>
                <div class="paragraph-actions">
                    <button onclick="showFullParagraph(${result.id})" class="btn-small">Читать полностью</button>
                    <button onclick="showBook(${result.bookId})" class="btn-small">Открыть учебник</button>
                    <button onclick="deleteParagraph(${result.id})" class="btn-small btn-delete">Удалить</button>
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

// === Учебники ===
async function displayBooks() {
    const container = document.getElementById('booksList');
    let html = '';

    if (allBooks.length === 0) {
        html = '<p class="placeholder">Нет загруженных учебников.</p>';
    } else {
        const filteredBooks = allBooks.filter(book => {
            const subjectFilter = document.getElementById('booksSubjectFilter').value;
            const searchQuery = document.getElementById('booksSearchQuery').value.toLowerCase();
            if (subjectFilter !== 'all' && book.subject !== subjectFilter) return false;
            if (searchQuery && !book.title.toLowerCase().includes(searchQuery)) return false;
            return true;
        });

        if (filteredBooks.length === 0) {
            html = '<p class="placeholder">Учебники не найдены.</p>';
        } else {
            filteredBooks.forEach(book => {
                const paragraphsCount = allParagraphs.filter(p => p.bookId === book.id).length;
                html += `
                    <div class="book-card" data-book-id="${book.id}">
                        <div class="book-card-header">
                            <h3 class="book-card-title">${book.title}</h3>
                            <span class="subject-tag">${book.subject}</span>
                        </div>
                        <div class="book-card-info">
                            <p>Параграфов: ${paragraphsCount}</p>
                        </div>
                        <div class="book-card-actions">
                            <button onclick="showBook(${book.id})" class="btn-small">Открыть</button>
                            <button onclick="deleteBook(${book.id}, '${book.title}')" class="btn-small btn-delete">Удалить</button>
                        </div>
                    </div>
                `;
            });
        }
    }

    container.innerHTML = html;
}

async function performBooksSearch() {
    displayBooks();
}

// === Словари ===
async function loadDictionaries() {
    try {
        let data;
        if (currentDictTab === 'synonyms') data = await getSynonyms(currentDictLanguage);
        else if (currentDictTab === 'stopwords') data = await getStopwords(currentDictLanguage);
        else if (currentDictTab === 'stemming') data = await getStemmingRules(currentDictLanguage);
        displayDictionaries(data);
    } catch (error) {
        console.error('Ошибка загрузки словарей:', error);
        showError('Ошибка загрузки словарей.');
    }
}

function displayDictionaries(data) {
    const container = document.getElementById('dictionariesList');
    let html = '';

    if (data.length === 0) {
        html = '<p class="placeholder">Нет записей в этом словаре.</p>';
    } else {
        data.forEach(entry => {
            if (currentDictTab === 'synonyms') {
                html += `
                    <div class="dictionary-entry" data-id="${entry.id}" data-type="synonym">
                        <div class="dictionary-entry-content">
                            <div class="dictionary-entry-term">${entry.term}</div>
                            <div class="dictionary-entry-synonyms">Синонимы: ${entry.synonyms.join(', ')}</div>
                        </div>
                        <div class="dictionary-entry-actions">
                            <button onclick="editDictEntry(${entry.id}, 'synonym')" class="btn-small">✏️</button>
                            <button onclick="deleteDictEntry(${entry.id}, 'synonym')" class="btn-small btn-delete">❌</button>
                        </div>
                    </div>
                `;
            } else if (currentDictTab === 'stopwords') {
                html += `
                    <div class="dictionary-entry" data-id="${entry.id}" data-type="stopword">
                        <div class="dictionary-entry-content">
                            <div class="dictionary-entry-term">${entry.term}</div>
                        </div>
                        <div class="dictionary-entry-actions">
                            <button onclick="deleteDictEntry(${entry.id}, 'stopword')" class="btn-small btn-delete">❌</button>
                        </div>
                    </div>
                `;
            } else if (currentDictTab === 'stemming') {
                html += `
                    <div class="dictionary-entry" data-id="${entry.id}" data-type="stemming">
                        <div class="dictionary-entry-content">
                            <div class="dictionary-entry-term">${entry.term}</div>
                            <div class="dictionary-entry-stem">Стем: ${entry.stem}</div>
                        </div>
                        <div class="dictionary-entry-actions">
                            <button onclick="editDictEntry(${entry.id}, 'stemming')" class="btn-small">✏️</button>
                            <button onclick="deleteDictEntry(${entry.id}, 'stemming')" class="btn-small btn-delete">❌</button>
                        </div>
                    </div>
                `;
            }
        });
    }

    container.innerHTML = html;
}

// === Работа с записями словарей ===
function openDictEntryModal(mode, id = null, type = null) {
    const modal = document.getElementById('dictEntryModal');
    const title = document.getElementById('dictEntryModalTitle');
    const form = document.getElementById('dictEntryForm');

    if (mode === 'add') {
        title.textContent = `Добавить ${getDictTypeName(currentDictTab)}`;
        if (currentDictTab === 'synonyms') {
            form.innerHTML = `
                <div class="form-group">
                    <label for="dictTermInput">Термин:</label>
                    <input type="text" id="dictTermInput" placeholder="Введите термин">
                </div>
                <div class="form-group">
                    <label for="dictSynonymsInput">Синонимы (через запятую):</label>
                    <input type="text" id="dictSynonymsInput" placeholder="синоним1, синоним2">
                </div>
            `;
        } else if (currentDictTab === 'stopwords') {
            form.innerHTML = `
                <div class="form-group">
                    <label for="dictTermInput">Стоп-слово:</label>
                    <input type="text" id="dictTermInput" placeholder="Введите стоп-слово">
                </div>
            `;
        } else if (currentDictTab === 'stemming') {
            form.innerHTML = `
                <div class="form-group">
                    <label for="dictTermInput">Термин:</label>
                    <input type="text" id="dictTermInput" placeholder="Введите термин">
                </div>
                <div class="form-group">
                    <label for="dictStemInput">Стем:</label>
                    <input type="text" id="dictStemInput" placeholder="Введите основу слова">
                </div>
            `;
        }
    } else if (mode === 'edit' && id && type) {
        loadDictEntryForEdit(id, type);
    }

    modal.style.display = 'flex';
}

async function loadDictEntryForEdit(id, type) {
    const title = document.getElementById('dictEntryModalTitle');
    const form = document.getElementById('dictEntryForm');
    title.textContent = `Редактировать ${getDictTypeName(type)}`;

    try {
        let entry;
        if (type === 'synonym') {
            entry = await getSynonymById(id);
            form.innerHTML = `
                <div class="form-group">
                    <label for="dictTermInput">Термин:</label>
                    <input type="text" id="dictTermInput" value="${entry.term}">
                </div>
                <div class="form-group">
                    <label for="dictSynonymsInput">Синонимы (через запятую):</label>
                    <input type="text" id="dictSynonymsInput" value="${entry.synonyms.join(', ')}">
                </div>
                <input type="hidden" id="dictEntryId" value="${id}">
                <input type="hidden" id="dictEntryType" value="${type}">
            `;
        } else if (type === 'stopword') {
            entry = await getStopwordById(id);
            form.innerHTML = `
                <div class="form-group">
                    <label for="dictTermInput">Стоп-слово:</label>
                    <input type="text" id="dictTermInput" value="${entry.term}">
                </div>
                <input type="hidden" id="dictEntryId" value="${id}">
                <input type="hidden" id="dictEntryType" value="${type}">
            `;
        } else if (type === 'stemming') {
            entry = await getStemmingRuleById(id);
            form.innerHTML = `
                <div class="form-group">
                    <label for="dictTermInput">Термин:</label>
                    <input type="text" id="dictTermInput" value="${entry.term}">
                </div>
                <div class="form-group">
                    <label for="dictStemInput">Стем:</label>
                    <input type="text" id="dictStemInput" value="${entry.stem}">
                </div>
                <input type="hidden" id="dictEntryId" value="${id}">
                <input type="hidden" id="dictEntryType" value="${type}">
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки записи:', error);
        showError('Ошибка загрузки записи.');
    }
}

function getDictTypeName(type) {
    const types = {
        'synonyms': 'синоним',
        'synonym': 'синоним',
        'stopwords': 'стоп-слово',
        'stopword': 'стоп-слово',
        'stemming': 'правило стемминга',
        'stemming_rule': 'правило стемминга'
    };
    return types[type] || 'запись';
}

async function saveDictEntry() {
    const termInput = document.getElementById('dictTermInput');
    const term = termInput.value.trim();
    if (!term) {
        showError('Введите термин.');
        return;
    }

    try {
        if (currentDictTab === 'synonyms') {
            const synonymsInput = document.getElementById('dictSynonymsInput');
            const synonyms = synonymsInput.value.split(',').map(s => s.trim()).filter(s => s);
            if (synonyms.length === 0) {
                showError('Введите хотя бы один синоним.');
                return;
            }
            const entryId = document.getElementById('dictEntryId')?.value;
            if (entryId) {
                await updateSynonym(parseInt(entryId), term, synonyms, currentDictLanguage);
                showSuccess('Синоним обновлён!');
            } else {
                await addSynonym(term, synonyms, currentDictLanguage);
                showSuccess('Синоним добавлен!');
            }
        } else if (currentDictTab === 'stopwords') {
            const entryId = document.getElementById('dictEntryId')?.value;
            if (entryId) {
                await updateStopword(parseInt(entryId), term, currentDictLanguage);
                showSuccess('Стоп-слово обновлено!');
            } else {
                await addStopword(term, currentDictLanguage);
                showSuccess('Стоп-слово добавлено!');
            }
        } else if (currentDictTab === 'stemming') {
            const stemInput = document.getElementById('dictStemInput');
            const stem = stemInput.value.trim();
            if (!stem) {
                showError('Введите стем.');
                return;
            }
            const entryId = document.getElementById('dictEntryId')?.value;
            if (entryId) {
                await updateStemmingRule(parseInt(entryId), term, stem, currentDictLanguage);
                showSuccess('Правило стемминга обновлено!');
            } else {
                await addStemmingRule(term, stem, currentDictLanguage);
                showSuccess('Правило стемминга добавлено!');
            }
        }

        await loadDictionaries();
        document.getElementById('dictEntryModal').style.display = 'none';
        paragraphBm25 = new ParagraphBM25();
        await paragraphBm25.loadDictionaries();
        allParagraphs.forEach(paragraph => paragraphBm25.addParagraph(paragraph));
    } catch (error) {
        console.error('Ошибка сохранения записи:', error);
        showError('Ошибка сохранения записи: ' + error.message);
    }
}

function editDictEntry(id, type) {
    openDictEntryModal('edit', id, type);
}

async function deleteDictEntry(id, type) {
    if (!confirm('Удалить эту запись?')) return;
    try {
        if (type === 'synonym') await deleteSynonym(id);
        else if (type === 'stopword') await deleteStopword(id);
        else if (type === 'stemming') await deleteStemmingRule(id);
        showSuccess('Запись удалена.');
        await loadDictionaries();
        paragraphBm25 = new ParagraphBM25();
        await paragraphBm25.loadDictionaries();
        allParagraphs.forEach(paragraph => paragraphBm25.addParagraph(paragraph));
    } catch (error) {
        showError('Ошибка удаления записи: ' + error.message);
    }
}

// === Загрузка файлов ===
async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    document.getElementById('fileCount').textContent = `Выбрано: ${files.length} файлов`;

    for (const file of files) {
        try {
            let content = '';
            const fileName = file.name.replace(/\.[^/.]+$/, "");

            if (file.name.endsWith('.pdf')) content = await extractTextFromPdf(file);
            else if (file.name.endsWith('.txt')) content = await extractTextFromTxt(file);
            else if (file.name.endsWith('.docx')) content = await extractTextFromDocx(file);
            else {
                showError(`Неподдерживаемый формат файла: ${file.name}`);
                continue;
            }

            const detectedLanguage = paragraphBm25.detectLanguage(content);
            let subject = currentSubjectFilter !== 'all' ? currentSubjectFilter : null;
            if (!subject || !allSubjects.includes(subject)) {
                subject = prompt(`Введите предмет для учебника "${file.name}" (язык: ${getLanguageName(detectedLanguage)}):`, allSubjects[0] || 'Математика');
                if (!subject) continue;
                if (!allSubjects.includes(subject)) {
                    await addSubject(subject);
                    allSubjects.push(subject);
                    updateSubjectFilter();
                }
            }

            const bookId = await addBook(fileName, subject, content, file.name);
            const paragraphs = content.split(/\n\n+/);
            for (const para of paragraphs) {
                if (para.trim().length > 20) {
                    await addParagraph(bookId, subject, para.trim());
                }
            }
            showSuccess(`Учебник "${fileName}" добавлен! (Язык: ${getLanguageName(detectedLanguage)})`);
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            showError(`Ошибка при загрузке файла ${file.name}: ${error.message}`);
        }
    }

    await loadData();
    event.target.value = '';
    document.getElementById('fileCount').textContent = 'Выбрано: 0 файлов';
}

// === Просмотр параграфов и книг ===
async function showFullParagraph(paragraphId) {
    const paragraph = allParagraphs.find(p => p.id === paragraphId);
    if (!paragraph) return;
    const book = allBooks.find(b => b.id === paragraph.bookId);
    const bookTitle = book ? book.title : 'Неизвестный учебник';
    const language = paragraphBm25.detectLanguage(paragraph.content);
    const languageName = getLanguageName(language);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <h2>${bookTitle}</h2>
            <p><strong>Предмет:</strong> ${paragraph.subject}</p>
            <p><strong>Язык:</strong> ${languageName}</p>
            <div class="paragraph-full-content">
                <pre>${paragraph.content}</pre>
            </div>
            <div class="modal-actions">
                <button onclick="showBook(${paragraph.bookId})" class="btn-small">Открыть учебник</button>
                <button onclick="deleteParagraph(${paragraph.id})" class="btn-small btn-delete">Удалить параграф</button>
                <button onclick="this.closest('.modal').remove()" class="btn-small">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function showBook(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;
    const paragraphs = allParagraphs.filter(p => p.bookId === bookId);

    const modal = document.createElement('div');
    modal.className = 'modal';
    let html = `
        <div class="modal-content modal-large">
            <h2>${book.title}</h2>
            <p><strong>Предмет:</strong> ${book.subject}</p>
            <p><strong>Количество параграфов:</strong> ${paragraphs.length}</p>
            <div class="book-paragraphs">
    `;

    paragraphs.forEach((para, index) => {
        const language = paragraphBm25.detectLanguage(para.content);
        const languageName = getLanguageName(language);
        html += `
            <div class="paragraph-card-in-book">
                <div class="paragraph-header-in-book">
                    <span class="paragraph-number">Параграф ${index + 1}</span>
                    <span class="language-tag">${languageName}</span>
                </div>
                <div class="paragraph-content-in-book">
                    <p>${para.content}</p>
                </div>
                <div class="paragraph-actions-in-book">
                    <button onclick="showFullParagraph(${para.id})" class="btn-small">Подробнее</button>
                    <button onclick="deleteParagraph(${para.id})" class="btn-small btn-delete">Удалить</button>
                </div>
            </div>
        `;
    });

    html += `
            </div>
            <div class="modal-actions">
                <button onclick="deleteBook(${book.id}, '${book.title}')" class="btn-small btn-delete">Удалить учебник</button>
                <button onclick="this.closest('.modal').remove()" class="btn-small">Закрыть</button>
            </div>
        </div>
    `;
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

// === Удаление ===
async function deleteParagraph(paragraphId) {
    if (!confirm('Удалить этот параграф?')) return;
    try {
        await deleteParagraph(paragraphId);
        showSuccess('Параграф удалён.');
        await loadData();
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab.id === 'search') performSearch();
        else if (activeTab.id === 'books') displayBooks();
    } catch (error) {
        showError('Ошибка удаления параграфа: ' + error.message);
    }
}

async function deleteBook(bookId, bookTitle) {
    if (!confirm(`Удалить учебник "${bookTitle}" и все его параграфы?`)) return;
    try {
        await deleteParagraphsByBookId(bookId);
        await deleteBook(bookId);
        showSuccess(`Учебник "${bookTitle}" и все его параграфы удалены.`);
        await loadData();
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab.id === 'search') performSearch();
        else if (activeTab.id === 'books') displayBooks();
    } catch (error) {
        showError('Ошибка удаления учебника: ' + error.message);
    }
}

// === Предметы ===
async function addNewSubject() {
    const subjectName = document.getElementById('newSubjectInput').value.trim();
    if (!subjectName) {
        showError('Введите название предмета.');
        return;
    }
    if (allSubjects.includes(subjectName)) {
        showError('Этот предмет уже существует.');
        return;
    }
    try {
        await addSubject(subjectName);
        allSubjects.push(subjectName);
        updateSubjectFilter();
        document.getElementById('subjectModal').style.display = 'none';
        document.getElementById('newSubjectInput').value = '';
        showSuccess(`Предмет "${subjectName}" добавлен!`);
    } catch (error) {
        showError('Ошибка при добавлении предмета: ' + error.message);
    }
}

// === Экспорт/Импорт ===
async function exportJson() {
    try {
        const jsonData = await exportToJson();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `school_assistant_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccess('Экспорт завершён!');
    } catch (error) {
        console.error('Ошибка при экспорте:', error);
        showError('Ошибка при экспорте данных.');
    }
}

async function handleJsonImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const jsonData = await file.text();
        await importFromJson(jsonData);
        showSuccess('Импорт завершён! Данные обновлены.');
        await loadData();
    } catch (error) {
        console.error('Ошибка при импорте:', error);
        showError('Ошибка при импорте данных: ' + error.message);
    }
    event.target.value = '';
}

// === Загрузка словарей с GitHub ===
async function loadDictsFromGitHub() {
    const confirmLoad = confirm('Загрузить стандартные словари с GitHub? Это перезапишет текущие словари (синонимы, стоп-слова, стемминг).');
    if (!confirmLoad) return;

    showLoadingInTab('dictionaries', 'Загрузка словарей с GitHub...');

    try {
        const dictsUrl = 'https://cdn.jsdelivr.net/gh/your-username/school-assistant-pwa@main/dicts.json';
        const response = await fetch(dictsUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.text();
        await importDictionariesFromJson(jsonData);
        showSuccess('Словари успешно загружены с GitHub!');
        await loadDictionaries();
        paragraphBm25 = new ParagraphBM25();
        await paragraphBm25.loadDictionaries();
        allParagraphs.forEach(paragraph => paragraphBm25.addParagraph(paragraph));
    } catch (error) {
        console.error('Ошибка загрузки словарей:', error);
        showError('Ошибка загрузки словарей: ' + error.message);
    } finally {
        hideLoadingInTab('dictionaries');
    }
}

function showLoadingInTab(tabId, message) {
    const container = document.getElementById(tabId);
    if (!container) return;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'alert alert-info';
    loadingDiv.textContent = message;
    container.querySelector('.tab-content')?.prepend(loadingDiv);
}

function hideLoadingInTab(tabId) {
    const container = document.getElementById(tabId);
    if (!container) return;
    const loadingDiv = container.querySelector('.alert-info');
    if (loadingDiv) loadingDiv.remove();
}

// === Голосовой поиск ===
function startVoiceSearch() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ru-RU';
    recognition.start();
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('searchQuery').value = transcript;
        performSearch();
    };
    recognition.onerror = (event) => {
        showError('Ошибка распознавания речи: ' + event.error);
    };
}

// === Вспомогательные функции ===
function highlightText(text, query) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    let highlightedText = text;
    queryTerms.forEach(term => {
        const regex = new RegExp(term, 'gi');
        highlightedText = highlightedText.replace(regex, match => `<span class="highlight">${match}</span>`);
    });
    return highlightedText;
}

function getLanguageName(code) {
    const languages = {
        'uz': 'Узбекский',
        'en': 'Английский',
        'ru': 'Русский'
    };
    return languages[code] || 'Неизвестный';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = message;
    const activeTab = document.querySelector('.tab-content.active');
    (activeTab || document.getElementById('results')).prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    const activeTab = document.querySelector('.tab-content.active');
    (activeTab || document.getElementById('results')).prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

// === Глобальные функции для HTML ===
window.showFullParagraph = showFullParagraph;
window.showBook = showBook;
window.deleteParagraph = deleteParagraph;
window.deleteBook = deleteBook;
window.editDictEntry = editDictEntry;
window.deleteDictEntry = deleteDictEntry;
