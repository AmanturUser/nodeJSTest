// survey script

document.addEventListener('DOMContentLoaded', function() {
    const optionsContainer = document.getElementById('optionsContainer');
    let optionsCount = optionsContainer ? optionsContainer.children.length : 0;

    // Функция добавления варианта ответа
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

    // Функция удаления варианта ответа
    window.removeOption = function(button) {
        const optionItems = optionsContainer.querySelectorAll('.option-item');
        
        // Проверяем, что это не последний элемент
        if (optionItems.length > 1) {
            button.closest('.option-item').remove();
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

    // Обработка фильтрации по школе
    const schoolSelect = document.getElementById('schoolFilter');
    if (schoolSelect) {
        schoolSelect.addEventListener('change', function() {
            // Сохраняем текущие значения вариантов ответов
            const currentOptions = Array.from(optionsContainer.querySelectorAll('input[type="text"]'))
                .map(input => input.value);

            // Очищаем и пересоздаем варианты с сохраненными значениями
            optionsContainer.innerHTML = '';
            optionsCount = 0;

            currentOptions.forEach(value => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option-item';
                optionDiv.style.display = 'flex';
                optionDiv.style.marginBottom = '10px';
                
                optionDiv.innerHTML = `
                    <input 
                        type="text" 
                        name="options[${optionsCount}][optionName]" 
                        value="${value}"
                        placeholder="Введите вариант ответа" 
                        required
                        style="flex-grow: 1; margin-right: 10px;"
                    >
                    <button type="button" class="remove-option" onclick="removeOption(this)">✕</button>
                `;
                
                optionsContainer.appendChild(optionDiv);
                optionsCount++;
            });

            // Если нет вариантов, добавляем один пустой
            if (optionsCount === 0) {
                addOption();
            }
        });
    }

    // Если нет вариантов при загрузке, добавляем один пустой
    if (optionsContainer && optionsContainer.children.length === 0) {
        addOption();
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
