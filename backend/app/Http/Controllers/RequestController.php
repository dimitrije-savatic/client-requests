<?php

namespace App\Http\Controllers;

use App\Models\Request as RequestModel;
use App\Priority;
use App\Status;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RequestController extends Controller
{
    public function getRequests(HttpRequest $request): JsonResponse
    {
        $values = $request->validate([
            'client_id' => 'nullable|integer|exists:clients,id',
            'status' => ['nullable', Rule::in(Status::values())],
            'priority' => ['nullable', Rule::in(Priority::values())],
            'q' => 'nullable|string|max:120',
        ]);

        $query = RequestModel::query()->with('client:id,name');

        $query
            ->when($values['client_id'] ?? null, function ($q, $clientId) {
                $q->where('client_id', $clientId);
            })
            ->when($values['status'] ?? null, function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($values['priority'] ?? null, function ($q, $priority) {
                $q->where('priority', $priority);
            })
            ->when($values['q'] ?? null, function ($q, $search) {
                $q->whereRaw('title ILIKE ?', ['%{search}%']);
            });

        $requests = $query->get();

        $summaryValues = RequestModel::query()->selectRaw('status, COUNT(*) as total')->when($values['client_id'] ?? null, function ($q, $clientId) {
            $q->where('client_id', $clientId);
        })->groupBy('status')->pluck('total', 'status');

        $summary = ['open' => ($summaryValues['open'] ?? 0), 'in_progress' => ($summaryValues['in_progress'] ?? 0), 'done' => ($summaryValues['done'] ?? 0)];

        return response()->json(['data' => $requests, 'summary' => $summary]);
    }

    public function getRequestsCountByStatusType(): JsonResponse
    {
        $requestsCount = RequestModel::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->get();

        return response()->json($requestsCount);
    }

    public function createRequest(HttpRequest $request): JsonResponse
    {
        $validationRules = [
            'title' => 'required|string|min:3|max:120',
            'client_id' => 'required|integer|exists:clients,id',
            'priority' => ['required', Rule::in(Priority::values())],
            'due_date' => 'nullable|date|after:today',
            'resolution' => 'nullable|string',
            'description' => 'nullable|string',
        ];

        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            throw new ValidationException($validator, response()->json([
                'error' => [
                    'code' => 422,
                    'name' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed.',
                    'details' => $validator->errors()],
            ], 422));
        }

        if ($request['priority'] === 'high' && $request['due_date'] == null) {
            throw new ValidationException($validator, response()->json([
                'error' => [
                    'code' => 422,
                    'name' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed.',
                    'details' => 'Due date cannot be null if the priority is high.'],
            ], 422));
        }

        $validated = $validator->validated();
        try {
            RequestModel::create($validated);

            return response()->json([], 201);
        } catch (\Throwable $e) {
            throw new Exception($e->getMessage(), 500);
        }
    }

    public function editRequest(HttpRequest $request, int $id): JsonResponse
    {
        $requestById = RequestModel::find($id);
        if ($requestById == null) {
            throw new Exception('Request with id:'.$id.'not found.', 404);
        }
        $validationRules = ['status' => ['required', Rule::in(Status::values())], 'resolution' => 'nullable|string'];

        $validator = Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            throw new ValidationException($validator, response()->json([
                'error' => [
                    'code' => 422,
                    'name' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed.',
                    'details' => $validator->errors()],
            ], 422));
        }

        if ($request['status'] === 'done') {
            if ($request['resolution'] == null || strlen($request['resolution']) < 10) {
                if ($requestById['resolution'] == null || strlen($requestById['resolution']) < 10) {

                    throw new ValidationException($validator, response()->json([
                        'error' => [
                            'code' => 422,
                            'name' => 'VALIDATION_ERROR',
                            'message' => 'Validation failed.',
                            'details' => 'Resolution must have at least 10 characters if the status is done.'],
                    ], 422));
                }
            }
        }
        $validated = $validator->validated();
        try {
            $requestById->update($validated);

            return response()->json([], 204);
        } catch (\Throwable $e) {
            throw new Exception($e->getMessage(), 500);
        }
    }
}
