<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_item_id')->constrained('catalog_items')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('expense_categories')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('iva_amount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->foreignId('account_id')->constrained('accounts')->restrictOnDelete();
            $table->string('period', 7);
            $table->boolean('is_planned')->default(false);
            $table->timestampTz('purchased_at');
            $table->timestamps();

            $table->index('period');
            $table->index(['category_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
