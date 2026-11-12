/**
 * Mode démo de l'espace auteur, sur le poste local uniquement.
 *
 * Sous `next dev` avec LOOMINA_DEMO_DATA=true, les routes /api/user/* répondent
 * avec le livre d'exemple ci-dessous au lieu de lire Supabase : on voit chaque
 * module rempli sans clé ni vrai client. Jamais actif en production.
 * Les réglages et les sujets suggérés sont gardés en mémoire jusqu'au redémarrage.
 */

export const DEMO_DATA = process.env.NODE_ENV === 'development' && process.env.LOOMINA_DEMO_DATA === 'true';

const CHAPTERS: { title: string; date: string; content: string }[] = [
    {
        title: 'La maison de la rue des Tilleuls',
        date: '2026-09-04',
        content: `Je suis née en 1948 à Rennes, dans une maison étroite de la rue des Tilleuls, la troisième d’une fratrie de quatre. On y entrait par la cuisine, toujours chaude, où ma mère faisait chanter la radio en épluchant les légumes.

Mon père était cheminot. Il partait avant le jour et rentrait avec l’odeur du charbon sur sa veste. Le dimanche, il nous emmenait voir passer les trains depuis le pont de la gare, et il connaissait chacun par son heure.

De cette maison, je garde surtout le bruit : les pas dans l’escalier de bois, les disputes de mes frères, le poste de radio. Le silence, je ne l’ai découvert que bien plus tard.`,
    },
    {
        title: 'Les dimanches à Saint-Malo',
        date: '2026-09-11',
        content: `L’été, nous prenions le car jusqu’à la mer. Ma mère emportait des tartines enveloppées dans du papier journal, et mon père racontait tout le trajet les étés de sa propre enfance.

À Saint-Malo, je courais sur les remparts jusqu’à perdre mon souffle. Ma grand-mère Marie nous attendait sur la plage du Sillon, son chapeau de paille sur la tête, avec une thermos de café trop sucré.

C’est là que j’ai appris à nager, à huit ans, dans une eau si froide que j’en ai pleuré. Mon père m’a dit que la mer ne se méritait pas, qu’elle s’apprivoisait. Je l’ai cru toute ma vie.`,
    },
    {
        title: 'L’école de Mademoiselle Le Goff',
        date: '2026-09-18',
        content: `Mademoiselle Le Goff portait des chignons impeccables et une règle en buis dont elle ne se servait jamais. Elle nous lisait des poèmes le samedi, et c’est elle qui m’a donné le goût des mots.

J’étais une élève appliquée mais rêveuse. Je recopiais les fables de La Fontaine dans un cahier à spirale que j’ai gardé jusqu’à aujourd’hui, avec ses taches d’encre violette.

Le jour du certificat d’études, en 1960, ma mère avait cousu une robe bleue pour l’occasion. J’ai été reçue avec mention, et mon père a acheté un gâteau chez le pâtissier, ce qui n’arrivait jamais.`,
    },
    {
        title: 'L’été de mes seize ans',
        date: '2026-09-25',
        content: `En 1964, j’ai passé l’été à travailler à la conserverie de Douarnenez. Le travail était dur, les mains toujours froides, mais c’était mon premier salaire, et j’en étais fière.

C’est là que j’ai rencontré Anne, qui allait devenir l’amie de toute une vie. Nous partagions nos pauses sur le port, à regarder les bateaux rentrer et à imaginer ce que serait notre vie à Paris.

À la fin de l’été, j’ai acheté avec mes économies un électrophone et deux disques. Je les ai écoutés jusqu’à les user, assise sur mon lit, en rêvant de partir.`,
    },
    {
        title: 'Paris, la poste de la rue Haute',
        date: '2026-10-02',
        content: `Je suis arrivée à Paris en 1967 avec une valise en carton et une lettre de recommandation. On m’a affectée au guichet de la poste de la rue Haute, dans le quinzième arrondissement.

Les premiers mois, je ne connaissais personne. Je vendais des timbres, je comptais des mandats, et le soir je marchais le long de la Seine pour ne pas rentrer trop tôt dans ma chambre de bonne.

Mais le guichet est un poste d’observation formidable. J’y ai vu passer tout un quartier : la boulangère pressée, le vieux monsieur qui écrivait chaque semaine à sa sœur en Argentine, les amoureux qui envoyaient des télégrammes.`,
    },
    {
        title: 'Pierre',
        date: '2026-10-09',
        content: `Pierre est entré à la poste un mardi de février 1969 pour envoyer un colis à sa mère. Il avait oublié son portefeuille. Je lui ai avancé les timbres, et il est revenu le lendemain avec des fleurs pour me rembourser.

Il était instituteur, il parlait doucement et riait fort. Nous nous sommes mariés à la mairie du quinzième en 1971, un samedi de juin où il a plu toute la journée. Personne ne s’en souvient, sauf moi : j’avais trouvé cela romantique.

Nous avons vécu quarante-huit ans ensemble. Il est parti en 2019, et je lui parle encore, le matin, en faisant le café.`,
    },
    {
        title: 'Deux enfants et un appartement trop petit',
        date: '2026-10-16',
        content: `Claire est née en 1973 et Thomas en 1976. Nous habitions alors un trois-pièces au cinquième sans ascenseur, et je montais les courses avec un enfant sur la hanche et l’autre accroché à mon manteau.

Ce furent des années épuisantes et merveilleuses. Pierre corrigeait ses copies sur la table de la cuisine pendant que je faisais les comptes. Le dimanche, nous allions au jardin du Luxembourg faire voguer les petits bateaux.

Claire posait mille questions, Thomas n’en posait aucune mais observait tout. Ils sont restés ainsi : elle est devenue médecin, lui architecte.`,
    },
    {
        title: 'Receveuse des postes',
        date: '2026-10-23',
        content: `En 1985, j’ai été nommée receveuse du bureau de Vanves. J’étais la première femme à ce poste dans la ville, et certains hommes de l’équipe ont mis des mois à l’accepter.

J’ai appris à diriger sans élever la voix. Je connaissais le prénom de chaque facteur et de leurs enfants. Quand le bureau a été informatisé, j’ai passé mes soirées à apprendre, pour ne pas laisser les plus anciens se perdre.

C’est, je crois, ma plus grande fierté professionnelle : que personne n’ait été laissé de côté.`,
    },
    {
        title: 'Le voyage au Québec',
        date: '2026-10-30',
        content: `Pour nos trente ans de mariage, en 2001, Pierre m’a offert un voyage au Québec. Je n’avais jamais pris l’avion. J’ai serré sa main pendant tout le décollage.

Nous avons loué une voiture et descendu le Saint-Laurent jusqu’à Tadoussac. J’ai vu des baleines, ce que je n’aurais jamais osé imaginer, petite fille sur la plage du Sillon.

Le soir, dans un chalet au bord de l’eau, Pierre m’a dit qu’il était temps que je raconte tout cela un jour. Il aura fallu vingt-cinq ans, et une voix au téléphone, pour que je le fasse.`,
    },
];

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

