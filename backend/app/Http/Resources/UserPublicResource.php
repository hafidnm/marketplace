<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserPublicResource extends JsonResource
{
    /**
     * Expose only fields intended for a public seller profile.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'location' => $this->location,
            'whatsapp' => $this->whatsapp,
            'created_at' => $this->created_at?->toIso8601String(),
            'available_listings_count' => (int) ($this->available_listings_count ?? 0),
            'sold_listings_count' => (int) ($this->sold_listings_count ?? 0),
        ];
    }
}
