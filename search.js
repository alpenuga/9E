// === Porter Stemmer (для английского) ===
function isVowel(char) {
    return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
}

function containsVowel(str) {
    for (let i = 0; i < str.length; i++) {
        if (isVowel(str[i])) return true;
    }
    return false;
}

function porterStemmer(word) {
    if (word.length < 3) return word;

    // Шаг 1a
    if (word.endsWith('sses')) return word.slice(0, -4) + 'ss';
    if (word.endsWith('ies')) return word.slice(0, -3) + 'i';
    if (word.endsWith('ss')) return word;
    if (word.endsWith('s')) return word.slice(0, -1);

    // Шаг 1b
    if (word.endsWith('eed')) {
        if (word.slice(-4, -3) === word.slice(-3, -2)) return word.slice(0, -1);
        return word;
    }
    if (word.endsWith('ed') || word.endsWith('ing')) {
        const stem = word.endsWith('ed') ? word.slice(0, -2) : word.slice(0, -3);
        if (containsVowel(stem)) return stem;
        return word;
    }

    // Шаг 1c
    if (word.endsWith('y') && word.length > 2 && !isVowel(word.slice(-2, -1))) {
        return word.slice(0, -1) + 'i';
    }

    // Шаг 2
    if (word.endsWith('ational')) return word.slice(0, -7) + 'ate';
    if (word.endsWith('tional')) return word.slice(0, -6) + 'tion';
    if (word.endsWith('enci')) return word.slice(0, -5) + 'ence';
    if (word.endsWith('anci')) return word.slice(0, -5) + 'ance';
    if (word.endsWith('izer')) return word.slice(0, -5) + 'ize';
    if (word.endsWith('abli')) return word.slice(0, -5) + 'able';
    if (word.endsWith('alli')) return word.slice(0, -5) + 'al';
    if (word.endsWith('entli')) return word.slice(0, -5) + 'ent';
    if (word.endsWith('eli')) return word.slice(0, -3) + 'e';
    if (word.endsWith('ousli')) return word.slice(0, -5) + 'ous';
    if (word.endsWith('ization')) return word.slice(0, -7) + 'ize';
    if (word.endsWith('ation')) return word.slice(0, -5) + 'ate';
    if (word.endsWith('ator')) return word.slice(0, -4) + 'ate';
    if (word.endsWith('alism')) return word.slice(0, -5) + 'al';
    if (word.endsWith('iveness')) return word.slice(0, -7) + 'ive';
    if (word.endsWith('fulness')) return word.slice(0, -7) + 'ful';
    if (word.endsWith('ousness')) return word.slice(0, -7) + 'ous';
    if (word.endsWith('aliti')) return word.slice(0, -5) + 'al';
    if (word.endsWith('iviti')) return word.slice(0, -5) + 'ive';
    if (word.endsWith('biliti')) return word.slice(0, -6) + 'ble';

    // Шаг 3
    if (word.endsWith('icate')) return word.slice(0, -5) + 'ic';
    if (word.endsWith('ative')) return word.slice(0, -5);
    if (word.endsWith('alize')) return word.slice(0, -5) + 'al';
    if (word.endsWith('iciti')) return word.slice(0, -5) + 'ic';
    if (word.endsWith('ical')) return word.slice(0, -4) + 'ic';
    if (word.endsWith('ful')) return word.slice(0, -3);
    if (word.endsWith('ness')) return word.slice(0, -4);

    // Шаг 4
    if (word.endsWith('al') && word.length > 3) return word.slice(0, -2);
    if (word.endsWith('ance') || word.endsWith('ence')) return word.slice(0, -4);
    if (word.endsWith('er') || word.endsWith('ic')) return word.slice(0, -2);
    if (word.endsWith('able') || word.endsWith('ible')) return word.slice(0, -4);
    if (word.endsWith('ant') || word.endsWith('ement') || word.endsWith('ment')) return word.slice(0, -3);
    if (word.endsWith('ion') && (word.endsWith('sion') || word.endsWith('tion'))) return word.slice(0, -3);
    if (word.endsWith('ion')) return word.slice(0, -3);

    // Шаг 5
    if (word.endsWith('e') && word.length > 3) {
        const stem = word.slice(0, -1);
        if (containsVowel(stem.slice(0, -1))) return stem;
        return word;
    }

    // Шаг 6
    if (word.endsWith('l') && word.length > 3 && word.slice(-2, -1) === 'l') {
        return word.slice(0, -1);
    }

    return word;
}

