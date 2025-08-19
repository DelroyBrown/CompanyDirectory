<?php
// example use from browser
// http://localhost/companydirectory/libs/php/searchAll.php?txt=<txt>

// remove next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");
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

$txt = isset($_GET['txt']) ? trim($_GET['txt']) : '';

if ($txt === '') {
	// Empty search: let the front end call its normal getAll endpoints
	echo json_encode([
		'status' => [
			'code' => '200',
			'name' => 'ok',
			'description' => 'empty search',
			'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . ' ms'
		],
		'data' => ['found' => []]
	]);
	$conn->close();
	exit;
}

$likeText = '%' . $txt . '%';
$found = [];

/* ------- PERSONNEL (your existing query, plus entity tag) ------- */
$sqlP = 'SELECT 
            p.id, p.firstName, p.lastName, p.email, p.jobTitle,
            d.id AS departmentID, d.name AS departmentName,
            l.id AS locationID,  l.name AS locationName
         FROM personnel p
         LEFT JOIN department d ON d.id = p.departmentID
         LEFT JOIN location   l ON l.id = d.locationID
         WHERE p.firstName LIKE ? OR p.lastName LIKE ? OR p.email LIKE ?
            OR p.jobTitle LIKE ? OR d.name LIKE ? OR l.name LIKE ?
         ORDER BY p.lastName, p.firstName, d.name, l.name';

$stmtP = $conn->prepare($sqlP);
$stmtP->bind_param('ssssss', $likeText, $likeText, $likeText, $likeText, $likeText, $likeText);
if (!$stmtP->execute()) {
	echo json_encode([
		'status' => ['code' => '400', 'name' => 'executed', 'description' => 'personnel query failed'],
		'data' => []
	]);
	$conn->close();
	exit;
}
$resP = $stmtP->get_result();
while ($row = $resP->fetch_assoc()) {
	$row['entity'] = 'personnel';
	// also include convenience fields to match your table renderers if you like
	$row['department'] = $row['departmentName'];
	$row['location'] = $row['locationName'];
	$found[] = $row;
}
$stmtP->close();

/* ------- DEPARTMENTS (name or location name) ------- */
$sqlD = 'SELECT 
            d.id, d.name, l.name AS locationName
         FROM department d
         LEFT JOIN location l ON l.id = d.locationID
         WHERE d.name LIKE ? OR l.name LIKE ?
         ORDER BY d.name, l.name';

$stmtD = $conn->prepare($sqlD);
$stmtD->bind_param('ss', $likeText, $likeText);
if (!$stmtD->execute()) {
	echo json_encode([
		'status' => ['code' => '400', 'name' => 'executed', 'description' => 'department query failed'],
		'data' => []
	]);
	$conn->close();
	exit;
}
$resD = $stmtD->get_result();
while ($row = $resD->fetch_assoc()) {
	$row['entity'] = 'department';
	$row['location'] = $row['locationName']; // convenience alias
	$found[] = $row;
}
$stmtD->close();

/* ------- LOCATIONS (name) ------- */
$sqlL = 'SELECT id, name FROM location WHERE name LIKE ? ORDER BY name';
$stmtL = $conn->prepare($sqlL);
$stmtL->bind_param('s', $likeText);
if (!$stmtL->execute()) {
	echo json_encode([
		'status' => ['code' => '400', 'name' => 'executed', 'description' => 'location query failed'],
		'data' => []
	]);
	$conn->close();
	exit;
}
$resL = $stmtL->get_result();
while ($row = $resL->fetch_assoc()) {
	$row['entity'] = 'location';
	$found[] = $row;
}
$stmtL->close();

/* ------- Output ------- */
echo json_encode([
	'status' => [
		'code' => '200',
		'name' => 'ok',
		'description' => 'success',
		'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . ' ms'
	],
	'data' => ['found' => $found]
]);

$conn->close();
