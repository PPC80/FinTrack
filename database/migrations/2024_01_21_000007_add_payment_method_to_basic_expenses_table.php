<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('basic_expenses', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('account_id');
            $table->decimal('commission_amount', 8, 2)->default(0)->after('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('basic_expenses', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'commission_amount']);
        });
    }
};
