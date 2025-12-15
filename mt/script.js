(function(){
    // ===== CALENDAR SETUP =====
    const monthPicker = document.getElementById('month-picker');
    const monthLabel = document.getElementById('month-label');
    const calendar = document.getElementById('calendar');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    // Keep tasks persisted
    let tasks = [];

    // Load tasks from database
    async function loadTasks() {
        try {
            const response = await fetch('get_tasks.php');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            tasks = await response.json();
            renderNotes();
            // initial render calendar
            const now = new Date();
            setPicker(now.getFullYear(), now.getMonth());
            renderCalendar(now.getFullYear(), now.getMonth());
        } catch (error) {
            console.error('Error loading tasks:', error);
            alert('Error loading tasks from database. Make sure XAMPP is running.');
        }
    }

    loadTasks();

    function renderCalendar(year, month) {
        if (!calendar) return;
        const first = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = first.getDay();
        const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

        let html = '';
        for (const wd of weekdays) {
            html += `<div class="weekday">${wd}</div>`;
        }

        for (let i = 0; i < startDay; i++) {
            html += `<div class="day empty"></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            html += `<div class="day" data-day="${d}" data-month="${month}" data-year="${year}"><div class="day-number">${d}</div></div>`;
        }

        const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
        for (let i = startDay + daysInMonth; i < totalCells; i++) {
            html += `<div class="day empty"></div>`;
        }

        calendar.innerHTML = html;
        monthLabel.textContent = `${first.toLocaleString('id-ID', { month: 'long' })} ${year}`;

        const today = new Date();
        if (today.getFullYear() === year && today.getMonth() === month) {
            const node = calendar.querySelector(`.day[data-day="${today.getDate()}"]`);
            if (node) node.classList.add('today');
        }

        // Add tasks dots / events to calendar days
        addTasksToCalendar(year, month);
    }

    function addTasksToCalendar(year, month) {
        tasks.forEach(task => {
            if (!task.deadline) return;
            const taskDate = new Date(task.deadline);
            if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
                const day = taskDate.getDate();
                const dayCell = calendar.querySelector(`.day[data-day="${day}"][data-month="${month}"][data-year="${year}"]`);

                if (dayCell) {
                    const eventEl = document.createElement('div');
                    eventEl.className = 'event';
                    eventEl.style.backgroundColor = getRandomColor();
                    eventEl.innerHTML = `
                        <div class="event-title">${task.icon} ${task.title}</div>
                        <div class="event-meta">${(task.description||'').substring(0, 30)}${(task.description && task.description.length>30)?'...':''}</div>
                    `;
                    dayCell.appendChild(eventEl);
                }
            }
        });
    }

    function getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function setPicker(year, monthZeroBased) {
        if (!monthPicker) return;
        monthPicker.value = `${String(year).padStart(4,'0')}-${String(monthZeroBased + 1).padStart(2,'0')}`;
    }

    function parsePicker() {
        if (!monthPicker || !monthPicker.value) {
            const now = new Date();
            return { y: now.getFullYear(), m: now.getMonth() };
        }
        const [y, m] = monthPicker.value.split('-');
        return { y: Number(y), m: Number(m) - 1 };
    }

    if (monthPicker) {
        monthPicker.addEventListener('change', () => {
            const { y, m } = parsePicker();
            renderCalendar(y, m);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const { y, m } = parsePicker();
            let year = y, month = m - 1;
            if (month < 0) { month = 11; year--; }
            setPicker(year, month);
            renderCalendar(year, month);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const { y, m } = parsePicker();
            let year = y, month = m + 1;
            if (month > 11) { month = 0; year++; }
            setPicker(year, month);
            renderCalendar(year, month);
        });
    }

    // ===== MODAL & NOTES =====
    const newNoteBtn = document.getElementById('new-note-btn');
    const taskModal = document.getElementById('task-modal');
    const closeModalBtns = document.querySelectorAll('.modal-close');
    const cancelStep1 = document.getElementById('cancel-step1');
    const nextStep1 = document.getElementById('next-step1');
    const backStep1 = document.getElementById('back-step1');
    const saveTask = document.getElementById('save-task');
    const modalOverlay = document.getElementById('modal-overlay');

    const taskTitle = document.getElementById('task-title');
    const taskDesc = document.getElementById('task-desc');
    const taskFile = document.getElementById('task-file');
    const taskDeadline = document.getElementById('task-deadline');

    const editor = document.getElementById('notes-editor');
    const placeholder = document.querySelector('.placeholder');
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const closeSearchModal = document.getElementById('close-search-modal');
    const cancelSearch = document.getElementById('cancel-search');
    const performSearch = document.getElementById('perform-search');
    const searchQueryInput = document.getElementById('search-query');
    const searchModalOverlay = document.getElementById('search-modal-overlay');

    let selectedIcon = '📝';
    let taskData = {};
    let searchQuery = '';

    // Search functionality
    function openSearchModal() {
        if (!searchModal) return;
        searchModal.classList.add('active');
        searchModal.setAttribute('aria-hidden', 'false');
        searchQueryInput.value = searchQuery;
        searchQueryInput.focus();
    }

    function closeSearchModal() {
        if (!searchModal) return;
        searchModal.classList.remove('active');
        searchModal.setAttribute('aria-hidden', 'true');
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', openSearchModal);
    }
    if (closeSearchModal) closeSearchModal.addEventListener('click', closeSearchModal);
    if (cancelSearch) cancelSearch.addEventListener('click', closeSearchModal);
    if (searchModalOverlay) searchModalOverlay.addEventListener('click', closeSearchModal);

    if (performSearch) {
        performSearch.addEventListener('click', () => {
            searchQuery = searchQueryInput.value.trim();
            renderNotes();
            closeSearchModal();
        });
    }

    // helper: render notes in editor area (Your Notes)
    function renderNotes() {
        if (!editor) return;
        // clear existing content
        editor.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            const query = searchQuery.toLowerCase();
            return task.title.toLowerCase().includes(query);
        });
        if (!filteredTasks || filteredTasks.length === 0) {
            editor.classList.add('empty');
            const p = document.createElement('p');
            p.className = 'placeholder';
            p.textContent = searchQuery ? 'No notes found matching your search.' : 'No notes yet. Buat catatan baru untuk melihat judul di sini';
            editor.appendChild(p);
            return;
        }

        // remove empty state
        editor.classList.remove('empty');

        // create cards
        filteredTasks.forEach(task => {
            const noteCard = document.createElement('div');
            noteCard.className = 'event-card';
            // Simpan ID tugas pada elemen kartu
            noteCard.dataset.taskId = task.id; 
            
            const deadlineDate = task.deadline ? new Date(task.deadline) : null;
            const formattedDate = deadlineDate ? deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    
            const shortDesc = task.description ? (task.description.length > 80 ? task.description.substring(0,80)+'...' : task.description) : '(Tanpa deskripsi)';
    
            noteCard.innerHTML = `
                <button class="delete-task-btn" data-task-id="${task.id}">X</button> <div class="event-card-left">${task.icon}</div>
                <div class="event-card-body">
                    <div class="event-card-title">${task.title}</div>
                    <div class="event-card-meta">${shortDesc}</div>
                    <div class="event-card-meta" style="font-size:11px; margin-top:6px; color:#8a8a8a;">${formattedDate ? 'Deadline: '+formattedDate : ''}</div>
                </div>
            `;
            editor.appendChild(noteCard);
        });
    
        // Tambahkan event listeners untuk tombol hapus
        document.querySelectorAll('.delete-task-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Mencegah event klik kartu
                const taskId = parseInt(e.currentTarget.dataset.taskId);
                if (confirm('Yakin ingin menghapus tugas ini?')) {
                    deleteTask(taskId);
                }
            }); 
        });
    }

    async function saveNote(title, description) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('deadline', '');
        formData.append('icon', '📝');

        try {
            const response = await fetch('save_task.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            if (result.success) {
                await loadTasks(); // Reload tasks from server
            } else {
                alert('Error saving note: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Error saving note. Make sure XAMPP is running.');
        }
    }

    function openModal() {
        if (!taskModal) return;
        taskModal.classList.add('active');
        taskModal.setAttribute('aria-hidden', 'false');
        resetForm();
    }

    function closeModal() {
        if (!taskModal) return;
        taskModal.classList.remove('active');
        taskModal.setAttribute('aria-hidden', 'true');
        resetForm();
    }

    if (newNoteBtn) newNoteBtn.addEventListener('click', () => {
        const title = prompt('Masukkan judul catatan:');
        if (title && title.trim()) {
            const description = prompt('Masukkan deskripsi catatan (opsional):') || '';
            saveNote(title.trim(), description.trim());
        }
    });
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
    if (cancelStep1) cancelStep1.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // step navigation
    if (nextStep1) {
        nextStep1.addEventListener('click', () => {
            if (!taskTitle.value.trim()) {
                alert('Judul tugas tidak boleh kosong!');
                return;
            }
            taskData = {
                title: taskTitle.value.trim(),
                description: taskDesc.value.trim(),
                file: taskFile.files[0] || null
            };
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        });
    }
    if (backStep1) {
        backStep1.addEventListener('click', () => {
            document.getElementById('step-2').classList.add('hidden');
            document.getElementById('step-1').classList.remove('hidden');
        });
    }

    // icon select
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedIcon = btn.dataset.icon;
        });
    });

    // save task: send to server, then reload tasks
    if (saveTask) {
        saveTask.addEventListener('click', async () => {
            const formData = new FormData();
            formData.append('title', taskData.title || taskTitle.value.trim());
            formData.append('description', taskData.description || taskDesc.value.trim());
            formData.append('deadline', taskDeadline.value || null);
            formData.append('icon', selectedIcon || '📝');
            if (taskFile && taskFile.files && taskFile.files[0]) {
                formData.append('file', taskFile.files[0]);
            }

            try {
                const response = await fetch('save_task.php', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                if (result.success) {
                    await loadTasks(); // Reload tasks from server
                    closeModal();
                } else {
                    alert('Error saving task: ' + result.error);
                }
            } catch (error) {
                console.error('Error saving task:', error);
                alert('Error saving task. Make sure XAMPP is running.');
            }
        });
    }

    // reset form
    function resetForm() {
        if (taskTitle) taskTitle.value = '';
        if (taskDesc) taskDesc.value = '';
        if (taskFile) taskFile.value = '';
        if (taskDeadline) taskDeadline.value = '';
        selectedIcon = '📝';
        document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('selected'));
        const defaultIcon = document.querySelector('.icon-btn[data-icon="📝"]');
        if (defaultIcon) defaultIcon.classList.add('selected');
        document.getElementById('step-1').classList.remove('hidden');
        document.getElementById('step-2').classList.add('hidden');
    }

    if (saveTask) {
        // ... (Kode yang sudah ada) ...
    }

    // Fungsi baru: Hapus tugas
    async function deleteTask(id) {
        try {
            const response = await fetch('delete_task.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'id=' + id
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            if (result.success) {
                await loadTasks(); // Reload tasks from server
            } else {
                alert('Error deleting task: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task. Make sure XAMPP is running.');
        }
    }
    
    // expose small helper (UPDATE: Tambahkan deleteTask ke helper)
    window.__mtt = {
        getTasks: () => tasks,
        clearTasks: async () => { tasks = []; await loadTasks(); },
        deleteTask: deleteTask // Expose juga fungsi deleteTask
    };


    // ===== THEME TOGGLE (LIGHT / DARK) =====
    const toggleMode = document.getElementById('toggle-mode');
    if (toggleMode) {
        toggleMode.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            const iconImg = toggleMode.querySelector('img');
            if (isLight) {
                localStorage.setItem('theme', 'light');
                iconImg.src = 'asset/dark.png';
                iconImg.alt = 'dark-mode';
            } else {
                localStorage.setItem('theme', 'dark');
                iconImg.src = 'asset/light.png';
                iconImg.alt = 'light-mode';
            }
        });
    }

    // ===== LOAD THEME ON STARTUP =====
    (function loadTheme() {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') {
            document.body.classList.add('light-mode');
            const iconImg = document.getElementById('toggle-mode').querySelector('img');
            if (iconImg) {
                iconImg.src = 'asset/dark.png';
                iconImg.alt = 'dark-mode';
            }
        }
    })();

})();