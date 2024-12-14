<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$action = isset($_POST['action']) ? $_POST['action'] : '';
$paymentId = isset($_POST['paymentId']) ? $_POST['paymentId'] : '';
$txid = isset($_POST['txid']) ? $_POST['txid'] : '';
$appClient = isset($_POST['app_client']) ? $_POST['app_client'] : '';

$response = array('status' => 'error', 'message' => 'Invalid request');

$servername = "sql207.infinityfree.com";
$username = "if0_37758794";
$password = "3God4JKcSu6pb";
$dbname = "if0_37758794_Gamal";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    $response = array('status' => 'error', 'message' => 'Database connection failed');
    echo json_encode($response);
    exit;
}

if ($action == 'approve') {
    $sql = "INSERT INTO payments (paymentId, app_client, status) VALUES (?, ?, 'pending')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $paymentId, $appClient);
    if ($stmt->execute()) {
        $response = array('status' => 'success', 'message' => 'Payment approved', 'paymentId' => $paymentId);
    } else {
        $response = array('status' => 'error', 'message' => 'Database error: ' . $stmt->error);
    }
    $stmt->close();
} elseif ($action == 'complete') {
    $sql = "UPDATE payments SET txid = ?, status = 'completed' WHERE paymentId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $txid, $paymentId);
    if ($stmt->execute()) {
        $response = array('status' => 'success', 'message' => 'Payment completed', 'paymentId' => $paymentId, 'txid' => $txid);
    } else {
        $response = array('status' => 'error', 'message' => 'Database error: ' . $stmt->error);
    }
    $stmt->close();
} elseif ($action == 'incomplete') {
    $sql = "INSERT INTO payments (paymentId, app_client, status) VALUES (?, ?, 'incomplete')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $paymentId, $appClient);
    if ($stmt->execute()) {
        $response = array('status' => 'success', 'message' => 'Payment is incomplete', 'paymentId' => $paymentId, 'txid' => $txid);
    } else {
        $response = array('status' => 'error', 'message' => 'Database error: ' . $stmt->error);
    }
    $stmt->close();
}

$conn->close();
echo json_encode($response);

?>