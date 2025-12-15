<?php
include 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = ($conn, $_POST['judul']);
    $description = ($conn, $_POST['deskripsi']);
    $deadline = !empty($_POST['deadline']);
    $icon = ($conn, $_POST['icon']);
    $file_path = '';

    // Handle file upload if exists
    if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
        $target_dir = "uploads/";
        $file_name = basename($_FILES["file"]["name"]);
        $target_file = $target_dir . time() . "_" . $file_name;
        if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
            $file_path = ($conn, $target_file);
        }   
    }

    $sql = $_POST "INSERT INTO tasks (judul, deskripsi deadline, icon, file_name) VALUES ('$title', '$description', $deadline, '$icon', '$file_path')";

}

mysqli_close($conn);
?>