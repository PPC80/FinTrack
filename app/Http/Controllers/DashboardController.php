<?php

namespace App\Http\Controllers;

use App\Services\Finance\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->query('period', now()->format('Y-m'));

        return Inertia::render('Dashboard', $this->dashboardService->getFullDashboardData($period));
    }
}
