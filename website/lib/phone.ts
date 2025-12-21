/**
 * Formats a phone number string to E164 format.
 * Primarily handles French numbers (starting with 0) and cleans up non-digits.
 */
export function formatToE164(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Handle 00 prefix
    if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.substring(2);
    }

    // Handle French local format (e.g., 06 12 34 56 78 -> +33612345678)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '+33' + cleaned.substring(1);
    }

    // Ensure it starts with +
    if (!cleaned.startsWith('+') && cleaned.length > 0) {
        cleaned = '+' + cleaned;
    }

    return cleaned;
}
