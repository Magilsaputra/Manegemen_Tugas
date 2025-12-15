<?php
include 'koneksi.php';

// Drop tabel tasks jika ada
$sql_drop = "DROP TABLE IF EXISTS tasks";
if (mysqli_query($conn, $sql_drop)) {
    echo "Tabel tasks dihapus jika ada.\n";
} else {
    echo "Error menghapus tabel: " . mysqli_error($conn) . "\n";
}

// Buat tabel tasks
$sql = "CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    icon VARCHAR(10),
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if (mysqli_query($conn, $sql)) {
    echo "Tabel tasks berhasil dibuat.";
} else {
    echo "Error: " . mysqli_error($conn);
}

mysqli_close($conn);
?>