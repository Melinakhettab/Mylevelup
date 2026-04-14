import { z } from 'zod'

export const profileSchema = z.object({
  age:          z.number().min(10).max(120),
  weight:       z.number().min(20).max(300),
  height:       z.number().min(100).max(250),
  objective:    z.enum(['perte_poids', 'prise_masse', 'remise_en_forme', 'maintien', 'performance']),
  level:        z.enum(['debutant', 'intermediaire', 'avance']),
  equipment:    z.enum(['domicile', 'salle']),
  dietary:      z.array(z.string()).optional(),
  hoursPerWeek: z.number().min(1).max(20),
})

export type ProfileInput = z.infer<typeof profileSchema>
