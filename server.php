<?php

if ($_POST['action'] == "approve") {
    $url = 'https://api.minepi.com/v2/payments/' . $_POST['paymentId'] . '/approve';
    $data = array();
} elseif ($_POST['action'] == "complete") {
    $url = 'https://api.minepi.com/v2/payments/' . $_POST['paymentId'] . '/complete';
    $data = array('txid' => $_POST['txid']);
}

$apps = array(
    'auth_example' => 'lpis5qexq2iswzulvqfu8l9k6yg92y7pgapiwj0x6lktjwlgi0hcaylmpjbodp2k>',
    'auth_app1' => 'lpis5qexq2iswzulvqfu8l9k6yg92y7pgapiwj0x6lktjwlgi0hcaylmpjbodp2k>',
    // Add other apps here if needed
);

$ch = curl_init($url);
$postString = http_build_query($data, '', '&');
$headers = array(
    "Authorization: " . $apps[$_POST['app_client']],
);

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postString);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

header("HTTP/1.1 200 OK");
header('Content-Type: application/json');
echo json_encode(array(
    'response' => json_decode($response),
    'error' => $error
));
?>
