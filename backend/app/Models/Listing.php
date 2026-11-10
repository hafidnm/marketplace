<?php

namespace App\Models;

use Database\Factories\ListingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Listing extends Model
{
    /** @use HasFactory<ListingFactory> */
    use HasFactory;

    public const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
    public const STATUSES = ['AVAILABLE', 'SOLD'];

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'description',
        'price',
        'condition',
        'status',
        'location',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
        ];
    }

    /**
     * Seller / owner of the listing.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Category of the listing.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * All gallery images for this listing ordered by sort order.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ListingImage::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Primary thumbnail / first image of the listing.
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ListingImage::class)->ofMany([
            'sort_order' => 'min',
            'id' => 'min',
        ]);
    }
}
