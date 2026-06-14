<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_account_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignId('destination_account_id')->constrained('accounts')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->decimal('commission_amount', 8, 2)->default(0);
            $table->string('transfer_type', 30);
            $table->string('description')->nullable();
            $table->char('period', 7);
            $table->timestampTz('transferred_at');
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_transfers');
    }
};
