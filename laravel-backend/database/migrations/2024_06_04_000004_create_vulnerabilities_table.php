<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vulnerabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vulnerability_asset_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('severity', ['critical', 'high', 'medium', 'low']);
            $table->decimal('cvss_score', 3, 1)->nullable();
            $table->string('cve_reference')->nullable();
            $table->enum('exploitability', ['high', 'medium', 'low'])->nullable();
            $table->enum('status', ['open', 'in_progress', 'resolved', 'ignored'])->default('open');
            $table->string('affected_component');
            $table->text('remediation')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('discovered_at');
            $table->timestamp('resolved_at')->nullable();
            $table->enum('impact_availability', ['high', 'medium', 'low'])->nullable();
            $table->enum('impact_confidentiality', ['high', 'medium', 'low'])->nullable();
            $table->enum('impact_integrity', ['high', 'medium', 'low'])->nullable();
            $table->boolean('false_positive')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['vulnerability_asset_id', 'severity']);
            $table->index(['vulnerability_asset_id', 'status']);
            $table->index(['assigned_to']);
            $table->index(['discovered_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vulnerabilities');
    }
};