# LOOMINA — Business Plan Stratégique 2026

## 1. Résumé Exécutif
LOOMINA est une plateforme de biographie assistée par IA qui permet de transformer la parole en un livre littéraire de haute qualité. En supprimant la barrière de l'écriture et en réduisant les coûts de production par 20 par rapport à un biographe humain, LOOMINA démocratise la transmission familiale. Ce document détaille le modèle économique basé sur un positionnement Premium à 499€.

## 2. Proposition de Valeur
*   **Accessibilité totale :** Pas besoin d'ordinateur ou de savoir écrire. Un simple téléphone suffit.
*   **Qualité Littéraire :** Le "Memory Engine" (GPT-4o) transforme les transcriptions orales en un récit structuré et élégant.
*   **Objet de Famille :** Livraison d'un livre physique à couverture rigide, conçu pour traverser les générations.
*   **Simplicité :** 14 thématiques de vie explorées en 6 heures de conversation.

## 3. Modèle Économique (Unit Economics)

### 3.1 Structure des Coûts Variables (Par livre)
Basé sur un cycle de production de 6 heures d'appels et une rédaction assistée par IA.

| Poste | Coût | Commentaire |
| :--- | :--- | :--- |
| **Téléphonie & Voix (Vapi)** | 43,00 € | 360 min à 0,12€/min (Incl. ElevenLabs & LLM temps réel) |
| **Intelligence Artificielle** | 15,00 € | Rédaction des chapitres par GPT-4o (Input/Output tokens) |
| **Impression & Packaging** | 65,00 € | Impression premium, papier ivoire, coffret cadeau luxe |
| **Frais de Transaction** | 15,00 € | Stripe (Frais fixe + commission) |
| **Acquisition Client (CAC)** | 80,00 € | Budget estimé pour Google/Meta Ads |
| **TOTAL COÛTS VARIABLES** | **218,00 €** | |

### 3.2 Revenus et Marges
*   **Prix de Vente Public :** 499,00 €
*   **Marge Brute par unité :** 281,00 €
*   **Taux de Marge :** 56,3 %

### 3.3 Coûts Fixes (Opérations mensuelles)
*   Supabase Pro : 25 €
*   Make.com Pro : 20 €
*   Vercel / Hosting : 20 €
*   Outils de communication & Divers : 15 €
*   **TOTAL FIXE : 80 € / mois**

## 4. Projections Financières (Année 1)
L'objectif est une croissance organique doublée tous les deux mois, soutenue par le réinvestissement des marges dans l'acquisition.

| Mois | Volume (Ventes) | Chiffre d'Affaires | Résultat Net Mensuel |
| :--- | :--- | :--- | :--- |
| **1 - 2** | 10 (5/mois) | 4 990 € | +2 650 € |
| **3 - 4** | 20 (10/mois) | 9 980 € | +5 460 € |
| **5 - 6** | 40 (20/mois) | 19 960 € | +11 080 € |
| **7 - 8** | 80 (40/mois) | 39 920 € | +22 320 € |
| **9 - 10** | 160 (80/mois) | 79 840 € | +44 800 € |
| **11 - 12** | 320 (160/mois) | 159 680 € | +89 760 € |
| **TOTAL AN 1** | **630 Livres** | **314 370 €** | **~176 000 €** |

## 5. Stratégie de Croissance et Marketing
Le levier principal de croissance est l'acquisition payante couplée au bouche-à-oreille (effet de recommandation familiale).

1.  **Ciblage Publicitaire :**
    *   *Direct (Seniors) :* Facebook Ads (audience 60+), axé sur la transmission.
    *   *Indirect (Prescripteurs) :* Instagram/Google Ads ciblant les 35-50 ans (idée cadeau fête des mères/pères/grands-parents).
2.  **Partenariats :**
    *   Maisons de retraite premium (EHPAD de luxe).
    *   Généalogistes professionnels.
3.  **Revenue Expansion (Upsells) :**
    *   Exemplaire supplémentaire : 39€ (Marge ~25€).
    *   Version numérique interactive : 19€.
    *   Scan et intégration de photos anciennes : 89€.

## 6. Risques et Atténuation
*   **Coût de la technologie :** Si OpenAI augmente ses prix. *Solution :* Migration vers des modèles "mini" ou open source localisés pour la transcription/rédaction simple.
*   **Échelonnage (Scalability) :** La gestion de 160 clients/mois demande une infrastructure de support. *Solution :* Automatisation maximale des validations via l'espace client.
*   **Qualité Littéraire :** Risque de style "robotique". *Solution :* Entraînement de prompts spécifiques (System Prompts) basés sur des styles d'auteurs classiques.

---
*Document établi par Antigravity pour LOOMINA*
*Date : 14 Janvier 2026*
