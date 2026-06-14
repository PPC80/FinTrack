<?php

return [

    /*
    |--------------------------------------------------------------------------
    | IVA Tax Rate
    |--------------------------------------------------------------------------
    |
    | The IVA (Impuesto al Valor Agregado) rate applied to catalog items
    | that are marked as "gravan IVA". Stored as a decimal (0.15 = 15%).
    |
    */

    'iva_rate' => env('FINTRACK_IVA_RATE', 0.15),

];
