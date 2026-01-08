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

/**
 * Formats a phone number string for display (as-you-type).
 * Adds spaces every 2 digits, handles +33 prefix specially.
 */
export function formatPhoneNumberForDisplay(value: string): string {
    const hasPlus = value.startsWith('+');
    const digits = value.replace(/\D/g, '');
    let formatted = digits;

    if (hasPlus) {
        if (digits.startsWith('33')) {
            formatted = "+33";
            const rest = digits.slice(2);
            if (rest.length > 0) {
                formatted += " " + rest.substring(0, 1);
                if (rest.length > 1) {
                    const remaining = rest.substring(1).match(/.{1,2}/g)?.join(' ');
                    if (remaining) formatted += " " + remaining;
                }
            }
        } else {
            formatted = "+" + (digits.match(/.{1,2}/g)?.join(' ') || digits);
        }
    } else {
        formatted = digits.match(/.{1,2}/g)?.join(' ') || digits;
    }

    return formatted;
}
