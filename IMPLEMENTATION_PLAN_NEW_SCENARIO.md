# Plan d'implémentation : Nouveau Scénario "Loomina Structuré"

## 1. Audit du Scénario Existant (LOOMINA MAIN)
**Constat :**
Le scénario actuel utilise une liste de 14 sujets génériques ("Racines", "Enfance", "Amour"...) et confie à l'IA (Module 8) la responsabilité totale de juger si un sujet est "traité".
**Problèmes identifiés :**
1. **Flou Artistique** : L'IA passe trop vite d'un sujet à l'autre ou tourne en rond.
2. **Manque de Directives** : Les instructions sont globales, pas spécifiques à chaque étape.
3. **Structure** : La structure actuelle ne correspond pas à la méthodologie "BioNativ" précise (19 points) que vous souhaitez.

---

## 2. Nouvelle Architecture : "Le Chef d'Orchestre Déterministe"

L'objectif est de remplacer le jugement "flou" de l'IA par une **machine à états stricte** (State Machine) basée sur votre structure en 19 points.

### A. Modifications Base de Données (Supabase)
Table `Books` :
- Ajouter une colonne `current_step_index` (Integer, défaut 1).
- Ajouter une colonne `step_status` (JSONB) pour suivre les sous-points validés (ex: `{ "metier_pere": true, "metier_mere": false }`).

### B. Structure des 19 Étapes (Le "Plan de Vol")
Chaque étape aura son **Prompt Système Unique**.

**I. VUE D'ENSEMBLE**
1. **Fiche d’identité** : Périmètre (Solo/Famille), Chronologie résidences.
2. **Timeline** : 15-30 événements clés (Squelette du livre).
3. **Arbre Généalogique** : 3 générations (Ancrage).

**II. MA CONSTRUCTION**
4. **Mes parents** : Portraits, relation affective.
5. **Rencontre parents** : Genèse du couple.
6. **Souvenirs d’enfance** : Foyer, fratrie, école, bêtises.
7. **Jeunesse** : Adolescence, amitiés, émancipation.
8. **Rencontre conjoint** : Histoire du couple.
9. **Enfants** : Naissances, éducation, évolution.

**III. MES ACCOMPLISSEMENTS**
10. **Carrière** : Parcours pro.
11. **Passions** : Vie extra-pro, spiritualité.
12. **Amis** : Cercle social.
13. **Personnalité** : Introspection.
14. **Retraite** : Nouvelle dynamique.

**IV. MES MESSAGES DE VIE**
15. **Petits-enfants** : Rôle de grand-parent.
16. **Projets** : Avenir.
17. **Philosophie** : Leçons à transmettre.
18. **Remerciements** : Gratitude.
19. **Témoignages** : (Module spécial de collecte ?)

### C. Logique du Scénario Make (Draft)
Le nouveau scénario suivra ce flux :

1. **Webhook** (Réception appel/message).
2. **Get Context** : Récupérer `Client` et `Book` (avec `current_step_index`).
3. **Router de Phase** :
   - Si `current_step_index` = 1 → Charge Prompt "Step 1: Identité".
   - Si `current_step_index` = 2 → Charge Prompt "Step 2: Timeline".
   - ...
4. **Génération Réponse (IA Interviewer)** :
   - L'IA pose LA question pertinente pour avancer dans l'étape en cours.
5. **Analyse de la Réponse (IA Juge)** :
   - Analyse le transcript UTILISATEUR.
   - Vérifie si les points de l'étape sont couverts.
   - **Décision** :
     - Si incomplet → Reste à l'étape X.
     - Si complet → Update `current_step_index = X + 1`.
6. **Sauvegarde** : Enregistrement du chapitre/story.

---

## 3. Plan d'Action Immédiat

1. **Créer le scénario "Loomina V2 - Structured"** (vide pour l'instant).
2. **Configurer les modules de base** (Webhook + Supabase Connection).
3. **Implémenter le "Router de Prompts"** : C'est le cœur du système. Au lieu de faire 19 branches, nous utiliserons une **Base de Données de Prompts** (Data Store Make ou Switch) pour charger le bon prompt dynamiquement.

**Validation requise** :
Êtes-vous d'accord pour que je crée ce scénario de test et que j'implémente cette logique d'indexation stricte ?