const state = {
    prefs: {
        title: 'Les saisons de Jeanne',
        politeness: 'vous' as 'tu' | 'vous',
        firstNamePhonetic: null as string | null,
        writingStyle: 'Chaleureux et vivant',
        sensitiveTopics: ['La maladie de Pierre'],
        smsChapter: true,
        callSchedule: { active: true, days: [2], time: '15:00' } as { active: boolean; days: number[]; time: string },
    },
    openQuestions: [
        'Raconte-nous ta rencontre avec papa à la poste',
        'Comment as-tu vécu Mai 68 à Paris ?',
        'Quelle recette de grand-mère Marie voudrais-tu transmettre ?',
    ],
};

const CALLS = [
    { date: '2026-10-30T10:12:00Z', minutes: 34, summary: 'Jeanne a raconté le voyage au Québec offert par Pierre pour leurs trente ans de mariage, les baleines de Tadoussac et la promesse de raconter sa vie.' },
    { date: '2026-10-23T09:40:00Z', minutes: 28, summary: 'Sa nomination comme receveuse des postes à Vanves en 1985, la première femme à ce poste, et sa fierté de n’avoir laissé personne de côté lors de l’informatisation.' },
    { date: '2026-10-16T15:05:00Z', minutes: 41, summary: 'Les naissances de Claire et Thomas, l’appartement au cinquième sans ascenseur, les dimanches au jardin du Luxembourg.' },
    { date: '2026-10-09T10:30:00Z', minutes: 37, summary: 'La rencontre avec Pierre au guichet en 1969, le mariage sous la pluie en 1971, et quarante-huit ans de vie commune.' },
    { date: '2026-10-02T11:00:00Z', minutes: 25, summary: 'L’arrivée à Paris en 1967, la chambre de bonne, le guichet de la rue Haute et les habitués du quartier.' },
    { date: '2026-09-25T16:20:00Z', minutes: 31, summary: 'L’été 1964 à la conserverie de Douarnenez, le premier salaire, la rencontre avec Anne et l’électrophone.' },
    { date: '2026-09-18T10:45:00Z', minutes: 22, summary: 'L’école de Mademoiselle Le Goff, le cahier de fables et le certificat d’études avec mention en 1960.' },
    { date: '2026-09-11T14:10:00Z', minutes: 29, summary: 'Les dimanches à Saint-Malo avec la grand-mère Marie, l’apprentissage de la nage à huit ans.' },
    { date: '2026-09-04T10:00:00Z', minutes: 18, summary: 'Premier appel : présentation, la maison de la rue des Tilleuls à Rennes, le père cheminot et la mère à la radio.' },
];

