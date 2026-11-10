<?php

namespace App\Http\Requests\Listing;

use Illuminate\Foundation\Http\FormRequest;

class UpdateListingRequest extends FormRequest
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
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'price' => ['sometimes', 'required', 'integer', 'min:0'],
            'condition' => ['sometimes', 'required', 'in:NEW,LIKE_NEW,GOOD,FAIR'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'images.max' => 'Maksimal 5 foto barang yang dapat diunggah.',
            'images.*.max' => 'Ukuran setiap foto maksimal 2MB.',
            'images.*.image' => 'File harus berupa gambar valid (jpeg, png, jpg, webp).',
        ];
    }
}
