(function(){
    // ===== CALENDAR SETUP =====
    const monthPicker = document.getElementById('month-picker');
    const monthLabel = document.getElementById('month-label');
    const calendar = document.getElementById('calendar');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    // Keep tasks persisted
    let tasks = [];

    async function loadTasks() {
        try {
            const response = await fetch('get_tasks.php');
            tasks = await response.json();
            renderNotes();
            const { y, m } = parsePicker();
            renderCalendar(y, m);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

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

    // initial render
    const now = new Date();
    setPicker(now.getFullYear(), now.getMonth());
    renderCalendar(now.getFullYear(), now.getMonth());

    // ===== MODAL & NOTES (Fitur Edit Catatan dimulai di sini) =====
    const newNoteBtn = document.getElementById('new-note-btn');
    const taskModal = document.getElementById('task-modal');
    const closeModalBtns = document.querySelectorAll('.modal-close');
    const cancelStep1 = document.getElementById('cancel-step1');
    const nextStep1 = document.getElementById('next-step1');
    const backStep1 = document.getElementById('back-step1');
    // UBAH ID: saveTask menjadi saveOrUpdateTaskBtn
    const saveOrUpdateTaskBtn = document.getElementById('save-edit-task');
    const modalOverlay = document.getElementById('modal-overlay');

    const taskTitle = document.getElementById('task-title');
    const taskDesc = document.getElementById('task-desc');
    const taskFile = document.getElementById('task-file');
    const existingFileNameSpan = document.getElementById('existing-file-name'); // Tambahkan elemen ini
    const taskDeadline = document.getElementById('task-deadline');

    const editor = document.getElementById('notes-editor');
    const placeholder = document.querySelector('.placeholder');

    const modalTitle1 = document.getElementById('task-modal-title-1'); // Ambil elemen title
    const modalTitle2 = document.getElementById('task-modal-title-2'); // Ambil elemen title

    let selectedIcon = '📝'; 
    let taskData = {};
    let editingTaskId = null; // **BARU**: ID tugas yang sedang diedit

    // helper: render notes in editor area (Your Notes)
    function renderNotes() {
        if (!editor) return;
        // clear existing content
        editor.innerHTML = '';
        if (!tasks || tasks.length === 0) {
            editor.classList.add('empty');
            const p = document.createElement('p');
            p.className = 'placeholder';
            p.textContent = 'No notes yet. Buat catatan baru untuk melihat judul di sini';
            editor.appendChild(p);
            return;
        }

        // remove empty state
        editor.classList.remove('empty');

        // create cards
        tasks.forEach(task => {
            const noteCard = document.createElement('div');
            noteCard.className = 'event-card';
            // Simpan ID tugas pada elemen kartu
            noteCard.dataset.taskId = task.id; 
            
            const deadlineDate = task.deadline ? new Date(task.deadline) : null;
            const formattedDate = deadlineDate ? deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    
            const shortDesc = task.description ? (task.description.length > 80 ? task.description.substring(0,80)+'...' : task.description) : '(Tanpa deskripsi)';
    
            const fileInfo = task.file_path ? `<div class="event-card-meta" style="font-size:11px; margin-top:4px; color:#4ecdc4;">File: ${task.file_path.split('/').pop()}</div>` : '';
    
            noteCard.innerHTML = `
                <button class="delete-task-btn" data-task-id="${task.id}">X</button> <div class="event-card-left">${task.icon}</div>
                <div class="event-card-body">
                    <div class="event-card-title">${task.title}</div>
                    <div class="event-card-meta">${shortDesc}</div>
                    <div class="event-card-meta" style="font-size:11px; margin-top:6px; color:#8a8a8a;">${formattedDate ? 'Deadline: '+formattedDate : ''}</div>
                    ${fileInfo}
                </div>
            `;
            
            // **PERBAIKAN**: Tambahkan event listener untuk mengedit saat kartu diklik
            noteCard.addEventListener('click', (e) => {
                // Pastikan tidak mengklik tombol hapus
                if (e.target.classList.contains('delete-task-btn')) return; 

                const taskId = parseInt(e.currentTarget.dataset.taskId);
                openEditModal(taskId);
            });
            
            // Tambahkan event listener khusus untuk icon agar klik icon langsung edit
            const iconDiv = noteCard.querySelector('.event-card-left');
            if (iconDiv) {
                iconDiv.addEventListener('click', (e) => {
                    e.stopPropagation(); // Mencegah event klik kartu
                    alert('Icon clicked for task ID: ' + noteCard.dataset.taskId);
                    const taskId = parseInt(noteCard.dataset.taskId);
                    openEditModal(taskId);
                });
            }
            
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
        // Logika edit yang sebelumnya di sini sudah dipindahkan ke dalam loop tasks.forEach
    }

    // initialize notes on load
    loadTasks();

    // **BARU**: Fungsi untuk membuka modal dalam mode Edit
    function openEditModal(taskId) {
        alert('Opening edit modal for task ID: ' + taskId);
        editingTaskId = taskId;
        taskModal.dataset.mode = 'edit';
        modalTitle1.textContent = 'Edit Tugas';
        modalTitle2.textContent = 'Edit Icon & Deadline';
        if (!taskModal) {
            alert('taskModal not found');
            return;
        }
        taskModal.classList.add('active');
        taskModal.setAttribute('aria-hidden', 'false');

        const taskToEdit = tasks.find(t => t.id === taskId);
        if (taskToEdit) {
            taskTitle.value = taskToEdit.title;
            taskDesc.value = taskToEdit.description || '';
            taskDeadline.value = taskToEdit.deadline || '';
            selectedIcon = taskToEdit.icon || '📝'; // Set icon yang sudah ada

            // Tampilkan nama file yang sudah ada
            if (taskToEdit.file_path) {
                const fileName = taskToEdit.file_path.split('/').pop();
                existingFileNameSpan.textContent = `File saat ini: ${fileName}`;
                existingFileNameSpan.style.display = 'block';
            } else {
                existingFileNameSpan.textContent = '';
                existingFileNameSpan.style.display = 'none';
            }
            
            // Kosongkan input file agar tidak menimpa file yang sudah ada kecuali jika pengguna memilih file baru
            taskFile.value = '';

            // Pilih ikon yang sesuai
            document.querySelectorAll('.icon-btn').forEach(b => {
                b.classList.remove('selected');
                if (b.dataset.icon === selectedIcon) {
                    b.classList.add('selected');
                }
            });
        }
    }

    // modal open/close (Disesuaikan untuk mode edit/new)
    function openModal() {
        editingTaskId = null; // Pastikan null untuk mode baru
        taskModal.dataset.mode = 'new';
        modalTitle1.textContent = 'Buat Tugas Baru';
        modalTitle2.textContent = 'Pilih Icon & Deadline';
        if (!taskModal) return;
        taskModal.classList.add('active');
        taskModal.setAttribute('aria-hidden', 'false');
        resetForm();
    }
    function closeModal() {
        editingTaskId = null; // Reset saat modal ditutup
        if (!taskModal) return;
        taskModal.classList.remove('active');
        taskModal.setAttribute('aria-hidden', 'true');
        resetForm();
    }

    if (newNoteBtn) newNoteBtn.addEventListener('click', openModal);
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
            // Simpan data dari langkah 1 (Detail Tugas)
            taskData = {
                title: taskTitle.value.trim(),
                description: taskDesc.value.trim(),
                // File hanya disimpan sementara untuk transfer
                file: taskFile.files[0] || null
            };
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
            
            // Pilih ikon default jika belum ada yang terpilih (saat mode new)
            if (!document.querySelector('.icon-btn.selected')) {
                const defaultIcon = document.querySelector('.icon-btn[data-icon="📝"]');
                if (defaultIcon) defaultIcon.classList.add('selected');
            }
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

    // **BARU**: Fungsi untuk menyimpan atau memperbarui tugas
    async function saveOrUpdateTask() {
        if (!taskDeadline.value) {
            alert('Deadline tidak boleh kosong!');
            return;
        }

        const isEditing = editingTaskId !== null;

        const formData = new FormData();
        formData.append('title', taskData.title || taskTitle.value.trim());
        formData.append('description', taskData.description || taskDesc.value.trim());
        formData.append('deadline', taskDeadline.value);
        formData.append('icon', selectedIcon || '📝');

        if (isEditing) {
            formData.append('id', editingTaskId);
        }

        const newFile = taskFile.files[0];
        if (newFile) {
            formData.append('file', newFile);
        }

        try {
            const url = isEditing ? 'update_task.php' : 'save_task.php';
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                await loadTasks();
                closeModal();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task');
        }
    }

    // Event listener untuk tombol Simpan (Save/Edit)
    if (saveOrUpdateTaskBtn) {
        saveOrUpdateTaskBtn.addEventListener('click', saveOrUpdateTask);
    }


    // Fungsi baru: Hapus tugas
    async function deleteTask(id) {
        try {
            const formData = new FormData();
            formData.append('id', id);
            const response = await fetch('delete_task.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                await loadTasks();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task');
        }
    }
    
    // reset form (Disesuaikan untuk mode edit/new)
    function resetForm() {
        if (taskTitle) taskTitle.value = '';
        if (taskDesc) taskDesc.value = '';
        if (taskFile) taskFile.value = '';
        if (existingFileNameSpan) {
            existingFileNameSpan.textContent = '';
            existingFileNameSpan.style.display = 'none';
        }
        if (taskDeadline) taskDeadline.value = '';
        selectedIcon = '📝'; 
        document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('selected'));
        const defaultIcon = document.querySelector('.icon-btn[data-icon="📝"]'); 
        if (defaultIcon) defaultIcon.classList.add('selected');
        document.getElementById('step-1').classList.remove('hidden');
        document.getElementById('step-2').classList.add('hidden');
        taskModal.dataset.mode = 'new';
        modalTitle1.textContent = 'Buat Tugas Baru';
        modalTitle2.textContent = 'Pilih Icon & Deadline';
        editingTaskId = null;
        taskData = {}; // Reset data cache
    }


    // expose small helper (UPDATE: Ganti saveTask menjadi saveOrUpdateTaskBtn)
    window.__mtt = {
        getTasks: () => tasks,
        clearTasks: () => { tasks = []; localStorage.removeItem('tasks'); renderNotes(); renderCalendar(now.getFullYear(), now.getMonth()); },
        deleteTask: deleteTask
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