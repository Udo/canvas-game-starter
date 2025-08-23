<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check if Memcached extension is available
if (!class_exists('Memcached')) {
    echo json_encode(['error' => 'Memcached extension not available', 'success' => false]);
    exit;
}

// Initialize Memcached connection
$memcached = new Memcached();
$memcached->addServer('localhost', 11211);

// Test memcached connection
$version = $memcached->getVersion();
if (!$version || $memcached->getResultCode() !== Memcached::RES_SUCCESS) {
    echo json_encode(['error' => 'Memcached connection failed', 'success' => false]);
    exit;
}

$roomId = $_GET['room'] ?? '';
if (empty($roomId)) {
    echo json_encode(['error' => 'Room ID required', 'success' => false]);
    exit;
}

// Sanitize room ID for use as memcached key
$roomKey = 'webrtc_room_' . preg_replace('/[^a-zA-Z0-9]/', '', $roomId);

// Debug: log the room info
error_log("Request: " . $_SERVER['REQUEST_METHOD'] . " for room '$roomId' -> key '$roomKey'");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Store signaling message
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        echo json_encode(['error' => 'Invalid JSON', 'success' => false]);
        exit;
    }
    
    $message = [
        'id' => uniqid(),
        'timestamp' => time(),
        'data' => $input
    ];
    
    // Get existing messages from memcached
    $messages = $memcached->get($roomKey);
    if ($memcached->getResultCode() === Memcached::RES_NOTFOUND) {
        $messages = [];
    } elseif ($memcached->getResultCode() !== Memcached::RES_SUCCESS) {
        echo json_encode(['error' => 'Failed to read from memcached: ' . $memcached->getResultMessage(), 'success' => false]);
        exit;
    }
    
    $cutoff = time() - 300;
    $messages = array_filter($messages, function($msg) use ($cutoff) {
        return $msg['timestamp'] >= $cutoff;
    });
    
    // Add new message
    $messages[] = $message;
    
    // Debug: log what we're storing
    error_log("Room $roomId: Storing message " . $message['id'] . " of type " . ($input['type'] ?? 'unknown') . ". Total messages: " . count($messages));
    
    // Store back to memcached with 10 minute expiration
    $result = $memcached->set($roomKey, $messages, 600);
    if (!$result) {
        echo json_encode(['error' => 'Failed to write to memcached: ' . $memcached->getResultMessage(), 'success' => false]);
        exit;
    }
    
    echo json_encode(['success' => true, 'messageId' => $message['id'], 'debug' => ['stored_messages' => count($messages)]]);
    
} else {
    // GET: Retrieve messages
    $since = (int)($_GET['since'] ?? 0);
    
    // Get messages from memcached
    $messages = $memcached->get($roomKey);
    if ($memcached->getResultCode() === Memcached::RES_NOTFOUND) {
        $messages = [];
    } elseif ($memcached->getResultCode() !== Memcached::RES_SUCCESS) {
        echo json_encode(['error' => 'Failed to read from memcached: ' . $memcached->getResultMessage(), 'success' => false]);
        exit;
    }
    
    // Filter messages newer than 'since' timestamp
    $newMessages = array_filter($messages, function($msg) use ($since) {
        return $msg['timestamp'] >= $since;
    });
    
    // Debug: log what we're returning
    error_log("Room $roomId: Found " . count($messages) . " total messages, returning " . count($newMessages) . " since $since");
    
    echo json_encode([
        'success' => true,
        'messages' => array_values($newMessages),
        'timestamp' => time(),
        'debug' => [
            'room_id' => $roomId,
            'room_key' => $roomKey,
            'total_messages' => count($messages),
            'since' => $since,
            'current_time' => time(),
            'new_messages' => count($newMessages),
            'message_timestamps' => array_map(function($msg) { return $msg['timestamp']; }, $messages)
        ]
    ]);
}
?>
