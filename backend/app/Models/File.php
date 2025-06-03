<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'original_name',
        'mime_type',
        'size',
        'access_level',
        'uploaded_by',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}