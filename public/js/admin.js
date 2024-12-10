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
    

    function updatePagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (paginationContainer) {
            const currentPage = parseInt(paginationContainer.dataset.currentPage) || 1;
            const totalPages = parseInt(paginationContainer.dataset.totalPages) || 1;
            
            let paginationHTML = '';
            
            if (currentPage > 1) {
                paginationHTML += `<a href="?page=${currentPage - 1}" class="btn btn-primary">Предыдущая</a>`;
            }
            
            paginationHTML += `<span class="page-info">Страница ${currentPage} из ${totalPages}</span>`;
            
            if (currentPage < totalPages) {
                paginationHTML += `<a href="?page=${currentPage + 1}" class="btn btn-primary">Следующая</a>`;
            }
            
            paginationContainer.innerHTML = paginationHTML;
        }
    }

    // Вызов функции обновления пагинации при загрузке страницы
    updatePagination();

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
                const className = user.querySelector('label').textContent.match(/\((.*?) -/)?.[1];
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