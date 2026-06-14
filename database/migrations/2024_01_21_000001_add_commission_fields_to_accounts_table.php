<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->decimal('service_payment_fee', 8, 2)->nullable()->after('is_default');
            $table->decimal('cross_bank_transfer_fee', 8, 2)->nullable()->after('service_payment_fee');
            $table->decimal('withdrawal_atm_fee', 8, 2)->nullable()->after('cross_bank_transfer_fee');
            $table->decimal('withdrawal_store_fee', 8, 2)->nullable()->after('withdrawal_atm_fee');
            $table->decimal('international_iva_rate', 5, 2)->nullable()->after('withdrawal_store_fee');
            $table->decimal('isd_rate', 5, 2)->nullable()->after('international_iva_rate');
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn([
                'service_payment_fee',
                'cross_bank_transfer_fee',
                'withdrawal_atm_fee',
                'withdrawal_store_fee',
                'international_iva_rate',
                'isd_rate',
            ]);
        });
    }
};
