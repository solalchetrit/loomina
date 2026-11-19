// Le paquet `hyphen` (coupure des mots, motifs TeX) ne fournit pas de types.
declare module 'hyphen/fr' {
    export function hyphenateSync(text: string, options?: { hyphenChar?: string; minWordLength?: number }): string;
    export function hyphenate(text: string, options?: { hyphenChar?: string; minWordLength?: number }): Promise<string>;
}
