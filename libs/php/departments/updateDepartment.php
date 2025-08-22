<?php

ini_set("display_errors", "on");
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include "../config.php";

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

// Updates department
$query = $conn->prepare("UPDATE department SET name = ?, locationID = ? WHERE id = ?");
$query->bind_param("sii", $_POST['name'], $_POST['locationID'], $_POST['id']);

$query->execute();

if ($query === false) {
    $output["status"]["code"] = "400";
    $output["status"]["name"] = "executed";
    $output["status"]["description"] = "query failed";
    $output["data"] = [];
} else {
    $output["status"]["code"] = "200";
    $output["status"]["name"] = "ok";
    $output["status"]["description"] = "success";
    $output["data"] = [];
}

mysqli_close($conn);
echo json_encode($output);

?>