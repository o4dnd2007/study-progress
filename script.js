// تعريف العناصر
const elements = {
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalInput: document.getElementById('modal-input'),
    modalSave: document.getElementById('modal-save'),
    modalCancel: document.getElementById('modal-cancel'),
    modalButtons: document.getElementById('modal-buttons'),
    addButton: document.getElementById('addButton'),
    subjectsContainer: document.getElementById('subjects-container'),
    subjectsList: document.getElementById('subjects-list'),
    chaptersContainer: document.getElementById('chapters-container'),
    chaptersList: document.getElementById('chapters-list'),
    topicsContainer: document.getElementById('topics-container'),
    topicsList: document.getElementById('topics-list'),
    addSubjectBtn: document.getElementById('add-subject-btn'),
    addChapterBtn: document.getElementById('add-chapter-btn'),
    addTopicBtn: document.getElementById('add-topic-btn'),
    backToSubjects: document.getElementById('back-to-subjects'),
    backToChapters: document.getElementById('back-to-chapters'),
    subjectTitle: document.getElementById('subject-title'),
    chapterTitle: document.getElementById('chapter-title'),
    subjectProgress: document.getElementById('subject-progress'),
    subjectProgressText: document.getElementById('subject-progress-text'),
    chapterProgress: document.getElementById('chapter-progress'),
    chapterProgressText: document.getElementById('chapter-progress-text'),
    toggleDeleteMode: document.getElementById('toggleDeleteMode'),
    deleteActions: document.getElementById('deleteActions'),
    confirmDelete: document.getElementById('confirmDelete'),
    cancelDelete: document.getElementById('cancelDelete'),
    selectedCount: document.getElementById('selectedCount'),
    toggleDeleteModeChapters: document.getElementById('toggleDeleteMode-chapters'),
    deleteActionsChapters: document.getElementById('deleteActions-chapters'),
    confirmDeleteChapters: document.getElementById('confirmDelete-chapters'),
    cancelDeleteChapters: document.getElementById('cancelDelete-chapters'),
    selectedCountChapters: document.getElementById('selectedCount-chapters'),
    toggleDeleteModeTopics: document.getElementById('toggleDeleteMode-topics'),
    deleteActionsTopics: document.getElementById('deleteActions-topics'),
    confirmDeleteTopics: document.getElementById('confirmDelete-topics'),
    cancelDeleteTopics: document.getElementById('cancelDelete-topics'),
    selectedCountTopics: document.getElementById('selectedCount-topics'),
    mainContainer: document.querySelector('main')
};

// المتغيرات العامة
let data = { subjects: [] };
let currentSubject = null;
let currentChapter = null;
let isDeleteModeSubjects = false;
let isDeleteModeChapters = false;
let isDeleteModeTopics = false;
let selectedSubjects = [];
let selectedChapters = [];
let selectedTopics = [];

// تهيئة التطبيق
function init() {
    loadData();
    renderSubjects();
    setupEventListeners();
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار الإضافة
    elements.addSubjectBtn.addEventListener('click', () => showAddModal('مادة جديدة', addSubject));
    elements.addChapterBtn.addEventListener('click', () => showAddModal('فصل جديد', addChapter));
    elements.addTopicBtn?.addEventListener('click', () => showAddModal('موضوع جديد', addTopic));

    // أزرار التنقل
    elements.backToSubjects.addEventListener('click', showSubjects);
    elements.backToChapters?.addEventListener('click', () => showChapters(currentSubject));

    // أزرار النافذة المنبثقة
    elements.modalCancel.addEventListener('click', hideModal);

    // أزرار وضع الحذف
    elements.toggleDeleteMode.addEventListener('click', () => toggleDeleteMode('subjects'));
    elements.confirmDelete.addEventListener('click', () => handleConfirmDelete('subjects'));
    elements.cancelDelete.addEventListener('click', () => cancelDelete('subjects'));
    
    elements.toggleDeleteModeChapters.addEventListener('click', () => toggleDeleteMode('chapters'));
    elements.confirmDeleteChapters.addEventListener('click', () => handleConfirmDelete('chapters'));
    elements.cancelDeleteChapters.addEventListener('click', () => cancelDelete('chapters'));
    
    elements.toggleDeleteModeTopics.addEventListener('click', () => toggleDeleteMode('topics'));
    elements.confirmDeleteTopics.addEventListener('click', () => handleConfirmDelete('topics'));
    elements.cancelDeleteTopics.addEventListener('click', () => cancelDelete('topics'));
}

