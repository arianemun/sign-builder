<?php
/**
 * Accepts a PNG (base64) and stores it under /sig-cache for email clients.
 * Gmail/Outlook cannot use data: URIs — hosted PNGs are required.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin !== '' && (str_contains($origin, $host) || str_contains($origin, 'sign.sepfa.ir') || str_contains($origin, 'localhost'))) {
  header('Access-Control-Allow-Origin: ' . $origin);
  header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'method_not_allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
if (!is_array($payload) || empty($payload['png']) || !is_string($payload['png'])) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid_payload']);
  exit;
}

$b64 = $payload['png'];
if (str_starts_with($b64, 'data:')) {
  $b64 = preg_replace('#^data:image/png;base64,#i', '', $b64) ?? '';
}

$bin = base64_decode($b64, true);
if ($bin === false || strlen($bin) < 64 || strlen($bin) > 250000) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid_image']);
  exit;
}

if (!str_starts_with($bin, "\x89PNG\r\n\x1a\n")) {
  http_response_code(400);
  echo json_encode(['error' => 'not_png']);
  exit;
}

$dir = __DIR__ . DIRECTORY_SEPARATOR . 'sig-cache';
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
  http_response_code(500);
  echo json_encode(['error' => 'mkdir_failed']);
  exit;
}

$hash = hash('sha256', $bin);
$file = $hash . '.png';
$path = $dir . DIRECTORY_SEPARATOR . $file;

if (!is_file($path)) {
  if (file_put_contents($path, $bin, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'write_failed']);
    exit;
  }
}

$info = @getimagesizefromstring($bin);
$width = is_array($info) ? ($info[0] ?? 0) : 0;
$height = is_array($info) ? ($info[1] ?? 0) : 0;

$url = 'https://sign.sepfa.ir/sig-cache/' . rawurlencode($file);

echo json_encode([
  'url' => $url,
  'width' => $width,
  'height' => $height,
]);
