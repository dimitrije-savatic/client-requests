<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\RequestController;
use Illuminate\Support\Facades\Route;

Route::get('/clients', [ClientController::class, 'getClients']);
Route::get('/requests', [RequestController::class, 'getRequests']);
Route::get('/requests/summary', [RequestController::class, 'getRequestsCountByStatusType']);
Route::post('/requests', [RequestController::class, 'createRequest']);
Route::patch('/requests/{id}', [RequestController::class, 'editRequest']);
