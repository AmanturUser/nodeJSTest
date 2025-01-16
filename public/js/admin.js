// public/js/admin.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin script loaded');

    // Сортировка таблицы
    const table = document.querySelector('.schools-table');
    let headers;

    if (table) {
        headers = table.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                const isAscending = header.classList.contains('asc');
                sortTable(column, !isAscending);
            });
        });
    }

    // Функция сортировки таблицы
    function sortTable(column, asc = true) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const sortedRows = rows.sort((a, b) => {
            let aValue = a.querySelector(`td:nth-child(${getColumnIndex(column)})`).textContent.trim();
            let bValue = b.querySelector(`td:nth-child(${getColumnIndex(column)})`).textContent.trim();
            
            if (column === 'id' || column === 'studentCount' || column === 'teacherCount',column === 'count') {
                aValue = parseInt(aValue, 10);
                bValue = parseInt(bValue, 10);
                return asc ? aValue - bValue : bValue - aValue;
            } else {
                return asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        // Очистка и заполнение tbody
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        sortedRows.forEach(row => tbody.appendChild(row));

        // Обновление иконок сортировки
        headers.forEach(h => {
            h.classList.remove('asc', 'desc');
        });
        const activeHeader = table.querySelector(`th[data-sort="${column}"]`);
        activeHeader.classList.toggle('asc', asc);
        activeHeader.classList.toggle('desc', !asc);
    }

    // Вспомогательная функция для получения индекса колонки
    function getColumnIndex(column) {
        return Array.from(headers).findIndex(h => h.dataset.sort === column) + 1;
    }

    // Обработка удаления школы
    document.body.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-delete');
        if (deleteButton) {
            event.preventDefault();
            const schoolId = deleteButton.dataset.schoolId;
            deleteSchool(schoolId);
        }
    });

    document.body.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-deleteClass');
        if (deleteButton) {
            event.preventDefault();
            const classId = deleteButton.dataset.classId;
            deleteClass(classId);
        }
    });

    document.body.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-deleteAdmin');
        if (deleteButton) {
            event.preventDefault();
            const adminId = deleteButton.dataset.adminId;
            deleteAdmin(adminId);
        }
    });

    document.body.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-deletePupil');
        if (deleteButton) {
            event.preventDefault();
            const pupilId = deleteButton.dataset.pupilId;
            deletePupil(pupilId);
        }
    });

    document.body.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-deleteProject');
        if (deleteButton) {
            event.preventDefault();
            const projectId = deleteButton.dataset.projectId;
            deleteProject(projectId);
        }
    });

    document.body.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-deleteSurvey');
        if (deleteButton) {
            event.preventDefault();
            const surveyId = deleteButton.dataset.surveyId;
            deleteSurvey(surveyId);
        }
    });

    // Функция удаления школы
    function deleteSchool(schoolId) {
        if (confirm('Вы уверены, что хотите удалить эту школу?')) {
            fetch(`/admin/schools/${schoolId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const row = document.querySelector(`tr[data-school-id="${schoolId}"]`);
                    if (row) {
                        row.remove();
                        console.log('School row removed');
                    } else {
                        console.error('Row not found');
                    }
                    alert('Школа успешно удалена');
                } else {
                    alert(data.message || 'Ошибка при удалении школы');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при удалении школы');
            });
        }
    }

    // Функция удаления класса
    function deleteClass(classId) {
        if (confirm('Вы уверены, что хотите удалить этот класс?')) {
            fetch(`/admin/classes/${classId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const row = document.querySelector(`tr[data-class-id="${classId}"]`);
                    if (row) {
                        row.remove();
                        console.log('Class row removed');
                    } else {
                        console.error('Class not found');
                    }
                    alert('Класс успешно удален');
                } else {
                    alert(data.message || 'Ошибка при удалении класса');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при удалении класса');
            });
        }
    }

    // Функция удаления админа
    function deleteAdmin(adminId) {
        if (confirm('Вы уверены, что хотите удалить админа?')) {
            fetch(`/admin/${adminId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const row = document.querySelector(`tr[data-admin-id="${adminId}"]`);
                    if (row) {
                        row.remove();
                        console.log('Admin row removed');
                    } else {
                        console.error('Admin not found');
                    }
                    alert('Админ успешно удален');
                } else {
                    alert(data.message || 'Ошибка при удалении Админа');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при удалении Админа');
            });
        }
    }


    // Функция удаления ученика
    function deletePupil(pupilId) {
        if (confirm('Вы уверены, что хотите удалить этого ученика?')) {
            fetch(`/admin/pupils/${pupilId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const row = document.querySelector(`tr[data-pupil-id="${pupilId}"]`);
                    if (row) {
                        row.remove();
                        console.log('Pupil row removed');
                    } else {
                        console.error('Pupil not found');
                    }
                    alert('Ученик успешно удален');
                } else {
                    alert(data.message || 'Ошибка при удалении ученика');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при удалении ученика');
            });
        }
    }

    function deleteProject(projectId) {
        if (confirm('Вы уверены, что хотите удалить этот проект?')) {
            fetch(`/admin/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const row = document.querySelector(`tr[data-project-id="${projectId}"]`);
                    if (row) {
                        row.remove();
                        console.log('Project row removed');
                    } else {
                        console.error('Row not found');
                    }
                    alert('Проект успешно удален');
                } else {
                    alert(data.message || 'Ошибка при удалении проекта');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при удалении проекта');
            });
        }
    }

    function deleteSurvey(surveyId) {
        if (confirm('Вы уверены, что хотите удалить этот опрос?')) {
            fetch(`/admin/surveys/${surveyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const row = document.querySelector(`tr[data-survey-id="${surveyId}"]`);
                    if (row) {
                        row.remove();
                        console.log('Project row removed');
                    } else {
                        console.error('Row not found');
                    }
                    alert('Опрос успешно удален');
                } else {
                    alert(data.message || 'Ошибка при удалении опроса');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при удалении опроса');
            });
        }
    }
    // Обработка формы редактирования школы
    

    

    // Вызов функции обновления пагинации при загрузке страницы


    // Дополнительные функции админ-панели могут быть добавлены здесь
    
});

