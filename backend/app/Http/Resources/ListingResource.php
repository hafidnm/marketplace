<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resolveUrl = function (?string $path): ?string {
            if (!$path) {
                return null;
            }
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }
            return asset('storage/' . ltrim($path, '/'));
        };

        $primaryPath = $this->relationLoaded('primaryImage') && $this->primaryImage
            ? $this->primaryImage->path
            : ($this->relationLoaded('images') ? $this->images->first()?->path : null);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'condition' => $this->condition,
            'status' => $this->status,
            'location' => $this->location,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'seller' => new SellerResource($this->whenLoaded('user')),
            'primary_image' => $resolveUrl($primaryPath),
            'images' => $this->whenLoaded('images', function () use ($resolveUrl) {
                return $this->images->map(fn ($img) => [
                    'id' => $img->id,
                    'path' => $img->path,
                    'url' => $resolveUrl($img->path),
                    'sort_order' => $img->sort_order,
                ]);
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
