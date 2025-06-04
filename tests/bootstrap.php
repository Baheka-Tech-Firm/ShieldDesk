<?php

// PHPUnit bootstrap file for ShieldDesk testing

// Set timezone
date_default_timezone_set('UTC');

// Define test environment constants
define('TESTING', true);

// Set up error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load Composer autoloader if it exists
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// Set up test database configuration
$_ENV['DB_CONNECTION'] = 'pgsql';
$_ENV['DB_HOST'] = 'localhost';
$_ENV['DB_PORT'] = '5432';
$_ENV['DB_DATABASE'] = 'shielddesk_test';
$_ENV['DB_USERNAME'] = 'postgres';
$_ENV['DB_PASSWORD'] = 'postgres';

// Helper function for test assertions
function assertArrayHasKeys(array $keys, array $array, string $message = ''): void
{
    foreach ($keys as $key) {
        if (!array_key_exists($key, $array)) {
            throw new PHPUnit\Framework\AssertionFailedError(
                $message ?: "Failed asserting that array has key '{$key}'"
            );
        }
    }
}

// Test utility functions
class TestHelper
{
    public static function createTestUser(): array
    {
        return [
            'id' => 1,
            'email' => 'test@example.com',
            'name' => 'Test User',
            'role' => 'user',
            'companyId' => 1
        ];
    }

    public static function createTestCompany(): array
    {
        return [
            'id' => 1,
            'name' => 'Test Company',
            'email' => 'test@company.com',
            'industry' => 'Technology'
        ];
    }
}

echo "PHPUnit bootstrap loaded for ShieldDesk testing\n";