export function demoOverview() {
    return {
        firstName: 'Jeanne',
        demo: true,
        prefs: state.prefs,
        project: {
            phase: 3,
            phaseLabel: 'Accomplissements',
            progress: 60,
            completed: false,
            nextTopic: 'Vous avez évoqué votre retraite en 2008. Qu’avez-vous fait de ce temps retrouvé, la première année ?',
            scheduleText: state.prefs.callSchedule.active ? 'chaque mardi à 15 h' : null,
            chapters: CHAPTERS.length,
            words: CHAPTERS.reduce((n, c) => n + words(c.content), 0),
            timeline: [
                { year: 1948, event: 'Naissance à Rennes, rue des Tilleuls' },
                { year: 1956, event: 'Apprend à nager à Saint-Malo avec son père' },
                { year: 1960, event: 'Certificat d’études avec mention' },
                { year: 1964, event: 'Été à la conserverie de Douarnenez, rencontre avec Anne' },
                { year: 1967, event: 'Arrivée à Paris, guichet de la poste de la rue Haute' },
                { year: 1971, event: 'Mariage avec Pierre à la mairie du 15e' },
                { year: 1973, event: 'Naissance de Claire' },
                { year: 1976, event: 'Naissance de Thomas' },
                { year: 1985, event: 'Receveuse des postes à Vanves, première femme à ce poste' },
                { year: 2001, event: 'Voyage au Québec pour les trente ans de mariage' },
                { year: 2008, event: 'Départ à la retraite' },
                { year: 2019, event: 'Décès de Pierre' },
            ],
            family: [
                { name: 'Pierre', relation: 'son mari', deceased: true },
                { name: 'Claire', relation: 'sa fille, médecin' },
                { name: 'Thomas', relation: 'son fils, architecte' },
                { name: 'Marie', relation: 'sa grand-mère maternelle', deceased: true },
                { name: 'Yves', relation: 'son père, cheminot', deceased: true },
                { name: 'Anne', relation: 'son amie depuis 1964' },
                { name: 'Léa', relation: 'sa petite-fille' },
            ],
            themes: ['L’enfance', 'Les premiers emplois', 'Les premiers amours', 'La famille', 'La carrière', 'Les voyages', 'Les études'],
            openQuestions: state.openQuestions,
            calls: CALLS,
        },
    };
}

export function demoStories() {
    return CHAPTERS.map((c, i) => ({
        book_id: 'demo',
        book_title: state.prefs.title,
        book_style: state.prefs.writingStyle,
        story_id: i + 1,
        story_title: c.title,
        story_content: c.content,
        story_date: c.date,
    }));
}

export function demoSavePrefs(patch: Partial<typeof state.prefs>) {
    state.prefs = { ...state.prefs, ...patch };
}

export function demoAddQuestion(question: string) {
    state.openQuestions = [question, ...state.openQuestions.filter((q) => q !== question)].slice(0, 15);
    return state.openQuestions;
}
