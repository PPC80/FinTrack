<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planned_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_item_id')->constrained('catalog_items')->cascadeOnDelete();
            $table->string('period', 7);
            $table->integer('quantity')->default(1);
            $table->boolean('is_purchased')->default(false);
            $table->foreignId('purchase_id')->nullable()->constrained('purchases')->nullOnDelete();
            $table->timestamps();

            $table->unique(['catalog_item_id', 'period']);
            $table->index('period');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planned_items');
    }
};
