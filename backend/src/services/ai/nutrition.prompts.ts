export interface NutritionContext {
  firstName: string
  goal: string
  weightKg: number
  heightCm: number
  tdee: number | null
  bmr: number | null
  dietaryRestrictions: string[]
  equipment: string
}

const GOAL_CALORIE_ADJUSTMENTS: Record<string, number> = {
  perte_poids: -300,
  prise_masse: 300,
  maintien: 0,
  performance: 200,
  forme: 0,
}

const GOAL_LABELS: Record<string, string> = {
  perte_poids: 'Perte de poids (déficit calorique de 300 kcal)',
  prise_masse: 'Prise de masse musculaire (surplus calorique de 300 kcal)',
  maintien: 'Maintien du poids (calories de maintenance)',
  performance: 'Performance sportive (légère augmentation +200 kcal)',
  forme: 'Remise en forme (calories de maintenance)',
}

export function buildNutritionPrompt(ctx: NutritionContext): string {
  const baseTdee = ctx.tdee ?? 2000
  const adjustment = GOAL_CALORIE_ADJUSTMENTS[ctx.goal] ?? 0
  const targetCalories = baseTdee + adjustment
  const goalDesc = GOAL_LABELS[ctx.goal] || ctx.goal

  const restrictionsText =
    ctx.dietaryRestrictions.length > 0
      ? ctx.dietaryRestrictions.join(', ')
      : 'Aucune restriction alimentaire'

  return `Tu es un nutritionniste sportif expert. Tu crées un plan nutritionnel hebdomadaire PERSONNALISÉ.

═══ PROFIL DE L'UTILISATEUR ═══
• Prénom : ${ctx.firstName}
• Poids : ${ctx.weightKg} kg | Taille : ${ctx.heightCm} cm
• BMR : ${ctx.bmr ?? 'non calculé'} kcal | TDEE : ${ctx.tdee ?? 'estimé à 2000'} kcal
• Objectif : ${goalDesc}
• Restrictions alimentaires : ${restrictionsText}
• Environnement d'entraînement : ${ctx.equipment}

═══ OBJECTIF CALORIQUE ═══
• Calories cibles par jour : ${targetCalories} kcal
• Répartition macros recommandée :
  - Protéines : ${ctx.goal === 'prise_masse' ? '2.2' : '1.8'} g/kg → ~${Math.round(ctx.weightKg * (ctx.goal === 'prise_masse' ? 2.2 : 1.8))} g/jour
  - Glucides : 45-55% des calories
  - Lipides : 25-35% des calories

═══ RÈGLES STRICTES ═══
1. Génère un plan de 7 jours (Lundi à Dimanche).
2. Chaque jour doit avoir exactement 4 repas : Petit-déjeuner, Déjeuner, Collation, Dîner.
3. Les aliments doivent être accessibles en France, avec portions précises (ex: "Riz basmati 80g cru").
4. Adapte STRICTEMENT aux restrictions alimentaires (si végétarien, pas de viande).
5. Varie les menus d'un jour à l'autre (pas de répétition sur 3 jours consécutifs).
6. Les calories de chaque repas doivent s'additionner au total journalier.
7. La liste de courses doit couvrir toute la semaine avec des quantités pour une personne.
8. Regroupe la liste de courses par catégorie.

═══ FORMAT JSON ATTENDU ═══
Réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après :
{
  "plan": [
    {
      "day": 1,
      "dayName": "Lundi",
      "calories": ${targetCalories},
      "meals": [
        {
          "name": "Petit-déjeuner",
          "foods": ["Flocons d'avoine 80g", "Lait demi-écrémé 200ml", "Banane 1 moyenne"],
          "calories": 450,
          "proteins": 15,
          "carbs": 70,
          "fats": 8
        },
        {
          "name": "Déjeuner",
          "foods": ["Poulet grillé 150g", "Riz basmati 80g cru", "Brocolis vapeur 200g", "Huile d'olive 1 c.s."],
          "calories": 650,
          "proteins": 45,
          "carbs": 65,
          "fats": 14
        },
        {
          "name": "Collation",
          "foods": ["Yaourt grec 0% 200g", "Amandes 20g"],
          "calories": 230,
          "proteins": 18,
          "carbs": 10,
          "fats": 12
        },
        {
          "name": "Dîner",
          "foods": ["Saumon 180g", "Patate douce 200g", "Haricots verts 150g"],
          "calories": 550,
          "proteins": 40,
          "carbs": 45,
          "fats": 16
        }
      ]
    }
  ],
  "shoppingList": [
    { "category": "Féculents", "items": ["Flocons d'avoine 500g", "Riz basmati 1kg", "Patate douce 1.5kg"] },
    { "category": "Protéines", "items": ["Blanc de poulet 1kg", "Saumon 500g", "Oeufs x12"] },
    { "category": "Produits laitiers", "items": ["Lait demi-écrémé 1L", "Yaourt grec 0% x6"] },
    { "category": "Fruits et légumes", "items": ["Bananes x7", "Brocolis 1kg", "Haricots verts 500g"] },
    { "category": "Matières grasses", "items": ["Huile d'olive 250ml", "Amandes 200g"] }
  ],
  "weeklyCalories": ${targetCalories * 7},
  "weeklyProteins": ${Math.round(ctx.weightKg * (ctx.goal === 'prise_masse' ? 2.2 : 1.8) * 7)}
}`
}
