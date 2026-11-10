let allTransactions = []; // Все данные
let displayedTransactions = []; // Отфильтрованные данные

// 1. Загрузка данных
async function loadData() {
    try {
        const response = await fetch('data.json'); // Имя вашего файла
        if (!response.ok) throw new Error('Ошибка загрузки');
        allTransactions = await response.json();
        displayedTransactions = [...allTransactions];
        
        initCategories(); // Заполняем выпадающий список категорий
        renderTable();
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось загрузить данные. Убедитесь, что сервер запущен.");
    }
}

// 2. Заполнение фильтра категорий (чтобы не хардкодить их в HTML)
function initCategories() {
    const categories = [...new Set(allTransactions.map(t => t.category))];
    const select = document.getElementById('filter-category');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

// 3. Отрисовка таблицы
function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = ''; // Очищаем

    let totalIncome = 0;
    let totalExpense = 0;

    displayedTransactions.forEach(t => {
        const tr = document.createElement('tr');
        
        // Форматирование суммы
        const amountFormatted = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(t.amount);
        const typeRu = t.type === 'income' ? 'Доход' : 'Расход';
        const amountClass = t.type === 'income' ? 'text-income' : 'text-expense';
        const amountSign = t.type === 'income' ? '+' : '-';

        // Подсчет итогов
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpense += t.amount;

        tr.innerHTML = `
            <td>${t.date.split('-').reverse().join('.')}</td> <!-- Формат ДД.ММ.ГГГГ -->
            <td>${typeRu}</td>
            <td>${t.category}</td>
            <td>${t.description}</td>
            <td class="${amountClass}">${amountSign} ${amountFormatted}</td>
        `;
        tbody.appendChild(tr);
    });

    // Обновление итогов
    document.getElementById('total-income').textContent = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(totalIncome);
    document.getElementById('total-expense').textContent = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(totalExpense);
    document.getElementById('total-balance').textContent = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(totalIncome - totalExpense);
    document.getElementById('total-count').textContent = displayedTransactions.length;
}

// 4. Фильтрация
function applyFilters() {
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;

    displayedTransactions = allTransactions.filter(t => {
        if (type !== 'all' && t.type !== type) return false;
        if (category !== 'all' && t.category !== category) return false;
        if (dateFrom && t.date < dateFrom) return false;
        if (dateTo && t.date > dateTo) return false;
        return true;
    });

    renderTable();
}

// 5. Сортировка
let currentSort = { field: 'date', asc: true };

document.querySelectorAll('th').forEach(th => {
    th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (currentSort.field === field) {
            currentSort.asc = !currentSort.asc; // Меняем направление
        } else {
            currentSort.field = field;
            currentSort.asc = true;
        }

        displayedTransactions.sort((a, b) => {
            let valA = a[field];
            let valB = b[field];
            
            // Для чисел и дат (строки в формате YYYY-MM-DD сравниваются корректно)
            if (valA < valB) return currentSort.asc ? -1 : 1;
            if (valA > valB) return currentSort.asc ? 1 : -1;
            return 0;
        });
        renderTable();
    });
});

// 6. Обработчики событий для фильтров
document.getElementById('filter-type').addEventListener('change', applyFilters);
document.getElementById('filter-category').addEventListener('change', applyFilters);
document.getElementById('filter-date-from').addEventListener('change', applyFilters);
document.getElementById('filter-date-to').addEventListener('change', applyFilters);

document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    applyFilters();
});

// Запуск
loadData();