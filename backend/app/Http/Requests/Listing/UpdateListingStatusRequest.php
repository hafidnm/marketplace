<?php

namespace App\Http\Requests\Listing;

use Illuminate\Foundation\Http\FormRequest;

class UpdateListingStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:AVAILABLE,SOLD'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status barang harus disertakan.',
            'status.in' => 'Status harus berupa AVAILABLE atau SOLD.',
        ];
    }
}
