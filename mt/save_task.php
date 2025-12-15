<?php
include 'koneksi.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$title = mysqli_real_escape_string($conn, $_POST['title']);
$description = mysqli_real_escape_string($conn, $_POST['description']);
$deadline = mysqli_real_escape_string($conn, $_POST['deadline']);
$icon = mysqli_real_escape_string($conn, $_POST['icon']);

$file_path = null;
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = 'uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    $file_name = basename($_FILES['file']['name']);
    $file_path = $upload_dir . time() . '_' . $file_name;
    move_uploaded_file($_FILES['file']['tmp_name'], $file_path);
}

$sql = "INSERT INTO tasks (title, description, deadline, icon, file_path) VALUES ('$title', '$description', '$deadline', '$icon', '$file_path')";

if (mysqli_query($conn, $sql)) {
    $id = mysqli_insert_id($conn);
    echo json_encode(['success' => true, 'id' => $id]);
} else {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
}

mysqli_close($conn);
?>