import { formatRupiah } from './format';

/**
 * Normalize phone number to international WhatsApp format (e.g. 081234 -> 6281234)
 */
export function normalizeWhatsAppNumber(phone?: string | null): string {
  if (!phone) return '';

  // Remove spaces, hyphens, plus signs, brackets
  let clean = phone.replace(/\D/g, '');

  if (clean.startsWith('08')) {
    clean = '628' + clean.slice(2);
  } else if (clean.startsWith('8')) {
    clean = '628' + clean.slice(1);
  } else if (clean.startsWith('62')) {
    // already 62...
  }

  return clean;
}

/**
 * Generate a pre-filled WhatsApp click-to-chat URL for a listing
 */
export function generateWhatsAppLink(
  phone: string | null | undefined,
  listingName: string,
  price: number
): string | null {
  const normalizedPhone = normalizeWhatsAppNumber(phone);
  if (!normalizedPhone) return null;

  const formattedPrice = formatRupiah(price);
  const message = `Halo, saya tertarik dengan ${listingName} seharga ${formattedPrice} di marketplace. Apakah masih tersedia?`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
