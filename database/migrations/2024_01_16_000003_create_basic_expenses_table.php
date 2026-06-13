<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('basic_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('expense_categories')->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('basic_expense_templates')->nullOnDelete();
            $table->string('name');
            $table->decimal('amount', 12, 2);
            $table->boolean('is_paid')->default(false);
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('period', 7); // YYYY-MM
            $table->timestamps();

            $table->unique(['template_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('basic_expenses');
    }
};
