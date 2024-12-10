// survey script

document.addEventListener('DOMContentLoaded', function() {
    // Создаем уникальный идентификатор формы опроса
    const surveyForm = document.querySelector('.survey-form');
    if (!surveyForm) return;

    let optionsCount = 0; // Счетчик для опций

    // Добавление варианта ответа
    function addOption(value = '') {
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        
        optionDiv.innerHTML = `
            <input 
                type="text" 
                name="options[${optionsCount}][optionName]" 
                value="${value}"
                placeholder="Введите вариант ответа" 
                required
            >
            <button type="button" class="remove-option" onclick="removeOption(this)">✕</button>
        `;
        
        container.appendChild(optionDiv);
        optionsCount++;
    }

    // Удаление варианта ответа
    window.removeOption = function(button) {
        const container = document.getElementById('optionsContainer');
        const optionItems = container.querySelectorAll('.option-item');
        
        // Проверяем, что это не последний элемент
        if (optionItems.length > 1) {
            button.closest('.option-item').remove();
            // Перенумеруем оставшиеся опции
            renumberOptions();
        }
    };

    // Перенумерация опций после удаления
    function renumberOptions() {
        const container = document.getElementById('optionsContainer');
        const inputs = container.querySelectorAll('input[type="text"]');
        inputs.forEach((input, index) => {
            input.name = `options[${index}][optionName]`;
        });
        optionsCount = inputs.length;
    }

    // Добавляем обработчик для кнопки добавления опции
    const addButton = document.querySelector('.add-option');
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            addOption();
        });
    }

    // Инициализация первой опции, если нет существующих
    const container = document.getElementById('optionsContainer');
    if (container && container.children.length === 0) {
        addOption();
    }

    // Фильтрация классов по школе
    const schoolFilter = document.getElementById('schoolFilter');
    if (schoolFilter) {
        schoolFilter.addEventListener('change', function() {
            const selectedSchoolId = this.value;
            const options = document.querySelectorAll('.survey-option-item');
            
            options.forEach(option => {
                const schoolId = option.getAttribute('data-school-id');
                if (!selectedSchoolId || selectedSchoolId === schoolId) {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                    option.querySelector('input[type="checkbox"]').checked = false;
                }
            });
        });
    }
});


// В admin.js добавляем
document.addEventListener('DOMContentLoaded', function() {
    const schoolFilter = document.getElementById('schoolFilter');
    const classSelect = document.getElementById('classIds');
    const selectAllBtn = document.getElementById('selectAllClasses');
    const deselectAllBtn = document.getElementById('deselectAllClasses');

    if (schoolFilter && classSelect) {
        // Обработчик изменения фильтра школы
        schoolFilter.addEventListener('change', function() {
            const selectedSchoolId = this.value;
            const options = classSelect.querySelectorAll('option');

            options.forEach(option => {
                if (!selectedSchoolId || option.getAttribute('data-school-id') === selectedSchoolId) {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                    option.selected = false;
                }
            });
        });

        // Выбрать все видимые классы
        selectAllBtn.addEventListener('click', function() {
            const options = classSelect.querySelectorAll('option');
            options.forEach(option => {
                if (option.style.display !== 'none') {
                    option.selected = true;
                }
            });
        });

        // Снять выбор со всех классов
        deselectAllBtn.addEventListener('click', function() {
            const options = classSelect.querySelectorAll('option');
            options.forEach(option => option.selected = false);
        });
    }
});

document.getElementById('selectAll').addEventListener('click', function(e) {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('.select-options input[type="checkbox"]:not([disabled])');
    checkboxes.forEach(checkbox => {
        if (checkbox.closest('.option-item').style.display !== 'none') {
            checkbox.checked = true;
        }
    });
});

document.getElementById('clearAll').addEventListener('click', function(e) {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('.select-options input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
});

document.addEventListener('DOMContentLoaded', function() {
    const schoolFilter = document.getElementById('schoolFilter');
    
    schoolFilter.addEventListener('change', function() {
        const selectedSchoolId = this.value;
        const options = document.querySelectorAll('.option-item');
        
        options.forEach(option => {
            const schoolId = option.getAttribute('data-school-id');
            if (!selectedSchoolId || selectedSchoolId === schoolId) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
                // Снимаем выделение с скрытых элементов
                option.querySelector('input[type="checkbox"]').checked = false;
            }
        });
    });
});