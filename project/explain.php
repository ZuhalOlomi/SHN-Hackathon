<?php
// explain.php

header('Content-Type: application/json');

// Read JSON body
$input = json_decode(file_get_contents('php://input'), true);
$profile = $input['profile'] ?? null;
$choice = $input['choice'] ?? null;
$patient = $input['patient'] ?? [];

if (!$profile || !$choice) {
    echo json_encode(['error' => 'Missing profile or choice']);
    exit;
}

// Load guidelines
$guidelinesJson = file_get_contents('guidelines.json');
$guidelines = json_decode($guidelinesJson, true);
$snippets = $guidelines[$profile] ?? [];
$snippetText = "- " . implode("\n- ", $snippets);

// Build prompt
$patientSummary = sprintf(
    "Age: %s, A1c: %s, ASCVD: %s, HF: %s, CKD: %s, BMI: %s",
    $patient['age'] ?? 'N/A',
    $patient['a1c'] ?? 'N/A',
    $patient['has_ascvd'] ?? 'N/A',
    $patient['has_hf'] ?? 'N/A',
    $patient['has_ckd'] ?? 'N/A',
    $patient['bmi'] ?? 'N/A'
);

$prompt = "
You are a clinical educator. A learner chose a medication for a patient with type 2 diabetes.

Patient:
- $patientSummary

Profile bucket: $profile
Learner choice: $choice

Guideline-based notes:
$snippetText

Explain in under 200 words:
1) How well this choice aligns with the notes.
2) The key pros and cons (cardiorenal benefit, hypoglycemia, weight).
Use clear educational language.
";

// Call OpenAI API via cURL
$apiKey = 'YOUR_OPENAI_API_KEY_HERE'; // TODO: move to config

$data = [
    "model" => "gpt-4.1-mini",
    "messages" => [
        ["role" => "system", "content" => "You are a clinical educator for medical students."],
        ["role" => "user", "content" => $prompt]
    ],
    "max_tokens" => 300,
    "temperature" => 0.3
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
if ($response === false) {
    echo json_encode(['error' => 'OpenAI request failed']);
    exit;
}
curl_close($ch);

$json = json_decode($response, true);
$explanation = $json['choices'][0]['message']['content'] ?? 'No explanation generated.';

echo json_encode(['explanation' => trim($explanation)]);