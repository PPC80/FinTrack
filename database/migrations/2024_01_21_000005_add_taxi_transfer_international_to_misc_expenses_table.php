<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('misc_expenses', function (Blueprint $table) {
            $table->boolean('is_taxi')->default(false)->after('is_guilty');
            $table->boolean('is_bank_transfer')->default(false)->after('is_taxi');
            $table->boolean('is_international')->default(false)->after('is_bank_transfer');
            $table->decimal('commission_amount', 8, 2)->default(0)->after('is_international');
        });
    }

    public function down(): void
    {
        Schema::table('misc_expenses', function (Blueprint $table) {
            $table->dropColumn(['is_taxi', 'is_bank_transfer', 'is_international', 'commission_amount']);
        });
    }
};
