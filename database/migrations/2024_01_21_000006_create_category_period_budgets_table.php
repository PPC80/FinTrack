<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_period_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('expense_categories')->cascadeOnDelete();
            $table->char('period', 7);
            $table->decimal('amount', 12, 2);
            $table->timestampsTz();

            $table->unique(['category_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_period_budgets');
    }
};
