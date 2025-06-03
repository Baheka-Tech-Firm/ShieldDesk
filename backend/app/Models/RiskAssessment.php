<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiskAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'physical_security_score',
        'data_protection_score',
        'access_control_score',
        'network_security_score',
        'overall_score',
    ];

    protected $casts = [
        'physical_security_score' => 'integer',
        'data_protection_score' => 'integer',
        'access_control_score' => 'integer',
        'network_security_score' => 'integer',
        'overall_score' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}