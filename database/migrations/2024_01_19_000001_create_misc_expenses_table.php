<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('misc_expenses', function (Blueprint $table) {
            $table->id();
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->boolean('is_guilty')->default(false);
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('period', 7); // YYYY-MM
            $table->timestampTz('spent_at');
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('misc_expenses');
    }
};
