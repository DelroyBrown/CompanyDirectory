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
	mysqli_close($conn);
	echo json_encode($output);
	exit;
}

// Check for personnel dependencies
$checkQuery = $conn->prepare("SELECT COUNT(*) AS count FROM personnel WHERE departmentID = ?");
$checkQuery->bind_param("i", $_REQUEST['id']);
$checkQuery->execute();
$checkResult = $checkQuery->get_result();
$row = $checkResult->fetch_assoc();

if ($row['count'] > 0) {
	// Dependency found — cannot delete
	$output['status']['code'] = "409"; // Conflict
	$output['status']['name'] = "conflict";
	$output['status']['description'] = "Cannot delete department with personnel";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];
	mysqli_close($conn);
	echo json_encode($output);
	exit;
}

// Proceed with deletion
$query = $conn->prepare('DELETE FROM department WHERE id = ?');
$query->bind_param("i", $_REQUEST['id']);
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

$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
mysqli_close($conn);
echo json_encode($output);

?>