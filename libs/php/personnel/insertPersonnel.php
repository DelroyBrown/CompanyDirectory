<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);
include("../config.php");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output["status"]["code"] = "300";
    $output["status"]["name"] = "failure";
    $output["status"]["description"] = "database unavailable";
    $output["data"] = [];
    echo json_encode($output);
    exit;
}

$query = $conn->prepare('INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentId) VALUES (?,?,?,?,?)');
$query->bind_param("ssssi", $_POST['firstName'], $_POST['lastName'], $_POST['jobTitle'], $_POST['email'], $_POST['departmentID']);

if (!$query->execute()) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "insert Failed";
    $output['data'] = [];

} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "insert successful";
}

$conn->close();
echo json_encode($output);

