<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST");

// Connect to SQLite
$db = new PDO('sqlite:' . dirname( __FILE__ ) . '/surveys.db');

// Handle GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT * FROM surveys");
    $surveys = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($surveys);
    exit;
}

// Handle POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $title = $input['title'] ?? '';
    if ($title !== '') {
        $stmt = $db->prepare("INSERT INTO surveys (title) VALUES (:title)");
        $stmt->execute([':title' => $title]);
        echo json_encode([ "id" => $db->lastInsertId(), "title" => $title ]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing title"]);
    }
    exit;
}
