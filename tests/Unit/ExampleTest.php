<?php

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function testBasicAssertion(): void
    {
        $this->assertTrue(true);
    }

    public function testArrayOperations(): void
    {
        $array = ['key1' => 'value1', 'key2' => 'value2'];
        
        $this->assertArrayHasKey('key1', $array);
        $this->assertArrayHasKey('key2', $array);
        $this->assertEquals('value1', $array['key1']);
        $this->assertEquals('value2', $array['key2']);
    }

    public function testStringOperations(): void
    {
        $string = 'ShieldDesk Security Platform';
        
        $this->assertStringContains('ShieldDesk', $string);
        $this->assertStringContains('Security', $string);
        $this->assertStringContains('Platform', $string);
    }

    public function testMathOperations(): void
    {
        $result = 2 + 2;
        $this->assertEquals(4, $result);
        
        $result = 10 / 2;
        $this->assertEquals(5, $result);
        
        $result = 3 * 3;
        $this->assertEquals(9, $result);
    }

    public function testHelperFunctions(): void
    {
        $user = TestHelper::createTestUser();
        $company = TestHelper::createTestCompany();
        
        $this->assertIsArray($user);
        $this->assertIsArray($company);
        
        $this->assertArrayHasKey('id', $user);
        $this->assertArrayHasKey('email', $user);
        $this->assertArrayHasKey('name', $user);
        
        $this->assertArrayHasKey('id', $company);
        $this->assertArrayHasKey('name', $company);
        $this->assertArrayHasKey('email', $company);
    }
}