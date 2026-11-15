<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('restrict');
            $table->text('title');
            $table->text('description')->nullable();
            $table->enum('status', ['open', 'in_progress', 'done'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high'])->default('low');
            $table->date('due_date')->nullable();
            $table->text('resolution')->nullable();
            $table->index(['client_id', 'status'], 'client_status_index');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
