<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function index(Request $request)
    {
        $companyId = 1; // Mock company ID for development
        
        $files = File::where('company_id', $companyId)
            ->with('uploadedBy')
            ->latest()
            ->get();

        return response()->json($files);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'accessLevel' => 'required|string',
        ]);

        $uploadedFile = $request->file('file');
        $companyId = 1; // Mock company ID for development
        $userId = 1; // Mock user ID for development

        // Generate encrypted filename
        $encryptedName = 'encrypted_' . uniqid() . '.enc';
        
        // In production, implement actual file encryption and storage
        $uploadedFile->storeAs('files', $encryptedName, 'local');

        $file = File::create([
            'company_id' => $companyId,
            'name' => $encryptedName,
            'original_name' => $uploadedFile->getClientOriginalName(),
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
            'access_level' => $request->accessLevel,
            'uploaded_by' => $userId,
        ]);

        return response()->json($file, 201);
    }

    public function destroy($id)
    {
        $file = File::findOrFail($id);
        
        // Check permissions (implement proper authorization)
        $file->delete();

        return response()->json(['message' => 'File deleted successfully']);
    }
}