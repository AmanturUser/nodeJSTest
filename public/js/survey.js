document.addEventListener('DOMContentLoaded', function() {
    // Инициализация элементов формы опроса
    const optionsContainer = document.getElementById('optionsContainer');
    const schoolFilter = document.getElementById('schoolFilter');
    const classSelectGroup = document.getElementById('classSelectGroup');
    const selectAllBtn = document.getElementById('selectAll');
    const clearAllBtn = document.getElementById('clearAll');
    
    let optionsCount = optionsContainer ? optionsContainer.children.length : 0;

    // Функции для управления вариантами ответов
    window.addOption = function() {
        if (!optionsContainer) return;

        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        optionDiv.style.display = 'flex';
        optionDiv.style.marginBottom = '10px';
        
        optionDiv.innerHTML = `
            <input 
                type="text" 
                name="options[${optionsCount}][optionName]" 
                placeholder="Введите вариант ответа" 
                required
                style="flex-grow: 1; margin-right: 10px;"
            >
            <button type="button" class="remove-option" onclick="removeOption(this)">✕</button>
        `;
        
        optionsContainer.appendChild(optionDiv);
        optionsCount++;
    };

    window.removeOption = function(button) {
        const optionItems = optionsContainer.querySelectorAll('.option-item');
        if (optionItems.length > 1) {
            button.closest('.option-item').remove();
            renumberOptions();
        }
    };

    function renumberOptions() {
        const inputs = optionsContainer.querySelectorAll('input[type="text"]');
        inputs.forEach((input, index) => {
            input.name = `options[${index}][optionName]`;
        });
        optionsCount = inputs.length;
    }

    // Обработчики для управления выбором классов
    if (schoolFilter) {
        schoolFilter.addEventListener('change', function() {
            const selectedSchoolId = this.value;
            const optionItems = document.querySelectorAll('.option-item');
            const checkboxes = document.querySelectorAll('.select-options input[type="checkbox"]');
            
            if (selectedSchoolId) {
                classSelectGroup.style.display = 'block';
                
                optionItems.forEach(item => {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    if (item.getAttribute('data-school-id') === selectedSchoolId) {
                        item.style.display = '';
                        checkbox.disabled = false;
                    } else {
                        item.style.display = 'none';
                        checkbox.disabled = true;
                        checkbox.checked = false;
                    }
                });
            } else {
                classSelectGroup.style.display = 'none';
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.disabled = true;
                });
            }
        });

        // Единый обработчик для выбора всех классов
        selectAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const checkboxes = document.querySelectorAll('.select-options input[type="checkbox"]:not([disabled])');
            checkboxes.forEach(checkbox => {
                if (checkbox.closest('.option-item').style.display !== 'none') {
                    checkbox.checked = true;
                }
            });
        });

        // Единый обработчик для очистки выбора
        clearAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const checkboxes = document.querySelectorAll('.select-options input[type="checkbox"]:not([disabled])');
            checkboxes.forEach(checkbox => checkbox.checked = false);
        });
    }

    // Инициализация пустого варианта ответа при загрузке
    if (optionsContainer && optionsContainer.children.length === 0) {
        addOption();
    }
});




// headerMenu
const HeaderManager = {
    init: function() {
        // Проверяем наличие элементов хедера
        const mainNav = document.querySelector('.main-nav');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (!mainNav || !menuToggle) return;

        // Добавляем обработчики событий
        this.initMenuToggle(menuToggle, mainNav);
        this.initClickOutside(mainNav, menuToggle);
        this.initResizeHandler(mainNav);
    },

    initMenuToggle: function(menuToggle, mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    },

    initClickOutside: function(mainNav, menuToggle) {
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && 
                !menuToggle.contains(e.target) && 
                mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    },

    initResizeHandler: function(mainNav) {
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1024) {
                mainNav.classList.remove('active');
            }
        });
    },

    // Дополнительные методы при необходимости
    closeMenu: function() {
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            mainNav.classList.remove('active');
        }
    },

    isMenuOpen: function() {
        const mainNav = document.querySelector('.main-nav');
        return mainNav ? mainNav.classList.contains('active') : false;
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    HeaderManager.init();
});


document.addEventListener('DOMContentLoaded', function() {
    const optionsContainer = document.getElementById('optionsContainer');
    const schoolFilter = document.getElementById('schoolFilter');
    const selectAllBtn = document.getElementById('selectAll');
    const clearAllBtn = document.getElementById('clearAll');
    
    let optionsCount = optionsContainer ? optionsContainer.children.length : 0;

    // Инициализация страницы редактирования
    function initializeEdit() {
        if (schoolFilter) {
            const selectedSchoolId = schoolFilter.value;
            filterClassesBySchool(selectedSchoolId);
        }
    }

    // Фильтрация классов по выбранной школе
    function filterClassesBySchool(schoolId) {
        const classItems = document.querySelectorAll('.class-item');
        
        classItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (item.getAttribute('data-school-id') === schoolId) {
                item.style.display = '';
                checkbox.disabled = false;
            } else {
                item.style.display = 'none';
                checkbox.disabled = true;
                checkbox.checked = false;
            }
        });
    }

    // Функция добавления варианта ответа
    window.addOption = function() {
        if (!optionsContainer) return;

        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item-edit';
        optionDiv.style.display = 'flex';
        optionDiv.style.marginBottom = '10px';
        
        optionDiv.innerHTML = `
            <input 
                type="text" 
                name="options[${optionsCount}][optionName]" 
                placeholder="Введите вариант ответа" 
                required
                style="flex-grow: 1; margin-right: 10px;"
            >
            <button type="button" class="remove-option" onclick="removeOption(this)">✕</button>
        `;
        
        optionsContainer.appendChild(optionDiv);
        optionsCount++;
    };

    // Функция удаления варианта ответа
    window.removeOption = function(button) {
        const optionItems = optionsContainer.querySelectorAll('.option-item-edit');
        if (optionItems.length > 1) {
            button.closest('.option-item-edit').remove();
            renumberOptions();
        }
    };

    // Перенумерация опций
    function renumberOptions() {
        const inputs = optionsContainer.querySelectorAll('input[type="text"]');
        inputs.forEach((input, index) => {
            input.name = `options[${index}][optionName]`;
        });
        optionsCount = inputs.length;
    }

    // Обработчики событий
    if (schoolFilter) {
        schoolFilter.addEventListener('change', function() {
            filterClassesBySchool(this.value);
        });

        selectAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const checkboxes = document.querySelectorAll('.class-list input[type="checkbox"]:not([disabled])');
            checkboxes.forEach(checkbox => checkbox.checked = true);
        });

        clearAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const checkboxes = document.querySelectorAll('.class-list input[type="checkbox"]:not([disabled])');
            checkboxes.forEach(checkbox => checkbox.checked = false);
        });
    }

    // Инициализация при загрузке страницы
    initializeEdit();
});