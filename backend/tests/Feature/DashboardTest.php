<?php

namespace Tests\Feature;

use Tests\TestCase;

class DashboardTest extends TestCase
{
    /**
     * Ensure the dashboard endpoint returns expected json structure.
     */
    public function test_dashboard_endpoint_returns_data(): void
    {
        $response = $this->get('/api/dashboard');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'riskAssessment',
                     'files',
                 ]);
    }
}

