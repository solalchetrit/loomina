/**
 * Retire d'un texte les noms épelés lettre par lettre (« A-Z-O-U-L-A-Y »,
 * « A, Z, O, U, L, A, Y ») : au téléphone la personne épelle pour qu'on écrive
 * bien son nom, pas pour que l'épellation soit imprimée (retour de Solal du
 * 26/11/2026 sur « Azoulay, A-Z-O-U-L-A-Y, c'est mon nom de jeune fille »).
 * Fait par le code, pas seulement par la consigne : aucune épellation ne passe.
 */
export function stripSpellings(text: string): string {
    const seq = String.raw`\p{Lu}(?:\s?[-–]\s?\p{Lu}|,\s\p{Lu}){2,}(?![\p{L}\p{N}’'])`;
    return text
        .replace(new RegExp(String.raw`,\s*${seq}\s*,(?!\s\p{Lu}(?!\p{L}))`, 'gu'), ',')
        .replace(new RegExp(String.raw`\s*[(:,]?\s*(?<![\p{L}\p{N}])${seq}\)?`, 'gu'), '')
        .replace(/ {2,}/g, ' ')
        .replace(/ ([.,;])/g, '$1');
}
