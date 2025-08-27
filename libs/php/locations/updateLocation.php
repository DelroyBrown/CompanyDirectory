<?php

// ini_set('display_errors', 'On');
// error_reporting(E_ALL);

include("../config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    echo json_encode(["status" => ["code" => "300", "name" => "failure", "description" => "database unavailable"], "data" => []]);
    exit;
}

// Check for duplicate
$check = $conn->prepare("SELECT id FROM location WHERE name = ? AND id != ?");
$check->bind_param("si", $_POST['name'], $_POST['id']);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["status" => ["code" => "409", "name" => "conflict", "description" => "duplicate location"], "data" => []]);
    exit;
}

// Update
$query = $conn->prepare("UPDATE location SET name = ? WHERE id = ?");
$query->bind_param("si", $_POST['name'], $_POST['id']);
$query->execute();

echo json_encode(["status" => ["code" => "200", "name" => "ok", "description" => "updated"], "data" => []]);

$conn->close();