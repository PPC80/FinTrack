<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->boolean('is_bank_transfer')->default(false)->after('is_planned');
            $table->boolean('is_international')->default(false)->after('is_bank_transfer');
            $table->decimal('commission_amount', 8, 2)->default(0)->after('is_international');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['is_bank_transfer', 'is_international', 'commission_amount']);
        });
    }
};
