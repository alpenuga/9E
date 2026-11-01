const DB_NAME = 'SchoolAssistantDB';
const DB_VERSION = 4;

let db;
const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
        db = event.target.result;

        if (!db.objectStoreNames.contains('books')) {
            const booksStore = db.createObjectStore('books', { keyPath: 'id', autoIncrement: true });
            booksStore.createIndex('title', 'title', { unique: false });
            booksStore.createIndex('subject', 'subject', { unique: false });
        }

        if (!db.objectStoreNames.contains('paragraphs')) {
            const paragraphsStore = db.createObjectStore('paragraphs', { keyPath: 'id', autoIncrement: true });
            paragraphsStore.createIndex('bookId', 'bookId', { unique: false });
            paragraphsStore.createIndex('subject', 'subject', { unique: false });
        }

        if (!db.objectStoreNames.contains('subjects')) {
            db.createObjectStore('subjects', { keyPath: 'name', unique: true });
        }

        if (!db.objectStoreNames.contains('synonyms')) {
            const synonymsStore = db.createObjectStore('synonyms', { keyPath: 'id', autoIncrement: true });
            synonymsStore.createIndex('term', 'term', { unique: false });
            synonymsStore.createIndex('language', 'language', { unique: false });
        }

        if (!db.objectStoreNames.contains('stopwords')) {
            const stopwordsStore = db.createObjectStore('stopwords', { keyPath: 'id', autoIncrement: true });
            stopwordsStore.createIndex('term', 'term', { unique: false });
            stopwordsStore.createIndex('language', 'language', { unique: false });
        }

        if (!db.objectStoreNames.contains('stemming_rules')) {
            const stemmingStore = db.createObjectStore('stemming_rules', { keyPath: 'id', autoIncrement: true });
            stemmingStore.createIndex('term', 'term', { unique: false });
            stemmingStore.createIndex('language', 'language', { unique: false });
        }
    };

    request.onsuccess = () => {
        db = request.result;
        resolve(db);
    };
    request.onerror = () => reject(request.error);
});

// === УЧЕБНИКИ ===
async function addBook(title, subject, content, filePath = null) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('books', 'readwrite');
        const store = transaction.objectStore('books');
        const book = { title, subject, content, filePath, timestamp: Date.now() };
        const request = store.add(book);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllBooks() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('books', 'readonly');
        const store = transaction.objectStore('books');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteBook(id) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('books', 'readwrite');
        const store = transaction.objectStore('books');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// === ПАРАГРАФЫ ===
async function addParagraph(bookId, subject, content) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('paragraphs', 'readwrite');
        const store = transaction.objectStore('paragraphs');
        const paragraph = { bookId, subject, content, timestamp: Date.now() };
        const request = store.add(paragraph);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllParagraphs() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('paragraphs', 'readonly');
        const store = transaction.objectStore('paragraphs');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteParagraph(id) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('paragraphs', 'readwrite');
        const store = transaction.objectStore('paragraphs');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteParagraphsByBookId(bookId) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('paragraphs', 'readwrite');
        const store = transaction.objectStore('paragraphs');
        const index = store.index('bookId');
        const request = index.openCursor(IDBKeyRange.only(bookId));
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            } else {
                resolve();
            }
        };
        request.onerror = () => reject(request.error);
    });
}

// === ПРЕДМЕТЫ ===
async function addSubject(name) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('subjects', 'readwrite');
        const store = transaction.objectStore('subjects');
        const request = store.add({ name });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getAllSubjects() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('subjects', 'readonly');
        const store = transaction.objectStore('subjects');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.map(s => s.name));
        request.onerror = () => reject(request.error);
    });
}

