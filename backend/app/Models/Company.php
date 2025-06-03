<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'industry',
        'size',
        'country',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function riskAssessments()
    {
        return $this->hasMany(RiskAssessment::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function popiaItems()
    {
        return $this->hasMany(PopiaItem::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}