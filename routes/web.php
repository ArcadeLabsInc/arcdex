<?php

use App\Http\Controllers\ChannelController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\VideoController;
use App\Models\Channel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::group(['middleware' => 'auth'], function () {
    Route::get('/chat', [ChatController::class, 'index'])->name('chat');
});



Route::get('/video/{id}', [VideoController::class, 'show']);

Route::any('/logout', function () {
    Auth::logout();
    return redirect()->route('home');
})->name('logout');

Route::get('/login', function () {
    return view('login');
})->name('login');

Route::post('/login', function (Request $request) {
    // if user is already logged in, log them out
    if (Auth::check()) {
        Auth::logout();
    }

    $validator = Validator::make($request->all(), [
        'pubkey' => 'required'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'error',
            'errors' => $validator->errors()
        ], 422);
    }

    $pubkey = $request->input('pubkey');
    // find the user with this pubkey
    $user = User::where('pubkey', $pubkey)->first();
    // if no user, return error
    if (!$user) {
        // Create a user with this pubkey and log them in
        $user = User::create([
            'pubkey' => $pubkey
        ]);
    }

    // otherwise log in the user
    Auth::login($user);

    return response()->json([
        'message' => 'success'
    ], 200);
});

Route::middleware('auth:sanctum')->post('/api/channels', [ChannelController::class, 'store']);

Route::middleware('auth:sanctum')->get('/api/channels', function (Request $request) {
    // Check for joined query param
    if ($request->query('joined') === 'false') {
        // Retrieve only channels that the user has not joined, and eager load the last message
        $channels = Channel::whereDoesntHave('users', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->with(['messages' => function($q) {
            $q->latest();
        }])->get();
    } else {
        // Retrieve only channels that the user has joined, and eager load the last message
        $channels = $request->user()->channels()->with(['messages' => function($q) {
            $q->latest();
        }])->get();
    }

    foreach ($channels as $channel) {
        try {
            $channel['lastMessage'] = $channel->messages->first()->load('user');
        } catch (Throwable $e) {
            $channel['lastMessage'] = null;
        }
    }

    return [
        'data' => $channels
    ];
});
