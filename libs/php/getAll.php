<?php

// example use from browser
// http://localhost/companydirectory/libs/php/getAll.php

// remove next two lines for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);
include("config.php");
header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
if ($conn->connect_errno) {
	echo json_encode([
		'status' => ['code' => '300', 'name' => 'failure', 'description' => 'database unavailable'],
		'data' => []
	]);
	exit;
}
$conn->set_charset('utf8mb4');

$departmentID = isset($_GET['departmentID']) && $_GET['departmentID'] !== '' ? (int) $_GET['departmentID'] : null;
$locationID = isset($_GET['locationID']) && $_GET['locationID'] !== '' ? (int) $_GET['locationID'] : null;

$base = "
  SELECT
    p.id,
    p.firstName,
    p.lastName,
    p.jobTitle,
    p.email,
    d.name AS department,
    l.name AS location
  FROM personnel p
  LEFT JOIN department d ON d.id = p.departmentID
  LEFT JOIN location   l ON l.id = d.locationID
";

$where = [];
$params = [];
$types = "";

if ($departmentID !== null) {
	$where[] = "p.departmentID = ?";
	$types .= "i";
	$params[] = $departmentID;
}
if ($locationID !== null) {
	$where[] = "l.id = ?";
	$types .= "i";
	$params[] = $locationID;
}

$sql = $base . (count($where) ? " WHERE " . implode(" AND ", $where) : "") .
	" ORDER BY p.lastName, p.firstName, d.name, l.name";

$stmt = $conn->prepare($sql);
if (!$stmt) {
	echo json_encode(['status' => ['code' => '400', 'name' => 'error', 'description' => $conn->error], 'data' => []]);
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
		'returnedIn' => (microtime(true) - $executionStartTime) * 1000 . ' ms'
	],
	'data' => $data
]);

$conn->close();
