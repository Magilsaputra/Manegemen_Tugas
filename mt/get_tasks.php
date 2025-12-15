<?php
include 'koneksi.php';

$sql = "SELECT * FROM tasks ORDER BY created_at DESC";
$result = mysqli_query($conn, $sql);

$tasks = [];
if (mysqli_num_rows($result) > 0) {
    while($row = mysqli_fetch_assoc($result)) {
        $tasks[] = $row;
    }
}

echo json_encode($tasks);

mysqli_close($conn);
?>