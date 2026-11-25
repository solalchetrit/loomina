/**
 * 6. La fin du livre : terminé, puis relu, à l'impression, en route, à
 * l'auteur (tu ou vous) et à la famille. Envoyés par lib/loomina/notify.ts
 * (notifyAuthorBookComplete, notifyBookStage).
 */
import { SITE } from '../../../config/site';
import { DASHBOARD, SUIVI_LIVRE, appeler, bouton, encadre, frise, memo, progression, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';

/** Délai annoncé pour la première version complète du livre. */
export const FIRST_VERSION_DELAY = 'une semaine';

export interface LivreTermineVars {
    firstName: string | null;
    tu: boolean;
}

export function livreTermineEmail(v: LivreTermineVars): RenderedEmail {
    const t = (a: string, b: string) => (v.tu ? a : b);
    return renderEmail({
        subject: t('Ton livre est terminé, bravo !', 'Votre livre est terminé, bravo !'),
        preheader: t(`Sa première version complète t’attend d’ici ${FIRST_VERSION_DELAY}.`, `Sa première version complète vous attend d’ici ${FIRST_VERSION_DELAY}.`),
        blocks: [
            memo({ age: 5, pose: 'c', bulle: t('Tu as tout raconté. Je tiens ton livre !', 'Vous avez tout raconté. Je tiens votre livre !') }),
            titre(v.firstName ? `Bravo ${v.firstName} !` : 'Bravo !'),
            ...ps(
                t('Tu l’as dit au téléphone : ton livre est terminé ! Merci pour tous ces souvenirs partagés.', 'Vous l’avez dit au téléphone : votre livre est terminé ! Merci pour tous ces souvenirs partagés.'),
                t(
                    `Notre équipe le relit maintenant en entier et le met en page. D’ici ${FIRST_VERSION_DELAY}, tu recevras sa première version complète par e-mail, et tu pourras aussi la lire dans ton espace.`,
                    `Notre équipe le relit maintenant en entier et le met en page. D’ici ${FIRST_VERSION_DELAY}, vous recevrez sa première version complète par e-mail, et vous pourrez aussi la lire dans votre espace.`
                ),
                t('Un souvenir te revient entre-temps ? Appelle Loomina, il rejoindra le livre.', 'Un souvenir vous revient entre-temps ? Appelez Loomina, il rejoindra le livre.')
            ),
            appeler(),
            progression(5, t('Ton récit est complet', 'Votre récit est complet')),
            frise(SUIVI_LIVRE, 1, t('Et maintenant, ton livre imprimé', 'Et maintenant, votre livre imprimé')),
            signature(),
        ],
    });
}

export type AnnouncedStep = 'reviewed' | 'printing' | 'shipped';

export interface EtapeLivreVars {
    step: AnnouncedStep;
    /** Prénom du destinataire (l'auteur, ou le proche). */
    firstName: string | null;
    tu: boolean;
    /** true : l'e-mail part à un proche ; on parle alors du « livre de Jeanne ». */
    family: boolean;
    narratorFirstName: string | null;
    tracking: { number: string; url: string } | null;
}

export function etapeLivreEmail(v: EtapeLivreVars): RenderedEmail {
    const tu = !v.family && v.tu;
    const t = (a: string, b: string) => (tu ? a : b);
    const n = v.narratorFirstName?.trim() || 'votre proche';
    const book = v.family ? `le livre de ${n}` : t('ton livre', 'votre livre');
    const Book = book.charAt(0).toUpperCase() + book.slice(1);
    const hello = v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !';
    const suivi = (i: number) => frise(SUIVI_LIVRE, i, v.family ? `Le livre de ${n}` : t('Où en est ton livre', 'Où en est votre livre'));

    if (v.step === 'reviewed') {
        return renderEmail({
            subject: v.family ? `${Book} est relu !` : t('Ton livre est relu : découvre-le !', 'Votre livre est relu : découvrez-le !'),
            preheader: 'Sa version complète est à lire maintenant.',
            blocks: [
                memo({ age: 5, pose: 'd', bulle: 'Je l’ai lu jusqu’à la dernière page !' }),
                titre(`${Book} est prêt à être lu !`),
                ...ps(
                    hello,
                    v.family
                        ? `Nous avons relu ${book} en entier. Sa version complète est à lire dans votre espace famille. Connectez-vous avec votre numéro de téléphone.`
                        : t(
                              'Nous avons relu ton livre en entier. Sa version complète t’attend dans ton espace, rubrique « Mon livre ». Tu peux aussi l’y télécharger.',
                              'Nous avons relu votre livre en entier. Sa version complète vous attend dans votre espace, rubrique « Mon livre ». Vous pouvez aussi l’y télécharger.'
                          )
                ),
                bouton(v.family ? 'Lire le livre' : 'Lire mon livre', DASHBOARD),
                ...ps(
                    v.family
                        ? null
                        : t(
                              `Prends le temps de le lire. Un nom mal écrit, un souvenir à ajouter ? Appelle le ${SITE.phoneDisplay} ou réponds à cet e-mail.`,
                              `Prenez le temps de le lire. Un nom mal écrit, un souvenir à ajouter ? Appelez le ${SITE.phoneDisplay} ou répondez à cet e-mail.`
                          ),
                    `Ensuite, direction l’imprimerie ! ${t('Nous te prévenons', 'Nous vous prévenons')} à chaque étape.`
                ),
                ...(v.family ? [] : [appeler()]),
                suivi(1),
                signature(),
            ],
        });
    }
    if (v.step === 'printing') {
        return renderEmail({
            subject: `${Book} est à l'impression !`,
            preheader: 'Le numéro de suivi arrive dès son départ.',
            blocks: [
                memo({ age: 5, pose: 'a', bulle: 'Je surveille l’imprimerie de près !' }),
                titre(`${Book} est à l’impression`),
                ...ps(
                    hello,
                    `${Book} est parti chez l’imprimeur. ${t('Nous te préviendrons', 'Nous vous préviendrons')} dès qu’il sera expédié, avec le numéro qui permet de suivre le colis.`
                ),
                suivi(2),
                bouton(v.family ? 'Ouvrir mon espace famille' : 'Ouvrir mon espace', DASHBOARD),
                signature(),
            ],
        });
    }
    const where = v.family ? `Il arrive à l’adresse indiquée par ${n}.` : t("Il arrive à l'adresse que tu nous as donnée.", "Il arrive à l'adresse que vous nous avez donnée.");
    return renderEmail({
        subject: `${Book} est en route !`,
        preheader: v.tracking ? `Numéro de suivi : ${v.tracking.number}` : 'Il arrive très bientôt.',
        blocks: [
            memo({ age: 5, pose: 'g', bulle: t('Il arrive ! Guette ta boîte aux lettres.', 'Il arrive ! Guettez votre boîte aux lettres.') }),
            titre(`${Book} est en route !`),
            ...ps(hello, `${Book} vient de partir. ${where}`),
            ...(v.tracking ? [encadre([`Numéro de suivi : ${v.tracking.number}`]), bouton('Suivre le colis', v.tracking.url)] : []),
            suivi(3),
            signature(),
        ],
    });
}

export interface LivreRecuVars {
    /** Prénom du destinataire (l'auteur, ou le proche). */
    firstName: string | null;
    tu: boolean;
    /** Pour un proche : le prénom de la personne qui a raconté. */
    family?: { narrator: string | null };
    /** Lien pour laisser un avis public (LOOMINA_REVIEW_URL), sinon on demande une réponse à l'e-mail. */
    reviewUrl?: string | null;
}

/** Le livre est arrivé (l'équipe le note dans l'admin) : merci, et un avis. */
export function livreRecuEmail(v: LivreRecuVars): RenderedEmail {
    const hello = v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !';
    const avis = v.reviewUrl
        ? [bouton('Laisser un avis', v.reviewUrl)]
        : [];
    if (v.family) {
        const n = v.family.narrator?.trim() || 'votre proche';
        return renderEmail({
            subject: `Le livre de ${n} est arrivé !`,
            preheader: 'Merci de nous avoir confié ses souvenirs.',
            blocks: [
                memo({ age: 5, pose: 'e', bulle: `Le livre de ${n} est entre vos mains. Merci !` }),
                titre(`Le livre de ${n} est arrivé !`),
                ...ps(
                    hello,
                    `Le livre de ${n} est bien arrivé. Merci de tout cœur de nous avoir confié ses souvenirs : c’était un bonheur de les écrire.`,
                    v.reviewUrl
                        ? 'Il vous plaît ? Un petit avis nous aide énormément à faire connaître Loomina.'
                        : 'Il vous plaît ? Dites-le-nous en répondant à cet e-mail, en une phrase ou en dix. On lit tout, avec beaucoup d’émotion.'
                ),
                ...avis,
                ...ps('Envie d’un exemplaire de plus, pour un frère, une sœur, un petit-enfant ? Commandez-le depuis votre espace famille.'),
                signature(),
            ],
        });
    }
    const t = (a: string, b: string) => (v.tu ? a : b);
    return renderEmail({
        subject: t('Ton livre est arrivé !', 'Votre livre est arrivé !'),
        preheader: t('Merci pour tous ces souvenirs partagés.', 'Merci pour tous ces souvenirs partagés.'),
        blocks: [
            memo({ age: 5, pose: 'e', bulle: t('Ton livre est entre tes mains. Merci pour tout !', 'Votre livre est entre vos mains. Merci pour tout !') }),
            titre(t('Ton livre est arrivé !', 'Votre livre est arrivé !')),
            ...ps(
                hello,
                t(
                    'Ton livre est bien arrivé. Merci de tout cœur pour tous ces souvenirs partagés au téléphone : c’était un bonheur de les écrire avec toi.',
                    'Votre livre est bien arrivé. Merci de tout cœur pour tous ces souvenirs partagés au téléphone : c’était un bonheur de les écrire avec vous.'
                ),
                v.reviewUrl
                    ? t('Il te plaît ? Un petit avis nous aide énormément à faire connaître Loomina.', 'Il vous plaît ? Un petit avis nous aide énormément à faire connaître Loomina.')
                    : t(
                          'Il te plaît ? Dis-le-nous en répondant à cet e-mail, en une phrase ou en dix. On lit tout, avec beaucoup d’émotion.',
                          'Il vous plaît ? Dites-le-nous en répondant à cet e-mail, en une phrase ou en dix. On lit tout, avec beaucoup d’émotion.'
                      )
            ),
            ...avis,
            frise(SUIVI_LIVRE, 4, t('Ton livre', 'Votre livre')),
            ...ps(t('Envie d’un exemplaire de plus pour tes proches ? Commande-le depuis ton espace.', 'Envie d’un exemplaire de plus pour vos proches ? Commandez-le depuis votre espace.')),
            bouton('Ouvrir mon espace', DASHBOARD),
            signature(),
        ],
    });
}
