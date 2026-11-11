export type ConditionType = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type StatusType = 'AVAILABLE' | 'SOLD';

export interface User {
  id: number;
  name: string;
  email: string;
  whatsapp?: string | null;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Seller {
  id: number;
  name: string;
  whatsapp: string | null;
  location: string | null;
}

export interface PublicSeller {
  id: number;
  name: string;
  location: string | null;
  whatsapp: string | null;
  created_at: string;
  available_listings_count: number;
  sold_listings_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  listings_count?: number;
}

export interface ListingImage {
  id: number;
  path: string;
  url: string;
  sort_order: number;
}

export interface Listing {
  id: number;
  name: string;
  description: string;
  price: number;
  condition: ConditionType;
  status: StatusType;
  location: string;
  category?: Category;
  seller?: Seller;
  primary_image?: string | null;
  images?: ListingImage[];
  created_at: string;
  updated_at: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedListings {
  data: Listing[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: PaginatedMeta;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