// === Uzbek Stemmer ===
function uzbekStemmer(word) {
    word = word.toLowerCase();

    // Удаляем окончания множественного числа (кириллица)
    if (word.endsWith('лар') || word.endsWith('лер')) return word.slice(0, -3);

    // Удаляем окончания множественного числа (латиница)
    if (word.endsWith('lar') || word.endsWith('ler')) return word.slice(0, -3);

    // Удаляем окончания притяжательных местоимений
    if (word.endsWith('ним') || word.endsWith('нимга') || word.endsWith('нимни')) return word.slice(0, -3);
    if (word.endsWith('нинг') || word.endsWith('ning')) return word.slice(0, -4);

    // Удаляем окончания падежей
    if (word.endsWith('га') || word.endsWith('да') || word.endsWith('ка') ||
        word.endsWith('ga') || word.endsWith('da') || word.endsWith('ka')) {
        return word.slice(0, -2);
    }
    if (word.endsWith('ни') || word.endsWith('ni')) return word.slice(0, -2);
    if (word.endsWith('билан') || word.endsWith('bilan') || word.endsWith('ва') || word.endsWith('va')) {
        return word.slice(0, -5);
    }
    if (word.endsWith('де') || word.endsWith('да') || word.endsWith('de') || word.endsWith('da')) {
        return word.slice(0, -2);
    }
    if (word.endsWith('дан') || word.endsWith('тан') || word.endsWith('чан') ||
        word.endsWith('dan') || word.endsWith('tan') || word.endsWith('chan')) {
        return word.slice(0, -3);
    }
    if (word.endsWith('гача') || word.endsWith('кача') ||
        word.endsWith('gacha') || word.endsWith('kacha')) {
        return word.slice(0, -4);
    }

    // Удаляем окончания причастий
    if (word.endsWith('ган') || word.endsWith('кан') || word.endsWith('ганлар') ||
        word.endsWith('gan') || word.endsWith('kan') || word.endsWith('ganlar')) {
        return word.slice(0, -3);
    }
    if (word.endsWith('гувчи') || word.endsWith('кувчи') ||
        word.endsWith('guvchi') || word.endsWith('kuvchi')) {
        return word.slice(0, -5);
    }

    return word;
}

// === Класс BM25 для параграфов с поддержкой языков ===
class ParagraphBM25 {
    constructor(k1 = 1.5, b = 0.75) {
        this.k1 = k1;
        this.b = b;
        this.paragraphs = [];
        this.termDocFreq = new Map();
        this.termFreq = [];
        this.docLengths = [];
        this.avgDocLength = 0;
        this.totalDocs = 0;
        this.stopwords = new Map();
        this.synonyms = new Map();
        this.stemmingRules = new Map();
    }

    // Загрузка словарей
    async loadDictionaries() {
        const languages = ['uz', 'en', 'ru'];
        for (const lang of languages) {
            const stopwords = await getStopwords(lang);
            this.stopwords.set(lang, new Set(stopwords.map(sw => sw.term.toLowerCase())));

            const synonyms = await getSynonyms(lang);
            const synMap = new Map();
            synonyms.forEach(syn => synMap.set(syn.term.toLowerCase(), syn.synonyms));
            this.synonyms.set(lang, synMap);

            const stemmingRules = await getStemmingRules(lang);
            const stemMap = new Map();
            stemmingRules.forEach(rule => stemMap.set(rule.term.toLowerCase(), rule.stem));
            this.stemmingRules.set(lang, stemMap);
        }
    }

    // Определение языка текста
    detectLanguage(text) {
        const uzbekCyrillic = /[а-яёЁҒғШшЪъЭэҲҳЧчҶҷ]/i;
        const uzbekLatin = /[a-zA-ZöÖğĞşŞçÇüÜıİ]/i;
        const english = /[a-zA-Z]/;
        const russian = /[а-яА-Я]/;

        if (uzbekCyrillic.test(text) || uzbekLatin.test(text)) return 'uz';
        if (english.test(text) && !russian.test(text)) return 'en';
        return 'ru';
    }