document.addEventListener('DOMContentLoaded', function() {
    const typeSelect = document.getElementById('type');
    const schoolSelect = document.querySelector('.school-select');
    const classSelect = document.querySelector('.class-select');
    const userSelect = document.querySelector('.user-select');
    const schoolForClassSelect = document.getElementById('schoolForClass');

    typeSelect.addEventListener('change', function() {
        // Скрываем все селекты
        schoolSelect.style.display = 'none';
        classSelect.style.display = 'none';
        userSelect.style.display = 'none';

        // Сбрасываем required атрибуты
        schoolSelect.querySelector('select').required = false;
        classSelect.querySelector('select').required = false;
        userSelect.querySelector('select').required = false;

        // Показываем нужный селект
        switch(this.value) {
            case 'SCHOOL':
                schoolSelect.style.display = 'block';
                schoolSelect.querySelector('select').required = true;
                break;
            case 'CLASS':
                classSelect.style.display = 'block';
                document.getElementById('schoolForClass').required = true;
                document.getElementById('class').required = true;
                break;
            case 'USER':
                userSelect.style.display = 'block';
                userSelect.querySelector('select').required = true;
                break;
        }
    });

    schoolForClassSelect.addEventListener('change', function() {
        const schoolId = this.value;
        const classSelect = document.getElementById('class');
        const classOptions = classSelect.querySelectorAll('option[data-school-id]');
        
        // Сначала показываем все опции
        classOptions.forEach(option => {
            if (!schoolId) {
                // Если выбраны все школы - показываем название школы
                const schoolName = option.getAttribute('data-school-name');
                option.textContent = `${option.getAttribute('data-class-name')} (${schoolName})`;
                option.style.display = '';
            } else {
                // Если выбрана конкретная школа
                if (option.getAttribute('data-school-id') === schoolId) {
                    option.textContent = option.getAttribute('data-class-name');
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            }
        });
    });

    // Инициализация при загрузке страницы
    if (typeSelect.value) {
        typeSelect.dispatchEvent(new Event('change'));
    }
    
    if (schoolForClassSelect.value) {
        schoolForClassSelect.dispatchEvent(new Event('change'));
    }
});


// public/js/notifications.js
document.addEventListener('DOMContentLoaded', function() {
    const typeSelect = document.getElementById('type');
    const schoolForUserSelect = document.getElementById('schoolForUser');
    const classForUserSelect = document.getElementById('classForUser');
    const userSelect = document.getElementById('userId');
    
    // Функция обновления списка классов
    function updateClassList(schoolId) {
        const classOptions = classForUserSelect.querySelectorAll('option[data-school-id]');
        
        // Сброс значения и показ первой опции
        classForUserSelect.value = '';
        classForUserSelect.querySelector('option:first-child').style.display = '';
        
        // Обновляем отображение опций классов
        classOptions.forEach(option => {
            if(schoolId==''){
                option.style.display = 'none';
            } else if (schoolId=='all') {
                // Если школа не выбрана - показываем все классы с названиями школ
                option.style.display = '';
            } else {
                // Показываем только классы выбранной школы
                option.style.display = option.getAttribute('data-school-id') === schoolId ? '' : 'none';
            }
        });

        // Вызываем обновление списка пользователей после обновления классов
        updateUserList(schoolId, '');
    }

    // Функция обновления списка пользователей
    function updateUserList(schoolId, classId) {
        const userOptions = userSelect.querySelectorAll('option[data-school-id]');
        
        // Сброс значения и показ первой опции
        userSelect.value = '';
        userSelect.querySelector('option:first-child').style.display = '';
        
        // Обновляем отображение опций пользователей
        userOptions.forEach(option => {
            const optionSchoolId = option.getAttribute('data-school-id');
            const optionClassId = option.getAttribute('data-class-id');
            let shouldShow = true;

            if (!schoolId) {
                shouldShow = false;
            }
            if (classId && optionClassId !== classId) {
                shouldShow = false;
            }

            option.style.display = shouldShow ? '' : 'none';
        });
    }

    // Обработчик изменения школы
    schoolForUserSelect.addEventListener('change', function() {
        const selectedSchoolId = this.value;
        updateClassList(selectedSchoolId);
    });

    // Обработчик изменения класса
    classForUserSelect.addEventListener('change', function() {
        const selectedSchoolId = schoolForUserSelect.value;
        const selectedClassId = this.value;
        updateUserList(selectedSchoolId, selectedClassId);
    });

    // Обработчик изменения типа уведомления
    typeSelect.addEventListener('change', function() {
        const isUserType = this.value === 'USER';
        if (isUserType) {
            // Если выбран тип "Пользователь", сбрасываем все значения
            schoolForUserSelect.value = '';
            classForUserSelect.value = '';
            userSelect.value = '';
            // Показываем всех пользователей
            updateUserList('', '');
        }
    });

    // Инициализация при загрузке страницы
    
});



// public/js/project.js
document.addEventListener('DOMContentLoaded', function() {

    const schoolSelect = document.getElementById('schoolSelect');
    const classSelect = document.getElementById('classSelect');
    const selectAll = document.getElementById('selectAll');
    const usersList = document.getElementById('usersList');
    const selectedUsersList = document.getElementById('selectedUsersList');

    // Инициализация при загрузке
    initializeSelectedUsers();

    function initializeSelectedUsers() {
        const checkedCheckboxes = usersList.querySelectorAll('input[type="checkbox"]:checked');
        console.log('Found checked checkboxes:', checkedCheckboxes.length); // для отладки

        checkedCheckboxes.forEach(checkbox => {
            const userItem = checkbox.closest('.user-item');
            const userId = checkbox.value;
            const userName = userItem.querySelector('label').textContent.trim();
            
            const div = document.createElement('div');
            div.className = 'selected-user';
            div.setAttribute('data-user-id', userId);
            div.innerHTML = `
                ${userName}
                <button type="button" class="remove-user" onclick="removeSelectedUser('${userId}')">✕</button>
            `;
            selectedUsersList.appendChild(div);
        });

        updateSelectedCount();
    }

    if (schoolSelect) {
        // Обработчик изменения школы
        schoolSelect.addEventListener('change', function() {
            updateClassList(this.value);
            filterUsers();
        });

        // Обработчик изменения класса
        classSelect.addEventListener('change', filterUsers);

        // Обработчик "Выбрать всех"
        selectAll.addEventListener('change', function() {
            const visibleUsers = usersList.querySelectorAll('.user-item:not([style*="display: none"]) input[type="checkbox"]');
            visibleUsers.forEach(checkbox => {
                checkbox.checked = this.checked;
                updateSelectedUsers(checkbox);
            });
        });

        // Обработчик выбора отдельных пользователей
        usersList.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox') {
                updateSelectedUsers(e.target);
            }
        });
    }

    function updateClassList(schoolId) {
        classSelect.innerHTML = '<option value="">Все классы</option>';
            
        if (!schoolId) return;

        const classesSet = new Set();
        usersList.querySelectorAll('.user-item').forEach(user => {
            if (user.dataset.schoolId === schoolId) {
                const classId = user.dataset.classId;
                const className = user.querySelector('label').textContent.split(' - ')[1].replace(')', '');
                if (classId && className) {
                    classesSet.add(JSON.stringify({ id: classId, name: className }));
                }
            }
        });

        Array.from(classesSet)
            .map(classJson => JSON.parse(classJson))
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(classData => {
                const option = document.createElement('option');
                option.value = classData.id;
                option.textContent = classData.name;
                classSelect.appendChild(option);
            });
    }

    function filterUsers() {
        const schoolId = schoolSelect.value;
        const classId = classSelect.value;

        usersList.querySelectorAll('.user-item').forEach(user => {
            const schoolMatch = !schoolId || user.dataset.schoolId === schoolId;
            const classMatch = !classId || user.dataset.classId === classId;
            user.style.display = (schoolMatch && classMatch) ? '' : 'none';
        });

        selectAll.checked = false;
    }

    function updateSelectedUsers(checkbox) {
        const userItem = checkbox.closest('.user-item');
        const userId = checkbox.value;
        const userName = userItem.querySelector('label').textContent.trim();
        const selectedItem = selectedUsersList.querySelector(`[data-user-id="${userId}"]`);
        
        if (checkbox.checked && !selectedItem) {
            const div = document.createElement('div');
            div.className = 'selected-user';
            div.setAttribute('data-user-id', userId);
            div.innerHTML = `
                ${userName}
                <button type="button" class="remove-user" onclick="removeSelectedUser('${userId}')">✕</button>
            `;
            selectedUsersList.appendChild(div);
        } else if (!checkbox.checked && selectedItem) {
            selectedItem.remove();
        }

        // Обновляем счетчик выбранных пользователей
        updateSelectedCount();
    }

    function updateSelectedCount() {
        const count = selectedUsersList.children.length;
        document.getElementById('selectedCount').textContent = count;
    }

    // Глобальная функция для удаления выбранного пользователя
    window.removeSelectedUser = function(userId) {
        const checkbox = usersList.querySelector(`input[value="${userId}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        const selectedItem = selectedUsersList.querySelector(`[data-user-id="${userId}"]`);
        if (selectedItem) {
            selectedItem.remove();
        }
        updateSelectedCount();
    };
});

function deleteEvent(eventId) {
    if (confirm('Вы уверены, что хотите удалить это событие?')) {
        fetch(`/admin/events/delete/${eventId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert('Ошибка при удалении события');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка при удалении события');
        });
    }
}

