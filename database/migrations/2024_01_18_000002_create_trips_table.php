<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_mode_id')->constrained()->cascadeOnDelete();
            $table->decimal('fare_at_time', 8, 2);
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('period', 7);
            $table->timestampTz('taken_at');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
