<?php

ini_set("display_errors", "On");
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include "config.php";

header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$name = trim($_POST['name']);

// Checks for duplicate location name
$check = $conn->prepare("SELECT id FROM location WHERE LOWER(name) = LOWER(?)");
$check->bind_param("s", $name);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    $output['status']['code'] = "409";  // Conflict
    $output['status']['name'] = "duplicate";
    $output['status']['description'] = "Location already exists";
    $output['data'] = [];
    echo json_encode($output);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

// Inserts new location
$query = $conn->prepare("INSERT INTO location (name) VALUES (?)");
$query->bind_param("s", $name);

if (!$query->execute()) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Insert query failed";
    $output['data'] = [];
} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "Location added successfully";
    $output['data'] = [];
}

$query->close();
$conn->close();

echo json_encode($output);
