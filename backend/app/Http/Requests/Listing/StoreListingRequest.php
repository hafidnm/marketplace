<?php

namespace App\Http\Requests\Listing;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
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
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'condition' => ['required', 'in:NEW,LIKE_NEW,GOOD,FAIR'],
            'location' => ['required', 'string', 'max:255'],
            'images' => ['required', 'array', 'min:1', 'max:5'],
            'images.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'images.required' => 'Wajib mengunggah minimal 1 foto barang.',
            'images.max' => 'Maksimal 5 foto barang yang dapat diunggah.',
            'images.*.max' => 'Ukuran setiap foto maksimal 2MB.',
            'images.*.image' => 'File harus berupa gambar valid (jpeg, png, jpg, webp).',
        ];
    }
}