    // Токенизация текста
    tokenize(text, language = null) {
        const detectedLanguage = language || this.detectLanguage(text);
        const stopwords = this.stopwords.get(detectedLanguage) || new Set();
        const stemmingRules = this.stemmingRules.get(detectedLanguage) || new Map();

        return text.toLowerCase()
            .split(/\s+/)
            .map(term => term.replace(/[^\wа-яА-ЯёЁҒғШшЪъЭэҲҳЧчҶҷöÖğĞşŞçÇüÜıİ]/g, ''))
            .filter(term => term.length > 2)
            .map(term => {
                if (detectedLanguage === 'en') return porterStemmer(term);
                if (detectedLanguage === 'uz') return uzbekStemmer(term);
                return term;
            })
            .map(term => stemmingRules.get(term) || term)
            .filter(term => !stopwords.has(term));
    }

    // Расширение запроса синонимами
    expandQuery(query, language = null) {
        const detectedLanguage = language || this.detectLanguage(query);
        const synonyms = this.synonyms.get(detectedLanguage) || new Map();
        const queryTerms = this.tokenize(query, detectedLanguage);
        const expandedTerms = [...queryTerms];

        queryTerms.forEach(term => {
            const termSynonyms = synonyms.get(term);
            if (termSynonyms) {
                expandedTerms.push(...termSynonyms.map(syn => this.tokenize(syn, detectedLanguage)).flat());
            }
        });

        return [...new Set(expandedTerms)];
    }

    // Добавить параграф в индекс
    addParagraph(paragraph) {
        const tokens = this.tokenize(paragraph.content);
        this.paragraphs.push(paragraph);
        this.docLengths.push(tokens.length);

        const docTermFreq = new Map();
        tokens.forEach(term => {
            docTermFreq.set(term, (docTermFreq.get(term) || 0) + 1);
        });
        this.termFreq.push(docTermFreq);

        tokens.forEach(term => {
            this.termDocFreq.set(term, (this.termDocFreq.get(term) || 0) + 1);
        });

        this.totalDocs = this.paragraphs.length;
        this.avgDocLength = this.docLengths.reduce((sum, len) => sum + len, 0) / this.totalDocs;
    }

    // Поиск по запросу
    search(query, topN = 10) {
        const expandedQuery = this.expandQuery(query);
        if (expandedQuery.length === 0) return [];

        const scores = this.paragraphs.map((paragraph, docIndex) => {
            let score = 0;
            expandedQuery.forEach(term => {
                const tf = this.termFreq[docIndex].get(term) || 0;
                const idf = this.idf(term);
                const numerator = tf * (this.k1 + 1);
                const denominator = tf + this.k1 * (1 - this.b + this.b * this.docLengths[docIndex] / this.avgDocLength);
                score += idf * (numerator / denominator);
            });
            return { ...paragraph, score, docIndex };
        });

        return scores.sort((a, b) => b.score - a.score).slice(0, topN);
    }

    // Вычисление IDF
    idf(term) {
        const docFreq = this.termDocFreq.get(term) || 0;
        return Math.log((this.totalDocs - docFreq + 0.5) / (docFreq + 0.5) + 1);
    }

    // Извлечение релевантного фрагмента
    getRelevantFragment(paragraph, query) {
        const queryTokens = this.tokenize(query);
        const sentences = paragraph.content.split(/[.!?]+/);
        let bestSentence = '';
        let maxScore = 0;

        sentences.forEach(sentence => {
            const sentenceTokens = this.tokenize(sentence);
            const score = queryTokens.filter(term => sentenceTokens.includes(term)).length;
            if (score > maxScore) {
                maxScore = score;
                bestSentence = sentence.trim();
            }
        });

        return bestSentence || paragraph.content.substring(0, 200) + '...';
    }
}

// === Извлечение текста из PDF/TXT/DOCX ===
async function extractTextFromPdf(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
            try {
                const typedArray = new Uint8Array(event.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        };
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
    });
}

async function extractTextFromTxt(file) {
    return file.text();
}

async function extractTextFromDocx(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            mammoth.extractRawText({ arrayBuffer })
                .then((result) => resolve(result.value))
                .catch(reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