// وظائف وضع الحذف
function toggleDeleteMode(type) {
    switch (type) {
        case 'subjects':
            isDeleteModeSubjects = !isDeleteModeSubjects;
            elements.mainContainer.classList.toggle('delete-mode', isDeleteModeSubjects);
            elements.toggleDeleteMode.textContent = isDeleteModeSubjects ? 'إلغاء التحديد' : 'تحديد للحذف';
            elements.deleteActions.classList.toggle('hidden', !isDeleteModeSubjects);
            if (!isDeleteModeSubjects) clearSelection('subjects');
            break;
            
        case 'chapters':
            isDeleteModeChapters = !isDeleteModeChapters;
            elements.chaptersContainer.classList.toggle('delete-mode', isDeleteModeChapters);
            elements.toggleDeleteModeChapters.textContent = isDeleteModeChapters ? 'إلغاء التحديد' : 'تحديد للحذف';
            elements.deleteActionsChapters.classList.toggle('hidden', !isDeleteModeChapters);
            if (!isDeleteModeChapters) clearSelection('chapters');
            break;
            
        case 'topics':
            isDeleteModeTopics = !isDeleteModeTopics;
            elements.topicsContainer.classList.toggle('delete-mode', isDeleteModeTopics);
            elements.toggleDeleteModeTopics.textContent = isDeleteModeTopics ? 'إلغاء التحديد' : 'تحديد للحذف';
            elements.deleteActionsTopics.classList.toggle('hidden', !isDeleteModeTopics);
            if (!isDeleteModeTopics) clearSelection('topics');
            break;
    }
    
    updateCardListeners();
}

function clearSelection(type) {
    const container = type === 'subjects' ? elements.subjectsList :
                     type === 'chapters' ? elements.chaptersList :
                     elements.topicsList;
    
    container.querySelectorAll('.card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    
    switch (type) {
        case 'subjects':
            selectedSubjects = [];
            updateSelectedCount('subjects');
            break;
        case 'chapters':
            selectedChapters = [];
            updateSelectedCount('chapters');
            break;
        case 'topics':
            selectedTopics = [];
            updateSelectedCount('topics');
            break;
    }
}

function updateSelectedCount(type) {
    const count = type === 'subjects' ? selectedSubjects.length :
                 type === 'chapters' ? selectedChapters.length :
                 selectedTopics.length;
    
    const element = type === 'subjects' ? elements.selectedCount :
                   type === 'chapters' ? elements.selectedCountChapters :
                   elements.selectedCountTopics;
    
    element.textContent = count > 0 ? `تم تحديد ${count} عناصر` : '';
}

function cancelDelete(type) {
    clearSelection(type);
    toggleDeleteMode(type);
}

function handleConfirmDelete(type) {
    const selectedItems = type === 'subjects' ? selectedSubjects :
                        type === 'chapters' ? selectedChapters :
                        selectedTopics;
    
    if (selectedItems.length === 0) return;
    
    selectedItems.forEach(title => {
        switch (type) {
            case 'subjects':
                const subjectIndex = data.subjects.findIndex(s => s.name === title);
                if (subjectIndex !== -1) {
                    data.subjects.splice(subjectIndex, 1);
                }
                break;
                
            case 'chapters':
                if (currentSubject) {
                    const chapterIndex = currentSubject.chapters.findIndex(c => c.name === title);
                    if (chapterIndex !== -1) {
                        currentSubject.chapters.splice(chapterIndex, 1);
                    }
                }
                break;
                
            case 'topics':
                if (currentChapter) {
                    const topicIndex = currentChapter.topics.findIndex(t => t.name === title);
                    if (topicIndex !== -1) {
                        currentChapter.topics.splice(topicIndex, 1);
                    }
                }
                break;
        }
    });
    
    // تحديث الواجهة
    if (type === 'topics' && currentChapter) {
        renderTopics(currentChapter);
    } else if (type === 'chapters' && currentSubject) {
        renderChapters(currentSubject);
    } else {
        renderSubjects();
    }
    
    updateProgress();
    saveData();
    toggleDeleteMode(type);
}

// وظيفة إنشاء البطاقة
function createCard(title, progress, onClick = null, isCompleted = false, onCheckboxChange = null) {
    const card = document.createElement('div');
    card.className = 'card';
    if (isCompleted) card.classList.add('completed');

    // تحويل النسبة المئوية إلى رقم
    const progressValue = parseInt(progress);
    // تعيين عرض شريط التقدم
    card.style.setProperty('--progress-width', `${progressValue}%`);
    
    // إضافة الخلفية الديناميكية
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-background';
    card.appendChild(progressBar);

    const content = document.createElement('div');
    content.className = 'card-content';

    const titleElement = document.createElement('div');
    titleElement.className = 'card-title';
    titleElement.textContent = title;

    const progressElement = document.createElement('div');
    progressElement.className = 'card-progress';
    progressElement.textContent = progress;

    content.appendChild(titleElement);

    if (onCheckboxChange) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'topic-checkbox';
        checkbox.checked = isCompleted;
        checkbox.addEventListener('change', (e) => {
            onCheckboxChange(e.target.checked);
            // تحديث عرض شريط التقدم عند تغيير حالة الاكتمال
            card.style.setProperty('--progress-width', e.target.checked ? '100%' : '0%');
        });
        content.appendChild(checkbox);
    }

    content.appendChild(progressElement);
    card.appendChild(content);

    if (onClick) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', onClick);
    }

    // تعيين عرض شريط التقدم باستخدام pseudo-element
    card.style.setProperty('--progress-width', `${progressValue}%`);

    return card;
}

