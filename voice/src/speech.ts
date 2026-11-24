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

/*
 * Les tournures interdites, retirées avant la voix (Solal, 24/11/2026).
 *
 * À l'écoute du premier appel de Patricia, malgré le prompt : « tu te
 * souviens… ? » 13 fois, des questions doubles avec « ou » 15 fois,
 * « tu disais que… » 6 fois. On les réécrit ici, sans appel au modèle :
 * c'est instantané et ne retarde pas la voix.
 */

const APOS = "['’]";
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** « Tu te souviens de X ? » → « Parle-moi de X. », « Tu te souviens comment X ? » → « Comment X ? », etc. */
function noRemember(sentence: string): string {
    const lead = `(^|[,;:]\\s*|\\bet\\s+)`;
    const ask = `(?:est-ce\\s+que\\s+|est-ce\\s+qu${APOS})?`;
    const tu = `(?:tu\\s+te\\s+souviens|tu\\s+te\\s+rappelles|te\\s+souviens-tu|te\\s+rappelles-tu)`;
    const vous = `(?:vous\\s+vous\\s+souvenez|vous\\s+vous\\s+rappelez|vous\\s+souvenez-vous|vous\\s+rappelez-vous)`;
    const soft = `(?:\\s+(?:encore|peut-être|un\\s+peu|bien))?`;
    let out = sentence;
    for (const [who, tell] of [[tu, 'parle-moi'], [vous, 'parlez-moi']] as const) {
        const head = `${lead}${ask}${who}${soft}`;
        // … de / d' / du / des X  →  parle-moi de X
        out = out.replace(new RegExp(`${head}\\s+(de\\s+|d${APOS}|du\\s+|des\\s+)`, 'iu'), (_m, l: string, prep: string) => `${l}${l ? tell : capital(tell)} ${prep}`);
        // … si X  →  est-ce que X
        out = out.replace(new RegExp(`${head}\\s+s(?:i\\s+|${APOS})(?=(il|ils)\\b)`, 'iu'), (_m, l: string) => `${l}${l ? 'est-ce qu’' : 'Est-ce qu’'}`);
        out = out.replace(new RegExp(`${head}\\s+si\\s+`, 'iu'), (_m, l: string) => `${l}${l ? 'est-ce que ' : 'Est-ce que '}`);
        // … comment / quand / où / qui / ce que … X  →  Comment X
        out = out.replace(
            new RegExp(`${head}\\s+(?=(comment|quand|où|qui|pourquoi|combien|quel|quelle|quels|quelles|ce\\s+que|ce\\s+qu${APOS}|ce\\s+qui)\\b)`, 'iu'),
            (_m, l: string) => l
        );
        // … que X  →  X
        out = out.replace(new RegExp(`${head}\\s+(?:que\\s+|qu${APOS})`, 'iu'), (_m, l: string) => l);
    }
    // Une demande « parle-moi » n'est pas une question : pas de « ? ».
    out = out.replace(/(parlez?-moi[^?]*)\?\s*$/iu, (_m, body: string) => `${body.trimEnd()}.`);
    return out.replace(/^\s*([a-zà-ÿ])/u, (m) => m.toUpperCase());
}

/** « Tu disais que X. » → « X. » (Loomina se met à résumer au lieu d'écouter). */
function noRecap(sentence: string): string {
    return sentence
        .replace(
            new RegExp(`(^|[,;:]\\s*|\\bet\\s+)(?:comme\\s+)?(?:tu\\s+(?:me\\s+)?(?:disais|racontais|expliquais)|vous\\s+(?:me\\s+)?(?:disiez|racontiez|expliquiez))\\s+(?:que\\s+|qu${APOS})`, 'iu'),
            (_m, l: string) => l
        )
        .replace(/^\s*([a-zà-ÿ])/u, (m) => m.toUpperCase());
}

/** Une question double « X, ou Y ? » → « X ? » (une seule question, la première). */
function noDoubleQuestion(sentence: string): string {
    if (!/\?\s*[»"”]?\s*$/.test(sentence)) return sentence;
    const m = /,?\s+ou\s+(?!bien\s+sûr|non\b|pas\b|moins\b)/iu.exec(sentence);
    if (!m) return sentence;
    const before = sentence.slice(0, m.index);
    // Trop court pour être une vraie question (« Toi ou ta sœur ? ») : on garde.
    if (before.trim().split(/\s+/).length < 4) return sentence;
    return `${before.replace(/[\s,]+$/, '')} ?`;
}

/** Retouche une réplique entière, phrase par phrase. */
export function tidyReply(text: string): string {
    if (!text) return text;
    return text.replace(/[^.?!…]+[.?!…]*[»"”]?/gu, (sentence) => {
        const lead = /^\s*/.exec(sentence)?.[0] ?? '';
        let s = sentence.slice(lead.length);
        if (!s) return sentence;
        s = noRemember(noRecap(noDoubleQuestion(s)));
        return lead + s;
    });
}
