<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$mot_de_passe = 'Boves2026';

if (!isset($_GET['mdp']) || $_GET['mdp'] !== $mot_de_passe) {
    http_response_code(401);
    echo json_encode(['erreur' => 'Accès refusé']);
    exit;
}

$licencies = [
    ['nom' => 'Cadart',     'prenom' => 'Lilou',        'tel' => '06 81 34 49 61'],
    ['nom' => 'Cadart',     'prenom' => 'Joel',          'tel' => '06 81 34 49 61'],
    ['nom' => 'Bore',       'prenom' => 'Sébastien',     'tel' => '06 51 38 23 32'],
    ['nom' => 'Celos',      'prenom' => 'Charles',       'tel' => '06 28 75 39 93'],
    ['nom' => 'Lozano',     'prenom' => 'Mathis',        'tel' => '06 07 71 37 83'],
    ['nom' => 'Subitte',    'prenom' => 'Jean-Marc',     'tel' => '06 10 67 13 61'],
    ['nom' => 'Langlois',   'prenom' => 'Emmanuel',      'tel' => '06 24 43 12 84'],
    ['nom' => 'Legris',     'prenom' => 'Daniel',        'tel' => '06 73 43 37 91'],
    ['nom' => 'Dos Santos', 'prenom' => 'Maya',          'tel' => '06 34 09 89 83'],
    ['nom' => 'Demarquet',  'prenom' => 'Kevin',         'tel' => '07 82 38 71 65'],
    ['nom' => 'Trioux',     'prenom' => 'Sebastien',     'tel' => '07 83 26 04 33'],
];

echo json_encode($licencies);