<?php
include 'koneksi.php';

header('Content-Type: application/json');

$sql = "SELECT * FROM tasks ORDER BY created_at DESC";
$result = mysqli_query($conn, $sql);

$tasks = [];
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $tasks[] = $row;
    }
}

echo json_encode($tasks);

mysqli_close($conn);
?>