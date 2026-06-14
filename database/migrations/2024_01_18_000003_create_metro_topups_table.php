<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metro_topups', function (Blueprint $table) {
            $table->id();
            $table->decimal('amount', 8, 2);
            $table->foreignId('source_account_id')->constrained('accounts')->cascadeOnDelete();
            $table->string('period', 7);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metro_topups');
    }
};