// تحديث مستمعي الأحداث للبطاقات
function updateCardListeners() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // تحديد نوع البطاقة وحالة الحذف
        let type = '';
        let isInDeleteMode = false;
        
        if (elements.topicsList.contains(newCard)) {
            type = 'topics';
            isInDeleteMode = isDeleteModeTopics;
        } else if (elements.chaptersList.contains(newCard)) {
            type = 'chapters';
            isInDeleteMode = isDeleteModeChapters;
        } else if (elements.subjectsList.contains(newCard)) {
            type = 'subjects';
            isInDeleteMode = isDeleteModeSubjects;
        }
        
        const title = newCard.querySelector('.card-title').textContent;
        
        if (isInDeleteMode) {
            // إضافة مستمع أحداث للتحديد
            newCard.addEventListener('click', () => {
                const isSelected = newCard.classList.toggle('selected');
                const selectedArray = type === 'subjects' ? selectedSubjects :
                                    type === 'chapters' ? selectedChapters :
                                    selectedTopics;
                
                if (isSelected) {
                    selectedArray.push(title);
                } else {
                    const index = selectedArray.indexOf(title);
                    if (index !== -1) {
                        selectedArray.splice(index, 1);
                    }
                }
                
                updateSelectedCount(type);
            });
        } else {
            // إضافة مستمعي الأحداث العادية
            if (type === 'topics') {
                const topic = currentChapter.topics.find(t => t.name === title);
                if (topic) {
                    const checkbox = newCard.querySelector('.topic-checkbox');
                    if (checkbox) {
                        checkbox.addEventListener('change', (e) => {
                            topic.completed = e.target.checked;
                            newCard.classList.toggle('completed', e.target.checked);
                            saveData();
                            updateProgress();
                        });
                    }
                }
            } else if (type === 'chapters') {
                newCard.addEventListener('click', () => {
                    const chapter = currentSubject.chapters.find(c => c.name === title);
                    if (chapter) {
                        showTopics(chapter);
                    }
                });
            } else if (type === 'subjects') {
                newCard.addEventListener('click', () => {
                    const subject = data.subjects.find(s => s.name === title);
                    if (subject) {
                        showChapters(subject);
                    }
                });
            }
        }
    });
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('studyProgress');
    if (savedData) {
        data = JSON.parse(savedData);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('studyProgress', JSON.stringify(data));
}

// Render functions
function calculateProgress(items) {
    if (!items || items.length === 0) return 0;
    const completed = items.filter(item => item.completed).length;
    return Math.round((completed / items.length) * 100);
}

function renderSubjects() {
    elements.subjectsList.innerHTML = '';
    data.subjects.forEach(subject => {
        const progress = calculateProgress(subject.chapters.flatMap(chapter => chapter.topics));
        const subjectElement = createCard(
            subject.name,
            `${progress}%`,
            () => showChapters(subject)
        );
        elements.subjectsList.appendChild(subjectElement);
    });
}

