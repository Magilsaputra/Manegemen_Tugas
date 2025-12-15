<?php ?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Manajemen Tugas</title>
    <link rel="stylesheet" href="styles.css" />
</head>
<body>
    <input type="checkbox" id="menu-toggle" class="menu-toggle" />

    <div class="main">
        <aside class="sidebar">
            <div class=""><img src="asset/logo.png" alt="MT" width="86px"></div>
            <button id="new-note-btn" class="side-btn"><h3>New Note</h3></button>
            <button class="side-btn">Search</button>
            <button class="side-btn">More</button>
        </aside>

        <div class="main-area">
            <header class="topbar">
                <label for="menu-toggle" class="menu-btn" aria-hidden="true">☰</label>

                <div class="notes">
                    <h3>Your Notes</h3>
                </div>

                <div class="top-actions">
                    <button class="txt-btn" id="toggle-mode"><img src="asset/light.png" alt="light-mode" width="100px" ></button>
                </div>

            </header>

            <section class="editor-wrap">
                <div class="editor empty" id="notes-editor">
                    <p class="placeholder">No notes yet. Buat catatan baru untuk melihat judul di sini</p>
                </div>
            </section>

            <section class="schedule-wrap">
                <div class="schedule-header">
                    <h3>Your Schedule</h3>

                    <div class="schedule-controls">
                        <button id="prev-month" aria-label="Previous month">‹</button>
                        <div class="month-label" id="month-label"></div>

                        <input type="month" id="month-picker" />

                        <button id="next-month" aria-label="Next month">›</button>
                    </div>
                </div>

                <div class="calendar" id="calendar">
                    </div>

                <div id="events-list" class="events-list" aria-hidden="true"></div>
            </section>
        </div>

    <label for="menu-toggle" class="backdrop" aria-hidden="true"></label>

    <div id="task-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true" data-mode="new">
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-content" role="document">
            <div class="modal-step" id="step-1">
                <div class="modal-header">
                    <h2 id="task-modal-title-1">Buat Tugas Baru</h2>
                    <button class="modal-close" id="close-modal" aria-label="Tutup">&times;</button>
                </div>
                <form class="modal-form" onsubmit="return false;">
                    <div class="form-group">
                        <label for="task-title">Judul Tugas</label>
                        <input type="text" id="task-title" placeholder="Masukkan judul tugas" required />
                    </div>
                    <div class="form-group">
                        <label for="task-desc">Deskripsi</label>
                        <textarea id="task-desc" placeholder="Masukkan deskripsi tugas" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="task-file">Upload File (Opsional)</label>
                        <input type="file" id="task-file" />
                        <span id="existing-file-name" style="font-size:12px; color:#9a9a9a; display:none;"></span>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" id="cancel-step1">Batal</button>
                        <button type="button" class="btn-next" id="next-step1">Selanjutnya</button>
                    </div>
                </form>
            </div>

            <div class="modal-step hidden" id="step-2">
                <div class="modal-header">
                    <h2 id="task-modal-title-2">Pilih Icon & Deadline</h2>
                    <button class="modal-close" id="close-modal-2" aria-label="Tutup">&times;</button>
                </div>
                <form class="modal-form" onsubmit="return false;">
                    <div class="form-group">
                        <label>Pilih Icon</label>
                        <div class="icon-grid">
                            <button type="button" class="icon-btn selected" data-icon="📝">📝</button>
                            <button type="button" class="icon-btn" data-icon="💼">💼</button>
                            <button type="button" class="icon-btn" data-icon="🎓">🎓</button>
                            <button type="button" class="icon-btn" data-icon="📊">📊</button>
                            <button type="button" class="icon-btn" data-icon="🎨">🎨</button>
                            <button type="button" class="icon-btn" data-icon="💻">💻</button>
                            <button type="button" class="icon-btn" data-icon="🔧">🔧</button>
                            <button type="button" class="icon-btn" data-icon="📅">📅</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="task-deadline">Deadline</label>
                        <input type="date" id="task-deadline" required />
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" id="back-step1">Kembali</button>
                        <button type="button" class="btn-save" id="save-edit-task">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
 </body>
 </html>