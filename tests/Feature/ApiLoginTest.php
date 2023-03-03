<?php

use Carbon\Carbon;

// App will request a nonce from the API via POST /nonce, passing in pubkey and device_name
// API will generate a nonce and store it in the database
// API will return the nonce to the app
// App will generate a proof by signing the nonce with the private key associated with the pubkey
// App will send the proof, pubkey, and device_name to the API via POST /login
// API will validate the proof was generated by the private key associated with the pubkey
// API will return a token to the app
// App will store the token in local storage
// App will send the token in the Authorization header for all subsequent requests



// App will request a nonce from the API via POST /nonce, passing in pubkey and device_name
// Route::post('/nonce', [LoginController::class, 'nonce']);
// LoginController@nonce creates nonce, saves to nonces table with timestamps and pubkey and device_name, returns it to the app
test('app can request a nonce', function () {
    $response = $this->post('/nonce', [
        'pubkey' => '987612984762893476234',
        'device_name' => 'test device',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['nonce']);

    $nonce = $response->json('nonce');
    expect($response->json('nonce'))->toBeString();

    // check that the nonce is in the database, associated with the pubkey and device_name and that nonce is recent
    $this->assertDatabaseHas('nonces', [
        'pubkey' => '987612984762893476234',
        'device_name' => 'test device',
        'nonce' => $nonce,
    ]);
    expect(Carbon::parse($nonce->created_at))->toBeWithinSeconds(3);
});


// test('user can log in via api', function () {
//     $user = User::factory()->create();

//     $response = $this->post('/sanctum/token', [
//         'pubkey' => $user->pubkey,
//         'device_name' => 'test device',
//         'proof' => 'test proof',
//     ]);

//     $response->assertStatus(200);
//     $response->assertJsonStructure(['token']);
// });
