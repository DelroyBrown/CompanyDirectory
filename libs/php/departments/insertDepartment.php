<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("../config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
	$output['status']['code'] = "300";
	$output['status']['name'] = "failure";
	$output['status']['description'] = "database unavailable";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];

	echo json_encode($output);
	exit;
}

$name = $_POST['name'];
$locationID = $_POST['locationID'];

// added check for duplicate department names
$checkQuery = $conn->prepare('SELECT id FROM department WHERE name = ?');
$checkQuery->bind_param("s", $name);
$checkQuery->execute();
$checkResult = $checkQuery->get_result();

if ($checkResult->num_rows > 0) {
	$output['status']['code'] = "409"; // Conflict
	$output['status']['name'] = "duplicate";
	$output['status']['description'] = "Department name already exists";
	$output['data'] = [];

	echo json_encode($output);
	$conn->close();
	exit;
}

// insert only if no duplicates
$query = $conn->prepare('INSERT INTO department (name, locationID) VALUES (?, ?)');
$query->bind_param("si", $name, $locationID);
$query->execute();

if ($query === false) {
	$output['status']['code'] = "400";
	$output['status']['name'] = "executed";
	$output['status']['description'] = "query failed";
	$output['data'] = [];
} else {
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['data'] = [];
}

$conn->close();
echo json_encode($output);

?>