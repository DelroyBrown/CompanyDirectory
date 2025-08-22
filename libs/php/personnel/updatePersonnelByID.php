<?php

header('Content-Type: application/json');

include("../config.php");

$conn = new mysqli(
    $cd_host,
    $cd_user,
    $cd_password,
    $cd_dbname,
    $cd_port,
    $cd_socket
);

if ($conn->connect_error) {
    echo json_encode(["status" => ["code" => "300", "description" => "database unavailable"]]);
    exit;
}

$query = $conn->prepare('
    UPDATE personnel 
    SET firstName = ?, lastName = ?, jobTitle = ?, email = ?, departmentID = ? 
    WHERE id = ?
');

$query->bind_param(
    "ssssii",
    $_POST['firstName'],
    $_POST['lastName'],
    $_POST['jobTitle'],
    $_POST['email'],
    $_POST['departmentID'],
    $_POST['id']
);

$query->execute();

if ($query->affected_rows >= 0) {
    echo json_encode(["status" => ["code" => "200", "description" => "update successful"]]);
} else {
    echo json_encode(["status" => ["code" => "400", "description" => "update failed"]]);
}

$conn->close();
?>