// === СИНОНИМЫ ===
async function addSynonym(term, synonyms, language = 'ru') {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('synonyms', 'readwrite');
        const store = transaction.objectStore('synonyms');
        const request = store.add({ term, synonyms, language, timestamp: Date.now() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getSynonyms(language = 'ru') {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('synonyms', 'readonly');
        const store = transaction.objectStore('synonyms');
        const index = store.index('language');
        const request = index.getAll(language);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getSynonymById(id) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('synonyms', 'readonly');
        const store = transaction.objectStore('synonyms');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateSynonym(id, term, synonyms, language) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('synonyms', 'readwrite');
        const store = transaction.objectStore('synonyms');
        const request = store.put({ id, term, synonyms, language, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteSynonym(id) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('synonyms', 'readwrite');
        const store = transaction.objectStore('synonyms');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// === СТОП-СЛОВА ===
async function addStopword(term, language = 'ru') {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stopwords', 'readwrite');
        const store = transaction.objectStore('stopwords');
        const request = store.add({ term, language, timestamp: Date.now() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getStopwords(language = 'ru') {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stopwords', 'readonly');
        const store = transaction.objectStore('stopwords');
        const index = store.index('language');
        const request = index.getAll(language);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getStopwordById(id) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stopwords', 'readonly');
        const store = transaction.objectStore('stopwords');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateStopword(id, term, language) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stopwords', 'readwrite');
        const store = transaction.objectStore('stopwords');
        const request = store.put({ id, term, language, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteStopword(id) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stopwords', 'readwrite');
        const store = transaction.objectStore('stopwords');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// === ПРАВИЛА СТЕММИНГА ===
async function addStemmingRule(term, stem, language = 'ru') {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stemming_rules', 'readwrite');
        const store = transaction.objectStore('stemming_rules');
        const request = store.add({ term, stem, language, timestamp: Date.now() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getStemmingRules(language = 'ru') {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stemming_rules', 'readonly');
        const store = transaction.objectStore('stemming_rules');
        const index = store.index('language');
        const request = index.getAll(language);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getStemmingRuleById(id) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stemming_rules', 'readonly');
        const store = transaction.objectStore('stemming_rules');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateStemmingRule(id, term, stem, language) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stemming_rules', 'readwrite');
        const store = transaction.objectStore('stemming_rules');
        const request = store.put({ id, term, stem, language, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteStemmingRule(id) {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stemming_rules', 'readwrite');
        const store = transaction.objectStore('stemming_rules');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// === ЭКСПОРТ/ИМПОРТ ===
async function exportToJson() {
    try {
        const books = await getAllBooks();
        const subjects = await getAllSubjects();
        const paragraphs = await getAllParagraphs();
        const synonyms = await getAllSynonyms();
        const stopwords = await getAllStopwords();
        const stemmingRules = await getAllStemmingRules();
        return JSON.stringify({ books, subjects, paragraphs, synonyms, stopwords, stemmingRules }, null, 2);
    } catch (error) {
        console.error('Ошибка при экспорте:', error);
        throw error;
    }
}

async function importFromJson(jsonString) {
    const data = JSON.parse(jsonString);
    const transaction = db.transaction(
        ['books', 'subjects', 'paragraphs', 'synonyms', 'stopwords', 'stemming_rules'],
        'readwrite'
    );
    const booksStore = transaction.objectStore('books');
    const subjectsStore = transaction.objectStore('subjects');
    const paragraphsStore = transaction.objectStore('paragraphs');
    const synonymsStore = transaction.objectStore('synonyms');
    const stopwordsStore = transaction.objectStore('stopwords');
    const stemmingStore = transaction.objectStore('stemming_rules');

    await clearAllBooks();
    await clearAllSubjects();
    await clearAllParagraphs();
    await clearAllSynonyms();
    await clearAllStopwords();
    await clearAllStemmingRules();

    data.subjects?.forEach(subject => subjectsStore.add({ name: subject }));
    data.books?.forEach(book => booksStore.add(book));
    data.paragraphs?.forEach(paragraph => paragraphsStore.add(paragraph));
    data.synonyms?.forEach(syn => synonymsStore.add(syn));
    data.stopwords?.forEach(sw => stopwordsStore.add(sw));
    data.stemmingRules?.forEach(rule => stemmingStore.add(rule));

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

async function getAllSynonyms() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('synonyms', 'readonly');
        const store = transaction.objectStore('synonyms');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllStopwords() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stopwords', 'readonly');
        const store = transaction.objectStore('stopwords');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllStemmingRules() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stemming_rules', 'readonly');
        const store = transaction.objectStore('stemming_rules');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function clearAllBooks() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('books', 'readwrite');
        const store = transaction.objectStore('books');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAllSubjects() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('subjects', 'readwrite');
        const store = transaction.objectStore('subjects');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAllParagraphs() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('paragraphs', 'readwrite');
        const store = transaction.objectStore('paragraphs');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAllSynonyms() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('synonyms', 'readwrite');
        const store = transaction.objectStore('synonyms');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAllStopwords() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stopwords', 'readwrite');
        const store = transaction.objectStore('stopwords');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAllStemmingRules() {
    await dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('stemming_rules', 'readwrite');
        const store = transaction.objectStore('stemming_rules');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Импорт только словарей из JSON
async function importDictionariesFromJson(jsonString) {
    const data = JSON.parse(jsonString);
    const transaction = db.transaction(
        ['synonyms', 'stopwords', 'stemming_rules'],
        'readwrite'
    );
    const synonymsStore = transaction.objectStore('synonyms');
    const stopwordsStore = transaction.objectStore('stopwords');
    const stemmingStore = transaction.objectStore('stemming_rules');

    await clearAllSynonyms();
    await clearAllStopwords();
    await clearAllStemmingRules();

    data.synonyms?.forEach(syn => synonymsStore.add(syn));
    data.stopwords?.forEach(sw => stopwordsStore.add(sw));
    data.stemming_rules?.forEach(rule => stemmingStore.add(rule));

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}
