<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$locationID = $_POST['id'];

// Check if any departments are assigned to this location
$checkDepartments = $conn->prepare("SELECT COUNT(*) as deptCount FROM department WHERE locationID = ?");
$checkDepartments->bind_param("i", $locationID);
$checkDepartments->execute();
$deptResult = $checkDepartments->get_result()->fetch_assoc();

if ($deptResult['deptCount'] > 0) {
    $output['status']['code'] = "409";
    $output['status']['name'] = "conflict";
    $output['status']['description'] = "location has departments assigned";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}


// Delete if no dependencies
$delete = $conn->prepare("DELETE FROM location WHERE id = ?");
$delete->bind_param("i", $locationID);
$success = $delete->execute();

if ($success) {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "location deleted";
    $output['data'] = [];
} else {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "delete failed";
    $output['data'] = [];
}

mysqli_close($conn);
echo json_encode($output);