const EventManager = {
    deleteEvent: function(eventId) {
        if (confirm('Вы уверены, что хотите удалить это событие?')) {
            fetch(`/admin/events/${eventId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Добавляем flash сообщение через localStorage
                    localStorage.setItem('flashSuccess', 'Событие успешно удалено');
                    window.location.reload();
                } else {
                    alert(data.message || 'Ошибка при удалении события');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ошибка при удалении события');
            });
        }
    },

    validateEventForm: function(form) {
        const title = form.querySelector('[name="title"]').value;
        const description = form.querySelector('[name="description"]').value;
        const date = form.querySelector('[name="date"]').value;
        const schoolId = form.querySelector('[name="schoolId"]').value;

        if (!title || !description || !date || !schoolId) {
            alert('Пожалуйста, заполните все поля');
            return false;
        }

        // Проверка, что дата не в прошлом
        if (new Date(date) < new Date()) {
            alert('Дата события не может быть в прошлом');
            return false;
        }

        return true;
    },

    initEventHandlers: function() {
        // Проверяем наличие flash сообщения при загрузке страницы
        const flashSuccess = localStorage.getItem('flashSuccess');
        if (flashSuccess) {
            // Показываем сообщение (в зависимости от вашей реализации flash-сообщений)
            // ...
            localStorage.removeItem('flashSuccess');
        }

        const eventForm = document.querySelector('.event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', function(e) {
                if (!EventManager.validateEventForm(this)) {
                    e.preventDefault();
                }
            });
        }
    }
};

// При необходимости инициализируем обработчики
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.event-container')) {
        EventManager.initEventHandlers();
    }
});



document.addEventListener('DOMContentLoaded', function() {
    const isGlobalCheckbox = document.getElementById('isGlobalCheckbox');
    const schoolSelectGroup = document.getElementById('schoolSelectGroup');
    const schoolSelect = document.getElementById('schoolSelect');

    isGlobalCheckbox.addEventListener('change', function() {
        if (this.checked) {
            schoolSelectGroup.style.display = 'none';
            schoolSelect.value = '';
            schoolSelect.required = false;
        } else {
            schoolSelectGroup.style.display = 'block';
            schoolSelect.required = true;
        }
    });
});


const DiscussionManager = {
    deleteDiscussion: function(id) {
        if (confirm('Вы уверены, что хотите удалить это обсуждение?')) {
            fetch(`/admin/discussions/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Ошибка при удалении обсуждения');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const typeFilter = document.getElementById('typeFilter');
    const discussionCards = document.querySelectorAll('.discussion-card');

    typeFilter.addEventListener('change', function() {
        const selectedType = this.value;
        
        discussionCards.forEach(card => {
            if (selectedType === 'all' || card.dataset.type === selectedType) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});



//notification
// В глобальном файле admin.js
const NotificationManager = {
    init: function() {
        const typeSelect = document.getElementById('notificationType');
        if (!typeSelect) return; // Проверяем, что мы на странице уведомлений

        const schoolSelect = document.querySelector('.school-select');
        const classSelect = document.querySelector('.class-select');
        const userSelect = document.querySelector('.user-select');

        if (schoolSelect && classSelect && userSelect) {
            this.initializeSelects(typeSelect, schoolSelect, classSelect, userSelect);
        }
    },

    initializeSelects: function(typeSelect, schoolSelect, classSelect, userSelect) {
        typeSelect.addEventListener('change', function() {
            // Скрываем все селекты
            this.hideAllSelects(schoolSelect, classSelect, userSelect);
            
            // Показываем нужный селект
            switch(typeSelect.value) {
                case 'SCHOOL':
                    this.showSelect(schoolSelect);
                    break;
                case 'CLASS':
                    this.showSelect(classSelect);
                    break;
                case 'USER':
                    this.showSelect(userSelect);
                    break;
            }
        }.bind(this));
    },

    hideAllSelects: function(schoolSelect, classSelect, userSelect) {
        // Скрываем все селекты и убираем required
        [schoolSelect, classSelect, userSelect].forEach(select => {
            select.style.display = 'none';
            const selectElement = select.querySelector('select');
            if (selectElement) {
                selectElement.required = false;
            }
        });
    },

    showSelect: function(selectContainer) {
        selectContainer.style.display = 'block';
        const selectElement = selectContainer.querySelector('select');
        if (selectElement) {
            selectElement.required = true;
        }
    },

    deleteNotification: function(id) {
        if (confirm('Вы уверены, что хотите удалить это уведомление?')) {
            fetch(`/admin/notification/delete/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert(data.message || 'Ошибка при удалении уведомления');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ошибка при удалении уведомления');
            });
        }
    },

    // Методы для пагинации
    initPagination: function() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        paginationContainer.addEventListener('click', function(e) {
            e.preventDefault();
            const link = e.target.closest('a');
            if (!link) return;

            const page = new URL(link.href).searchParams.get('page');
            NotificationManager.loadPage(page);
        });
    },

    loadPage: function(page) {
        window.location.href = `/admin/notification?page=${page}`;
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что мы на странице уведомлений
    if (document.querySelector('.notification-form')) {
        NotificationManager.init();
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



// Для добавления в global.js
// Создаем пространство имен для функций управления идеями

const SchoolIdeaManager = {
    // Инициализация менеджера
    init: function() {
        this.bindEvents();
    },

    // Привязка обработчиков событий
    bindEvents: function() {
        document.addEventListener('click', (e) => {
            const confirmBtn = e.target.closest('.school-idea-btn-confirm');
            const rejectBtn = e.target.closest('.school-idea-btn-reject');

            if (confirmBtn) {
                const ideaId = confirmBtn.dataset.ideaId;
                this.updateStatus(ideaId, true);
            } else if (rejectBtn) {
                const ideaId = rejectBtn.dataset.ideaId;
                this.updateStatus(ideaId, false);
            }
        });
    },

    // Обновление статуса идеи
    updateStatus: function(ideaId, confirm) {
        // Показываем индикатор загрузки
        const card = document.querySelector(`.school-idea-card[data-id="${ideaId}"]`);
        const actions = card.querySelector('.school-idea-actions');
        const originalContent = actions.innerHTML;
        
        actions.innerHTML = '<div class="school-idea-loading">Обновление...</div>';

        // Отправляем запрос
        fetch(`/admin/ideas/${ideaId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ confirm })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем UI
                actions.innerHTML = `
                    <span class="school-idea-status ${
                        confirm ? 'school-idea-status-confirmed' : 'school-idea-status-rejected'
                    }">
                        ${confirm ? 'Подтверждено' : 'Отклонено'}
                    </span>`;
                
                // Показываем уведомление
                this.showNotification(
                    'Статус идеи успешно обновлен', 
                    'success'
                );
            } else {
                throw new Error(data.message || 'Ошибка обновления');
            }
        })
        .catch(error => {
            // Возвращаем оригинальное состояние в случае ошибки
            actions.innerHTML = originalContent;
            this.showNotification(
                'Произошла ошибка при обновлении статуса', 
                'error'
            );
        });
    },

    // Показ уведомления
    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `school-idea-alert school-idea-alert-${type}`;
        notification.textContent = message;

        // Добавляем уведомление в начало списка
        const container = document.querySelector('.school-ideas-container');
        container.insertBefore(notification, container.firstChild);

        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Инициализируем менеджер когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    SchoolIdeaManager.init();
});