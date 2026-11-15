<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function getClients(): JsonResponse
    {
        $clients = Client::all('id', 'name');
        if ($clients->isEmpty()) {
            throw new \Exception('Clients not found.', 404);
        }

        return response()->json($clients);
    }
}
