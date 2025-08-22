<?php
// example: /libs/php/getAllDepartments.php?locationID=3

// remove next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);
include("../config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
if ($conn->connect_errno) {
	echo json_encode([
		'status' => [
			'code' => '300',
			'name' => 'failure',
			'description' => 'database unavailable',
			'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . ' ms'
		],
		'data' => []
	]);
	exit;
}
$conn->set_charset('utf8mb4');

// Optional filter: locationID
$locationID = isset($_GET['locationID']) && $_GET['locationID'] !== '' ? (int) $_GET['locationID'] : null;

$sql = "
    SELECT 
        d.id,
        d.name AS department,
        l.name AS location
    FROM department d
    LEFT JOIN location l ON d.locationID = l.id
";
$where = [];
$params = [];
$types = "";

if ($locationID !== null) {
	$where[] = "d.locationID = ?";
	$types .= "i";
	$params[] = $locationID;
}

if ($where) {
	$sql .= " WHERE " . implode(" AND ", $where);
}

$sql .= " ORDER BY d.name, l.name";

$stmt = $conn->prepare($sql);
if (!$stmt) {
	echo json_encode([
		'status' => ['code' => '400', 'name' => 'error', 'description' => $conn->error],
		'data' => []
	]);
	$conn->close();
	exit;
}

if ($types) {
	$stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
	$data[] = $row;
}

echo json_encode([
	'status' => [
		'code' => '200',
		'name' => 'ok',
		'description' => 'success',
		'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . ' ms'
	],
	'data' => $data
]);

$conn->close();