function renderChapters(subject) {
    elements.chaptersList.innerHTML = '';
    subject.chapters.forEach(chapter => {
        const progress = calculateProgress(chapter.topics);
        const chapterElement = createCard(
            chapter.name,
            `${progress}%`,
            () => showTopics(chapter)
        );
        elements.chaptersList.appendChild(chapterElement);
    });
}

function renderTopics(chapter) {
    elements.topicsList.innerHTML = '';
    chapter.topics.forEach(topic => {
        const topicElement = createCard(
            topic.name,
            topic.completed ? '100%' : '0%',
            null,
            topic.completed,
            (checked) => {
                topic.completed = checked;
                saveData();
                updateProgress();
                // تحديث النسبة المئوية في البطاقة
                const progressElement = topicElement.querySelector('.card-progress');
                if (progressElement) {
                    progressElement.textContent = checked ? '100%' : '0%';
                }
                if (checked) {
                    topicElement.classList.add('completed');
                } else {
                    topicElement.classList.remove('completed');
                }
            }
        );
        elements.topicsList.appendChild(topicElement);
    });
}

// Navigation functions
function showSubjects() {
    currentSubject = null;
    currentChapter = null;
    
    elements.subjectsContainer.classList.remove('hidden');
    elements.chaptersContainer.classList.add('hidden');
    elements.topicsContainer.classList.add('hidden');
    
    // إعادة تعيين حالة الحذف
    if (isDeleteModeChapters) {
        toggleDeleteMode('chapters');
    }
    
    renderSubjects();
    updateProgress();
}

function showChapters(subject) {
    currentSubject = subject;
    currentChapter = null;
    
    elements.subjectsContainer.classList.add('hidden');
    elements.chaptersContainer.classList.remove('hidden');
    elements.topicsContainer.classList.add('hidden');
    
    elements.subjectTitle.textContent = subject.name;
    
    // إعادة تعيين حالة الحذف
    if (isDeleteModeSubjects) {
        toggleDeleteMode('subjects');
    }
    
    renderChapters(subject);
    updateProgress();
}

function showTopics(chapter) {
    currentChapter = chapter;
    
    elements.chaptersContainer.classList.add('hidden');
    elements.topicsContainer.classList.remove('hidden');
    
    elements.chapterTitle.textContent = chapter.name;
    
    // إعادة تعيين حالة الحذف
    if (isDeleteModeChapters) {
        toggleDeleteMode('chapters');
    }
    
    renderTopics(chapter);
    updateProgress();
}

// Add new items
function addSubject(name) {
    const subject = {
        name,
        chapters: []
    };
    data.subjects.push(subject);
    saveData();
    renderSubjects();
}

function addChapter(name) {
    if (!currentSubject) return;
    const chapter = {
        name,
        topics: []
    };
    currentSubject.chapters.push(chapter);
    saveData();
    renderChapters(currentSubject);
}

function addTopic(name) {
    if (!currentChapter) return;
    const topic = {
        name,
        completed: false
    };
    currentChapter.topics.push(topic);
    saveData();
    renderTopics(currentChapter);
    updateProgress();
}

// Update progress displays
function updateProgress() {
    if (currentChapter) {
        const chapterProgress = calculateProgress(currentChapter.topics);
        elements.chapterProgress.style.width = `${chapterProgress}%`;
        elements.chapterProgressText.textContent = `${chapterProgress}%`;
    }
    
    if (currentSubject) {
        const subjectProgress = calculateProgress(currentSubject.chapters.flatMap(chapter => chapter.topics));
        elements.subjectProgress.style.width = `${subjectProgress}%`;
        elements.subjectProgressText.textContent = `${subjectProgress}%`;
    }
}

// Modal functions
function showAddModal(title, saveCallback) {
    elements.modalTitle.textContent = title;
    elements.modalInput.value = '';
    elements.modal.classList.remove('hidden');
    elements.modalSave.onclick = () => {
        if (elements.modalInput.value.trim()) {
            saveCallback(elements.modalInput.value.trim());
            hideModal();
        }
    };
}

function hideModal() {
    elements.modal.classList.add('hidden');
}

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered successfully');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// تهيئة التطبيق
init();
