/**
 * Dernière retouche du texte avant la voix de synthèse.
 *
 * ElevenLabs lit la ponctuation : un point d'exclamation fait monter la
 * voix et la rend enjouée, presque commerciale. Au téléphone avec une
 * personne âgée, on veut un ton posé. Dans les vrais appels (16 au
 * 18/11/2026), Loomina en mettait dans une réplique sur trois (« Ravi de te
 * retrouver ! », « L'amour du PSG, ça marque ! ») malgré le prompt : on les
 * remplace donc ici, de façon sûre, par un point.
 *
 * Points de suspension aussi remplacés par un point (20/11/2026, Solal) :
 * la voix les étirait et sonnait mièvre.
 *
 * Aussi retirés : les astérisques et dièses du gras ou des titres (lus ou
 * prononcés bizarrement), les émojis.
 */
export function forVoice(text: string): string {
    return text
        .replace(/!+(?=\s*\?)/g, '')
        .replace(/\s*!+/g, '.')
        .replace(/(?:\.{2,}|…)+/g, '.')
        .replace(/[*_#]+/g, '')
        .replace(/\p{Extended_Pictographic}️?/gu, '');
}
