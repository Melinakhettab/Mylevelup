export interface ProfileContext {
  firstName: string
  age: number
  gender: string
  weightKg: number
  heightCm: number
  goal: string
  fitnessLevel: string
  equipment: string
  weeklyAvailability: number
  bmi: number | null
  bmr: number | null
  tdee: number | null
}

const GOAL_LABELS: Record<string, string> = {
  perte_poids: 'Perte de poids (déficit calorique, cardio dominant, circuit training)',
  prise_masse: 'Prise de masse musculaire (hypertrophie, surplus calorique, charges lourdes)',
  forme: 'Remise en forme générale (mix cardio/musculation, progression douce)',
  remise_en_forme: 'Remise en forme générale (mix cardio/musculation, progression douce)',
  maintien: 'Maintien de la forme (équilibre cardio/muscu, intensité modérée)',
  performance: 'Performance sportive (intensité élevée, périodisation, HIIT)',
}

const LEVEL_LABELS: Record<string, string> = {
  debutant: 'Débutant — exercices fondamentaux, charges légères, focus technique',
  intermediaire: 'Intermédiaire — exercices composés + isolation, charges modérées',
  avance: 'Avancé — exercices avancés, charges lourdes, techniques d\'intensification',
}

const EQUIPMENT_LABELS: Record<string, string> = {
  maison: 'À domicile (poids du corps, haltères légers, élastiques, tapis)',
  domicile: 'À domicile (poids du corps, haltères légers, élastiques, tapis)',
  salle: 'En salle de sport (machines, barres, haltères, câbles, rack à squat)',
  mixte: 'Mixte — accès salle et entraînement à domicile (exercices adaptables aux deux environnements)',
}

export function buildProgramPrompt(profile: ProfileContext): string {
  const goalDesc = GOAL_LABELS[profile.goal] || profile.goal
  const levelDesc = LEVEL_LABELS[profile.fitnessLevel] || profile.fitnessLevel
  const equipDesc = EQUIPMENT_LABELS[profile.equipment] || profile.equipment

  // Calculate recommended sessions from weekly hours
  const sessionsPerWeek = Math.min(6, Math.max(2, Math.round(profile.weeklyAvailability / 1.25)))
  const avgSessionMin = Math.round((profile.weeklyAvailability * 60) / sessionsPerWeek)

  return `Tu es un coach sportif professionnel certifié. Tu crées un programme d'entraînement hebdomadaire PERSONNALISÉ.

═══ PROFIL DE L'UTILISATEUR ═══
• Prénom : ${profile.firstName}
• Âge : ${profile.age} ans
• Sexe : ${profile.gender}
• Poids : ${profile.weightKg} kg | Taille : ${profile.heightCm} cm
• IMC : ${profile.bmi ?? 'non calculé'}
• BMR : ${profile.bmr ?? 'non calculé'} kcal | TDEE : ${profile.tdee ?? 'non calculé'} kcal
• Objectif : ${goalDesc}
• Niveau : ${levelDesc}
• Équipement : ${equipDesc}
• Disponibilité : ${profile.weeklyAvailability}h/semaine → ~${sessionsPerWeek} séances de ~${avgSessionMin} min

═══ RÈGLES STRICTES ═══
1. Génère un programme de 7 jours (lundi=1 à dimanche=7).
2. Place exactement ${sessionsPerWeek} jours d'entraînement et ${7 - sessionsPerWeek} jours de repos.
3. Les jours de repos doivent avoir type "repos" et un tableau exercises vide.
4. Chaque exercice doit avoir : name (en français), sets (1–6), reps (1–50), rest (en secondes, 30–180), difficulty ("facile"|"moyen"|"difficile").
5. Durée de chaque séance : ${Math.max(30, avgSessionMin - 15)} à ${avgSessionMin + 10} minutes.
6. Adapte les exercices au niveau et à l'équipement disponible.
7. Varie les groupes musculaires pour éviter le surentraînement.
8. Inclus un échauffement et des étirements dans la durée totale.

═══ FORMAT JSON ATTENDU ═══
Réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après :
{
  "program": [
    {
      "day": 1,
      "dayName": "Lundi",
      "type": "musculation",
      "focus": "Haut du corps",
      "duration": 50,
      "exercises": [
        { "name": "Pompes", "sets": 4, "reps": 12, "rest": 60, "difficulty": "moyen" }
      ]
    },
    {
      "day": 2,
      "dayName": "Mardi",
      "type": "repos",
      "focus": "Récupération",
      "duration": 0,
      "exercises": []
    }
  ]
}

Les types possibles sont : "musculation", "cardio", "hiit", "mobilite", "repos".`
}
